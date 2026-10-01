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

Use known project preferences; ask only when missing information materially changes the edit.

## Execution Order
1. Extract DOM elements, SVGs, and screenshots from the URL into `./assets/` using Playwright.
2. If an external visual reference is supplied, generate `docs/style_guide.md` (see `prompts/C_style_transfer.txt`).
3. For talking-head films, use the actual speech clock and quiet cue events. Use music analysis only when music is supplied/requested.
4. Outline scenes and camera timings in `docs/shotlist.md`.
5. Write `index.html` using the deterministic `window.seek(t)` harness and `lib/motion.js` springs. Follow `CLAUDE.md`.
6. For tech talking-head edits, follow `AGENTS.md` and `.agents/skills/tech-video-editor/SKILL.md`. Render a full muxed project draft, inspect contact/phone/strip images and fix substantive issues.
7. Record the current review with `studio review`, then `studio final`. Read README.md for maintained commands.
8. Deliver `out/<project>/final.mp4`, generated `thumbnail.png`, and captions. Preserve approved versions.
