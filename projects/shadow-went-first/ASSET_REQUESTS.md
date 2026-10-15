# Produced assets

Original story and characters; no further user upload is required for this draft.

- Character keyframes: `story-projects/shadow-went-first/assets/00..12.png`,
  original portrait art. Actual image-to-video prompts are in
  `story-projects/shadow-went-first/prompts/00..12.txt` and director.json.
- Clean plates: `00-clean.png`, `01-clean.png`, `02-clean.png`, `10-clean.png`.
  Same framing/lighting/characters; remove only the specified shadow. Opaque
  background; composited featureless SVG supplies the missing action.
- Animation: `assets/shots/00..12.mp4`, 448x800/24fps, 4n+1 source frames.
  Exact source duration, timeline timing, trim handles and prompt/seed overrides
  live in director.json. Preserve the extra half-second motion handles.
- Narration: `assets/voice/00..11.mp3`, Arabic `ar-EG-SalmaNeural`, actual word
  boundaries in adjacent JSON. `assets/narration.wav` is the timed whole voice.
- Music/Foley: `score.mjs` generates deterministic 48k stereo `assets/score.wav`;
  `assets/SOUND_EVENTS.json` records every authored cue. Mix in `assets/mix.wav`.
- Cover: `projects/shadow-went-first/assets/thumbnail.png`, designed portrait
  composition, title MY SHADOW / WENT FIRST, distinct from a random video frame.
  `thumbnail-square.png` is a separately designed square version.

Image output IDs and reference/intent are recorded in assets/IMAGE_SOURCES.md.
Original tool outputs are preserved in the generated_images directory. Native
source images and character references remain outside rebuildable cache.
Final export target: 1440x2560, 60fps. No transparent/chroma footage is required;
the authored shadow SVG provides its own alpha. No paid generator was used.
