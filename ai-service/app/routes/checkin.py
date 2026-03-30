from fastapi import APIRouter, UploadFile, File, HTTPException

from app.pipelines.checkin import process_checkin_from_file

router = APIRouter()


@router.post("/")
async def process_checkin_endpoint(file: UploadFile = File(...)):
    """Process a short audio check-in clip.
    
    Pipeline:
        audio -> transcription (Whisper) -> emotion detection (Wav2Vec2) -> topic extraction
    
    Returns:
        JSON with transcription, topic, and emotion scores
    """
    if file.content_type and not file.content_type.startswith("audio/"):
        raise HTTPException(status_code=400, detail="Invalid audio file type")
    
    result = await process_checkin_from_file(file)
    return result
