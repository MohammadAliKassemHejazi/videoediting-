---
name: style-auditions
description: Offer 5–10 distinct speech-synced 15-second video style drafts, open a live Remotion preview, and extend the user's selected creative direction into a complete edit.
---

Read [the style workflow](../../../docs/STYLE_LAB.md), then the target brief,
corrected transcript and storyboard. Read the relevant actual installed skill:
`hyperframes`, `onetake`, `collage-broll`, `clawd-animation`, or `lemo-opuscar`.
The downloaded packages and local reference libraries have different runtimes;
their installation does not migrate the existing talking-head export pipeline.

Start `npm run preview` before editing and leave it running. Verify the actual
composition and audio load. Offer five candidates by default, up to ten; compare
the same 15-second speech window. Change composition, camera, type, material,
motion cause and narrative metaphor, not just accent colors. Prefer full-screen
speaker shots intercut with useful full-screen evidence; split layouts are optional
only when they serve a clear beat or the user requests them.

Research recent examples when choosing styles, save dated primary references in
the project's STYLE_RESEARCH.md, and adapt to the audience and message. Do not
promise virality or fabricate rankings. The built-in library is a starting point;
author new painters and story beats for each topic. Use local or licensed free
media now; record source/license and exact generated asset requests when needed.

Author `STYLE_CONTENT.json` with phrase-aligned beats. Run `styles init`, render
the auditions serially at 1440×2560/60fps and inspect phone frames and transitions.
Selection is saved by `styles select`; user selection is creative approval, not
quality review. Extend the selected direction through the full transcript using
original staging, then complete the normal reviewed export and generated cover.

For original films without supplied footage, read `docs/ORIGINAL_STYLE_FILMS.md`.
Use independent project folders, not color variants of one painter. The current
examples are `projects/midnight-transit`, `projects/paper-riot` and
`projects/signal-noise`. Their native scenes, materials, plots and sound scores
are deliberately different. Follow the user's requested count and duration;
three 15-second original films override the usual five speech auditions.

For ALL video tasks, storyboard a subject-specific visual cause and payoff.
Reject repeated headline cards, identical framing and generic drifting as a
professional finish. Inspect actual phone frames before full rendering, expose
the real project in live Remotion, and fix substantive framing/material/type issues.

For the user's clip with typography behind the person, read `docs/PRO_CLIP_EDITS.md`.
Use a real moving matte, not an opaque fake cutout or a still portrait. Match all
source/matte crops, keep the speaker prominent, and inspect hair/mic/hand edges.
The five current clip studies live in `projects/clip-*`; their gallery selection
is saved in `projects/backend-checklist/pro-edits/choice.json`. Original voice
stays at gain 1; quiet SFX do not normalize or duck it. Extend the chosen grammar
with fresh topic-specific content rather than carrying its backend words to a new clip.

When the user asks for more editing variety, read `docs/VARIETY_CLIP_EDITS.md`.
Change the actual structure: simultaneous speaker/proof, moving close performance,
pointer-led demonstration, a narrated animated system, or a sketch interruption.
The second set has independent `projects/clip-*/scenes.js` implementations and
explicit footage shots, not recolored background headlines. Keep earlier selections
and drafts available; preview the actual shots, inspect exports and finish rendering.

For the supplied reference's editorial grammar and the actual hand-tracked graphic
edit, read docs/REFERENCE_AND_STORY_EDITS.md. Use reference-clips.mjs and the source
landmark dataset; graphic attachment must follow the footage crop and camera scale.
Keep earlier live projects when activating a different workflow.
