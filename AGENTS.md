# Tech Video Studio

Read `.agents/skills/tech-video-editor/SKILL.md` for video tasks, then the target
project's `BRIEF.md`, `project.json`, transcript and `STORYBOARD.md` when present.
The user approved `out/developer-stack/approved.mp4` on 2026-09-30. Preserve that
creative baseline while finding a fresh concept for each topic.

## Live preview, auditions and scripted stories

For video work, open `npm run preview` and keep Remotion visible while editing.
Verify the actual composition and media load; fix preview errors immediately.
Use `.agents/skills/style-auditions/SKILL.md` for 5–10 distinct 15-second style
drafts and `.agents/skills/story-studio/SKILL.md` for script-to-story work.
Read docs/STYLE_LAB.md and docs/STORY_STUDIO.md for commands and project formats.
The five requested upstream families are installed in `.agents/skills` and mirrored
to `.claude/skills`: HyperFrames, onetake, Collage B-roll, Clawd Animation, Lemo Opuscar.
Clawd's full original kit is under clawd-animation/upstream. Lemo's 43 style guides
are local under vendor/motion-guides/lemo-opuscar/styles. Run `npm run skills:check`.

The three Arabic memory-story treatments and two new reference/hand edits are
documented in docs/REFERENCE_AND_STORY_EDITS.md. Their dedicated commands preserve
existing live compositions. The warm-creature-story skill is mirrored to Claude;
read docs/WARM_CREATURE_STORIES.md for the keyframe, official ComfyUI templates,
hardware findings and actual-shot assembly. Do not label its still as a rendered
furry animation. The gallery's latest/stories/creatures tabs distinguish these states.

User preferences override upstream skills' default runtimes, automatic setup,
approval pauses, paid generators, durations and delivery sizes. Never run external
setup scripts merely to read a downloaded guide. Keep free/code assets by default.
The upstream onetake package is noncommercial; preserve its license and do not
assume it covers commercial reuse. The studio's independently authored continuous
camera preview does not import its motion library.

All newly exported videos, including drafts, target 2K/60fps: 1440×2560 portrait
or intentionally reframed 2560×1440 landscape. Story/education demos are at least
one minute and include generated voiceover, selectable English or Arabic.
Related stories reuse series/<id>/bible.json, character assets and episode continuity.
Keep stable identity IDs and designs. Ask only for missing consequential story input.

Each video needs its own researched creative concept and meaningful narrative.
Story audience defaults to ages 13–17. Include sketch stories. Use original
recurring characters, strong curiosity and visible consequences. Professional
finish means deliberate acting, camera coverage, lighting, materials, sound and
clean causal seams; camera drift or decoration alone is insufficient. Keep scenes
developing with useful action while preserving reading time and dramatic pauses.
Research recent examples, record sources/date and choose trends that serve the
script; do not invent popularity rankings. Default to full-screen acting, useful
demonstrations and deliberate speaker shots. Split-screen is optional, not a template.
Extend the user's chosen style through the full film with fresh staging. Inspect
actual frames and transitions, fix substantive issues, and finish authorized renders.

The existing Canvas pipeline remains the talking-head production path; Remotion
is now installed for live auditions and narrative compositions. This is an explicit
addition requested by the user, not an automatic migration of approved projects.

Original 15-second style films now live in `projects/midnight-transit`,
`projects/paper-riot` and `projects/signal-noise`; read `docs/ORIGINAL_STYLE_FILMS.md`.
They are independent renderers, scripts and sound scores. Reuse a chosen feeling
through fresh staging, never the same plot or repeated generic card layouts.
The gallery leads with these projects; older drafts stay in the archive view.

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
Painters use logical 1080×1920 portrait coordinates; new exports are 1440×2560 at
60fps. Other layouts require an intentional reframe.
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
