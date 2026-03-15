import logging
import torch
from typing import Dict, List
from fastapi import UploadFile

from app.utils.audio import preprocess_audio
from app.pipelines.transcription import transcribe_audio
from app.pipelines.emotion import detect_emotions
from app.pipelines.topic import extract_topic, format_topic_for_response

logging.basicConfig(
    level=logging.INFO,
    format='[%(levelname)s] %(message)s'
)
logger = logging.getLogger(__name__)

WINDOW_SIZE_SECONDS = 1
STRIDE_SECONDS = 1


def analyze_audio_sliding_window(audio_tensor: torch.Tensor, sample_rate: int) -> List[Dict[str, any]]:
    """Analyze audio using sliding window for per-second emotion detection.
    
    Args:
        audio_tensor: Audio waveform tensor
        sample_rate: Sample rate (should be 16000)
    
    Returns:
        List of emotion results with VAD scores and timestamps
    """
    window_samples = WINDOW_SIZE_SECONDS * sample_rate
    stride_samples = int(STRIDE_SECONDS * sample_rate)
    
    total_samples = audio_tensor.shape[1]
    total_duration = total_samples // sample_rate
    
    logger.info(f"Analyzing audio with sliding window: {total_duration}s audio, {total_duration} results")
    logger.info(f"  Window size: {WINDOW_SIZE_SECONDS}s, Stride: {STRIDE_SECONDS}s")
    
    results = []
    position = 0
    
    while position + window_samples <= total_samples:
        chunk = audio_tensor[:, position:position + window_samples]
        
        emotions = detect_emotions(chunk)
        
        time_seconds = position // sample_rate
        
        emotion_dict = {"calm": emotions["calm"], "stress": emotions["stress"], "focus": emotions["focus"]}
        dominant = max(emotion_dict, key=emotion_dict.get)
        
        results.append({
            "time": time_seconds,
            "emotion": dominant,
            "valence": emotions["valence"],
            "arousal": emotions["arousal"],
            "dominance": emotions["dominance"],
            "scores": {
                "calm": emotions["calm"],
                "stress": emotions["stress"],
                "focus": emotions["focus"],
            },
        })
        
        position += stride_samples
    
    logger.info(f"  Analysis complete: {len(results)} data points")
    
    return results


def process_checkin(audio_tensor: torch.Tensor) -> Dict[str, any]:
    """Process a check-in audio clip through the full pipeline.
    
    Pipeline:
        audio -> transcription -> emotion detection (per second) -> topic extraction
    
    Args:
        audio_tensor: Preprocessed audio waveform tensor
    
    Returns:
        Dict with transcription, topic, emotion trajectory
    """
    logger.info("Starting check-in processing pipeline")
    
    sample_rate = 16000
    total_samples = audio_tensor.shape[1]
    duration_seconds = total_samples // sample_rate
    
    # Step 1: Transcription (full audio)
    logger.info("Step 1/3: Transcribing audio with Whisper...")
    transcription = transcribe_audio(audio_tensor)
    logger.info(f"Transcription complete: \"{transcription}\"")
    
    # Step 2: Emotion detection (per second)
    logger.info(f"Step 2/3: Detecting emotions (one per second)...")
    emotion_trajectory = analyze_audio_sliding_window(audio_tensor, sample_rate)
    logger.info(f"Emotion detection complete: {len(emotion_trajectory)} data points")
    
    # Step 3: Topic extraction
    logger.info("Step 3/3: Extracting topic from transcription...")
    raw_topic = extract_topic(transcription)
    topic = format_topic_for_response(raw_topic)
    logger.info(f"Topic extracted: {topic}")
    
    logger.info("Check-in processing complete!")
    
    return {
        "transcription": transcription.strip(),
        "topic": topic,
        "duration_seconds": duration_seconds,
        "emotion_trajectory": emotion_trajectory,
    }


async def process_checkin_from_file(file: UploadFile) -> Dict[str, any]:
    """Process an uploaded audio file through the check-in pipeline.
    
    Args:
        file: FastAPI UploadFile containing audio
    
    Returns:
        Dict with transcription, topic, and emotion trajectory
    """
    logger.info(f"Received audio file (content_type: {file.content_type})")
    
    # Read file content
    audio_bytes = await file.read()
    file_size = len(audio_bytes)
    logger.info(f"Read audio file ({file_size} bytes)")
    
    # Preprocess audio
    logger.info("Preprocessing audio...")
    audio_tensor, sample_rate = preprocess_audio(audio_bytes)
    logger.info(f"Audio preprocessed: shape={audio_tensor.shape}, sample_rate={sample_rate}")
    
    # Run full pipeline
    return process_checkin(audio_tensor)
