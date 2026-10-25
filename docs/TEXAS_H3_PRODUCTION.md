# Active production — Texas Casefiles

The user requested an actual professional 90-second YouTube video using local
MiniMax H3, with the same Javelina and Vulture Banker across future channel
episodes. This is not a request to stop at prompts. They approved the English
script by typing NEXT, then explicitly requested building the film. Retain the
stepwise prompt artifacts while proceeding with their subsequent production
instruction; do not ask them to repeat intake or generator choice.

Confirmed: True Crime & Mystery, duo 3, vertical 9:16, 90 seconds, idea 4
"The Cinema That Could Control Your Mind", glowing film reel, ending 3 Case Closed.
The user emphasized a coherent, linked and well-animated finished film. Read
`projects/texas-cinema-myth/BRIEF.md`, `VOICEOVER_DRAFT.md`, image/motion plans and
`series/texas-casefiles/bible.json`. Do not change unrelated approved films.

## Authorization and commercial intent

The user confirmed Hungary. After the standard H3 license's EU exclusion was
explained, they insisted on H3 and subsequently said "i got confirmation email to
use h3 mini max". Proceed on that user-reported separate authorization. No need
to ask the same question again; do not invent or independently certify the email's
wording, commercial scope or YouTube approval. YouTube's official guidance says
AI-assisted channels remain eligible, while repetitive or superficially varied
mass-produced content does not. Original, independently researched episodes and
recurring identity are the creative direction. No publishing is authorized.

## Local H3 — actual working setup

- Existing ComfyUI core 0.40.0, commit e0a32bce84f4603f2b61b16b50f8958e68fd6171.
- Separate base `.cache/h3-engine`, existing isolated Python environment reused.
  The existing Wan installation is preserved.
- Pinned leejet/ComfyUI-GGUF fork in the H3 base's custom_nodes only, revision
  373048b8403a7820620065210a691263d4da0a61.
- Q3 pruned H3 FL2VA, Q2 50-layer Qwen3-VL encoder with integrated vision tower,
  INT8 ConvRot video VAE and FP32 audio VAE are downloaded and SHA-256 verified.
  `projects/texas-cinema-myth/H3_MODELS.json` pins all sources and hashes.
- Optional official ModelTC/lightx2v mixed-aspect 544p FL2VA Turbo 8-step v1.0
  ComfyUI LoRA also downloaded and hash-verified. Use Euler, shifts 12/3, strength1.
  This is not the 768p model, whose training shift differs.
- Source dimensions currently 352×640/24fps. Final delivery remains
  1440×2560/60fps, upscaled; never claim native H3 2K/60 poses.

Start via `powershell -NoProfile -File scripts/start-h3-gpu.ps1`, local port8189.
`scripts/h3-gpu-engine.py` preloads PyAV, then enters main. Never import Torch
before Comfy configures its allocator: doing that caused cudaMallocAsync/native
allocator mismatch. The diagnostic timer has been removed after startup worked.

`lib/h3-studio-nodes.py` is copied to
`.cache/h3-engine/custom_nodes/studio_h3/__init__.py`. Restart only this owned H3
server after changing that adapter; preserve the Wan server/other applications.
The adapter handles raw-Comfy-key GGUFs with missing architecture metadata:
validate the H3 50-layer/vision signature, preserve tensor names, restore the
flattened visual Conv3d kernel (3456,2,16,16) to (1152,3,2,16,16), and load it as
a real native tensor. BF16 values are reinterpreted without giant int32 temporary
buffers. Keep `mmap_released=True` on both model patchers: upstream's detach pass
copies the whole 12GB encoder/8GB model into anonymous CPU RAM and caused heavy
paging on this 16GB laptop. Read-only file backing preserves the same values.
No upstream file was patched. Confirm GPU/CPU behavior rather than claiming fit
from file size alone.

`scripts/generate-h3-shot.mjs` performs sequential sampling, splits the joint AV
latent, saves VIDEO latent, unloads models, then separately decodes/encodes it.
Source soundtrack is discarded, as requested. Each source runs107 frames
(4.4583s) for motion handles; delivery source units must be trimmed to exactly4s.
Global `.cache/render.lock` protects generation. Never run a second job over it.

Examples:

```powershell
node scripts/generate-h3-shot.mjs new-take --width 352 --height 640 --frames 107 --steps 8 --turbo --image projects/texas-cinema-myth/assets/keyframes/02-clean.png --prompt projects/texas-cinema-myth/prompts/motion/02.txt
node scripts/generate-texas-episode.mjs --watch --start=2
```

The episode queue waits for missing keyframes, renders one shot at a time and
checks decode/metadata. It does not grant creative approval. It skips matching
generation signatures and refuses to overwrite differing source takes. Preserve
native source files and review/provenance outside rebuildable cache.

## Actual tests and first source

- `assets/shots/h3-smoke-03.mp4`: real local H3, 256×448/24fps,22frames,2steps,
  0.92s. Hardware test only. Earlier smoke01/02 failed due raw text-encoder kernel
  layout; errors are preserved in `.cache/texas-cinema-myth`.
- `assets/shots/01-h3-v2.mp4`:20-step base,352×640/24fps,4.4583s. Sampling437.65s,
  decode11.96s. Actual nine-frame contact inspected. Face/glove/reel recognizable,
  blink and small handling action. Native small hub lettering drifts and needs
  a tracked editorial label/glow repair before final delivery.
- `assets/shots/01-h3-turbo.mp4`:8-step official LoRA comparison, same geometry,
  sample243.11s/decode12.47s. Contact inspected. More expressive reel/head action;
  identity survives, but hub glow drops intermittently and lettering also drifts.
  This requires VFX cleanup; do not call it perfect or already final.
- Current stable `assets/shots/01-h3.mp4` is a COPY of the inspected20-step base.
  Both original takes are preserved. All source videos are Git-ignored but remain
  outside `.cache`.
- Native H3 test inputs and histories are under `.cache/texas-cinema-myth`.
  `01-h3` first production attempt was intentionally stopped during CPU mmap
  copying; `01-h3-v2` is the successful file-backed run. Do not mistake its pending
  submission record for an active process.

## Current artwork and live preview

The built-in image tool generated original art; H3 animated it locally. Main
reference `series/texas-casefiles/assets/duo-v1.png` was visually inspected. Full
cast locks are in the bible; use it in every related episode.

Keyframes currently exist for01,02,03,04,05,06; use `02-clean.png` (original02 contains
unwanted SALOON letters and is preserved). Scene06 has been generated as
`C:/Users/USER/.codex/generated_images/01a13666-9ae6-7be0-ad70-c7955e51b712/exec-708131cb-c565-44cb-927f-37d7e3a176fc.png`
and has been copied to `assets/keyframes/06.png` and visually inspected.
See `ASSET_SOURCES.md` for earlier generation IDs; append new ones as they land.
Main duo appear only in Present; Archive extras have their own fixed locks. Keep
paper props unlettered except CONTROL, add MYTH and captions during editing.

`image-plan.mjs` emits23 full image prompts, `image-scenes.json` and per-shot files.
`motion-plan.mjs` emits23 pure visible-motion prompts and `production-scenes.json`.
Full narration is preserved verbatim in order across scene boundaries. Production
prompts are ready, most image/animation assets are not yet generated.

Remotion is on3002 because Docker owns3000; do not stop Docker. Current preview:
http://localhost:3002/texas-cinema-myth-workbench
It is a four-second FIRST-SHOT work preview, not the completed episode. It labels
that state honestly. `node scripts/sync-texas-preview.mjs` updates its media.
`node scripts/inspect-texas-preview.mjs` verified actual H3 playback in installed
Chrome without page/media errors; screenshot/report in `out/texas-cinema-myth`.
Do not put query strings INSIDE `staticFile()`; it percent-encodes them and caused
a Code4/404. The fixed preview appends the cache query after `staticFile(path)`.
Do not claim user art approval or listening. Shared registry preserves this new
composition when other project families are activated;17 tests pass, including
the new Texas retention assertion. The approved developer-stack cut is preserved.

## Local narration and editing

Kokoro ONNX0.6.1 is installed in `.cache/voice-venv`; model/voices in
`.cache/kokoro-models` were downloaded and SHA-verified from the wrapper's release.
Base model publisher declares Apache2, wrapperMIT; sources in
`NARRATION_SOURCES.json`. Use a stable original preset, no real-person cloning.

`scripts/texas-voice.py` successfully generated full English narration with
am_michael, speed1.06, continuous phoneme-window synthesis, CPU-only. Files:
`story-projects/texas-cinema-myth/assets/narration.raw.wav` and `.raw.json`.
90.80s,223 canonical timed words, model-derived phoneme durations, mapping ratio
0.9691. Javelina uses Havelina as a synthesizer-only pronunciation alias. Captions
retain the approved spelling. Listening is pending; don't infer listening from
the timing. Native output contains both waveform and duration; no Whisper needed
for initial timing. Preserve these actual timings and do not replace with evenly
spaced captions.

Remaining edit issue:4-second source clips are the generation units, but the
natural narration reaches some semantic boundaries1–3s after the provisional
fixed4s cuts. Preserve natural narration and the user's demand for a linked film:
fit its90.80s to around89.4s with a small pitch-preserving speed adjustment; use
word-derived editorial cuts, while retaining separately prepared4-second source
units. The final line lasts almost3s, so crushing it into a2s last shot will rush
it. Keep the continuous voice, use deliberate editorial trims/retiming and pauses
for the ending, and inspect actual audio/visual continuity. Stamp reveal should
be tied to the spoken MYTH beat; do not blindly use the old editStart values.

Still required: remaining source art, actual H3 shots02–23, per-shot contacts and
bad-take fixes, clean tracked CONTROL labels/glow, word-synced white serif caption
overlay, original restrained Western score/Foley, deliberate ink wipes at03/14,
full90s assembly, designed thumbnail,2K60 render/full decode/phone/seam review,
listening/user feedback status, and final gallery registration. Do not publish.
