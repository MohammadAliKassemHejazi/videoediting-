---
name: tech-video-editor
description: Edit supplied tech talking-head videos into TikTok and Instagram Reels in this repository, with speech-synced visual evidence, designed full-screen cutaways, English captions, optional user-generated media, and a generated thumbnail. Use the existing Canvas/Playwright/FFmpeg project workflow.
---

# Tech video editor

The approved editorial reference is `out/developer-stack/approved.mp4`. The user
approved its large speaker, head cutout over a rounded card, dark grid, focused
code/UI, red markers, readable English captions and quiet effects. This is a style
baseline, not a mandate to repeat its scenes or reuse software-stack visuals for
unrelated subjects. Full-screen artifact moments are now welcome.

Read [the production workflow](../../../docs/WORKFLOW.md) and the chosen project's
brief/transcript/storyboard. Create a project with `studio new` when needed. Inspect
the footage and reference before choosing composition or generating assets.

Write a semantic shot list: spoken phrase/time → useful proof or demonstration →
viewer focus → motion cause → sound. Verify claims from official sources when
research is needed. Illustrative mockups must not masquerade as real quotes or
measured results. Use intentional contrast between speaker, split view and full
screen; add motion when it guides attention or explains cause and effect.

If an image, sticker or video would strengthen the explanation, put an exact request
in project.json `assets` and run `studio assets`. Include purpose, frame layout,
timing, filename, duration/handles and alpha/green requirements. Continue independent
work while the user generates assets. Prefer code for type, UI, diagrams and cards;
use generation for photographic/concept art and covers. No paid service calls by default.

Use the built-in image-generation skill/tool for the required thumbnail when
available, or give the user a complete prompt. Preserve the speaker's identity,
use a truthful short hook, inspect spelling, phone readability and center crops,
and save it inside the project. The render gate requires a real thumbnail file.

Implement scene functions in `scenes.js` using `SceneKit.register`; declarative
timings are in `timeline.js`. Never change the shared renderer solely to encode one
topic's story. The included developer painters are examples, not a universal script.
Read [repo research](../../../docs/RESEARCH.md) for optional techniques. Framework
skills apply in their own frameworks; keep this project's deterministic contract.

Render a muxed draft, inspect contact/phone/strip images and relevant frame sequences.
Correct real weaknesses; do not fabricate listening checks or rubber-stamp scores.
Record the current review, run final export and validation, and deliver only useful
links: MP4, thumbnail, captions if requested. Keep the approved original. Use
`studio clean` only for rebuildable intermediates, preserving sources and assets.
