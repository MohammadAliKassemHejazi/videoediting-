#!/usr/bin/env bash
# Render the same timeline in 9:16, 1:1 and 16:9.
set -euo pipefail
node render.mjs --w 1080 --h 1920 --out out/final_9x16_silent.mp4 "$@"
node render.mjs --w 1080 --h 1080 --out out/final_1x1_silent.mp4 "$@"
node render.mjs --w 1920 --h 1080 --out out/final_16x9_silent.mp4 "$@"
