import { RecordingKind, RecordingStatus } from "@prisma/client";
import { randomUUID } from "crypto";
import { db } from "@/lib/db";
import { uploadAudioObject } from "@/lib/minio";
import { env } from "@/lib/env";
import {
  buildRecommendationSet,
  calculateDistribution,
  calculateVadSeries,
  dominantEmotionFromTrajectory,
  findFocusPeak,
  findStressSpike,
  titleEmotion,
} from "@/lib/analytics";

function inferRecordingKind(file: File) {
  return file.size <= 5 * 1024 * 1024 ? RecordingKind.CHECKIN : RecordingKind.SESSION_AUDIO;
}

function buildObjectKey(userId: string, fileName: string) {
  return `${userId}/${Date.now()}-${randomUUID()}-${fileName.replace(/\s+/g, "-")}`;
}

function buildRecordingTitle(fileName: string, topic?: string | null) {
  if (topic) {
    return topic;
  }

  return fileName.replace(/\.[^.]+$/, "");
}

function buildInsights(trajectory: Array<{ time: number; emotion: string }>) {
  const stressSpike = findStressSpike(trajectory as never[]);
  const focusPeak = findFocusPeak(trajectory as never[]);

  return [
    stressSpike ? `Stress spike detected around ${stressSpike.time} min.` : "No major stress spike detected.",
    focusPeak ? `Focus peaked around ${focusPeak.time} min.` : "No clear focus peak detected yet.",
    "Review recent recordings to compare emotional changes across sessions.",
  ];
}

export async function createUploadedRecording(params: {
  userId: string;
  file: File;
  focusSessionId?: string | null;
  kind?: RecordingKind;
}) {
  const buffer = Buffer.from(await params.file.arrayBuffer());
  const objectKey = buildObjectKey(params.userId, params.file.name);
  const upload = await uploadAudioObject({
    objectKey,
    data: buffer,
    contentType: params.file.type || "application/octet-stream",
  });

  return db.recording.create({
    data: {
      title: buildRecordingTitle(params.file.name),
      kind: params.kind ?? inferRecordingKind(params.file),
      status: RecordingStatus.UPLOADED,
      filename: params.file.name,
      mimeType: params.file.type || "application/octet-stream",
      byteSize: params.file.size,
      bucket: upload.bucket,
      objectKey,
      etag: upload.etag,
      userId: params.userId,
      focusSessionId: params.focusSessionId ?? null,
    },
  });
}

export async function analyzeCheckinRecording(recordingId: string) {
  const recording = await db.recording.findUnique({ where: { id: recordingId } });
  if (!recording) {
    throw new Error("Recording not found.");
  }

  const response = await fetch(`${env.aiServiceBaseUrl}/process-checkin/`, {
    method: "POST",
    body: recording.mimeType.startsWith("audio/")
      ? await audioFileToFormData(recording)
      : undefined,
  });

  if (!response.ok) {
    throw new Error(`Check-in processing failed: ${response.statusText}`);
  }

  const result = await response.json();
  const trajectory = result.emotion_trajectory ?? [];
  const dominantEmotion = dominantEmotionFromTrajectory(trajectory);
  const distribution = calculateDistribution(trajectory);
  const vadSeries = calculateVadSeries(trajectory);
  const insights = buildInsights(trajectory);
  const recommendations = buildRecommendationSet(trajectory);

  const updated = await db.recording.update({
    where: { id: recording.id },
    data: {
      title: buildRecordingTitle(recording.filename, result.topic),
      status: RecordingStatus.ANALYZED,
      durationSeconds: result.duration_seconds ?? 0,
      transcript: result.transcription ?? null,
      topic: result.topic ?? null,
      dominantEmotion: titleEmotion(dominantEmotion),
      analysisVersion: "ai-service-v1",
      emotionTrajectory: trajectory,
      vadSeries,
      distribution,
      aiInsights: insights,
      aiRecommendations: recommendations,
      processedAt: new Date(),
      processingError: null,
    },
  });

  await syncSessionFromRecording(updated.id);
  return updated;
}

export async function queueLongRecordingAnalysis(recordingId: string) {
  const recording = await db.recording.findUnique({ where: { id: recordingId } });
  if (!recording) {
    throw new Error("Recording not found.");
  }

  await db.recording.update({
    where: { id: recordingId },
    data: { status: RecordingStatus.QUEUED },
  });

  try {
    const response = await fetch(`${env.aiServiceBaseUrl}/queue/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recording_id: recordingId,
        object_key: recording.objectKey,
        bucket: recording.bucket,
        filename: recording.filename,
        mime_type: recording.mimeType,
        user_id: recording.userId,
        focus_session_id: recording.focusSessionId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to enqueue job: ${response.statusText}`);
    }

    const result = await response.json();
    console.log(`Enqueued analysis job: ${result.job_id}`);

    return result;
  } catch (error) {
    console.error("Failed to enqueue analysis job:", error);

    await db.recording.update({
      where: { id: recordingId },
      data: { status: RecordingStatus.FAILED, processingError: String(error) },
    });

    throw error;
  }
}

export async function processLongRecording(recordingId: string) {
  const recording = await db.recording.findUnique({ where: { id: recordingId } });
  if (!recording) {
    return;
  }

  await db.recording.update({
    where: { id: recordingId },
    data: { status: RecordingStatus.PROCESSING, processingError: null },
  });

  try {
    const response = await fetch(`${env.aiServiceBaseUrl}/analyze-audio/`, {
      method: "POST",
      body: recording.mimeType.startsWith("audio/")
        ? await audioFileToFormData(recording)
        : undefined,
    });

    if (!response.ok) {
      throw new Error(`Analysis failed: ${response.statusText}`);
    }

    const result = await response.json();
    const trajectory = result.emotion_trajectory ?? [];
    const dominantEmotion = dominantEmotionFromTrajectory(trajectory);
    const distribution = calculateDistribution(trajectory);
    const vadSeries = calculateVadSeries(trajectory);
    const stressSpike = findStressSpike(trajectory);
    const focusPeak = findFocusPeak(trajectory);
    const insights = buildInsights(trajectory);
    const recommendations = buildRecommendationSet(trajectory);

    const updated = await db.recording.update({
      where: { id: recordingId },
      data: {
        status: RecordingStatus.ANALYZED,
        durationSeconds: result.duration_seconds ?? 0,
        dominantEmotion: titleEmotion(dominantEmotion),
        analysisVersion: "ai-service-v1",
        emotionTrajectory: trajectory,
        vadSeries,
        distribution,
        segments: trajectory.map((point: { time: number; emotion: string }) => ({
          time: point.time,
          emotion: titleEmotion(point.emotion),
        })),
        aiInsights: insights,
        aiRecommendations: recommendations,
        processedAt: new Date(),
        processingError: null,
      },
    });

    if (updated.focusSessionId) {
      await db.focusSession.update({
        where: { id: updated.focusSessionId },
        data: {
          dominantEmotion: titleEmotion(dominantEmotion),
          stressSpikeTimestamp: stressSpike?.time ?? null,
          focusPeakTimestamp: focusPeak?.time ?? null,
        },
      });
    }

    await syncSessionFromRecording(updated.id);
  } catch (error) {
    await db.recording.update({
      where: { id: recordingId },
      data: {
        status: RecordingStatus.FAILED,
        processingError: error instanceof Error ? error.message : "Unknown processing error",
      },
    });
  }
}

export async function syncSessionFromRecording(recordingId: string) {
  const recording = await db.recording.findUnique({
    where: { id: recordingId },
    include: { focusSession: { include: { recordings: true } } },
  });

  const focusSession = recording?.focusSession;
  if (!focusSession) {
    return;
  }

  const analyzed = focusSession.recordings.filter((item) => item.status === RecordingStatus.ANALYZED);
  const durationSeconds = analyzed.reduce((sum, item) => sum + item.durationSeconds, 0);
  const latest = analyzed[0] ?? null;
  const first = analyzed[analyzed.length - 1] ?? null;
  const scoreBase = analyzed.length === 0 ? 0 : analyzed.reduce((sum, item) => {
    const distribution = (item.distribution as Array<{ emotion: string; value: number }> | null) ?? [];
    return sum + (distribution.find((entry) => entry.emotion === "Focused")?.value ?? 0);
  }, 0);

  await db.focusSession.update({
    where: { id: focusSession.id },
    data: {
      title: focusSession.topic ?? latest?.topic ?? focusSession.title,
      topic: latest?.topic ?? focusSession.topic,
      durationSeconds,
      startEmotion: first?.dominantEmotion ?? focusSession.startEmotion,
      endEmotion: latest?.dominantEmotion ?? focusSession.endEmotion,
      dominantEmotion: latest?.dominantEmotion ?? focusSession.dominantEmotion,
      score: analyzed.length === 0 ? 0 : Math.round(scoreBase / analyzed.length),
      summaryInsight: (latest?.aiInsights as string[] | null)?.[0] ?? focusSession.summaryInsight,
    },
  });
}

async function audioFileToFormData(recording: { objectKey: string; bucket: string; filename: string; mimeType: string }) {
  const formData = new FormData();
  formData.append("file", new Blob(), recording.filename);
  return formData;
}
