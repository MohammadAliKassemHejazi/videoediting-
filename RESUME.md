# Active H3 Texas series production — 2026-10-26

CURRENT: Episode 1 is rendered at `out/texas-cinema-myth/draft.mp4` (90.01s,
1440x2560/60fps, audio, full decode passed). All23 actual H3 sources are complete,
AI enhanced using Real-ESRGAN animevideov3 on Vulkan GPU1 (RTX3060), and assembled
with continuous Kokoro narration, original synthesized score/Foley and captions.
The native sources remain352x640/24fps; delivery is enhanced/upscaled with repeated
poses, not native2K/60 generated motion. Actual muxed-film contacts, final stamp and
closing prop repair were inspected; Chrome played six sampled sections without
media errors. Listening and user creative approval remain pending.

Port fix committed as27493d0: removed fixed3000 from config and preview command.
Studio is3002; Docker keeps3000. On2026-10-26 the user confirmed "its working".
The user-started Studio SECOND export also FINISHED successfully at
`out/texas-cinema-myth.mp4`, queue id2450479451671672:5400 frames,90.01s,
1440x2560/60fps,audio, full decode passed. `studio-render-check.json` records the
check at2026-10-26T12:38:06Z. No export/generation is active at this checkpoint.
Services left running: Studio3002, gallery3001, H3 engine8189 and live Texas sync.
Check the live Studio queue before new render/generation: UI jobs do NOT acquire
`.cache/render.lock`. Do not stop unrelated services to free3000.

Episode2, the requested ten-thousand-steps retelling, is NOT a completed video.
`projects/texas-ten-thousand-steps` has the analyzed110.27s reference, sourced
factual corrections, a267-word original multi-voice script and first original
keyframe. Remaining:28-scene plans/art, local voices, H3 sources, separate live
composition, sound, finishing, actual110s2K60 render/review and monetization answer
after finishing. Keep the same series duo; do not copy reference audio/frames.
User already attested MiniMax authorization for Hungary; do not ask again.

The checkpoints below are historical and superseded by this paragraph.

LATEST: All23 keyframes, corrected wood-case continuity, landscape/portrait covers,
the continuous223-word local narration and a full90s Remotion timeline are ready.
Actual H3 source generation is still running;15 sources were complete at the last
review checkpoint. Verify the live queue before any new GPU/render job. Preview:
http://localhost:3002/texas-cinema-myth ; gallery http://localhost:3001/?latest=1.
The preview labels unanimated shots as keyframes. This is not a finished export.
Read the top of docs/TEXAS_H3_PRODUCTION.md for current commands and remaining work.

Read `docs/TEXAS_H3_PRODUCTION.md` first. The user requested building the actual
90-second YouTube film with recurring Javelina/Vulture Banker characters, coherent
cuts and real animation. They report a MiniMax authorization email for Hungary;
proceed on that attestation and do not ask the same license question again.
H3 weights/8-step accelerator are downloaded and SHA-verified. Local generation
works on the6GB3060: first4.46s source and an acceleration comparison are inspected,
not a completed episode. Remotion3002 shows the real first shot, H3 engine8189.
Current jobs must be checked before starting another generation; the episode
queue was started at shot02 and waits for missing artwork. Global render lock.
Full local English narration is generated (90.80s/223 timed words), not listened
to. Most episode sources and full assembly/render remain unfinished. See the
production handoff for files, exact tests, caveats and next work.

## Previous completed drafts — 2026-10-15

Historical intake (superseded by active production above): the user selected the 90-second vertical Texas animal
mystery "The Cinema That Could Control Your Mind", with Javelina/Vulture Banker.
The user chose ending 3 (Case Closed). STEP 7's English voiceover draft is saved
in `projects/texas-cinema-myth/VOICEOVER_DRAFT.md`; await approval/NEXT before
image prompts or assets. See that project's BRIEF.md. Final voice language is
unconfirmed. C: now has 41.07 GiB free; H3 inference remains unvalidated.
Nine official H3 skills and three official Comfy templates are downloaded;
33 skill packages match Codex/Claude. H3 weights are absent, local inference is
unvalidated, and disk/RAM constraints remain. See `docs/MINIMAX_H3_LOCAL.md`.

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
