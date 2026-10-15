# Production handoff — paused 2026-10-14, 14:01 UTC

## Pause state

The user requested all background terminals stopped and a log for later continuation.
Production is paused. Do not restart jobs until the user resumes.

Stopped Remotion, style gallery, ComfyUI and animation runner. Verified no listeners
on **3000 / 3001 / 8188**, no remaining studio Node/Python workers, no render lock,
and NVIDIA reporting **0 MiB / 0%**. Ordinary browser/editor sessions were preserved.
The longer acting shot completed before shutdown; its video/history are saved.

Workspace: `C:\Users\USER\videoediting-`, PowerShell. No subagents. Serial render
and generation jobs only. No paid generation or publishing. See AGENTS.md for the
full creative/export contract. No further production during the pause.

## Committed baseline and completed films

Latest commit: **effb764**, “Add Arabic story films, hand-synced edits and creature
production workflow.” This paused session's additions remain **uncommitted**.
Do not stage/restore the user's preexisting deletions under `projects/studio-smoke-check`.

Completed exports from the prior turn remain:

- `out/clip-reference-editorial/draft.mp4` — 15-second speaker reference edit.
- `out/clip-hand-orchestra/draft.mp4` — 15-second hand-tracked graphic edit.
- `out/story-collage-memory/draft.mp4` — Arabic memory story, 99.57 seconds.
- `out/story-clawd-memory/draft.mp4` — independent brush character treatment.
- `out/story-paper-theatre/draft.mp4` — real Three.js pop-up-book treatment.

These were checked at 1440×2560/60fps H.264/AAC with full decode. Actual contact,
phone and seam frames were inspected in the prior turn; ending timing was corrected.
Voice numerical checks passed; no listening review was claimed. Prior 16 tests,
legacy determinism and **24 canonical/mirrored skills** passed. Those checks do not
validate the new GPU scripts or new story. Read docs/REFERENCE_AND_STORY_EDITS.md.
Approved developer-stack cut and earlier original/clip styles are preserved.

## RTX 3060 animation: actual working local engine

Hardware verified: **RTX 3060 Laptop GPU, 6GB VRAM**, 16GB RAM, NVIDIA driver 581.57.
CUDA matrix test passed. Free C: disk at pause ~**13.1 GiB**. Avoid unnecessary huge
model downloads. The user authorized continuing with GPU; all setup is isolated.

- `.cache/comfyui`: official ComfyUI, commit
  `e0a32bce84f4603f2b61b16b50f8958e68fd6171`.
- `.cache/comfyui/custom_nodes/ComfyUI-GGUF`: city96 addon, commit
  `6ea2651e7df66d7585f6ffee804b20e92fb38b8a`.
- `.cache/comfyui-venv`: Python 3.13, Torch **2.14.1+cu130**. Exact installed
  versions saved in `projects/warm-creature-story/workflows/LOCAL_GPU_REQUIREMENTS.txt`.
  Torchaudio is 2.11.0+cu130; video worked, but broader audio ABI compatibility
  with Torch 2.14.1 has not been verified.
- Three SHA-256-verified model files: Wan2.2 5B Q4_K_M diffusion, UMT5 encoder
  Q4_K_M, official Wan2.2 VAE. Exact repositories/revisions/sizes/hashes:
  `projects/warm-creature-story/workflows/LOCAL_MODEL_SOURCES.json`.

New source files:

- `scripts/download-creature-models.mjs`: resumable hash-checked downloads.
- `scripts/creature-gpu-engine.py`: **preloads PyAV before Torch**. Reverse order
  froze Windows native extension loading. A faulthandler trace identified PyAV;
  this preload fixed actual engine startup.
- `scripts/start-creature-gpu.ps1`: offline/local-only engine; CUDA diffusion and
  tiled **bfloat16 CUDA VAE**, 0.7GB VRAM reserve, pinned memory disabled.
- `scripts/generate-creature-shot.mjs`: real native API graph, shared render lock,
  submission/history records. Newly generalized `--folder story-projects/<id>`
  and workspace-confined paths; the new folder branch is **not yet tested**.
- `projects/warm-creature-story/workflows/contact-test-6gb-gguf.json`: UI workflow;
  copied into the local engine user workflow folder as Ember-Luma-RTX3060.json.

CPU VAE took several minutes for 25 frames and was interrupted; CUDA VAE worked.
Do not restart the old CPU/debug commands. Logs: `.cache/comfyui-gpu-vae.log`;
startup trace in `.cache/comfyui-debug.log`. No engine is running now.

### Real animated sources saved outside cache

- `projects/warm-creature-story/assets/shots/contact-test.mp4`: 352×640/24fps,
  25 frames/1.04s, 12 steps; completed in 157s including loading. Actual strip
  inspected at `out/warm-creature-story/gpu-test-contact.png`: stable paw hold,
  noticeable exposure/saturation changes. **Not suitable for approval/delivery.**
- `projects/warm-creature-story/assets/shots/contact-acting.mp4`: 352×640/24fps,
  **97 frames/4.04s, 20 steps**, completed in **220.40s** before shutdown.
  Denoising ~127s/~6.3s per step. Observed ~94% GPU use/~4.5GB VRAM.
  **This newer shot has NOT been visually inspected yet.**
- Complete histories/submissions: `.cache/warm-creature-story/*-history.json` and
  `*-submitted.json`. Original videos: `.cache/comfyui/output/ember-luma`.
  Copies above protect animation sources from rebuildable-cache cleanup.

Stable characters: `series/ember-luma/bible.json`. Production art:
`projects/warm-creature-story/assets/keyframe.png` (paw hold), new
`hug-keyframe.png` (kneeling shoulder hug), new `bench-keyframe.png` (waiting
together). Hug/bench were built-in image generation using the original identity
reference; displayed/inspected **stills**, not animation. Exact acting prompt:
`projects/warm-creature-story/contact-motion.txt`.

Generated-image source folder:
`C:\Users\USER\.codex\generated_images\01a13666-9ae6-7be0-ad70-c7955e51b712`.
Hug: `exec-37cfba37-8fda-4edc-92d8-03a565a87fec.png`.
Bench: `exec-3c60ed7f-0060-490c-9d19-a81e037fda35.png`.
Add exact prompts/provenance to the project source record before delivery.

### Remaining fox/kitten work

1. Inspect the **97-frame acting test** for lighting, faces, paws, knees/feet and
   tails. Correct generation settings if the earlier test's artifacts persist.
2. Generate genuine animated hug and waiting/departing-tram shots. Finish the
   original ~15-second **The Next Tram** short using SHOT_PROMPTS.md and
   docs/WARM_CREATURE_STORIES.md. Meaningful acting, not a camera move on a still.
3. Author manifest; run `scripts/creature-story.mjs validate/assemble`. Export
   1440×2560/60fps. Generated sources are smaller and 24fps; upscaling/repeating
   frames does not create native 2K detail or 60 distinct poses.
4. Add deliberate sound/cover, inspect muxed output and key motion/cut points.
   Do not claim listening from numerical checks.
5. Once real animation is assembled, update gallery/preset state and register a
   playable Remotion film. Current WarmCreatureKeyframe.jsx and gallery still
   honestly label preparation. Update continuity and production docs afterward.

The old `out/warm-creature-story/pipeline-check.mp4` uses a speaker clip for an
assembly check. **It is not an animal story.**

## New requested film: My Shadow Went First

Latest task before pause: **after current work**, create one original narrated
story of **at least one minute for ages 13–17**, informed by high-view animation.
Arabic is the accepted demo language. The requested 90% virality probability was
honestly declined; don't invent a forecast, ranking or demographic measurements.

Plot: Noor records a dance; her shadow leaves. Following it leads to Rami's birthday
with empty chairs. She realizes she ignored his invitation, puts the camera away
and makes a paper rocket with him. More rockets bring friends. The shadow returns;
another shadow steals a piece of cake. Mystery → chase → motive reveal → choice →
earned connection → comic echo. Different plot/visual world from the memory film.

Saved:

- `projects/shadow-went-first/BRIEF.md`, `RESEARCH.md`: treatment and dated primary
  sources. Reach of examples is evidence, not prediction for our video.
- `story-projects/shadow-went-first/story.json`: 12 directed beats, colloquial
  Arabic, **ar-EG-SalmaNeural**, +0% rate.
- `script-source.mjs`: correct UTF-8 shortened script. Execute it directly with
  Node when reconstructing the script. Piping Arabic JS via default Windows
  PowerShell native encoding replaced text with question marks; this was found
  and corrected before final narration generation. Use apply_patch or explicit
  UTF-8 encoding, not that default pipeline.
- `assets/voice/00..11.mp3` plus matching JSON: all shortened narration generated
  successfully with actual word boundaries.
- `timed.json`, `captions.srt`, `assets/narration.wav`: **88.83 seconds**, current
  timing. Earlier 132-second voice version is superseded.
- `assets/00.png`: original opening **still**: painterly 3D teenage Noor, dark bob,
  teal jacket/copper bag/yellow laces; detached dark shadow and warm classroom in
  a night school corridor. No animated opening yet.
- `series/noor-shadow/bible.json`, `assets/noor-reference.png`: stable IDs/designs.
  Opening tool source: `exec-1c1466ce-1585-4f57-a8b0-a2dc1e81b717.png` in the
  generated-image folder above. Save exact art prompts/provenance before delivery.

**Mismatch to fix on resume:** bible voice currently says ar-EG-ShakirNeural from
a diagnostic experiment; the actual chosen/generated voice is **Salma**. Change
the bible to ar-EG-SalmaNeural and run `story prepare` to refresh the bible hash.
No need to regenerate unchanged Salma MP3s.

### Remaining new-story work

1. Fix bible voice, re-prepare timing, direct camera coverage using real word times.
2. Create consistent Rami reference and remaining keyframes, then real animated
   actions/reactions. Inspect identity, contact and temporal light. Test larger
   internal dimensions against this 6GB GPU before promising them.
3. Author its dedicated director/composition, STORYBOARD.md, project.json,
   sound/foley, captions and designed cover. **These do not exist yet.** Do not
   send this script through a generic old demo plot.
4. Add to Remotion/gallery while preserving all current compositions. New film
   is **not live in the composition list** and has **no MP4** yet.
5. Serial full >=60s 1440×2560/60fps export; full decode, phone/acting/seam review;
   fix substantive issues. Keep honest draft/upscale/native-frame labels.
6. Appropriate checks, skills:check and mirror any changed skill instructions.
   Commit scoped source additions, excluding weights/cache/exports and user
   smoke-check deletions. No new tests were run for this paused source work.

Optional acceleration research, **not installed or tested**: primary
https://huggingface.co/quanhaol/Wan2.2-TI2V-5B-Turbo documents four-step CFG-free
distillation. Kijai/hum-ma have a ~332MB 5B Turbo LoRA and merged GGUF models.
Verify license/hash and exact sampling workflow before use; 14B LightX2V is not
automatically compatible. Existing model weights are already downloaded.

## Restart commands — only when resumed

```powershell
npm run preview
npm run gallery
# Separate terminal, existing isolated environment:
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/start-creature-gpu.ps1
```

Wait for local engine http://127.0.0.1:8188 before queueing. Preview at
http://localhost:3000; latest gallery http://localhost:3001/?latest=1.
Browser auto-launch was rejected earlier; do not bypass it. User-opened links
and headless inspection are available. Inspect the saved acting shot before
rerendering it or choosing new dimensions/steps/prompts.
