import { RecordingStatus } from "@prisma/client";
import { db } from "@/lib/db";

function formatDuration(durationSeconds: number) {
  const minutes = Math.round(durationSeconds / 60);
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;
    return `${hours}h ${remainder}m`;
  }
  return `${minutes}m`;
}

type DistributionItem = {
  emotion: string;
  value: number;
};

type VadPoint = {
  time: string;
  valence: number;
  arousal: number;
  dominance: number;
};

type TrajectoryPoint = {
  time: number;
  emotion: string;
};

type SegmentPoint = {
  time: number;
  emotion: string;
  duration?: number;
};

function titleEmotion(emotion: string | null | undefined) {
  if (!emotion) {
    return "Calm";
  }

  return emotion
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function colorForEmotion(emotion: string) {
  const normalized = emotion.toLowerCase();
  if (normalized.includes("focus")) return "bg-blue-500";
  if (normalized.includes("stress")) return "bg-red-500";
  if (normalized.includes("fatigue") || normalized.includes("tired")) return "bg-yellow-500";
  return "bg-green-500";
}

function average(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function clamp(value: number, min = 0, max = 100) {
  return Math.min(Math.max(Math.round(value), min), max);
}

function standardDeviation(values: number[]) {
  if (values.length <= 1) return 0;
  const mean = average(values);
  const variance = average(values.map((value) => (value - mean) ** 2));
  return Math.sqrt(variance);
}

function buildTimelineSegments(points: TrajectoryPoint[]) {
  if (points.length === 0) {
    return [];
  }

  const segments: Array<{ start: number; end: number; emotion: string }> = [];

  for (let index = 0; index < points.length; index += 1) {
    const current = points[index];
    const next = points[index + 1];
    const previous = segments[segments.length - 1];
    const end = next?.time ?? current.time + 5;

    if (previous && previous.emotion === current.emotion) {
      previous.end = end;
      continue;
    }

    segments.push({
      start: current.time,
      end,
      emotion: current.emotion,
    });
  }

  return segments;
}

function mostCommonEmotion(values: string[]) {
  if (values.length === 0) return "Calm";
  const counts = values.reduce<Map<string, number>>((accumulator, value) => {
    accumulator.set(value, (accumulator.get(value) ?? 0) + 1);
    return accumulator;
  }, new Map());

  return [...counts.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] ?? "Calm";
}

export async function getDashboardData(userId: string) {
  const [sessions, recordings] = await Promise.all([
    db.focusSession.findMany({
      where: { userId },
      orderBy: { startedAt: "desc" },
      take: 50,
    }),
    db.recording.findMany({
      where: { userId, status: RecordingStatus.ANALYZED },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const activeSession = sessions.find((item) => item.status === "ACTIVE") ?? null;
  const sessionsToday = sessions.filter((item) => item.startedAt >= today).length;
  const totalFocusTimeSeconds = sessions.reduce((sum, item) => sum + item.durationSeconds, 0);
  const avgSessionSeconds = sessions.length === 0 ? 0 : Math.round(totalFocusTimeSeconds / sessions.length);
  const currentMood = recordings[0]?.dominantEmotion ?? null;

  const recentSessions = sessions.slice(0, 3).map((item) => ({
    title: item.title,
    duration: formatDuration(item.durationSeconds),
    startEmotion: item.startEmotion ?? "Calm",
    endEmotion: item.endEmotion ?? "Focused",
    time: item.startedAt.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }),
  }));

  const distributionMap = new Map<string, number>();
  for (const recording of recordings) {
    const items = (recording.distribution as Array<{ emotion: string; value: number }> | null) ?? [];
    for (const item of items) {
      distributionMap.set(item.emotion, (distributionMap.get(item.emotion) ?? 0) + item.value);
    }
  }

  const emotionDistribution = [...distributionMap.entries()]
    .map(([emotion, total]) => ({
      emotion,
      value: recordings.length === 0 ? 0 : Math.round(total / recordings.length),
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 4);

  const weeklyTrends = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const daySessions = sessions.filter((item) => item.startedAt.toDateString() === date.toDateString());
    const focus = daySessions.length === 0 ? 0 : Math.round(daySessions.reduce((sum, item) => sum + item.score, 0) / daySessions.length);
    const stress = daySessions.length === 0 ? 0 : Math.max(0, 100 - focus);

    return {
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      focus,
      stress,
    };
  });

  const latestRecording = recordings[0];
  const insights = latestRecording
    ? ((latestRecording.aiInsights as string[] | null) ?? []).slice(0, 3).map((text, index) => ({
        type: index === 0 ? "stress" : index === 1 ? "productivity" : "pattern",
        text,
      }))
    : [];

  const timeline = ((latestRecording?.vadSeries as Array<{
    time: string;
    valence: number;
    arousal: number;
    dominance: number;
  }> | null) ?? []).map((point) => ({
    time: point.time,
    calm: Math.max(0, 100 - point.arousal),
    focus: Math.round((point.valence + point.dominance) / 2),
    stress: point.arousal,
  }));

  const stressInsight = latestRecording
    ? ((latestRecording.aiInsights as string[] | null) ?? []).find((text) =>
        text.toLowerCase().includes("stress"),
      ) ?? null
    : null;

  return {
    activeSession: activeSession
      ? {
          id: activeSession.id,
          title: activeSession.title,
          topic: activeSession.topic,
          startedAt: activeSession.startedAt,
          status: activeSession.status,
        }
      : null,
    stats: {
      sessionsToday,
      focusTime: formatDuration(totalFocusTimeSeconds),
      avgSession: formatDuration(avgSessionSeconds),
      currentMood,
    },
    recentSessions,
    weeklyTrends,
    emotionDistribution,
    insights,
    timeline,
    stressInsight,
    latestRecording,
  };
}

export async function getInsightsData(userId: string) {
  const [latestRecording, recentRecordings, sessions] = await Promise.all([
    db.recording.findFirst({
      where: { userId, status: RecordingStatus.ANALYZED },
      orderBy: { createdAt: "desc" },
    }),
    db.recording.findMany({
      where: { userId, status: RecordingStatus.ANALYZED },
      orderBy: { createdAt: "desc" },
      take: 24,
    }),
    db.focusSession.findMany({
      where: { userId },
      orderBy: { startedAt: "desc" },
      take: 24,
    }),
  ]);

  if (!latestRecording) {
    return {
      vadData: [],
      emotionTimeline: [],
      sessionPhases: [],
      weeklyData: [],
      emotionDistribution: [],
      audioSegments: [],
      aiInsights: [],
      aiRecommendations: [],
      sessions: [],
      focusStability: 0,
      emotionalConsistency: 0,
    };
  }

  const trajectory = (latestRecording.emotionTrajectory as Array<{ time: number; emotion: string }> | null) ?? [];
  const vadData = ((latestRecording.vadSeries as VadPoint[] | null) ?? []).map((point) => ({
    time: point.time,
    valence: clamp(point.valence),
    arousal: clamp(point.arousal),
    dominance: clamp(point.dominance),
  }));
  const timelineSegments = buildTimelineSegments(trajectory).slice(0, 6);
  const emotionTimeline = timelineSegments.map((segment) => ({
    range: `${segment.start}-${segment.end} min`,
    emotion: titleEmotion(segment.emotion),
    duration: `${Math.max(segment.end - segment.start, 1)} min`,
    color: colorForEmotion(segment.emotion),
  }));

  const sessionPhases = timelineSegments.map((segment, index) => {
    const segmentVads = vadData.filter((point) => {
      const time = Number.parseFloat(point.time);
      return Number.isFinite(time) && time >= segment.start && time <= segment.end;
    });
    const focusValues = segmentVads.map((point) => (point.valence + point.dominance) / 2);
    return {
      phase: `${titleEmotion(segment.emotion)} Phase ${index + 1}`,
      duration: `${Math.max(segment.end - segment.start, 1)} min`,
      dominant: titleEmotion(segment.emotion),
      score: clamp(average(focusValues)),
    };
  });

  const weeklyData = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const dayRecordings = recentRecordings.filter((item) => item.createdAt.toDateString() === date.toDateString());
    const dayDistributions = dayRecordings.flatMap((item) =>
      ((item.distribution as DistributionItem[] | null) ?? []),
    );
    const focusValues = dayDistributions
      .filter((item) => item.emotion === "Focused")
      .map((item) => item.value);
    const stressValues = dayDistributions
      .filter((item) => item.emotion === "Stressed")
      .map((item) => item.value);
    return {
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      emotion: mostCommonEmotion(dayRecordings.map((item) => item.dominantEmotion ?? "Calm")),
      focus: clamp(average(focusValues)),
      stress: clamp(average(stressValues)),
    };
  });

  const audioSegmentsSource = ((latestRecording.segments as SegmentPoint[] | null) ?? []).length > 0
    ? ((latestRecording.segments as SegmentPoint[] | null) ?? [])
    : timelineSegments.map((segment) => ({
        time: segment.start,
        emotion: titleEmotion(segment.emotion),
        duration: segment.end - segment.start,
      }));

  const focusSeries = recentRecordings.map((item) => {
    const distribution = (item.distribution as DistributionItem[] | null) ?? [];
    return distribution.find((entry) => entry.emotion === "Focused")?.value ?? 0;
  });
  const consistencySeries = sessions
    .map((item) => item.dominantEmotion)
    .filter((value): value is string => Boolean(value));
  const mostCommon = mostCommonEmotion(consistencySeries);
  const emotionalConsistency = consistencySeries.length === 0
    ? 0
    : clamp((consistencySeries.filter((value) => value === mostCommon).length / consistencySeries.length) * 100);
  const focusStability = focusSeries.length === 0 ? 0 : clamp(100 - standardDeviation(focusSeries));

  return {
    vadData,
    emotionTimeline,
    sessionPhases,
    weeklyData,
    emotionDistribution: ((latestRecording.distribution as DistributionItem[] | null) ?? []).map((item) => ({
      emotion: item.emotion,
      value: clamp(item.value),
    })),
    audioSegments: audioSegmentsSource.map((item, index, items) => {
      const duration = item.duration ?? Math.max((items[index + 1]?.time ?? item.time + 5) - item.time, 1);
      return {
        time: `${item.time} min`,
        emotion: titleEmotion(item.emotion),
        duration: `${Math.max(duration, 1)} min`,
      };
    }),
    aiInsights: (latestRecording.aiInsights as string[] | null) ?? [],
    aiRecommendations: (latestRecording.aiRecommendations as string[] | null) ?? [],
    sessions: sessions.slice(0, 4).map((item) => ({
      name: item.title,
      date: item.startedAt.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      duration: formatDuration(item.durationSeconds),
      focusPeak: item.focusPeakTimestamp != null ? `${item.focusPeakTimestamp} min` : "N/A",
      score: item.score,
    })),
    focusStability,
    emotionalConsistency,
  };
}
