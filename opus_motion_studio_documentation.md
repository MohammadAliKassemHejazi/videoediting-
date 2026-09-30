# Opus 5.5 Motion Design Studio


An end-to-end framework and harness for building autonomous, code-rendered motion graphics pipelines using Claude Opus 5.5, Playwright, and FFmpeg.

---

## 1. Executive Summary: The 10/90 Rule

> *"The prompt is 10% of the video. The other 90% is the harness."*

Most out-of-the-box attempts at AI motion graphics result in uninspired visual defaults (centered titles, gradient backgrounds, slow fades, and static layouts) because LLMs cannot natively generate video files (`.mp4`). They generate code.

To produce studio-grade motion design, the generation model must be coupled with an automated execution and evaluation loop:
1. **Deterministic Execution:** Rendering driven by an analytical time function $seek(t)$ rather than runtime simulation loops.
2. **Subpixel Physics:** Closed-form damped springs avoiding naive easing curves.
3. **Vision Self-Critique:** Programmatic frame rendering, contact-sheet generation, and multi-round visual debugging.
4. **Sample-Accurate Sound:** Procedural synthesis or FFT-analyzed audio beat grids.

---

## 2. System Architecture

```
                       ┌────────────────────────────────────────┐
                       │          Claude Opus 5.5               │
                       │     (Claude Code CLI / xhigh)          │
                       └──────────────────┬─────────────────────┘
                                          │ Writes / Refactors
                                          ▼
                               ┌─────────────────────┐
                               │     index.html      │
                               │  window.seek(t)     │
                               └──────────┬──────────┘
                                          │
                  ┌───────────────────────┴───────────────────────┐
                  ▼                                               ▼
       ┌─────────────────────┐                         ┌─────────────────────┐
       │   Playwright Node   │                         │      beats.py       │
       │ (Headless Chromium) │                         │  (Librosa Transient)│
       └──────────┬──────────┘                         └──────────┬──────────┘
                  │ Screenshots (60 fps * 4 sub)                  │ Generates
                  ▼                                               ▼
       ┌─────────────────────┐                         ┌─────────────────────┐
       │  FFmpeg Video Pipe  │                         │     beats.json      │
       │  (tmix Motion Blur) │                         │    (Beat Grid)      │
       └──────────┬──────────┘                         └──────────┬──────────┘
                  │                                               │
                  └───────────────────────┬───────────────────────┘
                                          ▼
                               ┌─────────────────────┐
                               │    out/final.mp4    │
                               └──────────┬──────────┘
                                          │
                               ┌──────────┴──────────┐
                               ▼                     ▼
                     ┌──────────────────┐   ┌─────────────────┐
                     │ contact_sheet.png│   │   phone_360.png │
                     └─────────┬────────┘   └────────┬────────┘
                               │                     │
                               └──────────┬──────────┘
                                          │ Vision Analysis
                                          ▼
                               ┌─────────────────────┐
                               │ Opus Visual Critique│
                               │   (Score 1 - 10)    │
                               └─────────────────────┘
```

---

## 3. Environment Setup & Toolchain

### Prerequisites
* Node.js 22+
* Python 3.10+
* FFmpeg with `libx264` and `tmix` support
* Chromium / Playwright

### Installation Steps

```bash
# 1. System packages
brew install node ffmpeg python          # macOS (or apt-get install on Linux)
pip install numpy librosa soundfile

# 2. Project initialization & headless browser setup
mkdir motion-studio && cd motion-studio && npm init -y
npm install -D playwright
npx playwright install chromium

# 3. Optional framework skills (Route B)
npx skills add remotion-dev/skills       # Remotion React pipeline
npx skills add heygen-com/hyperframes    # HyperFrames GSAP pipeline

# 4. Start Claude Code at elevated reasoning effort
claude --model claude-opus-5-5
# Inside session: configure reasoning effort
> /model
# Select Opus 5.5 -> Set effort to 'xhigh' (or 'max' for master cut runs)
```

---

## 4. Studio Configuration: `CLAUDE.md`

Save the following file as `CLAUDE.md` in the project root. Claude Code ingests this file on every invocation to enforce deterministic constraints and aesthetic guardrails.

```markdown
# Motion Studio Rules

## Render Contract
- Every film is a pure function of time: `window.seek(t)` paints frame t.
- No CSS transitions, no setTimeout, no requestAnimationFrame in render mode.
- No state carried between frames.
- Seeded pseudo-random noise only (mulberry32); never Math.random.
- Render with `node render.mjs`, encode H.264 yuv420p, CRF 16.

## Visual Language & Look
- Banned defaults: centered title on gradient, elements fading in globally,
  corner labels, frame borders, glow on UI chrome, generic particle bursts.
- Typography: Maximum one display typeface, one UI typeface.
- Palette: One background, one foreground, one accent color unless specified.
- Pacing: Every 2 to 4 seconds, a new visual event or camera move must execute.

## Audio & Rhythm
- Score and SFX must be synthesized in code unless an external audio track is supplied.
- Snap visual hits directly to the measured beat grid (`beats.json`).
- Mix master audio to -14 LUFS standard.

## Vision Verification Loop (Mandatory before final export)
1. Render one frame per beat as a contact sheet (`out/contact.png`).
2. Self-score from 1-10 on:
   - Hook strength (first 2 seconds)
   - Readability at mobile scale (360px viewport width)
   - Motion quality (spring physics, zero dead frames)
   - Visual variety
   - Audio-visual sync
3. Fix the 3 lowest-scoring criteria.
4. Loop until every score is 8 or higher.
5. Only then trigger the full subframe render.
```

---

## 5. Director Prompt Patterns

### Pattern A: The Showreel Benchmark (Stress Test)
Used to verify rendering performance, typographic layout, and transition velocity.

```text
make a dynamic 15-second motion graphics video that shows what an 
incredible motion designer you are, like it's your showreel for a résumé. 
go all out.
```

### Pattern B: The Product / Brand Launch Reel
Crawls live assets to assemble an accurate product showcase.

```text
Make a dynamic 20-second motion graphics video for [PRODUCT] ([URL]), with the energy
of a motion designer's showreel. Go all out.

Assets
- Visit the site. Use real screenshots (Playwright), the real logo, real colors and fonts.
  Save everything to ./assets and list what you found before you animate.
- Never redraw the product UI from imagination. Crop and animate the real thing.

Story (one beat each, 2 to 4 seconds)
1. Hook: the problem in 5 words of huge kinetic type.
2. The product appears, the UI assembles itself piece by piece.
3. Three features, each as a UI moment with a cursor doing a real action.
4. One number that proves it works: [METRIC].
5. Logo lockup + [CTA].

Sound
- Original music, 120 BPM, synthesized in code. UI clicks and whooshes on the beat.

Format: 1080x1920 (9:16) first, then 1:1 and 16:9 from the same timeline.
Before the full render, show me a contact sheet of one frame per beat.
```

### Pattern C: Reference-to-Style Transfer
Deconstructs a visual benchmark without plagiarizing content.

```text
Reference: ./refs/launch.mp4 (and ./refs/frames/*.png)

1. Extract one frame every 0.5s with ffmpeg. Study them.
2. Write ./docs/style_guide.md: palette (hex), type (family, weight, tracking),
   shot lengths, transition types, camera moves, texture/grain, how text enters and exits.
3. Write ./docs/shotlist.md for a [DURATION]s video about [SUBJECT] in THAT style.
   Take the grammar of the reference, never its content, logos or characters.
4. Show me both files. Wait for my OK before any code.
```

### Pattern D: The XML State Machine Spec (Single-Shape Morph)
Constructs continuous, cut-free UI animations where a single container transforms dynamically.

```xml
<inputs>
Ask me for: my product + URL, 8 to 12 UI states that tell its story, the real data shown in
each state, brand colors + fonts + one accent, a royalty-free track near 120 BPM, formats.
</inputs>

<direction>
Product-film UI motion. One container never cuts: every state is the same element changing
size, radius and fill while its content swaps behind a short blur. A cursor drives every change.
Warm neutral canvas, one accent. Springs with at most a tiny overshoot.
Banned: bouncy easing, glows, gradients on UI chrome, particle bursts, dead time.
</direction>

<structure>
120 BPM, 8 bars, something happens on every beat.
logo → CTA button → email field (typed) → loader → success check → dashboard card
→ chart draws itself → tooltip on hover → ⌘K palette → toast → logo.
</structure>

<build>
1. One HTML file, one canvas, window.seek(t). No CSS transitions, no timers, no carried state.
2. Closed-form springs. A value with many targets = sum of one spring per change.
3. Text inside a morphing container enters after the morph starts, leaves before the next one.
4. Tab indicators: leading and trailing edges on different springs so they stretch.
5. Beat grid from the track (numpy/librosa). Start on a downbeat. UI sounds on measured peaks.
6. Render in headless Chrome at 60 fps, 4 subframes per frame, blended for motion blur.
</build>

<gotchas>
Never use will-change on anything the camera scales (blurry text).
The last frame must equal the first, cursor position and velocity included.
</gotchas>

<start>
Ask for the inputs, then show me the state list on the beat grid before writing code.
</start>
```

---

## 6. Physics Engine & Deterministic Mathematics

### Analytical Damped Springs (Closed-Form Solution)
Euler integration requires tracking previous frames, making random-access seeking impossible. Instead, calculate displacement directly using the analytical solution of the damped harmonic oscillator differential equation:

$$\ddot{x} + 2\zeta\omega_0 \dot{x} + \omega_0^2 x = 0$$

Where:
* $\omega_0 = \sqrt{k}$ (undamped angular frequency)
* $\zeta = \frac{d}{2\sqrt{k}}$ (damping ratio)
* $\omega_d = \omega_0 \sqrt{1 - \zeta^2}$ (damped frequency, for $\zeta < 1$)

```javascript
// Closed-form damped spring transition from 0 to 1 as a pure function of time
function spring(t, k = 170, d = 26) {
  if (t <= 0) return 0;
  const w0 = Math.sqrt(k);
  const z = d / (2 * w0);
  
  // Underdamped (oscillates with decay)
  if (z < 1) {
    const wd = w0 * Math.sqrt(1 - z * z);
    return 1 - Math.exp(-z * w0 * t) * (Math.cos(wd * t) + (z * w0 / wd) * Math.sin(wd * t));
  }
  
  // Critically damped / Overdamped
  return 1 - Math.exp(-w0 * t) * (1 + w0 * t);
}
```

### Multi-Target Value Tracking (Linear Superposition)
When animating an attribute across several consecutive targets (e.g., cursor positions or container widths), do not reset or restart the spring. Superimpose individual spring steps:

$$V(t) = V_0 + \sum_{i=1}^{n} (V_i - V_{i-1}) \cdot \text{spring}(t - t_i, k, d)$$

```javascript
export function track(t, keys, k = 170, d = 26) {
  let v = keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    v += (keys[i][1] - keys[i - 1][1]) * spring(t - keys[i][0], k, d);
  }
  return v;
}

// Example: Asymmetrical edge springs for UI stretch
export function indicator(t, stops) {
  const lead  = track(t, stops, 320, 30); // Stiff front edge
  const trail = track(t, stops, 140, 22); // Relaxed trailing edge
  return { left: Math.min(lead, trail), right: Math.max(lead, trail) + 120 };
}
```

### Motion Presets Table

| Preset | Target Elements | Stiffness ($k$) | Damping ($d$) | Behavior |
| :--- | :--- | :--- | :--- | :--- |
| **Snappy UI** | Buttons, toggles, leading edges | $320$ | $30$ | Fast onset, negligible overshoot |
| **Default Canvas** | Cards, containers, camera pans | $170$ | $26$ | Smooth, natural mass |
| **Heavy Body** | Large headlines, 3D assets | $90$ | $19$ | Deliberate acceleration |
| **Playful Accent** | Mascots, badges, stickers | $240$ | $14$ | Expressive secondary bounce |

---

## 7. Core Scripts

### `index.html` (The Canvas Engine)
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    html, body { margin: 0; padding: 0; background: #141413; overflow: hidden; }
    canvas { display: block; }
  </style>
</head>
<body>
<canvas id="c" width="1080" height="1920"></canvas>
<script>
const W = 1080, H = 1920, DUR = 15;
const canvas = document.getElementById('c');
const g = canvas.getContext('2d');

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));

function spring(t, k = 170, d = 26) {
  if (t <= 0) return 0;
  const w0 = Math.sqrt(k), z = d / (2 * w0);
  if (z < 1) {
    const wd = w0 * Math.sqrt(1 - z * z);
    return 1 - Math.exp(-z * w0 * t) * (Math.cos(wd * t) + (z * w0 / wd) * Math.sin(wd * t));
  }
  return 1 - Math.exp(-w0 * t) * (1 + w0 * t);
}

// Seeded PRNG (mulberry32) ensures reproducible renders
function rng(seed) {
  return () => {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

const SCENES = [
  {
    from: 0,
    to: 3,
    draw(t) {
      const s = spring(t - 0.1, 220, 22);
      g.save();
      g.translate(W / 2, H / 2);
      g.scale(0.6 + 0.4 * s, 0.6 + 0.4 * s);
      g.globalAlpha = clamp(t * 4);
      g.fillStyle = '#F0EEE6';
      g.font = '700 180px "Source Serif 4", serif';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText('MOTION', 0, 0);
      g.fillStyle = '#D97757';
      g.fillRect(-320 * s, 110, 640 * s, 16);
      g.restore();
    }
  },
  {
    from: 3,
    to: 6,
    draw(t) {
      const r = rng(42);
      for (let i = 0; i < 48; i++) {
        const x = (i % 6) * 160 + 140;
        const y = Math.floor(i / 6) * 160 + 400;
        const s = spring(t - (i * 0.02) - (r() * 0.08), 260, 20);
        g.fillStyle = (i % 7 === 0) ? '#D97757' : '#F0EEE6';
        g.fillRect(x - 50 * s, y - 50 * s, 100 * s, 100 * s);
      }
    }
  }
];

function draw(t) {
  g.fillStyle = '#141413';
  g.fillRect(0, 0, W, H);
  for (const s of SCENES) {
    if (t >= s.from && t < s.to) {
      s.draw(t - s.from);
    }
  }
}

// Global deterministic hook for Playwright
window.seek = (t) => { draw(t); return true; };

// Browser preview loop (disabled during automated headless runs)
if (!navigator.webdriver) {
  const t0 = performance.now();
  (function loop() {
    draw(((performance.now() - t0) / 1000) % DUR);
    requestAnimationFrame(loop);
  })();
}
</script>
</body>
</html>
```

---

### `render.mjs` (Headless Chromium -> FFmpeg Pipe)
```javascript
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const arg = (k, d) => {
  const i = process.argv.indexOf('--' + k);
  return i > 0 ? Number(process.argv[i + 1]) : d;
};

const FPS = arg('fps', 60);
const DUR = arg('dur', 15);
const SUB = arg('sub', 4); // Subframes per target frame for motion blur blending

mkdirSync('out', { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1080, height: 1920 },
  deviceScaleFactor: 1
});

await page.goto('file://' + process.cwd() + '/index.html');
await page.evaluate(() => document.fonts.ready);

// FFmpeg tmix filter blends SUB consecutive subframes to compute physical motion blur
const vf = `tmix=frames=${SUB},select='eq(mod(n\\,${SUB})\\,${SUB - 1})',setpts=N/${FPS}/TB`;
const ff = spawn('ffmpeg', [
  '-y',
  '-f', 'image2pipe',
  '-framerate', String(FPS * SUB),
  '-i', '-',
  '-vf', vf,
  '-r', String(FPS),
  '-c:v', 'libx264',
  '-crf', '16',
  '-pix_fmt', 'yuv420p',
  'out/silent.mp4'
], { stdio: ['pipe', 'inherit', 'inherit'] });

const totalFrames = Math.round(DUR * FPS * SUB);

for (let i = 0; i < totalFrames; i++) {
  const t = i / (FPS * SUB);
  await page.evaluate((timestamp) => window.seek(timestamp), t);
  const png = await page.locator('#c').screenshot({ type: 'png' });
  
  if (!ff.stdin.write(png)) {
    await new Promise((resolve) => ff.stdin.once('drain', resolve));
  }
  
  if (i % (FPS * SUB) === 0) {
    console.log(`Rendered ${Math.round(i / (FPS * SUB))}s / ${DUR}s`);
  }
}

ff.stdin.end();
await new Promise((resolve) => ff.on('close', resolve));
await browser.close();
console.log('Video render completed: out/silent.mp4');
```

---

### `beats.py` (Onset & Tempo Extraction)
```python
import sys
import json
import numpy as np
import librosa

if len(sys.argv) < 2:
    print("Usage: python beats.py <audio_path>", file=sys.stderr)
    sys.exit(1)

audio_path = sys.argv[1]
y, sr = librosa.load(audio_path, sr=None, mono=True)

tempo, frames = librosa.beat.beat_track(y=y, sr=sr, units="frames")
beats = librosa.frames_to_time(frames, sr=sr).round(3).tolist()

onset = librosa.onset.onset_strength(y=y, sr=sr)
peaks = librosa.util.peak_pick(onset, pre_max=3, post_max=3, pre_avg=3, post_avg=5, delta=0.5, wait=10)
hits = librosa.frames_to_time(peaks, sr=sr).round(3).tolist()

payload = {
    "bpm": float(np.atleast_1d(tempo)[0]),
    "beats": beats,
    "downbeats": beats[::4],
    "hits": hits
}

json.dump(payload, sys.stdout, indent=2)
```

---

### `sfx.mjs` (Procedural Sound Design Generator)
```javascript
import { readFileSync, writeFileSync } from 'node:fs';

const SR = 48000;
const cues = JSON.parse(readFileSync(process.argv[2] || 'cues.json', 'utf8'));

const maxT = Math.max(...cues.map(c => c.t), 0);
const buf = new Float32Array(Math.ceil((maxT + 2) * SR));

let seed = 42;
const noise = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return (seed / 2147483648) - 1;
};

const VOICES = {
  click:  [0.05, t => Math.sin(2 * Math.PI * 1800 * t) * Math.exp(-t * 90) * 0.5],
  pop:    [0.15, t => Math.sin(2 * Math.PI * (600 + 900 * t) * t) * Math.exp(-t * 30) * 0.4],
  thump:  [0.50, t => Math.sin(2 * Math.PI * (90 - 60 * t) * t) * Math.exp(-t * 9) * 0.9],
  whoosh: [0.35, t => noise() * Math.sin(Math.PI * Math.min(1, t / 0.35)) * 0.25]
};

for (const c of cues) {
  const voice = VOICES[c.type];
  if (!voice) continue;
  const [len, fn] = voice;
  const start = Math.floor(c.t * SR);
  for (let i = 0; i < len * SR && start + i < buf.length; i++) {
    buf[start + i] += fn(i / SR);
  }
}

// Export 16-bit Mono PCM WAV
const n = buf.length;
const wav = Buffer.alloc(44 + n * 2);

wav.write('RIFF', 0);
wav.writeUInt32LE(36 + n * 2, 4);
wav.write('WAVEfmt ', 8);
wav.writeUInt32LE(16, 16);
wav.writeUInt16LE(1, 20);
wav.writeUInt16LE(1, 22);
wav.writeUInt32LE(SR, 24);
wav.writeUInt32LE(SR * 2, 28);
wav.writeUInt16LE(2, 32);
wav.writeUInt16LE(16, 34);
wav.write('data', 36);
wav.writeUInt32LE(n * 2, 40);

for (let i = 0; i < n; i++) {
  const sample = Math.max(-1, Math.min(1, buf[i]));
  wav.writeInt16LE(Math.round(sample * 32767), 44 + i * 2);
}

writeFileSync(process.argv[3] || 'out/sfx.wav', wav);
console.log('Synthesized audio written to out/sfx.wav');
```

---

## 8. Automated Vision Critique Pipeline

Rather than trusting single-pass output, use FFmpeg extraction commands to generate diagnostic contact sheets, then feed them back to Opus for review.

```bash
# 1. Macro pacing contact sheet (2 fps, 6 columns)
ffmpeg -i out/final.mp4 -vf "fps=2,scale=270:-1,tile=6x5" -frames:v 1 out/contact.png

# 2. Frame-strip diagnostic (12 frames around an action beat)
ffmpeg -ss 4.1 -i out/final.mp4 -vf "scale=320:-1,tile=12x1" -frames:v 1 out/strip.png

# 3. Mobile screen simulation (downsampled to 360px width)
ffmpeg -i out/final.mp4 -vf "fps=1,scale=360:-1,tile=5x3" -frames:v 1 out/phone.png

# 4. Loop seam validation (runs sequence twice)
ffmpeg -stream_loop 1 -i out/final.mp4 -c copy out/loop_check.mp4

# 5. Determinism test (matching hash check across passes)
node render.mjs --dur 3 --fps 60 --sub 1
md5 out/silent.mp4
node render.mjs --dur 3 --fps 60 --sub 1
md5 out/silent.mp4
```

### Evaluation Prompt

```text
Open out/contact.png, out/strip.png, and out/phone.png and review them carefully.
Act as a strict motion design director.

Score from 1 to 10:
1. Hook strength (first 2 seconds)
2. Readability at phone size (360px wide)
3. Motion quality (spring physics, no dead frames)
4. Visual variety (new development every 2-4 seconds)
5. Composition & layout
6. Brand accuracy
7. Audio-visual synchronization

Identify the 3 most significant visual issues with exact timestamps. Check specifically for:
- Text overlap during container morphs
- Linear movement lacking spring easing
- Corner badges or unwanted borders
- Unintended centered gradients
- Blurry scaled typography
- Static stretches of time
- Noticeable seams when looping

Adjust the source code to resolve these issues, re-render only the affected seconds, and provide an updated contact sheet with new scores.
```

---

## 9. Modular Skill Packaging (`/motion-reel`)

Save this skill definition to `~/.claude/skills/motion-reel.md` or `.claude/skills/motion-reel.md` to trigger the entire pipeline with a single command.

```markdown
---
name: motion-reel
description: Generates a product or showreel motion graphic video rendered directly from code.
---

# Motion Reel Skill Pipeline

## Parameter Checklist
- Target URL
- Duration (in seconds)
- Aspect ratios (e.g., 9:16, 1:1, 16:9)
- Brand palette & fonts
- Style reference (video, image set, or frame)
- Music (audio file path or "synthesize")

## Execution Order
1. Extract DOM elements, SVGs, and screenshots from the URL into `./assets/` using Playwright.
2. If an external visual reference is supplied, generate `docs/style_guide.md`.
3. Analyze or generate audio: run `python beats.py <track>` to produce `beats.json`.
4. Outline scenes and camera timings in `docs/shotlist.md`.
5. Write `index.html` using the deterministic `window.seek(t)` harness and `lib/motion.js` springs.
6. Execute test render to create contact sheets; run vision evaluation loop (minimum 3 iterations).
7. Execute final subframe render: `node render.mjs`, generate SFX via `node sfx.mjs`, and multiplex audio.
8. Deliver `out/final.mp4`, `out/contact.png`, and `out/loop_check.mp4`.
```

---

## 10. Community Repositories & Implementations

* **[JohnHeibel/PDoomVideo](https://github.com/JohnHeibel/PDoomVideo):** Source repository for the 142-second autonomous "Claude Pop" music video.
* **[JohnHeibel/ClaudeAnimationBase](https://github.com/JohnHeibel/ClaudeAnimationBase):** Minimal base starter kit for the `seek(t)` browser harness.
* **[buildwithhanif/claude-animation-skill](https://github.com/buildwithhanif/claude-animation-skill):** Node-canvas rigs and hand-drawn pen styles.
* **[heygen-com/hyperframes](https://github.com/heygen-com/hyperframes):** Framework for orchestrating GSAP inside agentic runtimes.
* **[remotion-dev/skills](https://www.remotion.dev/docs/ai/skills):** Official programmatic video skills for React.
* **[WinterArc21/Battle-of-Austerlitz-Film](https://github.com/WinterArc21/Battle-of-Austerlitz-Film):** Extended-duration historical narrative generated via multi-agent coordination.
* **[guanmo-ai/awesome-ai-motion](https://github.com/guanmo-ai/awesome-ai-motion):** Collection of motion design prompt templates and XML specifications.
* **[athemeroy/awesome-opus-5-5-videos](https://github.com/athemeroy/awesome-opus-5-5-videos):** Directory of code-rendered videos and benchmarks.