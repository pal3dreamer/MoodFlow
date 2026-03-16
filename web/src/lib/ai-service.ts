import axios from 'axios';
import FormData from 'form-data';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export interface EmotionResult {
  [key: string]: number;
}

export interface ProcessCheckinResponse {
  transcription: string;
  topic: string;
  emotion_trajectory: Array<{
    time: number;
    emotion: string;
    scores: EmotionResult;
  }>;
}

/**
 * Sends a request to the AI service to process a check-in.
 * Updated to match the FastAPI contract: POST /process-checkin/ with a file.
 */
export async function processCheckin(audioBuffer: Buffer, fileName: string): Promise<any> {
  try {
    const form = new FormData();
    // The AI service expects a field named 'file'
    form.append('file', audioBuffer, {
      filename: fileName,
      contentType: 'audio/wav',
    });

    const response = await axios.post(`${AI_SERVICE_URL}/process-checkin/`, form, {
      headers: {
        ...form.getHeaders(),
      },
    });

    // The AI service returns a trajectory. We'll simplify it for the main dashboard 
    // by taking the average or the last state for now, matching our frontend expectation.
    const data = response.data;
    const trajectory = data.emotion_trajectory || [];
    const lastPoint = trajectory.length > 0 ? trajectory[trajectory.length - 1] : null;

    return {
      transcription: data.transcription,
      topic: data.topic,
      emotion: lastPoint ? lastPoint.scores : { calm: 1.0 }
    };
  } catch (error) {
    console.error('Error calling AI Service /process-checkin/:', error);
    throw error;
  }
}
