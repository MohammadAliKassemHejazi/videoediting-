# Reference edits and Arabic character stories

The new work lives in independent projects and keeps earlier drafts available.
Open http://localhost:3001/?latest=1 for the comparison, or use the story and
creature tabs. The gallery landing page retains the three original style films.

| Project | Material and direction | Duration |
| --- | --- | --- |
| clip-reference-editorial | Supplied reference's rounded speaker, hair breakout, red counts, yellow evidence marker and fullscreen changes; backend-specific content | 15 seconds |
| clip-hand-orchestra | Actual MediaPipe hand positions, moving glass orbits, speech-launched checks and contract fields | 15 seconds |
| story-collage-memory | Photographic cutout people, torn paper, red-ticket scene carrier, disappearing photograph | 99.56 seconds |
| story-clawd-memory | Original brush characters, expressive eyes, reach/contact, backward clock and friendship greeting | 99.56 seconds |
| story-paper-theatre | Three.js pop-up book, hinges, card silhouettes and shadows, page turns and different camera coverage | 99.56 seconds |
| warm-creature-story | Original furry-character keyframe, official video-generation templates and shot assembler; animation still required | Planned 15 seconds |

The first two edit **clips/1012 (1).mp4**, preserving its Arabic speech at gain 1
and using corrected English captions. The OpenAI update reference provides editing
grammar, not backend facts. Its footage is not substituted for the user's recording.
Landmarks are sampled from the actual source at 10Hz and interpolated for display;
they are not a claim of perfect volumetric hand tracking or skin occlusion.

```powershell
node scripts/reference-clips.mjs init
node scripts/reference-clips.mjs activate
node scripts/reference-clips.mjs stills
node scripts/reference-clips.mjs render
node scripts/review-pro-clips.mjs reference
```

The source video and alpha mattes must be prepared with the existing pro-clips
workflow before the new reference edits render. `track-clip-hands.mjs` regenerates
landmarks when the source changes. Reference shots are composed serially to bound
memory, then joined before the final graphics pass. Cut boundaries round upward
to the first frame satisfying the graphics' time condition.

The original fictional Arabic story, **The Stolen Minute**, compares three
materials using Mira, Sam and Pipbot from `series/mira-minute/bible.json`.
Mira borrows a minute to reach a robotics competition. A shared memory disappears;
Sam forgets their three-tap greeting. She returns the ticket, misses the trophy,
and restores their friendship. A related episode must reuse identity designs and
read the episode's continuity outcome.

```powershell
python scripts/story-voice.py story-projects/mira-stolen-minute
node scripts/story-studio.mjs prepare mira-stolen-minute
node scripts/memory-story.mjs prepare
node scripts/memory-story.mjs stills
node scripts/memory-story.mjs render
```

Use this episode's dedicated memory-story command for its three materials. The
older generic story renderer is a separate demo workflow. The new compositions
use native 1440×2560 canvases at 60fps. Neural narration is ar-SA-ZariyahNeural;
English captions are translated display chunks, while selectable Arabic captions
use service word boundaries. Generated narration is not the user's recorded voice.

The Collage and Clawd guides inform the art direction. The runtime is independently
authored Canvas/Remotion; this does not run the upstream paid collage video API.
Lemo's paper-popup guide informs the actual Three.js paper theatre. No upstream
onetake motion library is imported. Each new project has a designed cover made
with the built-in image-generation tool and its exact prompt in assets/.

## Research recorded 2026-10-14

- Primary visual references: both user-supplied MP4s, sampled under
  `out/reference-openai` and `out/reference-romance`. The furry reference is a
  character-animation target, not something the code-paper engine can reproduce.
- [TikTok Next](https://ads.tiktok.com/business/en-US/next) and
  [Creative Codes](https://ads.tiktok.com/business/en-US/creative-codes): format
  research for hooks, curiosity and visible development. No popularity ranking or
  guaranteed virality is inferred.
- [MediaPipe Hand Landmarker](https://developers.google.com/edge/mediapipe/solutions/vision/hand_landmarker/web_js):
  source of the normalized hand landmark workflow.
- [NFB's The Girl Who Cried Pearls announcement](https://mediaspace.nfb.ca/comm/oscars-shortlist-for-best-animated-short-film-includes-the-girl-who-cried-pearls/):
  dated December 16, 2025; recent miniature/stop-motion storytelling reference.
- [NFB stop-motion behind the scenes](https://www.nfb.ca/film/nfb-pause-with-sophie-jarvis-and-alicia-eisen/)
  and [The Magic Quilt](https://www.nfb.ca/film/magic_quilt/): craft references for
  physical material and cutout stories. The older film is not labelled a new trend.
- Official ComfyUI/Wan sources and hardware limitations are recorded in
  WARM_CREATURE_STORIES.md. The supplied online asset libraries are discovery
  resources; only assets needed by the directed story should be acquired.

Inspect exported frames, actual cuts and audio format before delivery. Automated
audio correlation is not a listening review. The files remain reviewable drafts.
