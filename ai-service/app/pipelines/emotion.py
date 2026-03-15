import logging
import torch
from typing import Dict, Optional
from transformers import AutoModelForAudioClassification, AutoProcessor

logger = logging.getLogger(__name__)


class EmotionDetectionPipeline:
    """Emotion detection pipeline using VAD (Valence-Arousal-Dominance) model."""
    
    def __init__(self, model_name: str = "audeering/wav2vec2-large-robust-12-ft-emotion-msp-dim"):
        self.model_name = model_name
        self._model = None
        self._processor = None
        self._loaded = False
    
    def _load(self):
        """Lazy load the model on first use."""
        if self._model is None:
            logger.info(f"Loading emotion model: {self.model_name}")
            logger.info("  (This will download from HuggingFace on first run)")
            self._processor = AutoProcessor.from_pretrained(self.model_name)
            self._model = AutoModelForAudioClassification.from_pretrained(self.model_name)
            self._model.eval()
            if torch.cuda.is_available():
                self._model = self._model.to("cuda")
                logger.info("  Model loaded on GPU")
            else:
                logger.info("  Model loaded on CPU")
            self._loaded = True
    
    def detect_emotions(self, audio_tensor: torch.Tensor) -> Dict[str, float]:
        """Detect emotions from audio - returns VAD scores."""
        if not self._loaded:
            self._load()
        
        logger.info("  Running emotion inference...")
        
        if audio_tensor.shape[0] == 2:
            audio_tensor = audio_tensor[0:1, :]
        
        audio_input = audio_tensor.squeeze()
        
        inputs = self._processor(
            audio_input, 
            sampling_rate=16000, 
            return_tensors="pt"
        )
        
        if torch.cuda.is_available():
            inputs = {k: v.to("cuda") for k, v in inputs.items()}
        
        with torch.no_grad():
            outputs = self._model(**inputs)
            logits = outputs.logits
        
        probs = torch.sigmoid(logits).squeeze().cpu().numpy()
        
        if len(probs) >= 3:
            valence = float(probs[0])
            arousal = float(probs[1])
            dominance = float(probs[2])
        else:
            valence, arousal, dominance = 0.5, 0.5, 0.5
        
        emotions = self._vad_to_emotions(valence, arousal, dominance)
        logger.info(f"  VAD: valence={valence:.3f}, arousal={arousal:.3f}, dominance={dominance:.3f}")
        
        return {
            "valence": round(valence, 3),
            "arousal": round(arousal, 3),
            "dominance": round(dominance, 3),
            **emotions,
        }
    
    def _vad_to_emotions(self, valence: float, arousal: float, dominance: float) -> Dict[str, float]:
        """Convert VAD scores to emotion scores (calm, stress, focus)."""
        calm = round((1 - arousal) * 0.5 + dominance * 0.3 + (1 - abs(valence - 0.5) * 2) * 0.2, 3)
        stress = round(arousal * 0.6 + (1 - dominance) * 0.2 + (1 - valence) * 0.2, 3)
        focus = round(arousal * 0.4 + valence * 0.3 + dominance * 0.3, 3)
        
        total = calm + stress + focus
        if total > 0:
            calm = round(calm / total, 3)
            stress = round(stress / total, 3)
            focus = round(focus / total, 3)
        
        return {
            "calm": calm,
            "stress": stress,
            "focus": focus,
        }


_emotion_pipeline: Optional[EmotionDetectionPipeline] = None


def get_emotion_pipeline() -> EmotionDetectionPipeline:
    global _emotion_pipeline
    if _emotion_pipeline is None:
        _emotion_pipeline = EmotionDetectionPipeline()
    return _emotion_pipeline


def detect_emotions(audio_tensor: torch.Tensor) -> Dict[str, float]:
    pipeline = get_emotion_pipeline()
    return pipeline.detect_emotions(audio_tensor)
