from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.routes import checkin, analyze


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


@app.get("/health")
async def health_check():
    return {"status": "ok"}