"""Job processors for recording analysis."""

import logging
from typing import Dict, Any, Optional
from pathlib import Path
import io

import torch
import numpy as np

from worker.jobs.data import AnalyzeJobData, CheckinJobData
from worker.config import ANALYZE_JOB_OPTIONS, CHECKIN_JOB_OPTIONS

logger = logging.getLogger(__name__)


def get_audio_from_minio(object_key: str, bucket: str) -> bytes:
    """Download audio from MinIO storage.
    
    Args:
        object_key: MinIO object key
        bucket: MinIO bucket name
    
    Returns:
        Audio file bytes
    """
    try:
        from minio import Minio
        import os
        
        client = Minio(
            os.getenv("MINIO_ENDPOINT", "localhost:9000"),
            access_key=os.getenv("MINIO_ACCESS_KEY", "minio_user"),
            secret_key=os.getenv("MINIO_SECRET_KEY", "minio_password"),
            secure=os.getenv("MINIO_USE_SSL", "false").lower() == "true",
        )
        
        data = client.get_object(bucket, object_key)
        return data.read()
    except Exception as e:
        logger.error(f"Failed to download from MinIO: {e}")
        raise


def update_recording_status(
    recording_id: str,
    status: str,
    result: Optional[Dict[str, Any]] = None,
    error: Optional[str] = None,
) -> Dict[str, Any]:
    """Update recording status in database via API.
    
    Args:
        recording_id: Recording ID
        status: New status
        result: Optional result data
        error: Optional error message
    
    Returns:
        Updated recording data
    """
    import httpx
    import os
    
    api_url = os.getenv("WEB_API_URL", "http://localhost:3000")
    
    payload = {
        "recording_id": recording_id,
        "status": status,
    }
    
    if result:
        payload["result"] = result
    
    if error:
        payload["error"] = error
    
    try:
        response = httpx.post(
            f"{api_url}/api/internal/update-recording",
            json=payload,
            timeout=30.0,
        )
        response.raise_for_status()
        return response.json()
    except Exception as e:
        logger.error(f"Failed to update recording status: {e}")
        return {"error": str(e)}


async def process_analyze_job(job_data: Dict[str, Any]) -> Dict[str, Any]:
    """Process long audio analysis job.
    
    Args:
        job_data: Job data dictionary
    
    Returns:
        Analysis result
    """
    from app.pipelines.analyze import analyze_long_audio
    from app.pipelines.transcription import transcribe_audio
    from app.utils.audio import preprocess_audio
    from app.pipelines.topic import extract_topic, format_topic_for_response
    
    data = AnalyzeJobData.from_dict(job_data)
    logger.info(f"Processing analysis job for recording: {data.recording_id}")
    
    try:
        audio_bytes = get_audio_from_minio(data.object_key, data.bucket)
        logger.info(f"Downloaded audio ({len(audio_bytes)} bytes)")
        
        audio_tensor, sample_rate = preprocess_audio(audio_bytes)
        logger.info(f"Preprocessed audio: {audio_tensor.shape}, {sample_rate}Hz")
        
        logger.info("Running full analysis...")
        
        transcription = transcribe_audio(audio_tensor)
        topic = format_topic_for_response(extract_topic(transcription) or "General")
        
        analysis_result = analyze_long_audio(
            audio_tensor,
            analysis_mode=data.mode,
            num_chunks=data.chunks,
            alpha=data.alpha,
            beta=data.beta,
            gamma=data.gamma,
            delta=data.delta,
        )
        
        result = {
            "transcription": transcription,
            "topic": topic,
            "duration_seconds": analysis_result.get("duration_seconds", 0),
            "emotion_trajectory": analysis_result.get("emotion_trajectory", []),
            "stress_summary": analysis_result.get("stress_summary", {}),
        }
        
        logger.info(f"Analysis complete: {len(result['emotion_trajectory'])} data points")
        
        return result
        
    except Exception as e:
        logger.error(f"Analysis failed: {e}")
        raise


async def process_checkin_job(job_data: Dict[str, Any]) -> Dict[str, Any]:
    """Process short check-in job.
    
    Args:
        job_data: Job data dictionary
    
    Returns:
        Check-in result
    """
    from app.pipelines.checkin import process_checkin
    from app.utils.audio import preprocess_audio
    
    data = CheckinJobData.from_dict(job_data)
    logger.info(f"Processing check-in job for recording: {data.recording_id}")
    
    try:
        audio_bytes = get_audio_from_minio(data.object_key, data.bucket)
        logger.info(f"Downloaded audio ({len(audio_bytes)} bytes)")
        
        audio_tensor, sample_rate = preprocess_audio(audio_bytes)
        logger.info(f"Preprocessed audio: {audio_tensor.shape}, {sample_rate}Hz")
        
        logger.info("Running check-in processing...")
        
        result = process_checkin(audio_tensor)
        
        logger.info(f"Check-in complete: topic={result.get('topic')}")
        
        return result
        
    except Exception as e:
        logger.error(f"Check-in processing failed: {e}")
        raise
