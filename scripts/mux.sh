#!/usr/bin/env bash
# Mux silent video + audio, loudness-normalised to -14 LUFS.
# Usage: scripts/mux.sh [video=out/silent.mp4] [audio=out/sfx.wav] [out=out/final.mp4]
set -euo pipefail
FFMPEG="${FFMPEG:-ffmpeg}"
VIDEO="${1:-out/silent.mp4}"; AUDIO="${2:-out/sfx.wav}"; OUT="${3:-out/final.mp4}"
"$FFMPEG" -y -loglevel error -i "$VIDEO" -i "$AUDIO" \
  -map 0:v:0 -map 1:a:0 -c:v copy \
  -af "loudnorm=I=-14:TP=-1.5:LRA=11" -c:a aac -b:a 192k -ar 48000 \
  -shortest "$OUT"
echo "Muxed: $OUT"
