# Motion Studio Rules

This repo is a harness for code-rendered motion graphics. Claude writes `index.html`;
the harness renders it frame-by-frame to video. Full reference: `docs/Opus_Motion_Studio_Documentation.md`.

## Layout
- `index.html` — the film. Canvas + `window.seek(t)`.
- `lib/motion.js` — closed-form springs, `track()`, `indicator()`, seeded `rng()`, presets.
- `render.mjs` — headless Chromium → H.264. In-page subframe blending + parallel chunk workers. `--fps --dur --sub --from --w --h --workers --encoder --gpu --out`; per-machine defaults in `studio.config.json` (`npm run bench`).
- `sfx.mjs` — procedural SFX from `cues.json` → `out/sfx.wav`.
- `beats.py` — beat grid from an audio track → `beats.json`.
- `scripts/*.mjs` — `mux`, `critique` (contact sheets), `determinism`, `formats`. All Node, so they run on Windows, macOS, Linux and in Docker.
- `lib/ffmpeg.mjs` — finds ffmpeg ($FFMPEG → bundled ffmpeg-static → PATH).
- Fonts: bundled via npm `@fontsource/*`, linked in `index.html`, listed in `window.FONTS`. Add any new face to both.
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
- Mix master audio to -14 LUFS standard (`npm run mux` does this with loudnorm).

## Vision Verification Loop (Mandatory before final export)
1. Render a draft and contact sheets (`out/contact.png`) — `npm run draft`.
2. Self-score from 1-10 on:
   - Hook strength (first 2 seconds)
   - Readability at mobile scale (360px viewport width)
   - Motion quality (spring physics, zero dead frames)
   - Visual variety
   - Audio-visual sync
3. Fix the 3 lowest-scoring criteria.
4. Loop until every score is 8 or higher.
5. Only then trigger the full subframe render.

## TikTok overlays (personal videos edited in CapCut)
- `overlay.html` + `lib/overlay-kit.js` draw transparent overlays from a timeline file in `overlays/`.
  Components: hook, caption, title, sticker, circle, arrow, counter, cta, progress, flash.
- `npm run tiktok -- clips/x.mp4 --timeline overlays/x.js` renders at the clip's size/fps/length,
  adds SFX from the timeline, and burns in → `out/x_motion.mp4`. `--capcut` also writes a
  transparent ProRes 4444 `out/x_overlay.mov`.
- Keep overlay content inside `OverlayKit.SAFE` and away from the speaker's face.
- Add new components to `lib/overlay-kit.js` (pure functions of local time) and a default SFX in `DEFAULT_SFX`.

## Generated media (images / video / voice)
- The user generates media manually in the free Gemini app (no API). Plan it in `assets/manifest.json`
  (format: `assets/manifest.example.json`), run `npm run assets` to produce `docs/asset_requests.md`
  (copy-paste prompts + exact file names), then wait for the user to drop files in `assets/inbox/`.
- `npm run assets` prepares `assets/ready/` (green screen → transparent PNG, video → H.264, voice → WAV).
  Only reference files in `assets/ready/`.
- Timeline elements: `image` (src, x, y, w, anim pop|slide|kenburns), `broll` (src, t, dur, mode full|pip),
  `voice` (src, t, volume). Never request text/shapes as images — draw them in code.
- Paid APIs (fal, ElevenLabs) are optional: only use `npm run assets:generate` if the user asks and `.env` has keys.
