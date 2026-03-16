import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/session';

export async function GET() {
  try {
    // For now, we fetch all sessions for the demo user
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json([]);
    }

    const sessions = await prisma.session.findMany({
      where: { userId: user.id },
      orderBy: { startTime: 'desc' },
      include: {
        checkins: {
          orderBy: { timestamp: 'asc' },
        },
      },
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}
