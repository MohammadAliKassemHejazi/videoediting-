---
name: warm-creature-story
description: Direct affectionate cinematic 3D animal microstories with consistent furry characters, expressive faces and believable contact; prepare image-to-video shots or a Blender rigging workflow and assemble supplied animated shots in the studio.
---

Read [the production guide](../../../docs/WARM_CREATURE_STORIES.md) and the selected
series bible. The user's fox/kitten reference establishes warm fur, face acting,
paw contact and an affectionate interrupted-departure story. Direct an original
situation and characters rather than reproducing that film frame for frame.

Use the original Ember/Luma design under `series/ember-luma` when a related episode
is requested. Lock silhouettes, fur markings, accessories, sizes and voice choices.
Plan one readable action and its reaction per 3–5 second shot. Prefer grounded
contact, eye lines and a clear emotional change over camera motion alone.

Choose a real production route: rigged 3D animation, or generated image-to-video
shots with identity references and inspected contact. The installed code renderer
and an image generation tool do not constitute a fur animation engine. Label
stills as keyframes, do not call a moving still a recreation, and state unavailable
capabilities plainly. Downloaded native ComfyUI templates are in
`vendor/comfy-workflows`; they require ComfyUI and model weights. Check actual
hardware against current primary documentation before promising local generation.
No paid generator or external setup script by default.

When animated shots are available, author a manifest with project ID, shot files,
source in/out points, and optional narration. Run `node scripts/creature-story.mjs
validate <manifest>` then `assemble <manifest>`. This joins real clips, exports
1440×2560/60fps, verifies full decode and never substitutes stills for missing video.
Exported 60fps does not imply a 24fps generated source contains 60 unique poses.
Review fur/face consistency, paw intersections, foot sliding, eye targets and all
cut points. Update episode continuity only after the story is actually made.
