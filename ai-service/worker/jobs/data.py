"""Job definitions for recording analysis."""

import logging
from typing import Dict, Any, Optional
from dataclasses import dataclass
from datetime import datetime

logger = logging.getLogger(__name__)


@dataclass
class AnalyzeJobData:
    """Data for long audio analysis job."""
    recording_id: str
    object_key: str
    bucket: str
    filename: str
    mime_type: str
    user_id: str
    focus_session_id: Optional[str] = None
    mode: str = "sliding_window"
    chunks: int = 10
    alpha: float = 5.0
    beta: float = 2.0
    gamma: float = 2.0
    delta: float = 2.0
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "recording_id": self.recording_id,
            "object_key": self.object_key,
            "bucket": self.bucket,
            "filename": self.filename,
            "mime_type": self.mime_type,
            "user_id": self.user_id,
            "focus_session_id": self.focus_session_id,
            "mode": self.mode,
            "chunks": self.chunks,
            "alpha": self.alpha,
            "beta": self.beta,
            "gamma": self.gamma,
            "delta": self.delta,
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "AnalyzeJobData":
        return cls(
            recording_id=data["recording_id"],
            object_key=data["object_key"],
            bucket=data["bucket"],
            filename=data.get("filename", "audio.wav"),
            mime_type=data.get("mime_type", "audio/wav"),
            user_id=data["user_id"],
            focus_session_id=data.get("focus_session_id"),
            mode=data.get("mode", "sliding_window"),
            chunks=data.get("chunks", 10),
            alpha=data.get("alpha", 5.0),
            beta=data.get("beta", 2.0),
            gamma=data.get("gamma", 2.0),
            delta=data.get("delta", 2.0),
        )


@dataclass
class CheckinJobData:
    """Data for check-in processing job."""
    recording_id: str
    object_key: str
    bucket: str
    filename: str
    mime_type: str
    user_id: str
    focus_session_id: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "recording_id": self.recording_id,
            "object_key": self.object_key,
            "bucket": self.bucket,
            "filename": self.filename,
            "mime_type": self.mime_type,
            "user_id": self.user_id,
            "focus_session_id": self.focus_session_id,
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "CheckinJobData":
        return cls(
            recording_id=data["recording_id"],
            object_key=data["object_key"],
            bucket=data["bucket"],
            filename=data.get("filename", "audio.wav"),
            mime_type=data.get("mime_type", "audio/wav"),
            user_id=data["user_id"],
            focus_session_id=data.get("focus_session_id"),
        )
