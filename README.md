# Motion Studio

Code-rendered motion graphics: Claude writes `index.html` (a pure function of time,
`window.seek(t)`), and this harness renders it with headless Chromium + FFmpeg, adds
procedural sound, and produces contact sheets so the model can critique its own output.

> The prompt is 10% of the video. The other 90% is the harness.

Full reference: [`docs/Opus_Motion_Studio_Documentation.md`](docs/Opus_Motion_Studio_Documentation.md).
Studio rules Claude follows: [`CLAUDE.md`](CLAUDE.md).

## Setup
```bash
npm install && npx playwright install chromium   # needs Node 22+
pip install -r requirements.txt                   # only needed for beats.py
# FFmpeg with libx264 on PATH (or FFMPEG=/path/to/ffmpeg)
# Optional: CHROMIUM_PATH=/path/to/chrome to reuse an existing Chromium
```

## Pipeline
| Step | Command | Output |
| --- | --- | --- |
| Preview | open `index.html` in a browser | live loop |
| Draft render | `npm run render:preview` | `out/silent.mp4` |
| Full render (60 fps, 4 subframes, motion blur) | `npm run render` | `out/silent.mp4` |
| Beat grid from a track | `python beats.py track.wav > beats.json` | `beats.json` |
| Procedural SFX | `npm run sfx` | `out/sfx.wav` |
| Mux + −14 LUFS | `npm run mux` | `out/final.mp4` |
| Critique images | `npm run critique` | `out/contact.png`, `strip.png`, `phone.png`, `loop_check.mp4` |
| Determinism check | `npm run determinism` | hash comparison |
| All formats | `bash scripts/formats.sh` | 9:16, 1:1, 16:9 |
| Everything | `npm run build` | |
| Unit tests | `npm test` | |

Re-render a slice: `node render.mjs --from 6 --dur 3 --out out/patch.mp4`.

## Layout
```
CLAUDE.md                      studio rules (render contract, look, audio, critique loop)
index.html                     the film — canvas + window.seek(t)
lib/motion.js                  closed-form springs, track(), indicator(), mulberry32, presets
render.mjs                     Chromium → FFmpeg with tmix motion blur
sfx.mjs  cues.json             procedural click/pop/thump/whoosh → WAV
beats.py                       librosa beat grid + onset hits
scripts/                       mux, critique, determinism, formats
prompts/                       director patterns A–D + evaluation prompt
.claude/skills/motion-reel/    /motion-reel skill: the whole pipeline in one command
assets/  refs/  docs/          scraped assets, style references, style guides & shot lists
```

## Using it with Claude Code
Start `claude` in this repo, set effort to `xhigh` via `/model`, then either paste a prompt
from `prompts/` or run `/motion-reel`.

## Motion presets (`Motion.PRESETS`)
| Preset | k | d | Use |
| --- | --- | --- | --- |
| snappy | 320 | 30 | buttons, toggles, leading edges |
| canvas | 170 | 26 | cards, containers, camera pans |
| heavy | 90 | 19 | large headlines |
| playful | 240 | 14 | badges, stickers |
