# MoodFlow

<<<<<<< HEAD
A web app that tracks your mood during focus sessions. Record a short voice check-in at the start and end of each session. The app analyzes your emotional state using AI and shows you patterns over time.

## Features

- **Voice Check-ins** — Record yourself talking at the beginning and end of a focus session
- **Emotion Analysis** — Audio analyzed using VAD (Valence-Arousal-Dominance) deep learning model
- **3D Dashboard** — Interactive visualization with live emotion timeline
- **Insights & Recommendations** — Focus stability metrics, emotion distribution, and AI-generated suggestions
- **Session Management** — Browse, filter, and search through all past sessions

## Architecture

```
moodflow/
├── web/                    # Next.js 14 frontend
│   ├── app/               # Pages (dashboard, sessions, insights, login)
│   ├── components/        # React components with Framer Motion
│   ├── lib/               # Utilities (API client, analytics, recording)
│   └── prisma/            # Database schema
├── ai-service/            # FastAPI AI inference service
│   ├── app/
│   │   ├── pipelines/     # ML inference pipelines
│   │   ├── routes/       # FastAPI endpoints
│   │   ├── cache/        # Model caching system
│   │   └── utils/        # Audio preprocessing
│   └── scripts/           # Management scripts
└── docker-compose.yml     # PostgreSQL + MinIO
```

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | Next.js 14, React 18, TypeScript, Tailwind CSS, Framer Motion |
| **3D / Visual** | Three.js, React Three Fiber |
| **Backend** | Next.js API Routes |
| **Database** | PostgreSQL + Prisma ORM |
| **File Storage** | MinIO (S3-compatible) |
| **AI Service** | FastAPI, PyTorch, Transformers, Whisper, Wav2Vec2 |
=======
AI-powered mood tracking and focus session management with real-time emotional analysis.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748)](https://www.prisma.io/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.135-009688)](https://fastapi.tiangolo.com/)

## Overview

MoodFlow is a modern web application that helps users track their emotional well-being during work sessions. Through voice check-ins and AI-powered analysis, it provides deep insights into mood patterns, focus stability, and stress levels.

## Features

- **Voice Check-ins**: Record voice notes at the start and end of focus sessions
- **AI-Powered Analysis**: Emotion detection using VAD (Valence-Arousal-Dominance) model
- **Real-time Dashboard**: Live tracking of sessions, focus time, and current mood
- **Insights & Trends**: Weekly emotional patterns, focus stability metrics, and AI recommendations
- **Session Management**: Create, track, and analyze focus sessions with detailed analytics

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 14, React 18, TypeScript |
| Styling | Tailwind CSS, Framer Motion |
| 3D Graphics | Three.js, React Three Fiber |
| Backend | Next.js API Routes |
| Database | PostgreSQL with Prisma ORM |
| Storage | MinIO (S3-compatible) |
| AI Service | FastAPI, PyTorch, Transformers, Whisper |
>>>>>>> 7fe3eba7b873f1d3c5064aece88ccc06fe2708ea

## Quick Start

### 1. Start Infrastructure

```bash
docker-compose up -d
```

<<<<<<< HEAD
- **PostgreSQL**: `localhost:5432`
- **MinIO API**: `localhost:9000`
- **MinIO Console**: `localhost:9001`

### 2. Web App Setup
=======
This starts PostgreSQL (port 5432) and MinIO (ports 9000, 9001).

### 2. Start AI Service

```bash
cd ai-service
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### 3. Start Web Application
>>>>>>> 7fe3eba7b873f1d3c5064aece88ccc06fe2708ea

```bash
cd web
npm install
cp .env.example .env.local
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

<<<<<<< HEAD
### 3. AI Service Setup

```bash
cd ai-service
pip install -r requirements.txt

# Pre-warm model cache (downloads ML models)
python scripts/cache_models.py

# Start the service
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Open [http://localhost:8000/docs](http://localhost:8000/docs) for API documentation.

---

## AI Service

The AI service provides emotion detection and speech-to-text transcription through REST APIs.

### Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/process-checkin/` | POST | Short audio check-in processing |
| `/analyze-audio/` | POST | Long audio analysis with stress tracking |

### AI Pipeline

```
Audio Input (16kHz mono)
       ↓
┌─────────────────────────┐
│  Wav2Vec2 Feature      │
│  Extractor             │
│  (audeering model)     │
└─────────────────────────┘
       ↓
┌─────────────────────────┐
│  Pre-trained Wav2Vec2  │
│  Emotion Detection      │
│  (VAD Regression)       │
└─────────────────────────┘
       ↓
┌─────────────────────────┐
│  Stress Calculation    │
│  + Emotion Mapping      │
└─────────────────────────┘
       ↓
Output: { valence, arousal, dominance, stress_index, calm, stress, focus }
```

### Models Used

| Model | Purpose | Size |
|-------|---------|------|
| `audeering/wav2vec2-large-robust-12-ft-emotion-msp-dim` | Emotion detection (VAD) | ~800MB |
| `openai/whisper-base` | Speech-to-text transcription | ~300MB |

### Model Caching

Models are cached locally to avoid re-downloading on every cold start:

```bash
# Pre-warm cache (run during deployment)
python scripts/cache_models.py

# Check cache status
python scripts/cache_models.py --info

# Verify cache integrity
python scripts/cache_models.py --verify
```

### Environment Variables

```bash
# AI Service (.env)
GEMINI_API_KEY=your_api_key          # For topic extraction
MODEL_CACHE_DIR=./models              # Local model cache directory
USE_MODEL_CACHE=true                  # Enable/disable caching
```

---

## Web App

### Available Scripts

```bash
cd web

npm run dev           # Development server
npm run build         # Production build
npm run start         # Production server
npm run lint          # ESLint
npm run prisma:generate   # Generate Prisma client
npm run prisma:migrate   # Run migrations
npm run prisma:push      # Push schema (no migration history)
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://...` | PostgreSQL connection string |
| `AI_SERVICE_BASE_URL` | `http://localhost:8000` | AI service URL |
| `MINIO_ENDPOINT` | `localhost` | MinIO server |
| `MINIO_PORT` | `9000` | MinIO port |
| `MINIO_ACCESS_KEY` | `minio_user` | MinIO access key |
| `MINIO_SECRET_KEY` | `minio_password` | MinIO secret key |
| `MINIO_BUCKET` | `moodflow` | MinIO bucket name |

---

## Database

### Schema Overview

- **User** — Account info and preferences
- **FocusSession** — Focus session with start/end emotions and metrics
- **Recording** — Audio files with analysis results
- **UserPreference** — Per-user settings (theme, reminders, audio quality)

---

## Development

### Running Tests

```bash
# Web app
cd web && npm test

# AI service
cd ai-service && pytest
```

### Building Docker Images

```bash
# Build web app
cd web && docker build -t moodflow-web .

# Build AI service
cd ai-service && docker build -t moodflow-ai .
```

---

## License

MIT
=======
## Environment Variables

### Web Application (`web/.env.local`)

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://moodflow_user:moodflow_password@localhost:5432/moodflow_db` |
| `MINIO_ENDPOINT` | MinIO server endpoint | `localhost` |
| `MINIO_PORT` | MinIO server port | `9000` |
| `MINIO_ACCESS_KEY` | MinIO access key | `minio_user` |
| `MINIO_SECRET_KEY` | MinIO secret key | `minio_password` |
| `MINIO_BUCKET` | MinIO bucket name | `moodflow` |
| `AI_SERVICE_URL` | AI service URL | `http://localhost:8000` |

### AI Service (`ai-service/.env`)

Create based on `.env.example` in the ai-service directory.

## Project Structure

```
moodflow/
├── docker-compose.yml     # PostgreSQL + MinIO
├── web/                   # Next.js application
│   ├── app/               # App router pages
│   │   ├── api/           # API routes
│   │   ├── dashboard/     # Dashboard pages
│   │   └── login/         # Authentication
│   ├── components/        # React components
│   ├── lib/               # Utility functions
│   └── prisma/            # Database schema
├── ai-service/            # FastAPI AI service
│   ├── app/
│   │   ├── pipelines/    # Audio processing pipelines
│   │   ├── routes/       # API endpoints
│   │   └── utils/        # Utility functions
│   └── requirements.txt
└── LICENSE
```

## Running Services

| Service | Command | URL |
|---------|---------|-----|
| PostgreSQL | `docker-compose up -d postgres` | localhost:5432 |
| MinIO | `docker-compose up -d minio` | localhost:9000 (API), localhost:9001 (Console) |
| AI Service | `uvicorn app.main:app --host 0.0.0.0 --port 8000` | localhost:8000 |
| Web App | `npm run dev` (in web/) | localhost:3000 |


## Available Scripts

### Web Application

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Run database migrations |
| `npm run prisma:push` | Push schema to database |

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

- **paledreamer** - [GitHub](https://github.com/paledreamer)
- **Praveen Parakh** - [GitHub](https://github.com/praveenparakh70140)
>>>>>>> 7fe3eba7b873f1d3c5064aece88ccc06fe2708ea
