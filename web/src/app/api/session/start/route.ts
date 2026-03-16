import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uploadAudio } from '@/lib/storage';
import { processCheckin } from '@/lib/ai-service';
import { getAuthenticatedUser } from '@/lib/session';

// Force reload to pick up Prisma fix
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
    let aiResult;
    try {
      aiResult = await processCheckin(buffer, fileName);
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
      id: workSession.id,
      topic: workSession.topic,
      startEmotion: workSession.startEmotion,
      startTime: workSession.startTime,
    });

  } catch (error: any) {
    console.error('CRITICAL ERROR starting session:', error);
    if (error.code) console.error('Error Code:', error.code);
    if (error.meta) console.error('Error Meta:', error.meta);
    return NextResponse.json({ 
      error: 'Failed to start session', 
      details: error.message,
      code: error.code 
    }, { status: 500 });
  }
}
