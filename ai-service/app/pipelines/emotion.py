import logging
import os
from typing import Dict, Optional, List, Tuple, Union
from pathlib import Path
import numpy as np
import torch
from transformers import Wav2Vec2Processor, Wav2Vec2ForSequenceClassification

from app.cache.manager import get_cache_manager

logger = logging.getLogger(__name__)

SAMPLE_RATE = 16000
MIN_AUDIO_DURATION = 0.1
MAX_AUDIO_DURATION = 300.0


class AudioValidationError(Exception):
    """Raised when audio input fails validation."""
    pass


class EmotionDetectionPipeline:
    """Pre-trained emotion detection pipeline using Wav2Vec2.
    
    Uses the audeering/wav2vec2-large-robust-12-ft-emotion-msp-dim model
    which is already fine-tuned for emotion detection.
    
    Optimizations:
        - Input validation
        - Batch processing
        - Audio duration handling
        - Device-aware inference
    
    Input: Audio tensor (16kHz mono)
    Output: VAD values, stress index, and derived emotions
    """
    
    def __init__(
        self,
        model_name: str = "audeering/wav2vec2-large-robust-12-ft-emotion-msp-dim",
        max_batch_size: int = 32,
    ):
        """Initialize emotion detection pipeline.
        
        Args:
            model_name: HuggingFace model ID
            max_batch_size: Maximum batch size for batch processing
        """
        self.model_name = model_name
        self.max_batch_size = max_batch_size
        self._model = None
        self._processor = None
        self._loaded = False
        self._device = "cpu"

    def _load(self):
        """Load model and processor with lazy initialization and caching."""
        if self._model is not None:
            return
            
        logger.info(f"Loading emotion model: {self.model_name}")
        
        try:
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
            
            if model_path:
                self._processor = Wav2Vec2Processor.from_pretrained(model_path, local_files_only=True)
                self._model = Wav2Vec2ForSequenceClassification.from_pretrained(
                    model_path,
                    local_files_only=True,
                    torch_dtype=torch.float32,
                )
            else:
                self._processor = Wav2Vec2Processor.from_pretrained(self.model_name)
                self._model = Wav2Vec2ForSequenceClassification.from_pretrained(
                    self.model_name,
                    torch_dtype=torch.float32,
                )
            
            self._model.eval()
            
            if torch.cuda.is_available():
                self._device = "cuda"
                self._model = self._model.to("cuda")
                logger.info("  Model loaded on GPU (CUDA)")
            elif torch.backends.mps.is_available():
                self._device = "mps"
                self._model = self._model.to("mps")
                logger.info("  Model loaded on GPU (Apple MPS)")
            else:
                logger.info("  Model loaded on CPU")
            
            self._loaded = True
            logger.info("  Emotion model loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            raise

    def _validate_audio(self, audio_tensor: torch.Tensor) -> torch.Tensor:
        """Validate and preprocess audio tensor.
        
        Args:
            audio_tensor: Input audio tensor
            
        Returns:
            Validated and preprocessed audio tensor
            
        Raises:
            AudioValidationError: If audio is invalid
        """
        if audio_tensor is None:
            raise AudioValidationError("Audio tensor is None")
        
        if not isinstance(audio_tensor, torch.Tensor):
            raise AudioValidationError(f"Audio must be torch.Tensor, got {type(audio_tensor)}")
        
        if audio_tensor.numel() == 0:
            raise AudioValidationError("Audio tensor is empty")
        
        if audio_tensor.dim() == 1:
            audio_tensor = audio_tensor.unsqueeze(0)
        
        if audio_tensor.shape[-1] == 0:
            raise AudioValidationError("Audio has zero samples")
        
        if audio_tensor.dtype != torch.float32 and audio_tensor.dtype != torch.float64:
            audio_tensor = audio_tensor.float()
        
        if audio_tensor.shape[0] > 2:
            audio_tensor = audio_tensor[:2, :]
        
        if audio_tensor.shape[0] == 2:
            audio_tensor = audio_tensor.mean(dim=0, keepdim=True)
        
        duration = audio_tensor.shape[-1] / SAMPLE_RATE
        
        if duration < MIN_AUDIO_DURATION:
            logger.warning(f"Audio too short ({duration:.2f}s), padding...")
            min_samples = int(MIN_AUDIO_DURATION * SAMPLE_RATE)
            if audio_tensor.shape[-1] < min_samples:
                padding = min_samples - audio_tensor.shape[-1]
                audio_tensor = torch.nn.functional.pad(audio_tensor, (0, padding))
        
        if duration > MAX_AUDIO_DURATION:
            logger.warning(f"Audio too long ({duration:.2f}s), truncating...")
            max_samples = int(MAX_AUDIO_DURATION * SAMPLE_RATE)
            audio_tensor = audio_tensor[:, :max_samples]
        
        return audio_tensor

    def detect_emotions(
        self, 
        audio_tensor: torch.Tensor,
        alpha: float = 5.0,
        beta: float = 2.0,
        gamma: float = 2.0,
        delta: float = 2.0,
    ) -> Dict[str, float]:
        """Detect emotions from audio tensor with configurable stress weighting.
        
        Research-backed stress formula:
        stress = ((α × arousal + β × (1 - valence) + δ × (1 - dominance)) / (α + β + δ)) ^ γ
        
        Args:
            audio_tensor: Audio waveform tensor (can be mono or stereo)
            alpha: Weight for arousal in stress calculation (default: 5.0)
            beta: Weight for valence (inverted) in stress calculation (default: 2.0)
            gamma: Emphasis factor for stress calculation (default: 2.0)
            delta: Weight for dominance (inverted) in stress calculation (default: 2.0)
        
        Returns:
            Dict with VAD scores, stress_index, and derived emotions
        """
        if not self._loaded:
            self._load()
        
        audio_tensor = self._validate_audio(audio_tensor)
        audio_input = audio_tensor.squeeze().cpu().numpy()
        
        inputs = self._processor(
            audio_input,
            sampling_rate=SAMPLE_RATE,
            return_tensors="pt",
            padding=True,
        )
        
        input_values = inputs.input_values.to(self._device)
        
        with torch.no_grad():
            outputs = self._model(input_values)
            logits = outputs.logits
        
        vad = torch.sigmoid(logits).squeeze().cpu().numpy()
        vad = np.clip(vad, 0, 1)
        
        if len(vad) >= 3:
            arousal = float(vad[0])
            dominance = float(vad[1])
            valence = float(vad[2])
        else:
            valence, arousal, dominance = 0.5, 0.5, 0.5
        
        stress_index = (alpha * arousal + beta * (1 - valence) + delta * (1 - dominance)) / (alpha + beta + delta)
        stress_index = stress_index ** gamma
        stress_index = float(stress_index)
        
        emotions = self._vad_to_emotions(valence, arousal, dominance)

        return {
            "arousal": round(arousal, 4),
            "dominance": round(dominance, 4),
            "valence": round(valence, 4),
            "stress_index": round(stress_index, 4),
            "calm": emotions["calm"],
            "stress": emotions["stress"],
            "focus": emotions["focus"],
            "dominant_emotion": emotions["dominant"],
        }

    def detect_emotions_batch(
        self,
        audio_tensors: List[torch.Tensor],
        alpha: float = 5.0,
        beta: float = 2.0,
        gamma: float = 2.0,
        delta: float = 2.0,
    ) -> List[Dict[str, float]]:
        """Detect emotions from multiple audio segments efficiently.
        
        Uses batch processing for better GPU utilization.
        
        Args:
            audio_tensors: List of audio waveform tensors
            alpha: Weight for arousal in stress calculation
            beta: Weight for valence (inverted) in stress calculation
            gamma: Emphasis factor for stress calculation
            delta: Weight for dominance (inverted) in stress calculation
        
        Returns:
            List of emotion dictionaries, one per audio tensor
        """
        if not self._loaded:
            self._load()
        
        if not audio_tensors:
            return []
        
        validated_tensors = [self._validate_audio(t) for t in audio_tensors]
        
        audio_inputs = [t.squeeze().cpu().numpy() for t in validated_tensors]
        
        inputs = self._processor(
            audio_inputs,
            sampling_rate=SAMPLE_RATE,
            return_tensors="pt",
            padding=True,
        )
        
        input_values = inputs.input_values.to(self._device)
        
        with torch.no_grad():
            outputs = self._model(input_values)
            logits = outputs.logits
        
        vad_batch = torch.sigmoid(logits).cpu().numpy()
        
        results = []
        for vad in vad_batch:
            vad = np.clip(vad, 0, 1)
            
            if len(vad) >= 3:
                arousal = float(vad[0])
                dominance = float(vad[1])
                valence = float(vad[2])
            else:
                valence, arousal, dominance = 0.5, 0.5, 0.5
            
            stress_index = (alpha * arousal + beta * (1 - valence) + delta * (1 - dominance)) / (alpha + beta + delta)
            stress_index = stress_index ** gamma
            
            emotions = self._vad_to_emotions(valence, arousal, dominance)
            
            results.append({
                "arousal": round(arousal, 4),
                "dominance": round(dominance, 4),
                "valence": round(valence, 4),
                "stress_index": round(float(stress_index), 4),
                "calm": emotions["calm"],
                "stress": emotions["stress"],
                "focus": emotions["focus"],
                "dominant_emotion": emotions["dominant"],
            })
        
        return results

    def analyze_sliding_window(
        self,
        audio_tensor: torch.Tensor,
        window_size_seconds: float = 3.0,
        stride_seconds: float = 1.5,
        alpha: float = 5.0,
        beta: float = 2.0,
        gamma: float = 2.0,
        delta: float = 2.0,
    ) -> List[Dict[str, any]]:
        """Analyze audio using sliding window for fine-grained emotion detection.
        
        Optimized with batch processing for better performance.
        
        Args:
            audio_tensor: Full audio waveform tensor
            window_size_seconds: Size of each analysis window in seconds
            stride_seconds: Stride between windows in seconds
            alpha: Weight for arousal in stress calculation
            beta: Weight for valence (inverted) in stress calculation
            gamma: Emphasis factor for stress calculation
            delta: Weight for dominance (inverted) in stress calculation
        
        Returns:
            List of emotion results with timestamps
        """
        if not self._loaded:
            self._load()
        
        audio_tensor = self._validate_audio(audio_tensor)
        
        total_samples = audio_tensor.shape[-1]
        window_samples = int(window_size_seconds * SAMPLE_RATE)
        stride_samples = int(stride_seconds * SAMPLE_RATE)
        
        windows = []
        positions = []
        position = 0
        
        while position + window_samples <= total_samples:
            window = audio_tensor[:, position:position + window_samples]
            windows.append(window)
            positions.append(position // SAMPLE_RATE)
            position += stride_samples
        
        if not windows:
            return []
        
        results = []
        for i in range(0, len(windows), self.max_batch_size):
            batch_windows = windows[i:i + self.max_batch_size]
            batch_positions = positions[i:i + self.max_batch_size]
            
            batch_results = self.detect_emotions_batch(
                batch_windows,
                alpha=alpha,
                beta=beta,
                gamma=gamma,
                delta=delta,
            )
            
            for pos, emotions in zip(batch_positions, batch_results):
                results.append({
                    "time": pos,
                    **emotions,
                })
        
        return results

    def _vad_to_emotions(self, valence: float, arousal: float, dominance: float) -> Dict[str, float]:
        """Convert VAD values to emotion probabilities.
        
        Args:
            valence: Valence score (0-1)
            arousal: Arousal score (0-1)
            dominance: Dominance score (0-1)
        
        Returns:
            Dict with calm, stress, focus probabilities and dominant emotion
        """
        calm_raw = (1 - arousal) * 0.5 + dominance * 0.3 + (1 - abs(valence - 0.5) * 2) * 0.2
        stress_raw = arousal * 0.6 + (1 - dominance) * 0.2 + (1 - valence) * 0.2
        focus_raw = arousal * 0.4 + valence * 0.3 + dominance * 0.3
        
        total = calm_raw + stress_raw + focus_raw
        if total > 0:
            calm = round(calm_raw / total, 4)
            stress = round(stress_raw / total, 4)
            focus = round(focus_raw / total, 4)
        
        emotions = {"calm": calm, "stress": stress, "focus": focus}
        dominant = max(emotions, key=emotions.get)
        emotions["dominant"] = dominant
        
        return emotions

    def get_audio_info(self, audio_tensor: torch.Tensor) -> Dict[str, any]:
        """Get information about audio tensor.
        
        Args:
            audio_tensor: Audio waveform tensor
        
        Returns:
            Dict with audio metadata
        """
        audio_tensor = self._validate_audio(audio_tensor)
        
        duration = audio_tensor.shape[-1] / SAMPLE_RATE
        
        return {
            "duration_seconds": round(duration, 2),
            "sample_rate": SAMPLE_RATE,
            "channels": audio_tensor.shape[0] if audio_tensor.dim() > 1 else 1,
            "samples": audio_tensor.shape[-1],
            "dtype": str(audio_tensor.dtype),
            "is_valid": True,
        }

    @property
    def is_loaded(self) -> bool:
        """Check if model is loaded."""
        return self._loaded

    @property
    def device(self) -> str:
        """Get current device."""
        return self._device


_emotion_pipeline: Optional[EmotionDetectionPipeline] = None


def get_emotion_pipeline() -> EmotionDetectionPipeline:
    """Get or create the global emotion detection pipeline instance."""
    global _emotion_pipeline
    if _emotion_pipeline is None:
        _emotion_pipeline = EmotionDetectionPipeline()
    return _emotion_pipeline


def detect_emotions(audio_tensor: torch.Tensor) -> Dict[str, float]:
    """Convenience function for emotion detection."""
    pipeline = get_emotion_pipeline()
    return pipeline.detect_emotions(audio_tensor)


def detect_emotions_batch(audio_tensors: List[torch.Tensor]) -> List[Dict[str, float]]:
    """Convenience function for batch emotion detection."""
    pipeline = get_emotion_pipeline()
    return pipeline.detect_emotions_batch(audio_tensors)
