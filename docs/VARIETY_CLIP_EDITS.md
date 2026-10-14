# Different editing structures for the same clip

The second set of five auditions uses the original 0–15 second backend recording.
Earlier depth-type edits remain available at http://localhost:3001/?depth=1.
The gallery's **Five edit ideas** tab compares five new ideas. All ten compositions remain in
Remotion; the new ones are in the NEW-EDIT-IDEAS folder.

| Project | Editing structure |
| --- | --- |
| clip-split-lab | Full speaker hook, then a wide speaker shot above sequential code/contract evidence |
| clip-whip-zoom | Real moving punch/pull crops, restrained velocity streaks, annotations on the performance |
| clip-cursor-run | Picture-in-picture speaker, a pointer-driven deployment interruption and contract builder |
| clip-request-runner | Isometric request route, three rising checkpoints, warning recoil and an access boundary |
| clip-sketch-interrupt | Monochrome footage, a brief real freeze, blue draw-on comic cutaways and a drawn contract |

These are independently authored scenes in each project's scenes.js. Shared
helpers supply only typography, primitives and captions. A different topic needs
fresh choreography and evidence. Code and diagrams are labeled illustrative.
The first 15 seconds end during the original second question; they are auditions,
not five invented complete arguments.

```powershell
node scripts/variety-clips.mjs init
node scripts/variety-clips.mjs activate
npm run preview
node scripts/variety-clips.mjs stills
node scripts/variety-clips.mjs render
node scripts/review-pro-clips.mjs variety
node scripts/check-showcase-preview.mjs clip-split-lab clip-whip-zoom clip-cursor-run clip-request-runner clip-sketch-interrupt
npm run gallery
node scripts/check-style-gallery.mjs
```

Prepare the source with scripts/prepare-pro-clips.mjs first when setting up a new
checkout. The live preview reuses its compatible base video and unchanged voice.
`init` generates the short freeze asset and original quiet SFX; re-running it
rewrites these auditions' configs and scores. Generated covers and their prompts
are kept in the project assets; exports, public preview media and cache are ignored.

Production uses the established Canvas/Playwright/FFmpeg workflow. Graphics are
packed into two alpha layers; FFmpeg composites each explicit footage shot between
them. Camera keyframes use smoothstep interpolation in both JS and FFmpeg. Wide
shots have a deliberately higher crop anchor to preserve the top of the head.
No person segmentation is needed for the new rectangular layouts. Graphic renders
stay serial, and forward/reverse pixel checks run before export.

Original speech remains at gain 1 with no normalization, ducking or time stretching.
SFX are synthesized from code and placed on speech/interaction beats. Numerical
alignment and peak checks are distinct from a listening review. All exports target
1440×2560, 60fps; that does not add captured detail or frame cadence to the source.

Research dates and primary references are recorded per project. TikTok's 2026
report informs curiosity and visible-process choices; a contemporary CapCut zoom
example informs camera vocabulary. Neither guarantees that an edit will go viral.
Selection is saved to projects/backend-checklist/pro-edits/choice.json across both
sets. Selection records a preference; it does not automatically render the full clip.
