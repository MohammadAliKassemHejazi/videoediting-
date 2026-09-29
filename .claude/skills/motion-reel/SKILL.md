---
name: motion-reel
description: Generates a product or showreel motion graphic video rendered directly from code using this repo's seek(t) harness.
---

# Motion Reel Skill Pipeline

## Parameter Checklist
- Target URL
- Duration (in seconds)
- Aspect ratios (e.g., 9:16, 1:1, 16:9)
- Brand palette & fonts
- Style reference (video, image set, or frame)
- Music (audio file path or "synthesize")

Ask for any missing parameters before starting.

## Execution Order
1. Extract DOM elements, SVGs, and screenshots from the URL into `./assets/` using Playwright.
2. If an external visual reference is supplied, generate `docs/style_guide.md` (see `prompts/C_style_transfer.txt`).
3. Analyze or generate audio: run `python beats.py <track> > beats.json`; otherwise write `cues.json` on a 120 BPM grid.
4. Outline scenes and camera timings in `docs/shotlist.md`.
5. Write `index.html` using the deterministic `window.seek(t)` harness and `lib/motion.js` springs. Follow `CLAUDE.md`.
6. Test render (`node render.mjs --fps 30 --sub 1`), then `node scripts/critique.mjs out/silent.mp4`; run the vision evaluation in `prompts/evaluation.md` (minimum 3 iterations, every score ≥ 8).
7. Final subframe render: `node render.mjs`, `node sfx.mjs`, `npm run mux`; extra formats via `npm run render:formats`.
8. Deliver `out/final.mp4`, `out/contact.png`, and `out/loop_check.mp4`.
