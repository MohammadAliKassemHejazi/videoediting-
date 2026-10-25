# MiniMax H3 acquisition and local readiness

Update: H3 is now installed and has generated real local source tests. The user
reports a separate MiniMax authorization email for Hungary. Active instructions,
verified model hashes, memory fixes and remaining film work are documented in
`docs/TEXAS_H3_PRODUCTION.md`. The first acquisition notes below are historical;
do not treat the old absence of weights as the current state.

Checked 2026-10-25. Skills are installed; H3 model inference is not configured or
validated. No weights, paid API, external setup script or background generator was
started for this acquisition.

## Acquired sources

All nine official skills from MiniMax-AI/MiniMax-H3, pinned to
`d21241f0a4b3acbb34c97dae47fa417b7065e438`, are unmodified in `.agents/skills`
and mirrored to `.claude/skills`:

- h3-prompt-writing
- 3d-animation-short-generator
- brand-promo-video-generator
- co-op-game-intro-generator
- handdrawn-live-video-generator
- minimalist-product-ad-generator
- music-video-subtitle-generator
- paper-collage-explainer-generator
- papercraft-stop-motion-explainer

`h3-prompt-writing` explicitly supports generic agents without a proprietary
runtime. The eight style skills declare MiniMax Hub dependencies. Preserve them
as upstream references; their installation does not supply Hub tools to Codex or
Claude, or make a local video engine available. The 3D/live-action style defaults
do not match the user's Texas 2D cartoon and must not replace it.

Official ComfyUI editor templates (T2V, I2V, R2V) are saved in
`vendor/video-workflows/minimax-h3/`, with repository commits in `SOURCES.json`.
They are editor documents, not submitted API graphs; no template was executed.
The skill installer fetched the official pinned GitHub repository; it did not run
upstream installation scripts. All 33 studio skill packages match after sync.

The system skill validator's strict frontmatter whitelist rejects the upstream
`compatibility` extension (and some style metadata). Its default Windows decoding
also rejects some UTF-8 characters unless Python UTF-8 mode is enabled. Preserve
official files rather than silently rewriting their requirements. YAML structure,
required identity fields, local references and exact upstream file hashes are
checked separately; mirror equality does not prove generation works.

## Machine findings

- NVIDIA GeForce RTX 3060 Laptop GPU: 6144 MiB VRAM.
- Physical RAM: 15.7 GiB reported by Windows.
- C: free space at first inspection: 8.18 GiB; after the user freed space, 41.07
  GiB. No H3 model downloads have begun.
- Existing isolated ComfyUI reports 0.40.0, commit
  `e0a32bce84f4603f2b61b16b50f8958e68fd6171`, with native
  `comfy_extras/nodes_minimax_h3.py` already present. This install was not upgraded.
- No files named for H3/MiniMax/Qwen3 were found under that instance's models tree.
  Native node code alone is not a working checkpoint installation.

Comfy's current guide lists a 16 GB pruned W6A8 transformer as its smallest
listed checkpoint, before the required text encoder and video/audio VAEs. MiniMax
suggests planning for 32–64 GB system RAM; its 12 GB VRAM reference uses around
42 GB of downloads. Lower-VRAM community routes are mentioned, but are not a
validated recipe for this 6 GB VRAM / 16 GB RAM machine. The updated free space
fits the smallest listed transformer in isolation, but does not establish room
for an entire working bundle plus temporary files and rendered output. Do not delete user
footage, existing models or completed films to fit it, and do not claim that
buying more RAM alone will establish acceptable speed or output quality.

## Offline and delivery distinctions

H3-Base can generate locally; native model output is 24 fps with a default
768-pixel short side. The official H3-Context-IR and H3-Regenerate-2K modules are
hosted and not part of the open-weight local pipeline. Avoid introducing either
into a supposedly offline workflow. Upscaling an offline render to the requested
1440×2560/60fps is delivery conversion, not native H3 2K generation or 60 unique
poses per second.

For character consistency, use approved model sheets and actual first-frame I2V
or Ref2VA conditioning. Do not attach references to an I2V graph and assume the
R2V branch is sampled: Comfy documents that unwired reference conditioning can be
ignored without an error.

H3 Comfy nodes align frame counts to `17k+5` at 24fps. The model card supports
4–15-second outputs, while Comfy's documented trained range starts near five
seconds. When producing this story, inspect the actual installed node's length
handling and trim approved source handles to exactly 96 frames at 24fps (four
seconds), then assemble exactly 240 output frames per four-second shot at 60fps.
Never promise an arbitrary node duration parameter produces an exact four seconds.
Twenty-three four-second clips total 92 seconds; the user permits trimming the
last two seconds for a 90-second edit.

## Texas story overrides and current gate

See `projects/texas-cinema-myth/BRIEF.md`. The user chose idea 4, ending 3 (Case
Closed), and has a STEP 7 English script draft awaiting approval. Do not generate
image prompts/assets before voiceover approval; animation prompts require NEXT.

For this project all animation prompts describe visible motion only. User rules
override H3's audiovisual prompt defaults: do not insert soundscape/music,
dialogue, narration, lip sync or caption instructions into the animation prompt.
If a future integration requires audio-specific controls, configure them separately
from the paste-ready animation prompt, discard unwanted source audio, and add
approved voiceover, captions and sound in editing. The original procedural story
workflow is authoritative; the Hub skills must not ask the user to repeat intake.

## Primary references and license scope

- Official H3 page: https://design.minimax.io/h3
- Official source and skills: https://github.com/MiniMax-AI/MiniMax-H3/tree/d21241f0a4b3acbb34c97dae47fa417b7065e438/skills
- Model card: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Comfy guide: https://docs.comfy.org/tutorials/video/minimax/minimax-h3
- Model license: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE

The official model license's I.5 and V.4 exclude local use in the EU, UK, US and
South Korea under that standard grant; MiniMax offers a separate authorization
route. A Europe/Budapest timezone is not proof of where the user deploys. Before
weights are acquired/run, establish applicable deployment rights if the intended
location is one of those regions. No weights were downloaded or terms accepted.
MiniMax's general FAQ and Comfy's commercial-license summary differ in emphasis;
retain the actual model license and verify applicable terms rather than certifying
unconditional commercial rights from the word "open". Do not assume an MIT grant
for this skill repository just because a different MiniMax repository uses MIT.
