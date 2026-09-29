#!/usr/bin/env bash
# Render the first 3s twice and compare hashes. Identical hashes = deterministic film.
set -euo pipefail
hash() { if command -v md5sum >/dev/null; then md5sum "$1" | cut -d' ' -f1; else md5 -q "$1"; fi; }
node render.mjs --dur 3 --fps 60 --sub 1 --out out/det_a.mp4 >/dev/null
node render.mjs --dur 3 --fps 60 --sub 1 --out out/det_b.mp4 >/dev/null
A=$(hash out/det_a.mp4); B=$(hash out/det_b.mp4)
echo "pass 1: $A"; echo "pass 2: $B"
[ "$A" = "$B" ] && echo "DETERMINISTIC ✓" || { echo "NON-DETERMINISTIC ✗"; exit 1; }
