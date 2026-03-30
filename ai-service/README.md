# MoodFlow AI Service

FastAPI-based microservice for audio emotion analysis and speech-to-text transcription.

## Features

- **Emotion Detection** — Wav2Vec2-based VAD (Valence-Arousal-Dominance) analysis
- **Speech Transcription** — Whisper-based speech-to-text
- **Topic Extraction** — Gemini API with keyword fallback
- **Model Caching** — Local disk caching for fast cold starts
- **Batch Processing** — Optimized inference with batching support

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Pre-warm model cache (downloads ~1.1GB on first run)
python scripts/cache_models.py

# Start the service
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Open [http://localhost:8000/docs](http://localhost:8000/docs) for interactive API documentation.

## API Endpoints

### Health Check

```bash
GET /health
```

### Process Check-in

```bash
POST /process-checkin/
Content-Type: multipart/form-data

file: <audio_file>
```

Analyzes a short audio clip (~1-60 seconds).

**Pipeline:**
1. Whisper transcription
2. Per-second emotion detection with sliding window
3. Topic extraction via Gemini API

### Analyze Audio

```bash
POST /analyze-audio/?mode=sliding_window&alpha=5.0&beta=2.0&gamma=2.0&delta=2.0
Content-Type: multipart/form-data

file: <audio_file>
```

Analyzes longer audio recordings with configurable stress calculation.

**Query Parameters:**
- `mode` — `sliding_window` (default) or `chunks`
- `chunks` — Number of segments (chunks mode only)
- `alpha` — Arousal weight (default: 5.0)
- `beta` — Valence weight (default: 2.0)
- `gamma` — Emphasis factor (default: 2.0)
- `delta` — Dominance weight (default: 2.0)

## Response Format

### Emotion Detection Result

```json
{
  "arousal": 0.7234,
  "dominance": 0.4512,
  "valence": 0.6234,
  "stress_index": 0.4521,
  "calm": 0.34,
  "stress": 0.28,
  "focus": 0.38,
  "dominant_emotion": "focus"
}
```

### Check-in Result

```json
{
  "transcription": "I've been working on coding for the past two hours...",
  "topic": "Programming",
  "duration_seconds": 45.0,
  "emotion_trajectory": [
    {
      "time": 0,
      "emotion": "focus",
      "arousal": 0.72,
      "dominance": 0.45,
      "valence": 0.62,
      "stress_index": 0.45,
      "scores": {"calm": 0.34, "stress": 0.28, "focus": 0.38}
    }
  ]
}
```

## Architecture

```
Audio Input
     ↓
┌─────────────────────────────────────────────┐
│           EmotionDetectionPipeline            │
│  ┌─────────────────────────────────────┐   │
│  │  Wav2Vec2 (audeering fine-tuned)    │   │
│  │  Pretrained model: ~800MB           │   │
│  └─────────────────────────────────────┘   │
│                    ↓                        │
│  ┌─────────────────────────────────────┐   │
│  │  Sigmoid → [Arousal, Dominance,    │   │
│  │           Valence]                  │   │
│  └─────────────────────────────────────┘   │
│                    ↓                        │
│  ┌─────────────────────────────────────┐   │
│  │  Stress Formula:                    │   │
│  │  ((α×A + β×(1-V) + δ×(1-D)) /     │   │
│  │   (α+β+δ)) ^ γ                      │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
     ↓
{ valence, arousal, dominance, stress_index, calm, stress, focus }
```

## Stress Formula

Research-backed stress calculation combining VAD dimensions:

```
stress = ((α × arousal + β × (1 - valence) + δ × (1 - dominance)) / (α + β + δ)) ^ γ

Where:
- α (alpha) = Weight for arousal (activation intensity)
- β (beta) = Weight for valence negativity
- γ (gamma) = Non-linear emphasis factor
- δ (delta) = Weight for lack of dominance
```

## Model Caching

Models are cached locally to avoid re-downloading on every cold start.

### Cache Management

```bash
# Pre-warm cache (download all models)
python scripts/cache_models.py

# Check cache status
python scripts/cache_models.py --info

# Verify cache integrity
python scripts/cache_models.py --verify

# Clear and re-cache
python scripts/cache_models.py --clear
```

### Cache Location

Default: `./models/` (configurable via `MODEL_CACHE_DIR`)

```
models/
├── audeering--wav2vec2-large-robust-12-ft-emotion-msp-dim/
│   ├── v1.0.0/
│   │   ├── config.json
│   │   ├── model.safetensors
│   │   └── .version
│   └── latest -> v1.0.0
└── openai--whisper-base/
    └── ...
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `GEMINI_API_KEY` | — | Gemini API key for topic extraction |
| `MODEL_CACHE_DIR` | `./models` | Local model cache directory |
| `USE_MODEL_CACHE` | `true` | Enable/disable model caching |

## Development

### Run Tests

```bash
pytest tests/
```

### Code Quality

```bash
# Format code
black app/

# Lint
ruff check app/
```

## Models

| Model | HuggingFace ID | Purpose | Size |
|-------|----------------|---------|------|
| Emotion | `audeering/wav2vec2-large-robust-12-ft-emotion-msp-dim` | VAD regression | ~800MB |
| Whisper | `openai/whisper-base` | Speech-to-text | ~300MB |

## License

MIT
