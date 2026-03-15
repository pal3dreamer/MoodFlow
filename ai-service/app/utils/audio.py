import io
from typing import Union
import httpx
import torch
import torchaudio


async def download_audio(url: str) -> bytes:
    """Download audio from a URL."""
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.get(url)
        response.raise_for_status()
        return response.content


def load_audio_from_bytes(audio_bytes: bytes) -> tuple[torch.Tensor, int]:
    """Load audio from bytes into a waveform tensor.
    
    Returns:
        Tuple of (waveform tensor, sample rate)
    """
    buffer = io.BytesIO(audio_bytes)
    waveform, sample_rate = torchaudio.load(buffer)
    return waveform, sample_rate


def resample_audio(waveform: torch.Tensor, orig_sr: int, target_sr: int = 16000) -> torch.Tensor:
    """Resample audio to target sample rate."""
    if orig_sr == target_sr:
        return waveform
    
    resampler = torchaudio.transforms.Resample(orig_freq=orig_sr, new_freq=target_sr)
    return resampler(waveform)


def mono_to_stereo(waveform: torch.Tensor) -> torch.Tensor:
    """Convert mono audio to stereo."""
    if waveform.shape[0] == 2:
        return waveform
    return torch.cat([waveform, waveform], dim=0)


def preprocess_audio(audio_input: Union[bytes, str]) -> tuple[torch.Tensor, int]:
    """Preprocess audio from bytes or URL.
    
    Args:
        audio_input: Audio data as bytes or URL string
    
    Returns:
        Tuple of (preprocessed waveform tensor, sample rate)
    """
    if isinstance(audio_input, str):
        if audio_input.startswith(("http://", "https://")):
            audio_bytes = httpx.get(audio_input).content
        else:
            with open(audio_input, "rb") as f:
                audio_bytes = f.read()
    else:
        audio_bytes = audio_input
    
    waveform, sample_rate = load_audio_from_bytes(audio_bytes)
    waveform = resample_audio(waveform, sample_rate, target_sr=16000)
    
    if waveform.shape[0] == 1:
        waveform = mono_to_stereo(waveform)
    
    return waveform, 16000