import logging
import os
import torch
from typing import Optional
from transformers import pipeline

from app.cache.manager import get_cache_manager

logger = logging.getLogger(__name__)


class TranscriptionPipeline:
    """Whisper-based speech-to-text transcription pipeline with caching."""
    
    def __init__(self, model_name: str = "openai/whisper-base"):
        self.model_name = model_name
        self._pipeline = None
        self._loaded = False
        self._device = "cpu"
    
    def _load(self):
        """Lazy load the model with caching."""
        if self._pipeline is not None:
            return
            
        logger.info(f"Loading Whisper transcription model: {self.model_name}")
        
        cache = get_cache_manager()
        use_cache = os.getenv("USE_MODEL_CACHE", "true").lower() == "true"
        model_path = None
        
        if use_cache:
            if cache.is_cached(self.model_name):
                model_path = cache.load_model(self.model_name)
                logger.info(f"  Loading from cache: {model_path}")
            else:
                logger.info("  Model not in cache, downloading from HuggingFace...")
                model_path, _ = cache.cache_model(self.model_name)
        
        if torch.cuda.is_available():
            self._device = "cuda"
            torch_dtype = torch.float16
        elif torch.backends.mps.is_available():
            self._device = "mps"
            torch_dtype = torch.float32
        else:
            self._device = "cpu"
            torch_dtype = torch.float32
        
        if model_path:
            self._pipeline = pipeline(
                "automatic-speech-recognition",
                model=model_path,
                local_files_only=True,
                dtype=torch_dtype,
                device=self._device,
            )
        else:
            self._pipeline = pipeline(
                "automatic-speech-recognition",
                model=self.model_name,
                dtype=torch_dtype,
                device=self._device,
            )
        
        logger.info(f"  Model loaded on {self._device.upper()}")
        self._loaded = True
    
    def transcribe(self, audio_tensor: torch.Tensor, language: Optional[str] = None) -> str:
        """Transcribe audio to text."""
        if not self._loaded:
            self._load()
        
        logger.info("  Running Whisper transcription...")
        
        audio_np = audio_tensor.squeeze().cpu().numpy()
        
        if audio_np.ndim > 1:
            audio_np = audio_np[0]
        
        kwargs = {"return_timestamps": True}
        if language:
            kwargs["language"] = language
        
        result = self._pipeline(audio_np, **kwargs)
        text = result.get("text", "")
        if not text and "chunks" in result:
            text = " ".join(chunk.get("text", "") for chunk in result["chunks"])
        
        text = text.strip()
        logger.info(f"  Transcription complete: \"{text[:50]}...\"" if len(text) > 50 else f"  Transcription complete: \"{text}\"")
        
        return text
    
    @property
    def device(self) -> str:
        """Get current device."""
        return self._device


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
