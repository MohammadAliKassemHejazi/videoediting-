# Episode 2 asset provenance

The supplied reference film is used for story analysis only. Its recorded footage,
characters, voice and audio are not production assets for this episode. The
reference checksum and local ASR are in `reference/`.

All 28 selected frames are generated artwork in `assets/keyframes/01.png` through
`28.png`. `ART_GENERATION.json` records selected checksums, generated source files,
retained exact prompts where available, and character/style references. Current
production sheets in `prompts/images/` are not all identical to earlier generation
requests. The original first-frame prompt remains in Git commit e5bfa89. Artwork
was generated with the built-in image tool and visually inspected; it is not
stock footage or an animated result by itself.

Present scenes reference the series duo sheet and opening watch frame. Archive
revisions use scene 08 for ink rendering, explicitly excluding the main duo.
Rejected Archive 09/10 images with the duo are preserved but excluded. Corrected
19/20 remove extra glowing watches/numbers; corrected 23 keeps the wrist lowered
to preserve the ending action. Rejected/alternate artwork remains on disk.

Actual motion uses locally installed MiniMax H3, pinned in `H3_MODELS.json`.
Native sources and generation signatures are in `assets/shots/`. Speaking takes
01–06 and 28 use matching voice guides with the audio VAE/AddGuide node. This is
not a claim to use Ref2VA weights or perfect phoneme synchronization. Generation
runs serially on the RTX 3060; native sources are preserved unchanged.

Kokoro ONNX stock voices am_michael (serious Bird and narrator) and am_puck
(softer Javelina) provide original generated English performances. No person's
voice is cloned. NARRATION.json, word/phoneme timing and speech-guide records
preserve text and timing provenance. The earlier planned am_fenrir is superseded.
Original procedural music, ambience and Foley come from make-casefile-audio.mjs;
the finished master records events/checksums in the story project's
`assets/SOUND_EVENTS.json`. Numerical checks are not a listening review.

CPU optical-flow metadata drives original SVG numeric repairs; source videos
remain unchanged. The locally installed Source Serif 4 font/package license is
preserved. Official pinned Real-ESRGAN animevideov3 tools are recorded in
FINISHING_TOOLS.json. Enhancement and 60fps delivery do not create native 2K
detail or 60 distinct generated poses from 352×640/24fps originals.

`assets/covers/youtube.png` is a separately designed generated cover, not a random
film frame. Its prompt is `prompts/COVER.txt`; source is
`exec-ceb8977b-bed6-403f-84af-ab2095e7071f.png`. `assets/thumbnail.png` is a byte copy.
Series profile provenance is in `series/texas-casefiles/branding/PROFILE.json`.
Nothing has been uploaded or published. Facts/primary sources are in FACTS.md.
