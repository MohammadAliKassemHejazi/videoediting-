# Beyond the Default — delivery notes

Source: `clips/0928(5).mp4`, 480×854, 30 fps, 65.04 seconds with original Arabic dialogue.
Subtitle timing: the user's revised 26-cue English transcript, used without retiming.
Export: 1080×1920, 30 fps, H.264/AAC. The footage is upscaled; graphics render at
native export resolution. Dialogue remains at its original speed and offset.

## Design

An editorial palette of near-black, warm off-white and electric lime. Inter is the
single typeface. Closed-form springs drive the entrances, diagrams, card stacking
and layout morphs. No generated raster assets or paid APIs are needed.

The presenter is reframed upward by 170 design pixels to make space for graphics.
Titles and illustrations reinforce the spoken argument while English captions
carry the complete supplied transcript. Four graphic takeovers create a change
in scale and rhythm without interrupting the voice.

| Time | Visual direction |
| --- | --- |
| 00:00–00:06.8 | Developer journey, engineering mindset, time saved |
| 00:06.8–00:15.3 | Oversized 2026 typography and the default-stack foundation |
| 00:15.3–00:20.8 | Preview blocks, then a full-screen sequential stack assembly |
| 00:20.8–00:28.2 | Hiring, beyond-the-default path and stack acknowledgment |
| 00:28.2–00:33.4 | Branching alternatives; full-screen React Router/TanStack diagram |
| 00:33.4–00:44.3 | Framework fit, moving comparison cursor and Tailwind acknowledgment |
| 00:44.3–00:49.4 | Full-screen browser layout that springs from two to three columns |
| 00:49.4–00:57 | Platform potential, clarification and an under-the-hood layer reveal |
| 00:57–01:00.3 | Full-screen code-to-interface sequence |
| 01:00.3–01:05.04 | Learn/question/explore and the like/comment/share close |

## Reproduce or edit

```powershell
node scripts/developer-film.mjs --draft
node scripts/developer-qa.mjs
node scripts/developer-film.mjs --final
```

Edit text/timing in `overlays/developer-2026.js` and design in
`lib/developer-design.js`. Open `developer-2026.html` in a browser for a live
preview over the source video. `--review` regenerates draft review sheets without
rendering; `--final --review` does the same for the final export.

Outputs:

- `out/developer_2026.mp4`: final video
- `out/developer_2026_graphics.mov`: reusable lossless alpha graphics
- `out/developer_2026.en.srt`: English subtitle sidecar
- `out/developer_2026_contact.png`: review frames spanning the entire video
- `out/developer_2026_stack_strip.png`: stack animation detail
- `out/developer_2026_phone.png`: CSS section at phone scale
- `out/developer_2026_poster.png`: poster at 20.4 seconds, after the stack settles
- `out/developer_2026_sfx.wav` and `out/developer_2026_cues.json`: procedural SFX

The video is an explanatory piece with a closing CTA, not a seamless loop.
The alpha MOV is qtrle, not ProRes. It should be aligned to the reframed source
described above. The standard sample `index.html` and its cues are preserved.

## Review

The first full-duration draft exposed a face/graphics collision and an overly
uniform layout. The revision reframed the presenter, moved captions into the
safe area, added large diagram takeovers and corrected icon contrast.

The second draft's full-duration contact sheet, stack strip and 360-pixel phone
sheet were inspected. Visual review: hook 8/10, readability 8/10, motion 8/10,
variety 8/10, composition 8/10. Audio/visual event placement follows the supplied
timestamps; listening-based sync assessment has not been performed.

Automated checks: 32 sampled frames match byte-for-byte after reverse seeks; all
26 caption blocks fit within the vertical TikTok safe area; no page errors.
The existing motion-library suite passes all seven tests.

Final verification: the full-resolution contact sheet was inspected, the video
decoded through all 1,951 frames, and FFmpeg's EBU R128 analysis measured -14.0
LUFS integrated loudness with -0.6 dBFS true peak. The poster was moved to a settled
frame so the moving React card is not captured mid-entrance.
