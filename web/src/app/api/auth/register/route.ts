import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const user = await prisma.user.upsert({
      where: { email: normalizedEmail },
      update: name ? { name } : {},
      create: {
        email: normalizedEmail,
        name: name || normalizedEmail.split('@')[0],
      },
    });

    return NextResponse.json({ id: user.id });
  } catch (error) {
    console.error('Error registering user:', error);
    return NextResponse.json({ error: 'Unable to register' }, { status: 500 });
  }
}
