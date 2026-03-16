import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const user = await prisma.user.findFirst({
      where: { email: 'demo@example.com' }
    });

    if (!user) {
      return NextResponse.json({ 
        focusStability: 0,
        emotionalDistribution: [],
        sessionCount: 0
      });
    }

    const sessions = await prisma.session.findMany({
      where: { 
        userId: user.id,
        endTime: { not: null }
      },
      orderBy: { startTime: 'desc' },
      take: 10
    });

    // Calculate Focus Stability (mock algorithm based on duration and consistency)
    const totalDuration = sessions.reduce((acc, s) => acc + (s.duration || 0), 0);
    const focusStability = sessions.length > 0 ? Math.min(Math.round((totalDuration / (sessions.length * 3600)) * 100), 100) : 0;

    // Calculate Emotional Distribution
    const emotions: Record<string, number> = {};
    sessions.forEach(s => {
      if (s.startEmotion) {
        const strongest = Object.entries(s.startEmotion).reduce((a, b) => (a[1] as number) > (b[1] as number) ? a : b);
        const name = strongest[0];
        emotions[name] = (emotions[name] || 0) + 1;
      }
    });

    const emotionalDistribution = Object.entries(emotions).map(([name, value]) => ({
      name,
      value
    }));

    return NextResponse.json({
      focusStability,
      emotionalDistribution,
      sessionCount: sessions.length,
      recentSessions: sessions.map(s => ({
        topic: s.topic,
        duration: s.duration,
        date: s.startTime
      }))
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
