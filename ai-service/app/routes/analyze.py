from fastapi import APIRouter, UploadFile, File, HTTPException, Query

from app.pipelines.analyze import (
    analyze_audio_from_file,
    DEFAULT_ALPHA,
    DEFAULT_BETA,
    DEFAULT_GAMMA,
    DEFAULT_DELTA,
)

router = APIRouter()


@router.post("/")
async def analyze_audio_endpoint(
    file: UploadFile = File(...),
    mode: str = Query("sliding_window", description="Analysis mode: 'sliding_window' or 'chunks'"),
    chunks: int = Query(10, ge=1, description="Number of chunks (only used in chunks mode)"),
    alpha: float = Query(DEFAULT_ALPHA, ge=0, description="Weight for arousal (higher = more arousal stress)"),
    beta: float = Query(DEFAULT_BETA, ge=0, description="Weight for valence negativity (1-valence)"),
    gamma: float = Query(DEFAULT_GAMMA, ge=0, description="Non-linear emphasis factor for stress"),
    delta: float = Query(DEFAULT_DELTA, ge=0, description="Weight for lack of dominance"),
):
    """Analyze longer audio recordings with research-backed stress calculation.
    
    Stress Formula:
        stress = ((α × arousal + β × (1-valence) + δ × (1-dominance)) / (α + β + δ)) ^ γ
    
    This models stress as a function of:
    - High arousal (activation/intensity)
    - Low valence (negativity)
    - Low dominance (lack of control)
    
    Pipeline:
        audio -> preprocessing -> chunking/sliding-window -> emotion detection -> timeline
    
    Query Parameters (all optional):
        - mode: "sliding_window" (default) for continuous analysis, "chunks" for equal-sized segments
        - chunks: Number of segments (only used in chunks mode, default: 10)
        - alpha: Arousal weight (default: 5.0, recommended: 3-7)
        - beta: Valence weight (default: 2.0, recommended: 2-3)
        - gamma: Emphasis factor (default: 2.0, recommended: 1.5-3)
        - delta: Dominance weight (default: 2.0, recommended: 1-3)
    
    Returns:
        JSON with duration and emotion trajectory including VAD, stress_index, and 3D coordinates
    """
    if file.content_type and not file.content_type.startswith("audio/"):
        raise HTTPException(status_code=400, detail="Invalid audio file type")
    
    if mode not in ["sliding_window", "chunks"]:
        raise HTTPException(status_code=400, detail="mode must be 'sliding_window' or 'chunks'")
    
    result = await analyze_audio_from_file(
        file,
        analysis_mode=mode,
        num_chunks=chunks,
        alpha=alpha,
        beta=beta,
        gamma=gamma,
        delta=delta,
    )
    return result