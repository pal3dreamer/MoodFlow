"""Job queue client for enqueueing jobs.

This module provides functions to enqueue jobs from:
- Web app API routes
- Direct API calls
- CLI tools
"""

import os
import logging
from typing import Dict, Any, Optional
from dataclasses import dataclass

logger = logging.getLogger(__name__)

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")


@dataclass
class JobResult:
    """Result of enqueueing a job."""
    job_id: str
    queue: str
    status: str


def get_queue(name: str):
    """Get a BullMQ queue instance.
    
    Args:
        name: Queue name from QUEUE_NAMES
    
    Returns:
        Queue instance
    """
    from bullmq import Queue
    from worker.config import QUEUE_NAMES, DEFAULT_JOB_OPTIONS
    
    queue_name = QUEUE_NAMES.get(name, name)
    return Queue(queue_name, connection={"url": REDIS_URL})


async def enqueue_analyze_job(
    recording_id: str,
    object_key: str,
    bucket: str,
    filename: str = "audio.wav",
    mime_type: str = "audio/wav",
    user_id: str = "",
    focus_session_id: Optional[str] = None,
    mode: str = "sliding_window",
    chunks: int = 10,
    alpha: float = 5.0,
    beta: float = 2.0,
    gamma: float = 2.0,
    delta: float = 2.0,
    priority: int = 0,
) -> JobResult:
    """Enqueue a long audio analysis job.
    
    Args:
        recording_id: Database recording ID
        object_key: MinIO object key
        bucket: MinIO bucket
        filename: Original filename
        mime_type: Audio MIME type
        user_id: User ID
        focus_session_id: Optional focus session ID
        mode: Analysis mode (sliding_window or chunks)
        chunks: Number of chunks (for chunks mode)
        alpha: Stress calculation alpha
        beta: Stress calculation beta
        gamma: Stress calculation gamma
        delta: Stress calculation delta
        priority: Job priority (higher = more priority)
    
    Returns:
        JobResult with job ID and status
    """
    from bullmq import Queue
    from worker.config import QUEUE_NAMES, ANALYZE_JOB_OPTIONS
    
    queue = Queue(QUEUE_NAMES["analyze"], connection={"url": REDIS_URL})
    
    job_data = {
        "recording_id": recording_id,
        "object_key": object_key,
        "bucket": bucket,
        "filename": filename,
        "mime_type": mime_type,
        "user_id": user_id,
        "focus_session_id": focus_session_id,
        "mode": mode,
        "chunks": chunks,
        "alpha": alpha,
        "beta": beta,
        "gamma": gamma,
        "delta": delta,
    }
    
    job_options = {**ANALYZE_JOB_OPTIONS}
    
    if priority != 0:
        job_options["jobId"] = f"analyze-{recording_id}"
    
    job = await queue.add(
        f"analyze-{recording_id}",
        job_data,
        job_options,
    )
    
    logger.info(f"Enqueued analyze job: {job.id} for recording {recording_id}")
    
    return JobResult(
        job_id=job.id,
        queue=QUEUE_NAMES["analyze"],
        status="queued",
    )


async def enqueue_checkin_job(
    recording_id: str,
    object_key: str,
    bucket: str,
    filename: str = "audio.wav",
    mime_type: str = "audio/wav",
    user_id: str = "",
    focus_session_id: Optional[str] = None,
    priority: int = 0,
) -> JobResult:
    """Enqueue a short check-in processing job.
    
    Args:
        recording_id: Database recording ID
        object_key: MinIO object key
        bucket: MinIO bucket
        filename: Original filename
        mime_type: Audio MIME type
        user_id: User ID
        focus_session_id: Optional focus session ID
        priority: Job priority (higher = more priority)
    
    Returns:
        JobResult with job ID and status
    """
    from bullmq import Queue
    from worker.config import QUEUE_NAMES, CHECKIN_JOB_OPTIONS
    
    queue = Queue(QUEUE_NAMES["checkin"], connection={"url": REDIS_URL})
    
    job_data = {
        "recording_id": recording_id,
        "object_key": object_key,
        "bucket": bucket,
        "filename": filename,
        "mime_type": mime_type,
        "user_id": user_id,
        "focus_session_id": focus_session_id,
    }
    
    job_options = {**CHECKIN_JOB_OPTIONS}
    
    if priority != 0:
        job_options["jobId"] = f"checkin-{recording_id}"
    
    job = await queue.add(
        f"checkin-{recording_id}",
        job_data,
        job_options,
    )
    
    logger.info(f"Enqueued check-in job: {job.id} for recording {recording_id}")
    
    return JobResult(
        job_id=job.id,
        queue=QUEUE_NAMES["checkin"],
        status="queued",
    )


async def get_job_status(queue_name: str, job_id: str) -> Dict[str, Any]:
    """Get the status of a job.
    
    Args:
        queue_name: Queue name
        job_id: Job ID
    
    Returns:
        Job status information
    """
    from bullmq import Queue
    
    queue = Queue(queue_name, connection={"url": REDIS_URL})
    job = await queue.getJob(job_id)
    
    if not job:
        return {"status": "not_found"}
    
    state = await job.getState()
    
    result = {
        "id": job.id,
        "status": state,
        "data": job.data,
    }
    
    if state == "completed":
        result["result"] = job.returnvalue
    elif state == "failed":
        result["error"] = job.failedReason
    
    progress = await job.getProgress()
    if progress is not None:
        result["progress"] = progress
    
    return result


async def get_queue_stats() -> Dict[str, Any]:
    """Get statistics for all queues.
    
    Returns:
        Queue statistics
    """
    from worker.config import QUEUE_NAMES
    
    stats = {}
    
    for name, queue_name in QUEUE_NAMES.items():
        queue = Queue(queue_name, connection={"url": REDIS_URL})
        
        counts = await queue.getJobCounts("waiting", "active", "completed", "failed", "delayed")
        
        stats[name] = {
            "name": queue_name,
            "waiting": counts.get("waiting", 0),
            "active": counts.get("active", 0),
            "completed": counts.get("completed", 0),
            "failed": counts.get("failed", 0),
            "delayed": counts.get("delayed", 0),
        }
    
    return stats
