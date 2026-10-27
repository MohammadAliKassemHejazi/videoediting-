# Episode 2 production — 2026-10-27

Authorized task: finish the110-second ten-thousand-steps film, then answer the
YouTube monetization question. User subsequently requested detailed reference
rhythm matching, speaking lips, a serious bird voice and softer other character.
Latest addition: create a shared TikTok/YouTube/Instagram series profile picture.
No upload/publication is authorized. Do not end production at prompt delivery.

## Actual production state

All28 selected keyframes and complete image/motion plans exist in
`projects/texas-ten-thousand-steps`. The original255-word English v2 voice track is
generated locally with real model-derived word/phoneme timing, fitted to110s.
Opening dialogue ends28s, matching the supplied reference's Tokyo cue. Main bird
and narrator: Kokoro am_michael, serious measured delivery. Javelina: am_puck,
softer. This is generated speech; no human listening approval is claimed.

Speaking shots01–06 and28 use exact speech-guide WAVs via the installed
MiniMaxH3AddGuide node and audio VAE. This replaces the earlier silent-animation
restriction at the user's explicit request. Actual native speaking takes01–06
are complete; sampled contacts of01,02,03,05 show the selected character's mouth
articulating, stable faces, outfits and white gloves.04/06 have also been inspected in actual native contacts. Do not equate mouth movement or guide preparation with a completed
listening/phoneme-by-phoneme lip-sync approval.

Native sources01–24 were completed at the latest checkpoint; queue now continues
from25 after corrected art was copied. Check files, queue and processes before
starting anything else. One H3 job at a time. Native sources are352x640/24fps,
107frames including handles; exact4-second96-frame units are prepared afterward.
Delivery1440x2560/60fps uses enhancement/upscale and repeated poses, not native
2K detail or60 uniquely generated poses. Sources remain outside cache.

The live110s composition is http://localhost:3002/texas-ten-thousand-steps.
Actual sources replace labeled keyframes as they complete. Browser verified:
font, full110s fitted voice and composition load without errors. Gallery3001
registers Episode2 separately and uses its own source hash. Episode1 is preserved.

Watch digits drifted in H3. Numeric CPU optical-flow tracks01/05 are recorded,
with no weak frames; seek-safe SVG repairs keep8400 legible on the actual case.
Studio frames0.12,1.4,3.6s verified the01 patch and a watch-to-two-shot camera move;
9.6s showed the speaking bird. Check05 and other readable prop fields, especially
06/09/13/18/21/25 as their sources are inspected. Never retain a floating repair.

## Running jobs — verify ownership, do not duplicate

- Generation: `node scripts/generate-casefile-episode.mjs texas-ten-thousand-steps --watch`,
  session3265, parent PID17292 at checkpoint. It skips matching source03's earlier
  audio-guided test and waits for artwork/clear Studio render queue when necessary.
- Finisher: `node scripts/await-casefile-finishing.mjs texas-ten-thousand-steps`,
  session9351, PID33092. State `.cache/texas-ten-thousand-steps/finishing-state.json`.
  Once all28 records exist and GPU/lock are clear, it serially runs exact units,
  original audio master, enhancement, sync, reverse check and full2K60 rendering.
  Do not launch duplicate finishing stages while this helper is active.
- Live sync: `node scripts/sync-casefile-episode.mjs texas-ten-thousand-steps --watch`,
  session9272, PID34400. Restart only this owned watcher after changing its code.
- Studio3002 PID31968. Gallery3001 latest session27185/PID18452. H3 engine8189.
  Docker owns3000; leave it alone. A Studio UI render does not use render.lock:
  check its actual queue before any new render/generation. Port fix is committed.

The first silent-only01 attempt hit disk full during latent saving;02 was
interrupted to implement the user's new lip requirement. Both failed/superseded
attempt histories are preserved under `.cache/.../versions/silent-attempts`.
They are not delivered sources. V1 scripts/plan/audio versions are preserved.

Windows paging temporarily filled C:. Automatic approval review rejected both
recursive and per-file cache deletion attempts; no cache files were deleted by
those rejected calls. NTFS compression of cached Python dependencies completed
(logical1.487GB to physical1.078GB); around8GB free remained at latest checkpoint.
Do not repeat rejected cleanup via another tool. The new enhancer uses a bounded,
reused107-frame input/output pool and performs no folder deletion. It validates
all output mtimes and full encoded MP4 before reusing that pool. Real-ESRGAN
animevideov3 must use Vulkan GPU1 (RTX3060), not Intel0. Three-GiB free-space gates.

## Remaining delivery work

Watch the real generation and finisher; inspect all actual native/enhanced acting
and contacts, particularly readable counters, mouth assignment, hands and action
timing. Adjust non-speaking source excerpts only after reviewing real motion.
Native speaking excerpts and their prepared audio guides must keep matching
timing. Inspect source24's stand and27's chalk-line crossing; their prompt timing
was corrected to fit the short final cuts. Source23's raised wrist was corrected
in its selected still so the lowered-watch sequence does not reset.

The finisher is prepared but has NOT completed enhancement/audio/full export at
this checkpoint. Its failure, if any, is written to state JSON. Source review,
full-film contacts/phone/seams and final browser playback/listening status still
need recording. Run meaningful changed checks;17 existing tests passed after new
composition integration. Source hashes prevent stale gallery delivery. Do not
claim a finished film until the actual MP4 exists, decodes and has been reviewed.

Designed cover generation is pending tool cell289 (`steps-cover` store). Series
avatar generation is pending cell303 (`texas-profile-picture` store), square,
no text, both exact character faces, dark navy/amber and circular crop safety.
Inspect/copy both generated outputs into the workspace. Provide the profile master
and named platform copies, inspect small circular crops, record provenance and
commit source/branding. No account changes or upload is authorized.

Read REFERENCE_RHYTHM.md and FACTS.md for measured pacing and primary-source
corrections. The reference's unsupported no-doctor origin and universal threshold
are not repeated. The main cast/series bible stays consistent. User already
attested MiniMax permission for Hungary; do not ask that again. After production,
check current official YouTube monetization policy and answer the user's question
without guaranteeing acceptance or claiming a character swap alone qualifies.

2026-10-27 update: Sources23/24 inspected. H3 repeated a wrist raise in23;
EDITORIAL_OVERRIDES.json skips it and selects the settled arm/head turn.24 begins
at0.6s to complete the stand/first step in its short final cut.22 includes the
full face reaction. No speaking guide interval was changed. Source contacts19–22
and actual05 watch repairs at22/23.8s are inspected. Source21 numeric repair is
being tracked. Final movie review/playback helpers are prepared.

Ollama is not running and has no dependency in scripts/lib/remotion. User asked
because they want to uninstall it; removal does not affect ComfyUI/H3 or Kokoro.
No uninstall or Ollama startup was performed.
