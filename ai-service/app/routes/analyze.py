from fastapi import APIRouter, UploadFile, File, HTTPException

from app.pipelines.analyze import analyze_audio_from_file

router = APIRouter()


@router.post("/")
async def analyze_audio_endpoint(file: UploadFile = File(...)):
    """Analyze longer audio recordings.
    
    Pipeline:
        audio -> chunking -> emotion detection -> timeline
    
    Returns:
        JSON with duration and emotion timeline
    """
    if file.content_type and not file.content_type.startswith("audio/"):
        raise HTTPException(status_code=400, detail="Invalid audio file type")
    
    result = await analyze_audio_from_file(file)
    return result