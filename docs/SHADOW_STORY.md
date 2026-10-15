# My Shadow Went First

Original 88.83-second Arabic narrated teen story, directed 2026-10-15. Noor's
shadow abandons her dance recording to lead her to Rami's overlooked birthday.
The mystery turns into a choice to show up; a cake-stealing shadow closes the gag.
The research, script, storyboard, prompts and identity references are local.
No forecast of views or virality is made.

Live: http://localhost:3000/shadow-went-first
Gallery: http://localhost:3001/?stories=1
Export: `out/shadow-went-first/draft.mp4` after successful finishing.

```powershell
# Prepare narration/timing using the existing story workflow; retain Salma.
# See story-projects/shadow-went-first/script-source.mjs and story.json.
node story-projects/shadow-went-first/director-source.mjs
# Local GPU engine must already be running. Serial production only.
node scripts/generate-shadow-shots.mjs
node story-projects/shadow-went-first/repair-candle.mjs
node story-projects/shadow-went-first/score.mjs
node scripts/sync-shadow-preview.mjs
node scripts/render-shadow-story.mjs --stills=2,8.6,14.3,17.1,35.3,52.5,67.8,74.8
node scripts/render-shadow-story.mjs
# Optional one-time audio finish for the initial quiet master; later score
# rebuilds already contain this gain. Repeated running does not stack gain.
node scripts/master-shadow-audio.mjs
node scripts/inspect-shadow-playback.mjs
```

Generation checkpoints mean generation finished, not visual acceptance. Rejected
glasses/camera/flame takes are preserved beside the selected sources. Do not
delete shot assets as cache. The batch uses prompt/image/settings hashes, so
deliberately rerun only the affected shot before reapplying its finishing effect.
`repair-door-direction.mjs` was an authoring migration; do not run it routinely.

Actual character sources: 448x800, 24fps, generated on the local 6GB RTX 3060
with the four-step Turbo recipe documented in LOCAL_GPU_ANIMATION.md. They are
upscaled/repeated for 1440x2560/60fps delivery, not native 2K/60-pose generation.
AI sources retain some face, hand, prop and background texture instability.

The master adds a pure-time featureless SVG shadow, selective clean plates,
closer coverage after the rocket release, readable invitation UI, English
captions and an original score/Foley. Arabic captions are selectable as a
composition prop; the narration stays Arabic in this episode. Voice timing
comes from the actual Salma files. No fabricated lip-sync claim.

The shadow-return insert uses a held clean plate and purposeful rig animation;
the rest uses actual animated character shots. Candle repair removes the
generated relighting after the breath, adds smoke and holds the final smile
briefly before an unwanted second blow. The film is a reviewable draft.
Visual findings live in projects/shadow-went-first/REVIEW.md. A numerical audio
check is not a listening review.

The gallery checks the source digest before serving an export. After any visual
change, render again; use the audio finishing pass only for an audio revision.
Neither film is user-approved or published. No paid generator was used.

The final Rami identity repair was rendered only for frames 1592–2065 and
integrated with scripts/patch-shadow-shot.mjs. That utility requires a matching
pre-change source/film snapshot under .cache, refuses unrelated source changes,
preserves a rollback copy, copies mastered audio and validates the full output.
It is a repair utility, not needed for a normal fresh full render. The selected
bare-faced close keyframe and prompt override are now part of the normal film.
