import logging
import os
import numpy as np
import torch
import torch.nn as nn
from typing import Dict, Optional
from safetensors import safe_open
from transformers import Wav2Vec2Config, Wav2Vec2Processor
from transformers.models.wav2vec2.modeling_wav2vec2 import Wav2Vec2Model

logger = logging.getLogger(__name__)


class RegressionHead(nn.Module):
    def __init__(self, config):
        super().__init__()
        self.dense = nn.Linear(config.hidden_size, config.hidden_size)
        self.dropout = nn.Dropout(config.final_dropout)
        self.out_proj = nn.Linear(config.hidden_size, config.num_labels)

    def forward(self, features):
        x = self.dropout(features)
        x = self.dense(x)
        x = torch.tanh(x)
        x = self.dropout(x)
        x = self.out_proj(x)
        return x


class EmotionModel(nn.Module):
    def __init__(self, config):
        super().__init__()
        self.config = config
        self.wav2vec2 = Wav2Vec2Model(config)
        self.classifier = RegressionHead(config)

    def forward(self, input_values):
        outputs = self.wav2vec2(input_values)
        hidden_states = outputs[0]
        hidden_states = torch.mean(hidden_states, dim=1)
        logits = self.classifier(hidden_states)
        return hidden_states, logits


class EmotionDetectionPipeline:
    def __init__(self, model_name: str = "audeering/wav2vec2-large-robust-12-ft-emotion-msp-dim"):
        self.model_name = model_name
        self._model = None
        self._processor = None
        self._loaded = False
        self._device = "cpu"

    def _load(self):
        if self._model is not None:
            return
            
        logger.info(f"Loading emotion model: {self.model_name}")
        
        self._processor = Wav2Vec2Processor.from_pretrained(self.model_name)
        config = Wav2Vec2Config.from_pretrained(self.model_name)
        
        self._model = EmotionModel(config)
        
        model_path = self._get_model_path()
        logger.info(f"Loading weights from: {model_path}")
        
        with safe_open(model_path, framework="pt") as f:
            state_dict = {k: f.get_tensor(k) for k in f.keys()}
        
        self._model.load_state_dict(state_dict, strict=False)
        self._model.eval()
        
        if torch.cuda.is_available():
            self._device = "cuda"
            self._model = self._model.to("cuda")
            logger.info("  Model loaded on GPU")
        else:
            logger.info("  Model loaded on CPU")
        
        self._loaded = True
        logger.info("  Emotion model loaded successfully")

    def _get_model_path(self):
        cache_dir = os.path.expanduser("~/.cache/huggingface/hub")
        model_dir = f"models--{self.model_name.replace('/', '--')}"
        for root, dirs, files in os.walk(os.path.join(cache_dir, model_dir)):
            for f in files:
                if f.endswith(".safetensors"):
                    return os.path.join(root, f)
        raise FileNotFoundError(f"Model weights not found for {self.model_name}")

    def detect_emotions(self, audio_tensor: torch.Tensor) -> Dict[str, float]:
        if not self._loaded:
            self._load()

        if audio_tensor.shape[0] == 2:
            audio_tensor = audio_tensor[0:1, :]

        audio_input = audio_tensor.squeeze().numpy()

        inputs = self._processor(
            audio_input,
            sampling_rate=16000,
            return_tensors="pt"
        )

        input_values = inputs.input_values.to(self._device)

        with torch.no_grad():
            _, logits = self._model(input_values)

        vad = torch.sigmoid(logits).squeeze().cpu().numpy()
        
        logger.info(f"  Raw logits: {logits}")
        logger.info(f"  Raw VAD (sigmoid): {vad}")

        if len(vad) >= 3:
            arousal = float(vad[0])
            dominance = float(vad[1])
            valence = float(vad[2])
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