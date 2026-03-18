import logging
from app.pipelines.emotion import get_emotion_pipeline
from app.pipelines.transcription import get_transcription_pipeline

logging.basicConfig(level=logging.INFO)

print("Starting background model downloads...")

try:
    print("1/2 Loading Whisper Transcription Model...")
    transcription_pipeline = get_transcription_pipeline()
    transcription_pipeline._load()
    print("Whisper model loaded successfully!")
    
    print("2/2 Loading Emotion Detection Model...")
    emotion_pipeline = get_emotion_pipeline()
    emotion_pipeline._load()
    print("Emotion model loaded successfully!")
    
except Exception as e:
    print(f"Error downloading models: {e}")
