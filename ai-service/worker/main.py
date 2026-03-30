"""Worker entry point for MoodFlow AI service.

This worker processes jobs from the Redis queue:
- Long audio analysis
- Short check-in processing

Usage:
    python worker/main.py
    python worker/main.py --workers 2
"""

import asyncio
import logging
import signal
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from worker.config import (
    REDIS_URL,
    QUEUE_NAMES,
    DEFAULT_JOB_OPTIONS,
    ANALYZE_JOB_OPTIONS,
    CHECKIN_JOB_OPTIONS,
)
from worker.jobs.processors import process_analyze_job, process_checkin_job

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


class MoodFlowWorker:
    """Main worker class for processing jobs."""
    
    def __init__(self):
        self.workers = []
        self.is_shutting_down = False
        self.bully_queue = None
        
    async def start(self, num_workers: int = 2):
        """Start the worker pool.
        
        Args:
            num_workers: Number of concurrent workers
        """
        from bullmq import Worker
        
        logger.info(f"Starting MoodFlow AI worker with {num_workers} workers")
        logger.info(f"Redis URL: {REDIS_URL}")
        
        self.workers = []
        
        analyze_worker = Worker(
            QUEUE_NAMES["analyze"],
            self._process_analyze,
            {
                "connection": {"url": REDIS_URL},
                "concurrency": num_workers,
            },
        )
        
        checkin_worker = Worker(
            QUEUE_NAMES["checkin"],
            self._process_checkin,
            {
                "connection": {"url": REDIS_URL},
                "concurrency": num_workers,
            },
        )
        
        analyze_worker.on("completed", self._on_job_completed)
        analyze_worker.on("failed", self._on_job_failed)
        checkin_worker.on("completed", self._on_job_completed)
        checkin_worker.on("failed", self._on_job_failed)
        
        self.workers = [analyze_worker, checkin_worker]
        
        logger.info("Workers started successfully")
        logger.info(f"  - Analyze queue: {QUEUE_NAMES['analyze']}")
        logger.info(f"  - Checkin queue: {QUEUE_NAMES['checkin']}")
    
    async def _process_analyze(self, job) -> dict:
        """Process analysis job.
        
        Args:
            job: BullMQ job object
        
        Returns:
            Job result
        """
        logger.info(f"Processing analyze job {job.id}: {job.data.get('recording_id', 'unknown')}")
        
        await job.updateProgress(10)
        
        try:
            result = await process_analyze_job(job.data)
            
            await job.updateProgress(100)
            
            logger.info(f"Analysis job {job.id} completed successfully")
            
            return result
            
        except Exception as e:
            logger.error(f"Analysis job {job.id} failed: {e}")
            raise
    
    async def _process_checkin(self, job) -> dict:
        """Process check-in job.
        
        Args:
            job: BullMQ job object
        
        Returns:
            Job result
        """
        logger.info(f"Processing check-in job {job.id}: {job.data.get('recording_id', 'unknown')}")
        
        await job.updateProgress(10)
        
        try:
            result = await process_checkin_job(job.data)
            
            await job.updateProgress(100)
            
            logger.info(f"Check-in job {job.id} completed successfully")
            
            return result
            
        except Exception as e:
            logger.error(f"Check-in job {job.id} failed: {e}")
            raise
    
    def _on_job_completed(self, job, result):
        """Handle job completion.
        
        Args:
            job: Completed job
            result: Job result
        """
        logger.info(f"Job {job.id} completed in {job.finishedOn - job.timestamp}ms")
    
    def _on_job_failed(self, job, error):
        """Handle job failure.
        
        Args:
            job: Failed job
            error: Error that caused failure
        """
        logger.error(f"Job {job.id} failed: {error}")
    
    async def stop(self):
        """Stop all workers gracefully."""
        logger.info("Stopping workers...")
        
        for worker in self.workers:
            await worker.close()
        
        self.workers = []
        logger.info("All workers stopped")
    
    async def run(self, num_workers: int = 2):
        """Run the worker until shutdown.
        
        Args:
            num_workers: Number of concurrent workers
        """
        await self.start(num_workers)
        
        shutdown_event = asyncio.Event()
        
        def signal_handler(sig, frame):
            logger.info(f"Received signal {sig}, shutting down...")
            shutdown_event.set()
        
        signal.signal(signal.SIGINT, signal_handler)
        signal.signal(signal.SIGTERM, signal_handler)
        
        try:
            await shutdown_event.wait()
        finally:
            await self.stop()


async def main():
    """Main entry point."""
    import argparse
    
    parser = argparse.ArgumentParser(description="MoodFlow AI Worker")
    parser.add_argument(
        "--workers",
        type=int,
        default=2,
        help="Number of concurrent workers (default: 2)",
    )
    args = parser.parse_args()
    
    worker = MoodFlowWorker()
    await worker.run(num_workers=args.workers)


if __name__ == "__main__":
    asyncio.run(main())
