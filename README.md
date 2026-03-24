# MoodFlow

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

## Quick Start

### 1. Start Infrastructure

```bash
docker-compose up -d
```

This starts PostgreSQL (port 5432) and MinIO (ports 9000, 9001).

### 2. Start AI Service

```bash
cd ai-service
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### 3. Start Web Application

```bash
cd web
npm install
cp .env.example .env.local
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

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
