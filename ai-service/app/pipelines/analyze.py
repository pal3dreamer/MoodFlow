import logging
import torch
from typing import List, Dict
from fastapi import UploadFile

from app.utils.audio import preprocess_audio
from app.pipelines.emotion import detect_emotions

logger = logging.getLogger(__name__)

WINDOW_SIZE_SECONDS = 3
STRIDE_SECONDS = 0.5


def analyze_audio_sliding_window(audio_tensor: torch.Tensor, sample_rate: int) -> List[Dict[str, any]]:
    """Analyze audio using sliding window for fine-grained VAD emotion detection.
    
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
    num_windows = (total_samples - window_samples) // stride_samples + 1
    
    logger.info(f"Analyzing audio with sliding window: {total_duration}s audio, {num_windows} windows")
    logger.info(f"  Window size: {WINDOW_SIZE_SECONDS}s, Stride: {STRIDE_SECONDS}s")
    
    results = []
    position = 0
    window_count = 0
    
    while position + window_samples <= total_samples:
        emotions = detect_emotions(audio_tensor[:, position:position + window_samples])
        
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
        window_count += 1
        
        if window_count % 10 == 0:
            logger.info(f"  Processed {window_count}/{num_windows} windows ({window_count*100//num_windows}%)")
    
    logger.info(f"  Analysis complete: {len(results)} data points")
    
    return results


def analyze_long_audio(audio_tensor: torch.Tensor) -> Dict[str, any]:
    """Analyze long audio recording with VAD emotion trajectory.
    
    Args:
        audio_tensor: Preprocessed audio waveform tensor
    
    Returns:
        Dict with duration and full VAD emotion trajectory
    """
    logger.info("Starting long audio analysis")
    
    sample_rate = 16000
    total_samples = audio_tensor.shape[1]
    duration_seconds = total_samples // sample_rate
    
    logger.info(f"Audio duration: {duration_seconds}s ({duration_seconds//60}m {duration_seconds%60}s)")
    
    trajectory = analyze_audio_sliding_window(audio_tensor, sample_rate)
    
    logger.info("Long audio analysis complete!")
    
    return {
        "duration_seconds": duration_seconds,
        "emotion_trajectory": trajectory,
    }


async def analyze_audio_from_file(file: UploadFile) -> Dict[str, any]:
    """Analyze an uploaded long audio file.
    
    Args:
        file: FastAPI UploadFile containing audio
    
    Returns:
        Dict with duration and emotion trajectory
    """
    logger.info(f"Received long audio file (content_type: {file.content_type})")
    
    audio_bytes = await file.read()
    file_size = len(audio_bytes)
    logger.info(f"Read audio file ({file_size} bytes)")
    
    logger.info("Preprocessing audio...")
    audio_tensor, sample_rate = preprocess_audio(audio_bytes)
    logger.info(f"Audio preprocessed: shape={audio_tensor.shape}, sample_rate={sample_rate}")
    
    return analyze_long_audio(audio_tensor)
