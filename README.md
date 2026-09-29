# Motion Studio

Code-rendered motion graphics: Claude writes `index.html` (a pure function of time,
`window.seek(t)`), and this harness renders it with headless Chromium + FFmpeg, adds
procedural sound, and produces contact sheets so the model can critique its own output.

> The prompt is 10% of the video. The other 90% is the harness.

Full reference: [`docs/Opus_Motion_Studio_Documentation.md`](docs/Opus_Motion_Studio_Documentation.md).
Studio rules Claude follows: [`CLAUDE.md`](CLAUDE.md).

## Option 1 — Docker (recommended on Windows)
Needs [Docker Desktop](https://www.docker.com/products/docker-desktop/). Everything
(Node, Chromium, ffmpeg, Python + librosa) is inside the image.

```powershell
docker compose build                                   # once (and after package.json changes)
docker compose run --rm studio                         # full pipeline → out\final.mp4
docker compose run --rm studio npm run render:preview  # quick draft
docker compose run --rm studio python beats.py refs/track.wav > beats.json
```
The repo is mounted into the container, so edit `index.html` on Windows and re-run.
After changing dependencies: `docker compose down -v; docker compose build`.
Smaller image without librosa: `docker compose build --build-arg WITH_AUDIO_ANALYSIS=false`.

## Option 2 — Native (Windows, macOS, Linux)
Needs Node 22+. ffmpeg (with libx264) comes from npm, so there's nothing else to install.
```powershell
npm run setup          # npm install + Playwright Chromium
npm run build          # render → sfx → mux → critique
```
Python is only needed for `beats.py`: `pip install -r requirements.txt`.
Overrides: `FFMPEG=path\to\ffmpeg.exe`, `CHROMIUM_PATH=path\to\chrome.exe`.

## Commands
| Step | Command | Output |
| --- | --- | --- |
| Preview | open `index.html` in a browser (after `npm install`, for fonts) | live loop |
| Draft render (30 fps, no blur) | `npm run render:preview` | `out/silent.mp4` |
| Full render (60 fps, 4-subframe motion blur) | `npm run render` | `out/silent.mp4` |
| All formats | `npm run render:formats` | 9:16, 1:1, 16:9 |
| Beat grid from a track | `python beats.py track.wav > beats.json` | `beats.json` |
| Procedural SFX | `npm run sfx` | `out/sfx.wav` |
| Mux + −14 LUFS | `npm run mux` | `out/final.mp4` |
| Critique images | `npm run critique` | `out/contact.png`, `strip.png`, `phone.png`, `loop_check.mp4` |
| Determinism check | `npm run determinism` | hash comparison |
| Everything | `npm run build` | |
| Unit tests | `npm test` | |

Re-render a slice: `node render.mjs --from 6 --dur 3 --out out/patch.mp4`.
Control parallelism: `--workers 2` (default: CPU cores − 1, max 4).

## Performance
The renderer is a pure function of time, so it can:
- **Blend motion-blur subframes on the GPU inside the page**: one screenshot per output
  frame instead of one per subframe.
- **Render chunks of the timeline in parallel** browser contexts, each with its own encoder,
  then join them losslessly.
- Use clipped `page.screenshot` instead of `locator.screenshot` (~1.7× faster per capture).

Measured on a 4-core Linux box, 15 s film at 1080×1920:

| Setting | Before | Now |
| --- | --- | --- |
| 30 fps, 2 subframes | 1 m 41 s | 35 s |
| 60 fps, 4 subframes (final) | ~13 min (est.) | ~75 s (Docker) |

Output is still byte-identical between runs (`npm run determinism`).

## Layout
```
CLAUDE.md                      studio rules (render contract, look, audio, critique loop)
index.html                     the film: canvas + window.seek(t)
lib/motion.js                  closed-form springs, track(), indicator(), mulberry32, presets
lib/ffmpeg.mjs                 cross-platform ffmpeg lookup/runner
render.mjs                     Chromium → H.264 (GPU subframe blend, parallel chunks)
sfx.mjs  cues.json             procedural click/pop/thump/whoosh → WAV
beats.py                       librosa beat grid + onset hits
scripts/                       mux, critique, determinism, formats (Node, cross-platform)
prompts/                       director patterns A–D + evaluation prompt
.claude/skills/motion-reel/    /motion-reel skill: the whole pipeline in one command
Dockerfile  docker-compose.yml container toolchain
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
