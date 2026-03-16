import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/session';

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(null);
    }

    const activeSession = await prisma.session.findFirst({
      where: { 
        userId: user.id,
        endTime: null 
      },
      include: {
        checkins: {
          orderBy: { timestamp: 'asc' },
        },
      },
    });

    return NextResponse.json(activeSession);
  } catch (error) {
    console.error('Error fetching active session:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
