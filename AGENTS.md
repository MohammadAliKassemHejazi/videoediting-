# Motion Studio: project instructions

This repository makes motion graphics from code using Node.js ES modules,
Playwright Chromium and FFmpeg. There is no application backend or frontend build
framework. Use the existing canvas/HTML harness for video work.

## Where to work

- `index.html`: current developer-artifact TikTok render entry. Its film data is
  in `overlays/developer-artifacts.js`; painters in `lib/artifact-studio.js`;
  export harness in `lib/export-artifact-film.mjs`. See `docs/TIKTOK_ARCHITECTURE.md`.
  `index-standalone.html` preserves the original sample.
- `overlay.html`, `lib/overlay-kit.js`, `overlays/*.js`: transparent graphics over
  existing clips. Timelines set `window.OVERLAY`; the TikTok script also loads them
  in Node, so keep timelines declarative and free of browser-only side effects.
- `render.mjs`: parallel frame capture, subframe blending, encoding and chunk joining.
- `lib/motion.js`: closed-form springs, tracks, seeded randomness and rhythm helpers.
- `lib/options.mjs`: command-line options override `studio.config.json`, then defaults.
- `lib/ffmpeg.mjs`, `lib/encoders.mjs`: executable discovery and encoder selection.
- `scripts/tiktok.mjs`: clip probing, alpha rendering, B-roll/voice compositing and SFX.
- `sfx.mjs`, `cues.json`, `scripts/mux.mjs`: procedural sound and audio muxing.
- `scripts/assets.mjs`: manifest, manual media preparation and optional paid generation.
- `scripts/critique.mjs`: contact sheet, frame strip, phone view, poster and loop check.
- `test/motion.test.mjs`: Node's built-in tests for motion math.

Read `docs/CODEX.md` for commands and the Codex workflow, `GUIDE.md` for detailed
user recipes, and the relevant files in `prompts/` for creative briefs and review.
`docs/Opus_Motion_Studio_Documentation.md` is background/reference material.
`CLAUDE.md` and `.claude/` retain the existing Claude integration; Codex uses this file.

## Render contract

- `window.seek(t)` must draw frame t as a pure function of time, including seeks
  backward or in arbitrary order. Clear/reset canvas state on each frame.
- Expose `window.DURATION` in seconds, `window.FONTS` for every used font face,
  and `window.ASSETS_READY` when media loading is asynchronous.
- Read dimensions from `?w=&h=` and reframe layouts for different aspect ratios.
- No timers, CSS transitions, wall-clock dependence, or accumulated simulation
  state in render mode. Existing `requestAnimationFrame` loops are preview-only;
  preserve their render-mode guards.
- Use `Motion.rng(seed)` instead of `Math.random`. Reset or precompute randomness
  so results do not depend on the order of `seek` calls.
- Prefer `lib/motion.js` springs and presets. Keep fonts local through
  `@fontsource/*`, with both CSS links and matching `window.FONTS` entries.
- Standard final films use H.264/yuv420p; alpha overlays use ProRes 4444 (or qtrle).

## Creative and audio conventions

- Follow the user's brief. Default to one background, one foreground, one accent,
  at most one display and one UI typeface, and a visual event every 2–4 seconds.
- Avoid generic centered titles on gradients, global fade-ins, decorative corner
  labels/frame borders, glowing UI chrome and generic particle bursts.
- Draw typography, shapes, counters and UI in code. Avoid `will-change` on scaled
  content and keep text readable at phone size.
- Keep overlays within `OverlayKit.SAFE` and away from faces. Add new components
  as pure functions of local time and update their default SFX in the internal
  `DEFAULT_SFX` map.
- Use supplied music or synthesize sound in code. With supplied music, use
  `beats.py` to measure rhythm and align hits to `beats.json`.
- Muxing normalizes audio to -14 LUFS. `scripts/mux.mjs` takes one audio input;
  supplying a music track replaces its default SFX input. Premix music and SFX
  explicitly when both are required.

## Media and local files

- Default generated-media workflow: plan `assets/manifest.json` using
  `assets/manifest.example.json`, run `npm run assets`, and give the user the
  missing items in `docs/asset_requests.md` for manual Gemini generation.
- Downloads go in `assets/inbox/`; run `npm run assets` to prepare them and use
  `assets/ready/` in timelines. Store real brand references in `assets/brand/`.
- Only use paid `npm run assets:generate` when the user requests it and the
  required credentials exist. Never print or commit secrets from `.env`.
- Preserve source clips, reference media and existing artwork. `out/`, `clips/`,
  inbox/ready media, dependencies and machine configuration are git-ignored.
- `npm run bench` changes local `studio.config.json`; do not run it for routine
  edits or copy this machine's worker/GPU settings into project defaults.

## Validation and delivery

- Node.js 22+ is required. First-time setup is `npm run setup`; Python dependencies
  in `requirements.txt` are only needed for audio analysis.
- Run `npm test` for motion/harness code changes. For renderer or determinism
  changes, also run `npm run determinism` when Chromium is available; it compares
  two three-second renders with x264 and GPU disabled.
- For film changes, run `npm run draft` and inspect the generated contact, strip
  and phone images with an available image viewer. Use `prompts/evaluation.md` to
  assess hook, readability, motion, variety and audio/visual sync. Fix the weakest
  issues and repeat until each score is at least 8 before final export. A silent
  draft cannot establish audio sync; check the muxed output too.
- For overlay changes, render the affected interval through `overlay.html` or
  the TikTok pipeline, and review it against the actual clip and safe zones.
- Documentation-only changes need link/command checks, not a full video render.
- Current TikTok: `npm run video:draft`, inspect `out/contact.png`, run
  `npm run video:check`, record the current-source review, then
  `npm run video:final`. Final export requires a current source hash. Top-deck
  frames must contain developer artifacts, never generic caption headline cards.
- Final films: `npm run build`; extra aspect ratios: `npm run render:formats`
  (silent outputs, requiring separate audio muxing).
- Report actual output paths, checks performed and any unavailable prerequisites.
  Do not claim visual or audio review without inspecting/listening to the output.
