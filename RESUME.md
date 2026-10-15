# Completed drafts — 2026-10-15

The user resumed the paused session. Both authorized new films are rendered:

- **My Shadow Went First**: original 88.83s Arabic teen story, Salma narration,
  recurring Noor/Rami characters, 13 actual animated shots, authored shadow VFX,
  invitation insert, captions, original score/Foley and designed portrait/square
  covers. `out/shadow-went-first/draft.mp4`. Live: http://localhost:3000/shadow-went-first
- **The Next Tram**: original 15s fox/kitten animation, three actual GPU shots,
  original score and designed cover. `out/warm-creature-story/assembled-draft.mp4`.
  Live: http://localhost:3000/warm-creature-story

Watch both at http://localhost:3001/?latest=1. They lead that gallery. All exports
are 1440x2560/60fps. Generated character sources are 448x800/24fps, upscaled and
repeated; this does not create native 2K detail or 60 new poses. Some AI texture,
hand/prop and face variation remains. Neither film is approved or published.

Read [SHADOW_STORY.md](docs/SHADOW_STORY.md),
[LOCAL_GPU_ANIMATION.md](docs/LOCAL_GPU_ANIMATION.md) and both projects' REVIEW.md
before further edits. Stable identities and episode outcomes are in the
series/noor-shadow and series/ember-luma bibles. Reuse those for related episodes.

Verified: final contact/phone/cut images, full decode, dimensions/fps/audio, actual
Chrome playback of both films and the formerly failing backend speech.mp4.
Story audio master measures -16.5 LUFS / -3.3dB true peak. No listening review is
claimed. 17 tests pass, shared Canvas determinism hashes match, and all 24 skill
packages match between Codex and Claude. Listening and user creative feedback
remain pending; do not invent approval or a probability of virality.

No generation/render job remains active. Services intentionally left running:
Remotion 3000 (PID 32728), gallery 3001 (PID 8156), GPU engine 8188 (PID 16188).
GPU models were unloaded after generation. PIDs are a snapshot; verify ownership
before stopping anything. Restart background services only at the user's request.

Work-in-progress setup checkpoint: c7b5a78. Completed source checkpoint is the
latest commit (use git log -1). Models, cache, audio, video exports and public
mirrors are ignored in Git; actual generated shot assets are preserved on disk
outside cache. Preserve the user's preexisting projects/studio-smoke-check deletions.
The previous [pause log](docs/PAUSED_SESSION_2026-10-14.md) is historical.
