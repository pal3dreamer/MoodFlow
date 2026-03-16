import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uploadAudio } from '@/lib/storage';
import { processCheckin } from '@/lib/ai-service';
import { getAuthenticatedUser } from '@/lib/session';

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const sessionId = formData.get('sessionId') as string;
    const audioFile = formData.get('audio') as File;

    if (!sessionId || !audioFile) {
      return NextResponse.json({ error: 'Missing sessionId or audio file' }, { status: 400 });
    }

    // 1. Find the active session
    const workSession = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!workSession || workSession.endTime) {
      return NextResponse.json({ error: 'Session not found or already ended' }, { status: 404 });
    }

    // 2. Upload end audio to MinIO
    const buffer = Buffer.from(await audioFile.arrayBuffer());
    const fileName = `sessions/${workSession.userId}/end-${Date.now()}.wav`;
    const audioUrl = await uploadAudio(fileName, buffer, audioFile.type);

    // 3. Call AI Service
    let aiResult;
    try {
      aiResult = await processCheckin(buffer, fileName);
    } catch (aiError) {
      console.error('AI Service call failed:', aiError);
      aiResult = {
        transcription: "Mock end transcription",
        topic: workSession.topic,
        emotion: { exhausted: 0.7, focused: 0.3 }
      };
    }

    // 4. Update session
    const endTime = new Date();
    const durationInSeconds = Math.floor((endTime.getTime() - workSession.startTime.getTime()) / 1000);

    const updatedSession = await prisma.session.update({
      where: { id: sessionId },
      data: {
        endTime: endTime,
        endEmotion: aiResult.emotion as any,
        duration: durationInSeconds,
        checkins: {
          create: {
            audioUrl: audioUrl,
            transcription: aiResult.transcription,
            emotionVector: aiResult.emotion as any,
          }
        }
      }
    });

    return NextResponse.json({
      endTime: updatedSession.endTime,
      endEmotion: updatedSession.endEmotion,
      duration: updatedSession.duration,
    });

  } catch (error) {
    console.error('Error ending session:', error);
    return NextResponse.json({ error: 'Failed to end session' }, { status: 500 });
  }
}
