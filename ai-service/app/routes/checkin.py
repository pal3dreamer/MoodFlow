from fastapi import APIRouter, UploadFile, File, HTTPException

from app.pipelines.checkin import process_checkin_from_file

router = APIRouter()


@router.post("/")
async def process_checkin_endpoint(file: UploadFile = File(...)):
    """Process a short audio check-in clip.
    
    Pipeline:
        audio -> transcription (Whisper) -> emotion detection (WavLM) -> topic extraction
    
    Returns:
        JSON with transcription, topic, and emotion scores
    """
    print(f"DEBUG: file.content_type = {file.content_type}")
    # Allow if content_type is audio/* or if it's not set (fallback)
    if file.content_type and not file.content_type.startswith("audio/"):
        raise HTTPException(status_code=400, detail="Invalid audio file type")
    
    result = await process_checkin_from_file(file)
    return result