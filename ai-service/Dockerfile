FROM python:3.11-slim

WORKDIR /app

# Install system dependencies required for audio processing and cloudflared
# Added 'socat' to route traffic from 7860 (HF Spaces) to 8000 (FastAPI/Cloudflare)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    ffmpeg \
    libsndfile1 \
    wget \
    socat \
    && rm -rf /var/lib/apt/lists/*

# Download and install cloudflared (required for Cloudflare Tunnel)
RUN wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb \
    && dpkg -i cloudflared-linux-amd64.deb \
    && rm cloudflared-linux-amd64.deb

# Create a non-root user for better security
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Set environment variables for Hugging Face Spaces cache directories
ENV HOME=/home/appuser \
    PATH=/home/appuser/.local/bin:$PATH \
    TRANSFORMERS_CACHE=/home/appuser/.cache/huggingface/hub \
    TORCH_HOME=/home/appuser/.cache/torch

# Create home directory and cache directories, set ownership
RUN mkdir -p /home/appuser/.cache/huggingface/hub \
    && chown -R appuser:appuser /home/appuser

# Copy requirements first to leverage Docker cache
COPY requirements.txt .

# --- HUGGING FACE OPTIMIZATION ---
# Install PyTorch CPU version first. This prevents pip from downloading
# the massive 2-3GB GPU binaries which cause HF Spaces builds to freeze/timeout.
RUN pip install --no-cache-dir torch torchaudio --index-url https://download.pytorch.org/whl/cpu

# Install the rest of the Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy the application code with appropriate ownership
COPY --chown=appuser:appuser . .

# Ensure start script is executable
RUN chmod +x /app/start.sh

# Switch to the non-root user
USER appuser

# Expose 8000 for Cloudflare Tunnel config, and 7860 for HF Spaces default
EXPOSE 8000
EXPOSE 7860

# Start both the application and the Cloudflare Tunnel via the script
CMD ["/app/start.sh"]
