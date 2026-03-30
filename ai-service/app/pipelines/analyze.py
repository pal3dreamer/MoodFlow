import logging
import torch
from typing import List, Dict, Optional, Any
from fastapi import UploadFile

from app.utils.audio import preprocess_audio
from app.pipelines.emotion import get_emotion_pipeline, EmotionDetectionPipeline
from app.pipelines.transcription import get_transcription_pipeline

logger = logging.getLogger(__name__)

CHUNK_SIZE_SECONDS = 3.0
STRIDE_SECONDS = 1.5

DEFAULT_ALPHA = 5.0
DEFAULT_BETA = 2.0
DEFAULT_GAMMA = 2.0
DEFAULT_DELTA = 2.0

TEMPORAL_ALPHA = 0.3
STRESS_SPIKE_THRESHOLD = 0.3


def apply_temporal_smoothing(stress_values: List[float], alpha: float = TEMPORAL_ALPHA) -> List[float]:
    """Apply exponential moving average smoothing to stress values."""
    if not stress_values:
        return []
    
    smoothed = [stress_values[0]]
    for i in range(1, len(stress_values)):
        ema = alpha * stress_values[i] + (1 - alpha) * smoothed[i-1]
        smoothed.append(ema)
    
    return smoothed


def detect_stress_spikes(stress_values: List[float], threshold: float = STRESS_SPIKE_THRESHOLD) -> List[Dict[str, Any]]:
    """Detect sudden spikes in stress levels."""
    spikes = []
    for i in range(1, len(stress_values)):
        delta = abs(stress_values[i] - stress_values[i-1])
        if delta > threshold:
            spikes.append({
                "index": i,
                "previous_stress": round(stress_values[i-1], 4),
                "spike_stress": round(stress_values[i], 4),
                "delta": round(delta, 4),
            })
    
    return spikes


def analyze_audio_chunks(
    audio_tensor: torch.Tensor, 
    sample_rate: int,
    num_chunks: int,
    alpha: float = DEFAULT_ALPHA,
    beta: float = DEFAULT_BETA,
    gamma: float = DEFAULT_GAMMA,
    delta: float = DEFAULT_DELTA,
) -> List[Dict[str, any]]:
    """Analyze audio by splitting into equal chunks with batch processing."""
    total_samples = audio_tensor.shape[1]
    chunk_samples = total_samples // num_chunks
    
    logger.info(f"Analyzing audio with chunking: {num_chunks} equal chunks")
    logger.info(f"  Alpha={alpha}, Beta={beta}, Gamma={gamma}, Delta={delta}")
    
    pipeline = get_emotion_pipeline()
    chunks = []
    
    for i in range(num_chunks):
        start = i * chunk_samples
        end = start + chunk_samples if i < num_chunks - 1 else total_samples
        chunk = audio_tensor[:, start:end]
        chunks.append(chunk)
    
    batch_results = pipeline.detect_emotions_batch(chunks, alpha=alpha, beta=beta, gamma=gamma, delta=delta)
    
    results = []
    for i, emotions in enumerate(batch_results):
        start = i * chunk_samples
        results.append({
            "chunk": i,
            "time": start // sample_rate,
            "emotion": emotions["dominant_emotion"],
            "arousal": emotions["arousal"],
            "dominance": emotions["dominance"],
            "valence": emotions["valence"],
            "stress_index": emotions["stress_index"],
            "scores": {
                "calm": emotions["calm"],
                "stress": emotions["stress"],
                "focus": emotions["focus"],
            },
        })
    
    logger.info(f"  Analysis complete: {len(results)} data points")
    return results


def analyze_audio_sliding_window(
    audio_tensor: torch.Tensor, 
    sample_rate: int,
    window_size_seconds: float = CHUNK_SIZE_SECONDS,
    stride_seconds: float = STRIDE_SECONDS,
    alpha: float = DEFAULT_ALPHA,
    beta: float = DEFAULT_BETA,
    gamma: float = DEFAULT_GAMMA,
    delta: float = DEFAULT_DELTA,
) -> List[Dict[str, any]]:
    """Analyze audio using sliding window with optimized batch processing."""
    logger.info(f"Analyzing audio with sliding window")
    logger.info(f"  Window size: {window_size_seconds}s, Stride: {stride_seconds}s")
    logger.info(f"  Alpha={alpha}, Beta={beta}, Gamma={gamma}, Delta={delta}")
    
    pipeline = get_emotion_pipeline()
    
    results = pipeline.analyze_sliding_window(
        audio_tensor,
        window_size_seconds=window_size_seconds,
        stride_seconds=stride_seconds,
        alpha=alpha,
        beta=beta,
        gamma=gamma,
        delta=delta,
    )
    
    for i, item in enumerate(results):
        item["scores"] = {
            "calm": item["calm"],
            "stress": item["stress"],
            "focus": item["focus"],
        }
        item.pop("calm", None)
        item.pop("stress", None)
        item.pop("focus", None)
    
    logger.info(f"  Analysis complete: {len(results)} data points")
    return results


def analyze_long_audio(
    audio_tensor: torch.Tensor,
    analysis_mode: str = "sliding_window",
    num_chunks: int = 10,
    alpha: float = DEFAULT_ALPHA,
    beta: float = DEFAULT_BETA,
    gamma: float = DEFAULT_GAMMA,
    delta: float = DEFAULT_DELTA,
) -> Dict[str, any]:
    """Analyze long audio recording with VAD emotion trajectory."""
    logger.info("Starting long audio analysis")
    
    sample_rate = 16000
    total_samples = audio_tensor.shape[1]
    duration_seconds = total_samples / sample_rate
    
    logger.info(f"Audio duration: {duration_seconds:.1f}s ({int(duration_seconds//60)}m {int(duration_seconds%60)}s)")
    logger.info(f"Analysis mode: {analysis_mode}")
    
    if analysis_mode == "chunks":
        trajectory = analyze_audio_chunks(
            audio_tensor, 
            sample_rate, 
            num_chunks,
            alpha=alpha,
            beta=beta,
            gamma=gamma,
            delta=delta
        )
    else:
        trajectory = analyze_audio_sliding_window(
            audio_tensor,
            sample_rate,
            alpha=alpha,
            beta=beta,
            gamma=gamma,
            delta=delta
        )
    
    stress_values = [t["stress_index"] for t in trajectory]
    smoothed_stress = apply_temporal_smoothing(stress_values)
    spikes = detect_stress_spikes(smoothed_stress)
    
    logger.info("Long audio analysis complete!")
    
    return {
        "duration_seconds": round(duration_seconds, 2),
        "analysis_mode": analysis_mode,
        "emotion_trajectory": trajectory,
        "stress_summary": {
            "average": round(sum(stress_values) / len(stress_values), 4) if stress_values else 0,
            "max": round(max(stress_values), 4) if stress_values else 0,
            "min": round(min(stress_values), 4) if stress_values else 0,
            "spikes": len(spikes),
        },
    }


async def analyze_audio_from_file(
    file: UploadFile,
    analysis_mode: str = "sliding_window",
    num_chunks: int = 10,
    alpha: float = DEFAULT_ALPHA,
    beta: float = DEFAULT_BETA,
    gamma: float = DEFAULT_GAMMA,
    delta: float = DEFAULT_DELTA,
) -> Dict[str, any]:
    """Analyze an uploaded long audio file."""
    logger.info(f"Received long audio file (content_type: {file.content_type})")
    
    audio_bytes = await file.read()
    file_size = len(audio_bytes)
    logger.info(f"Read audio file ({file_size} bytes)")
    
    logger.info("Preprocessing audio...")
    audio_tensor, sample_rate = preprocess_audio(audio_bytes)
    logger.info(f"Audio preprocessed: shape={audio_tensor.shape}, sample_rate={sample_rate}")
    
    return analyze_long_audio(
        audio_tensor,
        analysis_mode=analysis_mode,
        num_chunks=num_chunks,
        alpha=alpha,
        beta=beta,
        gamma=gamma,
        delta=delta
    )
