type EmotionPoint = {
  time: number;
  emotion: string;
  valence?: number;
  arousal?: number;
  dominance?: number;
  scores?: {
    calm?: number;
    stress?: number;
    focus?: number;
  };
};

export function dominantEmotionFromTrajectory(trajectory: EmotionPoint[]) {
  const counts = new Map<string, number>();
  for (const point of trajectory) {
    counts.set(point.emotion, (counts.get(point.emotion) ?? 0) + 1);
  }

  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Calm";
}

export function calculateDistribution(trajectory: EmotionPoint[]) {
  if (trajectory.length === 0) {
    return [];
  }

  const counts = new Map<string, number>();
  for (const point of trajectory) {
    counts.set(point.emotion, (counts.get(point.emotion) ?? 0) + 1);
  }

  return [...counts.entries()].map(([emotion, count]) => ({
    emotion: titleEmotion(emotion),
    value: Math.round((count / trajectory.length) * 100),
  }));
}

export function calculateVadSeries(trajectory: EmotionPoint[]) {
  return trajectory.map((point) => ({
    time: String(point.time),
    valence: Math.round((point.valence ?? 0) * 100),
    arousal: Math.round((point.arousal ?? 0) * 100),
    dominance: Math.round((point.dominance ?? 0) * 100),
  }));
}

export function findStressSpike(trajectory: EmotionPoint[]) {
  let best: EmotionPoint | null = null;
  let bestValue = -1;

  for (const point of trajectory) {
    const value = point.scores?.stress ?? 0;
    if (value > bestValue) {
      bestValue = value;
      best = point;
    }
  }

  return best ? { time: best.time, value: Math.round(bestValue * 100) } : null;
}

export function findFocusPeak(trajectory: EmotionPoint[]) {
  let best: EmotionPoint | null = null;
  let bestValue = -1;

  for (const point of trajectory) {
    const value = point.scores?.focus ?? 0;
    if (value > bestValue) {
      bestValue = value;
      best = point;
    }
  }

  return best ? { time: best.time, value: Math.round(bestValue * 100) } : null;
}

export function buildRecommendationSet(trajectory: EmotionPoint[]) {
  const stressSpike = findStressSpike(trajectory);
  const focusPeak = findFocusPeak(trajectory);

  return [
    stressSpike ? `Take a short break before ${stressSpike.time} minutes to reduce stress buildup.` : "Keep work blocks short when stress starts climbing.",
    focusPeak ? `Your best focus appears around ${focusPeak.time} minutes into a session.` : "Track more sessions to identify your strongest focus window.",
    "Review the emotion timeline after each session to spot patterns across the week.",
  ];
}

export function titleEmotion(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}
