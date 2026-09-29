#!/usr/bin/env bash
# Diagnostic images for the vision self-critique loop.
# Usage: scripts/critique.sh [video=out/final.mp4] [strip_at=4.1]
set -euo pipefail
FFMPEG="${FFMPEG:-ffmpeg}"
IN="${1:-out/final.mp4}"; AT="${2:-4.1}"
mkdir -p out
# 1. Macro pacing contact sheet (2 fps, 6 columns)
"$FFMPEG" -y -loglevel error -i "$IN" -vf "fps=2,scale=270:-1,tile=6x5" -frames:v 1 out/contact.png
# 2. Frame strip (12 frames around an action beat)
"$FFMPEG" -y -loglevel error -ss "$AT" -i "$IN" -vf "scale=320:-1,tile=12x1" -frames:v 1 out/strip.png
# 3. Mobile simulation (360px wide)
"$FFMPEG" -y -loglevel error -i "$IN" -vf "fps=1,scale=360:-1,tile=5x3" -frames:v 1 out/phone.png
# 4. Loop seam check (sequence played twice)
"$FFMPEG" -y -loglevel error -stream_loop 1 -i "$IN" -c copy out/loop_check.mp4
echo "Wrote out/contact.png out/strip.png out/phone.png out/loop_check.mp4"
echo "Next: run the evaluation prompt in prompts/evaluation.md"
