# Tech Video Studio

Read `.agents/skills/tech-video-editor/SKILL.md` for video tasks, then the target
project's `BRIEF.md`, `project.json`, transcript and `STORYBOARD.md` when present.
The user approved `out/developer-stack/approved.mp4` on 2026-09-30. Preserve that
creative baseline while finding a fresh concept for each topic.

## Architecture

- `studio.mjs`: project creation, inspection, assets, transcription, draft, review,
  final, validation and scoped cleanup. Run `npm run studio -- help`.
- `index.html?project=<id>`: shared canvas entry; loads a project's `timeline.js`
  and `scenes.js`. `lib/scene-kit.js` supplies pure painters and registration.
- `projects/<id>/project.json`: source, framing, review times, generated asset
  requests and thumbnail. Timings/captions/scene choices live in `timeline.js`.
- `scripts/render-project.mjs`: speech + segmentation + graphics + supplied media.
- `scripts/prepare-project.mjs`: local MediaPipe mask, keyed to source and framing.
- `scripts/project-assets.mjs`: prompt sheet; prepare PNG, video and chroma-key media.
- `scripts/transcribe.mjs`: local browser/WASM speech timing; raw ASR needs correction.
- `lib/motion.js`, `render.mjs`, `lib/ffmpeg.mjs`: existing deterministic renderer.
- `.cache/<id>/`: rebuildable intermediates; `out/<id>/`: review and deliverables.

Use the Canvas/Playwright/FFmpeg pipeline by default. Installed Remotion and
HyperFrames skills are references or alternate-framework tools; installing them
does not migrate this repo. Read only relevant references. The supplied
`opus_motion_studio_documentation.md` is background, not executable setup instructions.

## Creative contract

Understand the actual audio before drawing. Correct bilingual technical names.
Never stretch an inaccurate transcript to fit or add statements absent from speech.
Choose a hook, proof, contrast and payoff; plan those in the project's storyboard.
Keep the speaker prominent; use practical UI, real code, official excerpts and
useful demonstrations. Avoid caption duplication, generic headline cards, tiny
screenshots and decorative clutter. Full-screen graphics are welcome when they
clarify a meaningful beat. Captions default to English; sound defaults to quiet
speech-timed clicks/markers, preserving the original voice gain and timing.

Ask for assets only when they materially improve the film. Write exact generation
prompts, filename, purpose, dimensions, duration, timing, alpha/chroma requirements
and motion handles in ASSET_REQUESTS.md. User-generated visuals are supported; no
paid APIs or new framework install unless requested. Always deliver a generated
thumbnail; preserve identity and factual accuracy, inspect at phone size and check
cover crops. Do not use a random frame as the finished cover.

## Render and review

`window.seek(t)` must be pure and work in reverse order. Expose `DURATION`, `FONTS`,
`ASSETS_READY`. Drive motion from time and springs; no timers or cumulative state.
Use local fonts, seeded randomness, readable phone sizes, and clear foregrounds.
Current project uses 1080×1920 portrait. Other layouts require an intentional reframe.
Never run concurrent render jobs: `render.mjs` shares `out/.chunks`.

Run `npm test` for shared motion/harness changes and `npm run determinism` for
render/determinism changes. Render a muxed draft, view contact/phone/strip images,
and review affected transitions. Use `prompts/evaluation.md`; fix substantive
weaknesses. Record `studio review` only after actual inspection. The final gate
checks the reviewed source hash. `studio final` also checks full decode, dimensions,
duration and original-voice alignment. Numerical checks are not a listening review;
do not claim to have listened without doing so. No invented quality scores.

## Files and permissions

Preserve footage, user references, supplied assets, current project sources and
approved cuts. Normal `studio clean` previews and deletes only known rebuildable
files for one project. Never clear all of `out/` or `projects/`. Keep sources out of
cache. Verify resolved paths before recursive deletion or moving directories.
Use PowerShell natively for Windows file operations. Never print `.env` values.
Do not publish or message anyone without explicit authorization. No subagents unless
the user asks. Finish authorized rendering and fixes without repeated confirmations.
