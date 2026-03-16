import logging
import torch
from typing import Optional
from transformers import pipeline, WhisperProcessor, WhisperForConditionalGeneration

logger = logging.getLogger(__name__)


class TranscriptionPipeline:
    """Whisper-based speech-to-text transcription pipeline."""
    
    def __init__(self, model_name: str = "openai/whisper-base"):
        self.model_name = model_name
        self._pipeline = None
        self._loaded = False
    
    def _load(self):
        """Lazy load the model on first use."""
        if self._pipeline is None:
            logger.info(f"Loading Whisper transcription model: {self.model_name}")
            logger.info("  (This will download from HuggingFace on first run)")
            self._pipeline = pipeline(
                "automatic-speech-recognition",
                model=self.model_name,
                torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
                device="cuda" if torch.cuda.is_available() else "cpu",
            )
            if torch.cuda.is_available():
                logger.info("  Model loaded on GPU")
            else:
                logger.info("  Model loaded on CPU")
            self._loaded = True
    
    def transcribe(self, audio_tensor: torch.Tensor, language: Optional[str] = None) -> str:
        """Transcribe audio to text."""
        if not self._loaded:
            self._load()
        
        logger.info("  Running Whisper transcription...")
        
        # Convert tensor to numpy for transformers pipeline
        audio_np = audio_tensor.squeeze().cpu().numpy()
        
        # Handle stereo by taking first channel
        if audio_np.ndim > 1:
            audio_np = audio_np[0]
        
        kwargs = {"return_timestamps": True}
        if language:
            kwargs["language"] = language
        
        result = self._pipeline(audio_np, **kwargs)
        text = result.get("text", "")
        if not text and "chunks" in result:
            text = " ".join(chunk.get("text", "") for chunk in result["chunks"])
        logger.info(f"  Transcription complete: \"{text}\"")
        
        return text


# Global singleton instance
_transcription_pipeline: Optional[TranscriptionPipeline] = None


def get_transcription_pipeline() -> TranscriptionPipeline:
    """Get or create the global transcription pipeline instance."""
    global _transcription_pipeline
    if _transcription_pipeline is None:
        _transcription_pipeline = TranscriptionPipeline()
    return _transcription_pipeline


def transcribe_audio(audio_tensor: torch.Tensor, language: Optional[str] = None) -> str:
    """Convenience function for transcription."""
    pipeline = get_transcription_pipeline()
    return pipeline.transcribe(audio_tensor, language)
