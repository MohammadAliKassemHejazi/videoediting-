# Motion Studio Rules

This repo is a harness for code-rendered motion graphics. Claude writes `index.html`;
the harness renders it frame-by-frame to video. Full reference: `docs/Opus_Motion_Studio_Documentation.md`.

## Layout
- `index.html` — the film. Canvas + `window.seek(t)`.
- `lib/motion.js` — closed-form springs, `track()`, `indicator()`, seeded `rng()`, presets.
- `render.mjs` — headless Chromium → FFmpeg (subframe motion blur). `--fps --dur --sub --from --out`.
- `sfx.mjs` — procedural SFX from `cues.json` → `out/sfx.wav`.
- `beats.py` — beat grid from an audio track → `beats.json`.
- `scripts/` — `mux.sh`, `critique.sh` (contact sheets), `determinism.sh`, `formats.sh`.
- `prompts/` — director prompt patterns A–D and the evaluation prompt.

## Render Contract
- Every film is a pure function of time: `window.seek(t)` paints frame t.
- No CSS transitions, no setTimeout, no requestAnimationFrame in render mode.
- No state carried between frames.
- Seeded pseudo-random noise only (mulberry32 via `Motion.rng`); never Math.random.
- Render with `node render.mjs`, encode H.264 yuv420p, CRF 16.

## Visual Language & Look
- Banned defaults: centered title on gradient, elements fading in globally,
  corner labels, frame borders, glow on UI chrome, generic particle bursts.
- Typography: Maximum one display typeface, one UI typeface.
- Palette: One background, one foreground, one accent color unless specified.
- Pacing: Every 2 to 4 seconds, a new visual event or camera move must execute.
- Never use will-change on anything the camera scales (blurry text).

## Audio & Rhythm
- Score and SFX must be synthesized in code unless an external audio track is supplied.
- Snap visual hits directly to the measured beat grid (`beats.json`).
- Mix master audio to -14 LUFS standard (`scripts/mux.sh` does this with loudnorm).

## Vision Verification Loop (Mandatory before final export)
1. Render one frame per beat as a contact sheet (`out/contact.png`) — `npm run critique`.
2. Self-score from 1-10 on:
   - Hook strength (first 2 seconds)
   - Readability at mobile scale (360px viewport width)
   - Motion quality (spring physics, zero dead frames)
   - Visual variety
   - Audio-visual sync
3. Fix the 3 lowest-scoring criteria.
4. Loop until every score is 8 or higher.
5. Only then trigger the full subframe render.
