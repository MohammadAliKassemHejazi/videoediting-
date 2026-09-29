# Motion Studio render image: Node 22 + Playwright Chromium + ffmpeg (libx264) + librosa.
# Playwright's image ships Chromium and its system deps; the tag must match package.json.
FROM mcr.microsoft.com/playwright:v1.56.1-noble

# Python + librosa for beats.py (set WITH_AUDIO_ANALYSIS=false for a ~400 MB smaller image)
ARG WITH_AUDIO_ANALYSIS=true
RUN if [ "$WITH_AUDIO_ANALYSIS" = "true" ]; then \
      rm -f /etc/apt/sources.list.d/nodesource* && \
      apt-get update && apt-get install -y --no-install-recommends python3-venv && \
      rm -rf /var/lib/apt/lists/* && \
      python3 -m venv /opt/venv && \
      /opt/venv/bin/pip install --no-cache-dir numpy librosa soundfile; \
    fi
ENV PATH="/opt/venv/bin:$PATH"

WORKDIR /app
# Dependencies first so this layer is cached across source edits.
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
CMD ["npm", "run", "build"]
