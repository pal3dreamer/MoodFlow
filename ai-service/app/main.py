from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.routes import checkin, analyze, queue


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


app = FastAPI(
    title="MoodFlow AI Service",
    description="Audio processing and emotion detection service",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(checkin.router, prefix="/process-checkin", tags=["checkin"])
app.include_router(analyze.router, prefix="/analyze-audio", tags=["analyze"])
app.include_router(queue.router, prefix="/queue", tags=["queue"])


@app.get("/health")
async def health_check():
    return {"status": "ok"}


@app.get("/health/ready")
async def readiness_check():
    """Check if the service is ready to accept requests."""
    try:
        from worker.client import REDIS_URL
        import redis
        r = redis.from_url(REDIS_URL)
        r.ping()
        return {"status": "ready", "redis": "connected"}
    except Exception as e:
        return {"status": "not_ready", "redis": str(e)}