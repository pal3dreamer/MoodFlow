#!/bin/bash

# Define custom cache directories for Hugging Face models to prevent permission errors
export TRANSFORMERS_CACHE="/home/appuser/.cache/huggingface/hub"
export TORCH_HOME="/home/appuser/.cache/torch"

# 1. Start a dummy server on port 7860 immediately. 
# This tells Hugging Face Spaces that the container is "Running" and prevents it 
# from pausing or timing out during the long model download process.
echo "Starting dummy server on port 7860 to satisfy HF health checks..."
python /app/dummy_server.py &
DUMMY_PID=$!

# 2. Pre-download the AI models (Whisper and Wav2Vec2)
echo "Preloading AI models from Hugging Face..."
python /app/preload_models.py

# 3. Start the FastAPI application in the background on port 8000
# (This is the port your Cloudflare Tunnel expects)
echo "Starting FastAPI app on port 8000..."
uvicorn app.main:app --host 0.0.0.0 --port 8000 &

# 4. Once models are loaded and FastAPI is starting, kill the dummy server
# and switch port 7860 to forward traffic to FastAPI (optional, but good for HF UI)
echo "Replacing dummy server with actual API proxy (socat)..."
kill $DUMMY_PID
socat TCP-LISTEN:7860,fork TCP:127.0.0.1:8000 &

# 5. Start Cloudflare Tunnel
if [ -z "$CLOUDFLARE_TUNNEL_TOKEN" ]; then
  echo "Error: CLOUDFLARE_TUNNEL_TOKEN environment variable is not set."
  echo "Please set it in your Hugging Face Space Settings -> Variables and secrets."
  exit 1
fi

# Start the Cloudflare Tunnel in the foreground to keep the container alive
echo "Starting Cloudflare Tunnel..."
cloudflared tunnel --no-autoupdate run --token $CLOUDFLARE_TUNNEL_TOKEN
