import logging
import torch
from typing import Dict, List
from fastapi import UploadFile

from app.utils.audio import preprocess_audio
from app.pipelines.transcription import transcribe_audio
from app.pipelines.emotion import get_emotion_pipeline
from app.pipelines.topic import extract_topic, format_topic_for_response

logging.basicConfig(
    level=logging.INFO,
    format='[%(levelname)s] %(message)s'
)
logger = logging.getLogger(__name__)

WINDOW_SIZE_SECONDS = 1.0
STRIDE_SECONDS = 1.0


def analyze_audio_sliding_window(audio_tensor: torch.Tensor, sample_rate: int) -> List[Dict[str, any]]:
    """Analyze audio using sliding window with batch processing.
    
    Args:
        audio_tensor: Audio waveform tensor
        sample_rate: Sample rate (should be 16000)
    
    Returns:
        List of emotion results with VAD scores and timestamps
    """
    logger.info(f"Analyzing audio with sliding window (1s windows)")
    
    pipeline = get_emotion_pipeline()
    
    results = pipeline.analyze_sliding_window(
        audio_tensor,
        window_size_seconds=WINDOW_SIZE_SECONDS,
        stride_seconds=STRIDE_SECONDS,
    )
    
    for i, item in enumerate(results):
        item["scores"] = {
            "calm": item["calm"],
            "stress": item["stress"],
            "focus": item["focus"],
        }
        item["emotion"] = item.pop("dominant_emotion", "calm")
        item.pop("calm", None)
        item.pop("stress", None)
        item.pop("focus", None)
    
    logger.info(f"  Analysis complete: {len(results)} data points")
    return results


def process_checkin(audio_tensor: torch.Tensor) -> Dict[str, any]:
    """Process a check-in audio clip through the full pipeline.
    
    Pipeline:
        audio -> transcription -> emotion detection -> topic extraction
    
    Args:
        audio_tensor: Preprocessed audio waveform tensor
    
    Returns:
        Dict with transcription, topic, emotion trajectory
    """
    logger.info("Starting check-in processing pipeline")
    
    sample_rate = 16000
    total_samples = audio_tensor.shape[1]
    duration_seconds = total_samples / sample_rate
    
    logger.info("Step 1/3: Transcribing audio with Whisper...")
    transcription = transcribe_audio(audio_tensor)
    logger.info(f"Transcription complete: \"{transcription[:50]}...\"" if len(transcription) > 50 else f"Transcription complete: \"{transcription}\"")
    
    logger.info("Step 2/3: Detecting emotions...")
    emotion_trajectory = analyze_audio_sliding_window(audio_tensor, sample_rate)
    logger.info(f"Emotion detection complete: {len(emotion_trajectory)} data points")
    
    logger.info("Step 3/3: Extracting topic from transcription...")
    raw_topic = extract_topic(transcription)
    topic = format_topic_for_response(raw_topic)
    logger.info(f"Topic extracted: {topic}")
    
    logger.info("Check-in processing complete!")
    
    return {
        "transcription": transcription.strip(),
        "topic": topic,
        "duration_seconds": round(duration_seconds, 2),
        "emotion_trajectory": emotion_trajectory,
    }


async def process_checkin_from_file(file: UploadFile) -> Dict[str, any]:
    """Process an uploaded audio file through the check-in pipeline."""
    logger.info(f"Received audio file (content_type: {file.content_type})")
    
    audio_bytes = await file.read()
    file_size = len(audio_bytes)
    logger.info(f"Read audio file ({file_size} bytes)")
    
    logger.info("Preprocessing audio...")
    audio_tensor, sample_rate = preprocess_audio(audio_bytes)
    logger.info(f"Audio preprocessed: shape={audio_tensor.shape}, sample_rate={sample_rate}")
    
    return process_checkin(audio_tensor)
