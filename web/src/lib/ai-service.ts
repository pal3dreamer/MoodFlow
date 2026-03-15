import axios from 'axios';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export interface EmotionResult {
  [key: string]: number;
}

export interface ProcessCheckinResponse {
  transcription: string;
  topic: string;
  emotion: EmotionResult;
}

export interface AnalyzeAudioResponse {
  duration: string;
  emotion_timeline: Array<{
    time: string;
    emotion: string;
  }>;
}

/**
 * Sends a request to the AI service to process a check-in (start/end of session).
 * For this implementation, we assume the AI service can accept an audio URL or we'll send it a blob.
 * If the AI service expects a file, we should fetch it from MinIO first or pass it as multipart form data.
 */
export async function processCheckin(audioUrl: string): Promise<ProcessCheckinResponse> {
  try {
    // In a real scenario, we might need to send the actual file or a presigned URL
    // For now, we follow the contract in the product requirements
    const response = await axios.post(`${AI_SERVICE_URL}/process-checkin`, {
      audio_url: audioUrl,
    });
    return response.data;
  } catch (error) {
    console.error('Error calling AI Service /process-checkin:', error);
    throw error;
  }
}

export async function analyzeAudio(audioUrl: string): Promise<AnalyzeAudioResponse> {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/analyze-audio`, {
      audio_url: audioUrl,
    });
    return response.data;
  } catch (error) {
    console.error('Error calling AI Service /analyze-audio:', error);
    throw error;
  }
}
