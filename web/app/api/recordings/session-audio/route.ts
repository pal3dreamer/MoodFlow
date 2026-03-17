import { NextRequest, NextResponse } from "next/server";
import { RecordingKind } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { env } from "@/lib/env";
import { jsonError } from "@/lib/http";
import { createUploadedRecording, queueLongRecordingAnalysis } from "@/lib/recordings";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return jsonError("Audio file is required.");
    }

    if (!file.type.startsWith("audio/")) {
      return jsonError("Invalid audio file type.");
    }

    if (file.size > env.maxAudioFileSizeBytes) {
      return jsonError("Audio file exceeds the size limit.");
    }

    const focusSessionId = typeof formData.get("focusSessionId") === "string" ? String(formData.get("focusSessionId")) : null;

    const recording = await createUploadedRecording({
      userId: user.id,
      file,
      focusSessionId,
      kind: RecordingKind.SESSION_AUDIO,
    });

    await queueLongRecordingAnalysis(recording.id);
    return NextResponse.json(recording, { status: 202 });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Upload failed.", 500);
  }
}
