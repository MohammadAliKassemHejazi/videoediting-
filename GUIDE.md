# Motion Studio: Step-by-Step Guide

A practical walkthrough from zero to your first video, then recipes for everything you
might want to make. For the reference manual (every command and option) see `README.md`.

---

## Part 1: One-time setup (Windows, ~15 minutes)

### Step 1: Install the tools
1. **Node.js 22 LTS**: https://nodejs.org (tick "Add to PATH").
2. **Git**: https://git-scm.com.
3. **Claude Code**: in PowerShell: `npm install -g @anthropic-ai/claude-code`, then run `claude` once and log in.
4. *(Optional, only for measuring music)* **Python 3.11+** from python.org.

### Step 2: Get the project
```powershell
cd $HOME\Documents
git clone https://github.com/MohammadAliKassemHejazi/videoediting-.git motion-studio
cd motion-studio
git checkout claude/eloquent-noether-dlrnv9
npm run setup                       # packages + Chromium + ffmpeg, all inside the folder
pip install -r requirements.txt     # optional: only for beats.py
```

### Step 3: Make Windows fast (do once)
1. Plug in the laptop, then go to **Settings → System → Power → Best performance**.
2. Go to **Windows Security → Virus & threat protection → Manage settings → Exclusions**
   and add the `motion-studio` folder.
3. In your laptop's control app, set the fan mode to **Performance/Turbo**.

### Step 4: Benchmark
```powershell
npm run bench
```
This takes about 3 minutes and saves the fastest settings to `studio.config.json`. Re-run it after driver or Windows updates.

### Step 5: Check it works
```powershell
npm run build
```
Open `out\final.mp4`. You should see the 15-second sample film with sound.

### Step 6: Images, video and voice: free now, paid later
You **don't need any API key**. Generate images and videos by hand in the free **Gemini app**
and the tool does the rest (Part 5 below).

*Later, if you ever pay for fal.ai or ElevenLabs:* copy `.env.example` to `.env`, fill in the keys,
and run `npm run assets:generate` to create everything automatically. In prompts, refer to keys
by name ("the key is FAL_KEY in .env"), never paste a real key.

---

## Part 2: How a video gets made (the mental model)

1. **Claude doesn't make video files. It writes code.** `index.html` has one function,
   `window.seek(t)`, that paints the exact frame for time *t*.
2. **The harness turns that code into a video.** `render.mjs` calls `seek` for every frame,
   screenshots it, and ffmpeg encodes. Nothing depends on timers, so every render is identical
   and a fix is a one-line edit plus a re-render.
3. **Quality comes from the loop, not the prompt.** Claude renders a draft, looks at contact
   sheets of its own frames, scores them, fixes the 3 worst problems, and repeats until
   every score is 8+. `CLAUDE.md` makes it do this automatically.

> The prompt is 10% of the video. The other 90% is the harness, and it's already built here.

---

## Part 3: Your first video with Claude (5 minutes of your time)

```powershell
cd $HOME\Documents\motion-studio
claude
```
Inside Claude Code:
1. Type `/model`, pick **Opus 5.5**, and set effort to **xhigh**. Use **max** for flagship pieces and **medium** for small fixes.
2. Paste the one-liner (from `prompts/A_showreel.txt`):
   ```
   make a dynamic 15-second motion graphics video that shows what an incredible
   motion designer you are, like it's your showreel for a résumé. go all out.
   ```
3. Claude writes `index.html`, runs `npm run draft`, reviews `out/contact.png`, fixes, then runs
   `npm run build`. When it's done, open `out\final.mp4`.

This tests the engine. Every one-liner reel looks similar ("brief contagion"), so once it
works, move on to the recipes below.

---

## Part 4: Recipes (pick what you want to make)

Every recipe is: **put inputs in the right folder → paste a prompt → review → ship.**
The prompts live in `prompts/`. Replace the `[BRACKETS]`.

### Recipe 1: TikTok: add hooks and graphics to your own clip ⭐ *(your main use)*
*Want generated stickers, backgrounds or B-roll too? Do Part 5 first.*
1. Edit in CapCut, export 1080×1920, and save to `clips/my_video.mp4`.
2. In Claude Code, paste `prompts/E_tiktok_overlay.txt` filled in with what you say at which second.
   *(Or copy `overlays/example.js` → `overlays/my_video.js` and edit it yourself.)*
3. Preview in Chrome: `overlay.html?timeline=overlays/my_video.js&bg=clips/my_video.mp4&safe=1`
4. Render: `npm run tiktok -- clips/my_video.mp4 --timeline overlays/my_video.js`
5. Upload `out/my_video_motion.mp4`. Add `--capcut` if you'd rather finish in CapCut with a transparent overlay.

**Tips for hooks that hold viewers:**
- Keep the first 3 seconds to **7 words max**, with 1–2 accent words: a number, "never", "nobody", "this".
- Something should change on screen **every 2–4 seconds**: a caption, sticker, circle or flash.
- End with a `cta` in the last 3–4 seconds and keep the `progress` bar on for retention.
- Keep everything inside the green safe-zone box. Nothing over your face.

### Recipe 2: Showreel variants
Use `prompts/A2_showreel_variants.txt`: a 60 s piano-scored reel, a 10 s anti-slop intro,
a "history of X" story, or an agency persona reel.

### Recipe 3: Product or brand launch video
Paste `prompts/B_product_launch.txt` with your product name, URL, a metric and a CTA.
Claude visits the site, saves real screenshots, logo and colours to `assets/`, and builds a
5-beat story: hook → UI assembles → 3 features → proof number → logo + CTA.
**Keep one Claude session per brand.** The second video is much faster because the pipeline already exists.

### Recipe 4: Copy the look of a video you love
1. Put the video in `refs/launch.mp4`, or a few frames in `refs/frames/`.
2. Paste `prompts/C_style_transfer.txt`. Claude writes `docs/style_guide.md` and `docs/shotlist.md`
   and waits for your OK. It takes the *grammar* (pace, type, transitions), never the content.

Naming a style ("Swiss poster", "PC-98 pixel art", "watercolour") beats describing it.
Your own image folder is a reference nobody else can copy.

### Recipe 5: UI morph film (one shape, never cuts)
Paste `prompts/D_state_machine.xml`. Claude asks for 8–12 UI states, your data, colours and
a ~120 BPM track, shows you the state list on the beat grid, then builds it.

### Recipe 6: Music video / long film (overnight run)
1. Put your song in `refs/track.wav` and references in `refs/`.
2. Fill in `prompts/F_director_brief.md` (logline, look, beat sheet), set effort to **max**, paste it, and let it run.
3. It works in gates: shot list → stills → draft animatic → full pass → polish → sound → render,
   and logs its self-review in `docs/review_log.md`.

### Recipe 7: Music-synced anything
```powershell
python beats.py refs\track.wav > beats.json
```
Then tell Claude: "snap state changes to `beats`, big moments to `downbeats`, SFX to `hits` in beats.json".
Add the track with `node scripts/mux.mjs out/silent.mp4 refs/track.wav`.

### Recipe 8: Every format from one timeline
`npm run render:formats` renders 9:16, 1:1 and 16:9. Ask Claude to *reframe* layouts per
format (it reads `?w=&h=`) rather than crop.

### Recipe 9: The whole pipeline in one command
In Claude Code: `/motion-reel`. It asks for URL, duration, formats, palette, reference and music,
then does everything above and delivers `out/final.mp4`, `out/contact.png`, `out/poster.png`
and `out/loop_check.mp4`.

---

## Part 5: Images, video and voice with free Gemini (no API)

Code draws text, shapes, arrows, counters and UI perfectly, so **don't generate those**.
Generate only what code can't draw well: **stickers/characters/objects, realistic backgrounds
and short B-roll clips.** Voice lines you can record yourself.

### The folders
```
assets/
  manifest.json      the list of what's needed + prompts   (Claude writes it, or you)
  inbox/             YOUR Gemini downloads go here           (you)
  ready/             processed files the videos use          (automatic)
  brand/             logo, screenshots, brand fonts          (you)
docs/asset_requests.md   copy-paste prompts + exact file names (automatic)
```

### Naming rule
`<project>_<what>`, lowercase with underscores, and **no extension needed** (png/jpg/webp/mp4 all work):
`gym_fire_sticker`, `gym_bg_sunrise`, `gym_broll_city`, `gym_intro_voice`.

### Step by step
1. **Plan.** In Claude Code, paste `prompts/G_asset_requests.txt`, filled in with your idea.
   Claude writes `assets/manifest.json` and runs `npm run assets`, which creates
   **`docs/asset_requests.md`**: a checklist with each Gemini prompt ready to copy and the exact file name.
   *(Without Claude: copy `assets/manifest.example.json` to `assets/manifest.json`, edit it, run `npm run assets`.)*
2. **Generate in Gemini** (gemini.google.com, free):
   - **Images:** paste the prompt → download the image.
   - **Video:** use Gemini's video (Veo) option if your plan includes it → download the MP4.
     If you don't have video, skip those items or use your own phone footage with the same name.
   - **Voice:** record it on your phone, or use any free text-to-speech tool.
3. **Save** each file into `assets/inbox/` with **exactly** the name from the checklist.
4. **Prepare.** Run `npm run assets`. For every file it:
   - **green-screen images:** removes the green background, making a transparent PNG, and erases Gemini's corner sparkle watermark;
   - **backgrounds:** converts them to PNG;
   - **videos:** converts them to a clean MP4 (sound removed unless `"keep_audio": true`);
   - **voice:** converts it to WAV.

   It shows ✅/⬜ for each item, and ticks them off in `docs/asset_requests.md`.
5. **Use them** in a timeline (Claude does this in step 4 of prompt G), e.g. `overlays/example_with_assets.js`:
   ```js
   { type: 'image', src: 'assets/ready/gym_bg_sunrise.png', t: 0, dur: 3, w: 1, anim: 'kenburns' }, // full-screen background
   { type: 'image', src: 'assets/ready/gym_fire_sticker.png', t: 7.5, dur: 2.5, x: 0.72, y: 0.6, w: 0.35 }, // sticker
   { type: 'broll', src: 'assets/ready/gym_broll_city.mp4', t: 3, dur: 3, mode: 'full' },             // cut-in clip
   { type: 'broll', src: 'assets/ready/gym_broll_city.mp4', t: 7, dur: 3, mode: 'pip', y: 0.3, w: 0.6 }, // picture-in-picture
   { type: 'voice', src: 'assets/ready/gym_intro_voice.wav', t: 0.5 },                                  // voice-over
   ```
6. **Render** as usual: `npm run tiktok -- clips/gym_day.mp4 --timeline overlays/gym_day.js`.

### Manifest fields
| Field | Values | Notes |
| --- | --- | --- |
| `file` | `gym_fire_sticker` | the name you save it as |
| `type` | `image` · `video` · `voice` | |
| `aspect` | `1:1` · `9:16` · `16:9` | stickers 1:1, backgrounds and B-roll 9:16 |
| `background` | `green` · `keep` | `green` = sticker/object you want transparent |
| `prompt` | text | what to generate; style and green-screen instructions are added automatically |
| `style` | text | per item; a top-level `style` applies to all items |
| `seconds` | 4–8 | videos |
| `text` | text | voice lines |
| `use` | text | where it goes (a note for you and Claude) |
| `keep_audio` | `true` | keep a video's own sound |
| `key_similarity` | 0.2–0.45 (default 0.3) | raise it if green edges remain; lower it if the subject gets holes |
| `clean_corner` | `false` | turn off the watermark-corner erase for an item |

### Tips for Gemini
- Always keep the **green-screen sentence** the checklist adds. Gemini can't make transparent images.
- If the subject has green in it, change its colour in the prompt ("red shaker bottle").
- Keep one `style` for every item so they look like one set.
- For B-roll, ask for one simple camera move and no text. Keep clips 8 s or shorter.
- Not happy with a result? Generate again, save with the same name, and run `npm run assets`. It re-processes newer files automatically.

### Paid mode (for later)
| Service | What it adds | `.env` |
| --- | --- | --- |
| fal.ai | automatic images (Flux) and videos (Kling) from the same manifest | `FAL_KEY`, optional `FAL_IMAGE_MODEL`, `FAL_VIDEO_MODEL` |
| ElevenLabs | automatic voice lines | `ELEVENLABS_API_KEY`, optional `ELEVENLABS_VOICE_ID` |

Then `npm run assets:generate` creates only the **missing** items and prepares them.
Items you already made in Gemini are kept. Nothing is paid unless you run this command with keys in `.env`.

---

## Part 6: What each tool is for

| You want… | Use | Command / file |
| --- | --- | --- |
| Hooks, captions, stickers on **your own clip** | TikTok overlays | `npm run tiktok -- clips/x.mp4 --timeline overlays/x.js` |
| To keep editing in CapCut | transparent overlay | add `--capcut` → `out/x_overlay.mov` |
| A full animated video from nothing (reel, ad, explainer) | the film engine | Claude writes `index.html` → `npm run build` |
| A product/launch video | film engine + real screenshots | `prompts/B_product_launch.txt` |
| Pictures, characters, backgrounds, B-roll | Gemini + assets tool | `npm run assets` (Part 5) |
| Sound effects | procedural SFX | automatic in `tiktok`; `cues.json` + `npm run sfx` for films |
| Sync to a song | beat grid | `python beats.py song.wav > beats.json` |
| Voice-over | your recording / TTS / ElevenLabs | `voice` element |
| Vertical + square + wide versions | formats | `npm run render:formats` |
| Check quality before the final render | critique images | `npm run draft`, `npm run critique` |
| Make renders faster | benchmark | `npm run bench` |
| Everything in one go | skill | `/motion-reel` in Claude Code |

---

## Part 7: Reviewing and fixing (the part that makes it good)

After any render:
```powershell
npm run critique       # out\contact.png, strip.png, phone.png, poster.png, loop_check.mp4
```
Then paste `prompts/evaluation.md` into Claude. It scores the video like a harsh director, lists the 3
worst problems with timestamps, fixes them and re-renders only those seconds.

**Things to look for yourself:**
| Problem | What to say to Claude |
| --- | --- |
| Centered text on a gradient, everything fading in | "Banned defaults. Rebuild shot N with kinetic type and a camera move." |
| Nothing happens for a while | "Dead beat at 0:07. Add an event every 2–4 s." |
| Movement feels cheap or linear | "Replace every easing with closed-form springs from lib/motion.js. Tiny overshoot on UI, none on type." |
| Text is hard to read on a phone | "Check out/phone.png. Make anything under 40px bigger." |
| Blurry text when zooming | "Don't scale text up; draw at final size. No will-change." |
| Stutter where it loops | "Last frame must equal the first. Use Motion.loopT." |

Fast iteration: `npm run draft` renders at half size in seconds. Only run `npm run build` when every score is 8+.

---

## Part 8: Which effort, which route

| Situation | Effort |
| --- | --- |
| small fix / re-render | medium |
| new film | xhigh |
| launch piece, first 3 s must carry it | max |

**Route A** (default, this repo): one `index.html` + `seek(t)`, zero dependencies. Opus picks this naturally.
**Route B** (frameworks, optional): say so explicitly.
```powershell
npx create-video@latest launch-film; cd launch-film; npx skills add remotion-dev/skills   # Remotion (React)
npx hyperframes init my-video; cd my-video; npx hyperframes skills update                # HyperFrames (GSAP)
```
Use Remotion for series and data-driven templates, and HyperFrames if you think in web pages.

---

## Part 9: Turning it into a service
- **Package:** `/motion-reel` is already a skill. Copy `.claude/skills/motion-reel` to share it.
- **Offer:** music + mascot/character + product features + offer at the end, any language, up to 3 revisions.
- **Pricing anchor:** a year ago, videos like this cost clients around $1,000; with this pipeline you deliver in an afternoon.

---

## Cheat sheet
```powershell
npm run draft                                         # quick look (seconds)
npm run build                                         # final video + review images
npm run tiktok -- clips\x.mp4 --timeline overlays\x.js  # graphics on your own clip
npm run render:formats                                # 9:16, 1:1, 16:9
npm run critique                                      # contact sheets for review
npm run bench                                         # re-tune speed
npm run assets                                        # Gemini checklist + prepare downloads
npm run assets:generate                               # (paid, later) auto-generate missing media
python beats.py refs\track.wav > beats.json           # beat grid from music
```

**Community repos worth cloning for ideas:**
- JohnHeibel/PDoomVideo (music video, subagent pattern)
- JohnHeibel/ClaudeAnimationBase (starter)
- buildwithhanif/claude-animation-skill (hand-drawn look)
- heygen-com/hyperframes, remotion-dev/skills (frameworks)
- WinterArc21/Battle-of-Austerlitz-Film (long form)
- guanmo-ai/awesome-ai-motion (prompt library)
- athemeroy/awesome-opus-5-5-videos (dataset)
