# Motion Studio

Make motion-graphics videos **from code**. Claude writes `index.html`, a film that is a
pure function of time (`window.seek(t)` draws frame *t*). This harness renders it
frame by frame with headless Chromium, encodes it with FFmpeg, adds procedural sound,
and makes contact sheets so Claude can review its own work and fix it.

> The prompt is 10% of the video. The other 90% is the harness.

- Full background and theory: [`docs/Opus_Motion_Studio_Documentation.md`](docs/Opus_Motion_Studio_Documentation.md)
- Rules Claude follows in this repo: [`CLAUDE.md`](CLAUDE.md)

---

## TikTok workflow: add motion graphics to your CapCut videos

For personal 1–2 minute videos: cut in CapCut as usual, then let this tool add the hooks,
captions, stickers and sound effects.

**1. Export from CapCut** at 1080×1920 and put the file in `clips/` (e.g. `clips/gym_day.mp4`).

**2. Make a timeline**: copy `overlays/example.js` to `overlays/gym_day.js` and edit the times and text:
```js
{ type: 'hook',    t: 0.1, dur: 2.6, text: 'I tried this for 30 days and', accent: ['30', 'DAYS'] },
{ type: 'caption', t: 6.5, dur: 2.5, text: 'Nobody told me THIS part', style: 'box', pos: 'top' },
{ type: 'sticker', t: 7,   dur: 2,   text: '😳', x: 0.78, y: 0.28 },
{ type: 'cta',     t: 56,  dur: 4,   text: 'Follow for part 2' },
```
Or ask Claude Code to write it for you: fill in `prompts/E_tiktok_overlay.txt` with what you say
at which second, and paste it.

**3. Preview over your clip** (live, with a TikTok safe-zone guide): open in Chrome/Edge
```
overlay.html?timeline=overlays/gym_day.js&bg=clips/gym_day.mp4&safe=1
```

**4. Render**
```powershell
npm run tiktok -- clips/gym_day.mp4 --timeline overlays/gym_day.js
```
→ `out/gym_day_motion.mp4`, ready to upload. It keeps your original audio, mixes in
pop/whoosh/click SFX timed to each graphic, and normalises loudness to −14 LUFS.

| Flag | Effect |
| --- | --- |
| `--capcut` | also save `out/<name>_overlay.mov`, the graphics alone as **transparent ProRes 4444**: drag it onto a track above your clip in CapCut (desktop) to keep editing there |
| `--no-sfx` | no sound effects |
| `--sfx-volume 0.4` | quieter SFX (default 0.6) |
| `--sub 1` | no motion blur (faster) |

**Components** (all take `t` = start seconds and `dur` = seconds on screen):

| type | What it is | Main options |
| --- | --- | --- |
| `hook` | big words slamming in one by one | `text`, `accent: [words]`, `pos`, `size`, `stagger` |
| `caption` | text pop | `text`, `style: 'box' \| 'outline' \| 'accent'`, `pos` or `x`/`y` |
| `title` | name tag / lower third | `text`, `sub`, `y` |
| `sticker` | emoji pop with wobble | `text: '🔥'`, `x`, `y`, `size`, `rotate` |
| `circle` | circle that draws itself around something | `x`, `y`, `r`, `color` |
| `arrow` | arrow that draws itself | `from: [x, y]`, `to: [x, y]` |
| `counter` | rolling number | `from`, `to`, `prefix`, `suffix`, `label` |
| `cta` | pulsing "follow" pill | `text`, `pos` |
| `progress` | bar across the top for the whole video | `color` |
| `flash` | white flash on a cut | `strength` |

- **Positions:** `pos: 'top' | 'center' | 'bottom'`, or `x`/`y` from 0 to 1 (0.5 = middle).
- **Sound:** every element can set `sfx: 'pop' | 'click' | 'whoosh' | 'thump' | false`.
- **Theme:** colours and font are set in `theme` at the top of the file.
- **Speed:** a 20 s clip takes ~1 min on a 4-core VM; a 1–2 min video on an i9 laptop should
  take a few minutes. Run `npm run bench` once first.

---

## Contents
1. [Quick start (Windows)](#1-quick-start-windows)
2. [Install options](#2-install-options)
3. [Tune for your machine](#3-tune-for-your-machine)
4. [Making a video with Claude Code](#4-making-a-video-with-claude-code)
5. [Command reference](#5-command-reference)
6. [Render options](#6-render-options)
7. [Writing a film by hand](#7-writing-a-film-by-hand)
8. [Sound and music](#8-sound-and-music)
9. [Performance](#9-performance)
10. [Project layout](#10-project-layout)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. Quick start (Windows)

Install [Node.js 22 LTS](https://nodejs.org/) and [Git](https://git-scm.com/), then in PowerShell:

```powershell
git clone https://github.com/MohammadAliKassemHejazi/videoediting-.git
cd videoediting-
npm run setup      # installs packages, Chromium and ffmpeg (all local to the project)
npm run bench      # optional, ~3 min: finds the fastest settings for this PC
npm run build      # renders the sample film → out\final.mp4
```

Open `out\final.mp4`. To see the film live while editing, open `index.html` in Chrome or Edge.

---

## 2. Install options

### Option A: native (fastest; recommended for your own laptop)
| Need | How |
| --- | --- |
| Node.js 22+ | nodejs.org |
| Chromium | installed by `npm run setup` |
| ffmpeg (with libx264, NVENC, Quick Sync) | installed by `npm install` via `ffmpeg-static`; no manual install |
| Python 3.10+ *(only for `beats.py`)* | `pip install -r requirements.txt` |

Works on Windows, macOS and Linux. Every script is Node, so no bash is needed.

### Option B: Docker (identical output on any machine)
Install [Docker Desktop](https://www.docker.com/products/docker-desktop/), then:

```powershell
docker compose build                                   # once, and after package.json changes
docker compose run --rm studio                         # full pipeline → out\final.mp4
docker compose run --rm studio npm run draft           # quick draft + contact sheets
docker compose run --rm studio python beats.py refs/track.wav > beats.json
```

- The repo is mounted into the container: edit files on Windows, render in Docker.
- After changing dependencies: `docker compose down -v; docker compose build`.
- For a smaller image without librosa: `docker compose build --build-arg WITH_AUDIO_ANALYSIS=false`.
- The GPU encoders (NVENC, Quick Sync) are **not** available inside Docker Desktop. Use native for maximum speed.

---

## 3. Tune for your machine

```powershell
npm run bench
```

This tries different worker counts, NVIDIA NVENC, Intel Quick Sync and GPU canvas, then
writes the fastest combination to `studio.config.json` (per-machine, git-ignored).
Every render uses that file automatically, and command-line flags still override it.

**Laptop checklist** (e.g. i9 · 16 GB · RTX 3050 · Iris Xe):
- Plug in, and set Windows to **Best performance** power mode. Laptop CPUs throttle hard on battery.
- In **NVIDIA Control Panel → Manage 3D settings → Program settings**, set `node.exe` and
  Playwright's `chrome.exe` to *High-performance NVIDIA processor* so `--gpu` uses the RTX.
- 16 GB fits 8–10 workers at 1080×1920 (~370–500 MB each). Close browsers during final renders.
- Docker/WSL2 gets half your RAM by default. To change it, create `%UserProfile%\.wslconfig`:
  ```ini
  [wsl2]
  memory=10GB
  ```
  then run `wsl --shutdown`.

---

## 4. Making a video with Claude Code

1. Start Claude Code in the repo (`claude`), open `/model`, and set effort to **xhigh**.
2. Either run the skill **`/motion-reel`**, which asks for URL, duration, formats, palette,
   reference and music, and then runs the whole pipeline,
   **or** paste a director prompt from `prompts/`:

   | File | Use it for |
   | --- | --- |
   | `prompts/A_showreel.txt` | stress test: "show off" 15 s showreel |
   | `prompts/B_product_launch.txt` | product/brand launch built from a real website |
   | `prompts/C_style_transfer.txt` | copy the *style* of a reference video in `refs/` |
   | `prompts/D_state_machine.xml` | one morphing UI container, cursor-driven, on a 120 BPM grid |

3. Claude follows `CLAUDE.md`: it writes `index.html`, runs `npm run draft`, and reviews
   `out/contact.png`, `out/strip.png` and `out/phone.png` using `prompts/evaluation.md`.
   It keeps fixing and re-rendering until every score is ≥ 8, then runs `npm run build`.
4. Your deliverables: `out/final.mp4`, `out/contact.png`, `out/loop_check.mp4`.

Put reference media in `refs/` and scraped logos, screenshots and fonts in `assets/`.

---

## 5. Command reference

| Command | What it does | Output |
| --- | --- | --- |
| `npm run tiktok -- clips/x.mp4 --timeline overlays/x.js` | **add overlays + SFX to your clip** | `out/x_motion.mp4` |
| `npm run setup` | install packages + Chromium | |
| `npm run bench` | find the fastest settings for this machine | `studio.config.json` |
| `npm run draft` | **fast iteration**: 540×960, 30 fps, no blur, then contact sheets (~10 s) | `out/silent.mp4`, `out/contact.png`… |
| `npm run render:preview` | full size, 30 fps, no blur | `out/silent.mp4` |
| `npm run render` | **final**: 1080×1920, 60 fps, 4-subframe motion blur | `out/silent.mp4` |
| `npm run render:formats` | same timeline in 9:16, 1:1 and 16:9 | `out/final_*_silent.mp4` |
| `npm run sfx` | synthesize SFX from `cues.json` | `out/sfx.wav` |
| `npm run mux` | add audio at −14 LUFS, matched to video length | `out/final.mp4` |
| `npm run critique` | contact sheet, frame strip, phone view, loop check | `out/*.png`, `out/loop_check.mp4` |
| `npm run build` | sfx → render → mux → critique | everything |
| `npm run determinism` | render 3 s twice, compare hashes | pass/fail |
| `npm test` | unit tests for the motion library | |
| `python beats.py track.wav > beats.json` | beat grid + transient hits from music | `beats.json` |

Pass extra flags after `--`, e.g. `npm run render -- --workers 6 --encoder nvenc`.
Scripts take optional paths, e.g. `node scripts/critique.mjs out/final_1x1.mp4 2.5`
(the second argument is the strip start time in seconds).

---

## 6. Render options

`node render.mjs [options]`. Any option can also go in `studio.config.json`.

| Option | Default | Meaning |
| --- | --- | --- |
| `--w` / `--h` | 1080 / 1920 | output size (the film reads it from `?w=&h=`) |
| `--fps` | 60 | output frame rate |
| `--sub` | 4 | subframes blended per frame (motion blur); `1` = off |
| `--dur` | film's `window.DURATION` | seconds to render |
| `--from` | 0 | start time: re-render just a slice |
| `--workers` | `auto` | parallel renderers (≈0.6 × logical cores, limited by free RAM, max 12) |
| `--encoder` | `x264` | `x264` (CPU, deterministic), `nvenc` (NVIDIA), `qsv` (Intel iGPU), `auto` |
| `--gpu` | off | hardware-accelerated canvas in Chromium |
| `--out` | `out/silent.mp4` | output file |

Re-render one slice after a fix: `node render.mjs --from 6 --dur 3 --out out/patch.mp4`.

Environment overrides: `FFMPEG=C:\path\ffmpeg.exe`, `CHROMIUM_PATH=C:\path\chrome.exe`.

`x264` with the software canvas is **byte-identical run to run**. The hardware options look
identical (≈48 dB PSNR) but can differ by a few bits between runs.

---

## 7. Writing a film by hand

`index.html` is the whole film. The contract (enforced in `CLAUDE.md`):

- `window.seek(t)` paints frame *t*. There's no state between frames, no timers, no CSS
  transitions and no `Math.random` (use `Motion.rng(seed)`).
- Set `window.DURATION` (seconds) and list every font face in `window.FONTS`.
- Read the size from `?w=&h=` so one timeline renders every aspect ratio.

The motion library `lib/motion.js` exposes `window.Motion`:

```js
const { spring, track, indicator, rng, PRESETS, beatIndex, clamp, lerp } = Motion;
spring(t, k, d)                       // 0 → 1 closed-form damped spring
track(t, [[0, 0], [1, 400], [2, 100]]) // value that springs to each key at its time
indicator(t, stops)                   // tab indicator with stretchy leading/trailing edges
rng(42)()                             // seeded random in [0, 1)
beatIndex(t, beats.beats)             // index of the current beat
```

| Preset | k | d | Use |
| --- | --- | --- | --- |
| `PRESETS.snappy` | 320 | 30 | buttons, toggles, leading edges |
| `PRESETS.canvas` | 170 | 26 | cards, containers, camera pans |
| `PRESETS.heavy` | 90 | 19 | large headlines |
| `PRESETS.playful` | 240 | 14 | badges, stickers |

**Fonts**: install from npm (`npm i @fontsource/<family>`), add a `<link>` to its CSS in
`index.html`, and add the face to `window.FONTS`. Bundled fonts render the same on every OS.

---

## 8. Sound and music

- **Procedural SFX**: edit `cues.json` (`{ "t": seconds, "type": "click|pop|thump|whoosh", "gain": 1 }`),
  then `npm run sfx`. Add new voices in `sfx.mjs`.
- **Your own track**: `python beats.py refs/track.wav > beats.json`, snap visual hits to
  `beats` / `downbeats` / `hits`, then `node scripts/mux.mjs out/silent.mp4 refs/track.wav`.
- `mux` normalises to −14 LUFS and pads or trims audio to exactly the video length.

---

## 9. Performance

Because the film is a pure function of time, the renderer can:
- **blend motion-blur subframes on the GPU inside the page**, taking one capture per output frame instead of four;
- **render chunks of the timeline in parallel**, each with its own encoder, and join them losslessly;
- **capture over CDP with `optimizeForSpeed`**, which is lossless PNG and ~3× faster than a locator screenshot;
- **optionally offload encoding to NVENC or Quick Sync**, freeing the CPU for drawing.

Measured on a 4-core Linux VM (no GPU), 15 s film:

| Job | Original | Now |
| --- | --- | --- |
| 1080×1920, 30 fps, 2 subframes | 1 m 41 s | 22 s |
| 1080×1920, 60 fps, 4 subframes (final), whole build | ~13 min (est.) | 68 s |
| Draft (`npm run draft`, 540×960, 30 fps) | — | ~9 s |

A modern i9 laptop should be considerably faster; `npm run bench` shows the real numbers.

---

## 10. Project layout

```
CLAUDE.md                      rules Claude follows (render contract, look, audio, review loop)
index.html                     the film: canvas + window.seek(t)
overlay.html                   TikTok overlay player/previewer (transparent)
lib/overlay-kit.js             hook, caption, title, sticker, circle, arrow, counter, cta, progress, flash
overlays/                      one timeline file per video
clips/                         your CapCut exports (git-ignored)
lib/motion.js                  springs, track(), indicator(), mulberry32 rng, presets
lib/ffmpeg.mjs                 finds and runs ffmpeg ($FFMPEG → ffmpeg-static → PATH)
lib/encoders.mjs               x264 / NVENC / Quick Sync settings + availability probe
lib/options.mjs                option lookup: CLI → studio.config.json → default
render.mjs                     Chromium → H.264 (GPU subframe blend, parallel chunks, CDP capture)
sfx.mjs  cues.json             procedural sound effects → WAV
beats.py  requirements.txt     beat grid from a music track (librosa)
scripts/                       tiktok, mux, critique, determinism, formats, bench (Node, cross-platform)
prompts/                       director prompts A–D, TikTok overlay prompt E, evaluation prompt
.claude/skills/motion-reel/    the /motion-reel skill
test/                          unit tests (node --test)
Dockerfile  docker-compose.yml container toolchain
assets/  refs/  docs/          your assets, reference media, style guides & shot lists
out/                           renders (git-ignored)
```

---

## 11. Troubleshooting

| Problem | Fix |
| --- | --- |
| `Executable doesn't exist … chrome-headless-shell` | `npx playwright install chromium` |
| `ffmpeg not found` | `npm install` again, or set `FFMPEG` to an ffmpeg.exe |
| `Encoder "nvenc" is not available` | update the NVIDIA driver; it falls back to x264 automatically |
| Emoji show as boxes | Windows has Segoe UI Emoji built in; on Linux/Docker install `fonts-noto-color-emoji` |
| Overlay covers my face | move it with `pos` or `x`/`y`; preview with `&safe=1` |
| Wrong/fallback font in the video | the face is missing from `window.FONTS` or its `<link>` |
| Text looks blurry when scaled | remove `will-change`; draw text at final size instead of scaling up |
| Render is slow | `npm run bench`, plug in the laptop, close other apps, use `npm run draft` while iterating |
| Out of memory | lower `--workers` |
| `NON-DETERMINISTIC` | something uses `Math.random`, `Date`, timers, or state between frames |
| Docker: Chromium crashes | keep `shm_size: 2gb` in `docker-compose.yml` |
| Docker: old packages after an update | `docker compose down -v; docker compose build` |
| Windows: script errors about line endings | re-clone; `.gitattributes` forces LF |

## Credits
Based on the community work listed in the documentation, including
JohnHeibel/ClaudeAnimationBase, remotion-dev/skills, heygen-com/hyperframes and guanmo-ai/awesome-ai-motion.
