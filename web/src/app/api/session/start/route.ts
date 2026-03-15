import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uploadAudio } from '@/lib/storage';
import { processCheckin } from '@/lib/ai-service';
import { getServerSession } from 'next-auth';
// You'll need to create this NextAuth options file later
// import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    // 1. Get user session (Authentication)
    // For now, if Auth is not yet fully configured, we'll use a placeholder user or check if it's there
    // const session = await getServerSession(authOptions);
    // if (!session?.user?.id) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }
    // const userId = session.user.id;

    // FOR DEVELOPMENT: Use a placeholder user ID until NextAuth is fully ready
    // You should have at least one user in the database or use a static one for now
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'demo@example.com',
          name: 'Demo User',
        },
      });
    }
    const userId = user.id;

    // 2. Receive audio data
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;
    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await audioFile.arrayBuffer());
    const fileName = `sessions/${userId}/start-${Date.now()}.wav`;

    // 3. Upload to MinIO
    const audioUrl = await uploadAudio(fileName, buffer, audioFile.type);

    // 4. Call AI service /process-checkin
    // NOTE: In local dev, AI Service might not be running yet, so we'll add a try-catch
    let aiResult;
    try {
      aiResult = await processCheckin(audioUrl);
    } catch (aiError) {
      console.error('AI Service call failed, using mock data for development:', aiError);
      aiResult = {
        transcription: "Mock transcription for development",
        topic: "Mock Topic",
        emotion: { calm: 0.8, focus: 0.2 }
      };
    }

    // 5. Create session in database
    const workSession = await prisma.session.create({
      data: {
        userId: userId,
        topic: aiResult.topic,
        startEmotion: aiResult.emotion as any,
        checkins: {
          create: {
            audioUrl: audioUrl,
            transcription: aiResult.transcription,
            emotionVector: aiResult.emotion as any,
          }
        }
      },
      include: {
        checkins: true
      }
    });

    return NextResponse.json({
      sessionId: workSession.id,
      topic: workSession.topic,
      startEmotion: workSession.startEmotion,
      startTime: workSession.startTime,
    });

  } catch (error) {
    console.error('Error starting session:', error);
    return NextResponse.json({ error: 'Failed to start session' }, { status: 500 });
  }
}
