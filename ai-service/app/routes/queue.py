"""Queue management routes for job scheduling."""

import logging
from typing import Optional
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel

from worker.client import (
    enqueue_analyze_job,
    enqueue_checkin_job,
    get_job_status,
    get_queue_stats,
    JobResult,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/queue", tags=["queue"])


class EnqueueAnalyzeRequest(BaseModel):
    """Request to enqueue an analysis job."""
    recording_id: str
    object_key: str
    bucket: str
    filename: str = "audio.wav"
    mime_type: str = "audio/wav"
    user_id: str = ""
    focus_session_id: Optional[str] = None
    mode: str = "sliding_window"
    chunks: int = 10
    alpha: float = 5.0
    beta: float = 2.0
    gamma: float = 2.0
    delta: float = 2.0


class EnqueueCheckinRequest(BaseModel):
    """Request to enqueue a check-in job."""
    recording_id: str
    object_key: str
    bucket: str
    filename: str = "audio.wav"
    mime_type: str = "audio/wav"
    user_id: str = ""
    focus_session_id: Optional[str] = None


class EnqueueResponse(BaseModel):
    """Response after enqueueing a job."""
    job_id: str
    queue: str
    status: str


@router.post("/analyze", response_model=EnqueueResponse)
async def queue_analyze(request: EnqueueAnalyzeRequest):
    """Enqueue a long audio analysis job.
    
    The job will be processed by a worker in the background.
    Use GET /queue/stats to monitor queue status.
    """
    try:
        result = await enqueue_analyze_job(
            recording_id=request.recording_id,
            object_key=request.object_key,
            bucket=request.bucket,
            filename=request.filename,
            mime_type=request.mime_type,
            user_id=request.user_id,
            focus_session_id=request.focus_session_id,
            mode=request.mode,
            chunks=request.chunks,
            alpha=request.alpha,
            beta=request.beta,
            gamma=request.gamma,
            delta=request.delta,
        )
        
        logger.info(f"Enqueued analysis job: {result.job_id}")
        
        return EnqueueResponse(
            job_id=result.job_id,
            queue=result.queue,
            status=result.status,
        )
        
    except Exception as e:
        logger.error(f"Failed to enqueue analyze job: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/checkin", response_model=EnqueueResponse)
async def queue_checkin(request: EnqueueCheckinRequest):
    """Enqueue a check-in processing job.
    
    The job will be processed by a worker in the background.
    Use GET /queue/stats to monitor queue status.
    """
    try:
        result = await enqueue_checkin_job(
            recording_id=request.recording_id,
            object_key=request.object_key,
            bucket=request.bucket,
            filename=request.filename,
            mime_type=request.mime_type,
            user_id=request.user_id,
            focus_session_id=request.focus_session_id,
        )
        
        logger.info(f"Enqueued check-in job: {result.job_id}")
        
        return EnqueueResponse(
            job_id=result.job_id,
            queue=result.queue,
            status=result.status,
        )
        
    except Exception as e:
        logger.error(f"Failed to enqueue check-in job: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status/{queue}/{job_id}")
async def job_status(queue: str, job_id: str):
    """Get the status of a job.
    
    Args:
        queue: Queue name (analyze, checkin)
        job_id: Job ID from enqueue response
    """
    try:
        queue_name = f"moodflow:{queue}"
        status = await get_job_status(queue_name, job_id)
        return status
        
    except Exception as e:
        logger.error(f"Failed to get job status: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats")
async def queue_statistics():
    """Get statistics for all queues.
    
    Returns counts of waiting, active, completed, failed, and delayed jobs.
    """
    try:
        stats = await get_queue_stats()
        return stats
        
    except Exception as e:
        logger.error(f"Failed to get queue stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))
