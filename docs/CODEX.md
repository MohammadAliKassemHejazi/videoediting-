# Using Motion Studio with Codex

Open this repository in Codex and describe the video or change you want.
The root `AGENTS.md` supplies the project map, render contract and review workflow.
The rendering pipeline runs locally; it does not require adding an OpenAI API
integration to the project.

## How the project works

The current `index.html` is the developer artifact TikTok. Its film data, UI
components, audio events and export harness are separated; see
[`TIKTOK_ARCHITECTURE.md`](TIKTOK_ARCHITECTURE.md). Use `npm run video:draft`,
`npm run video:check` and `npm run video:final` for this project. The final export
requires a contact-sheet review recorded against the current source hash.

For the original standalone sample, `index-standalone.html` draws a canvas frame at any requested time via
`window.seek(t)`. `render.mjs` opens the page in Chromium, waits for fonts/assets,
renders independent chunks in parallel, blends subframes for motion blur and
feeds frames to FFmpeg. The build synthesizes SFX from `cues.json`, renders a silent
video, muxes audio and creates review images.

For an existing video, `overlays/<project>.js` describes timed graphics through
`window.OVERLAY`. `overlay.html` previews them and supplies transparent frames.
The TikTok script composites those frames and optional B-roll over the source
clip, mixes original audio, SFX and voice, and exports the finished video.

Media preparation is separate: the manifest records requested media, inbox holds
downloads, and `npm run assets` converts them into ready-to-use assets.

## Setup and commands

Use Node.js 22 or newer. From the repository root in PowerShell:

```powershell
npm run setup
npm test
npm run draft
```

The draft writes `out/silent.mp4` and review images. Once reviewed:

```powershell
npm run build
```

This produces `out/final.mp4`, `out/contact.png`, `out/strip.png`,
`out/phone.png`, `out/poster.png` and `out/loop_check.mp4`.

For overlays on your CapCut export:

```powershell
npm run tiktok -- clips/my_video.mp4 --timeline overlays/my_video.js
```

Use `overlays/example.js` or `overlays/example_with_assets.js` as a starting point.
Add `--capcut` for a transparent MOV export. To review the finished clip:

```powershell
node scripts/critique.mjs out/my_video_motion.mp4
```

For a short film render during iteration:

```powershell
node render.mjs --from 6 --dur 3 --fps 30 --sub 1 --workers 2 --out out/patch.mp4
```

`studio.config.json` holds local performance settings; CLI flags override them.
`npm run bench` is optional machine tuning. Use `FFMPEG` or `CHROMIUM_PATH`
environment variables if you need an existing executable.

## Requests you can give Codex

- “Create a 15-second vertical product launch film. Use the brand references in
  assets/brand, a dark background and orange accent. Draft, review, then export.”
- “Add hooks and captions to clips/my_video.mp4 using the transcript and timestamps
  below. Put the timeline in overlays/my_video.js and keep graphics away from faces.”
- “Use prompts/C_style_transfer.txt with refs/reference.mp4 to plan the look.”
- “Plan the missing images for this film in assets/manifest.json and prepare a
  Gemini checklist. Use the media already available in assets/ready.”

Include duration, format, text/transcript, visual references and music when known.
The prompt templates in `prompts/` work as task briefs in Codex as well as Claude.
Claude-specific slash commands such as `/motion-reel` remain part of the Claude
integration; in Codex, request the workflow in ordinary language.

For music, install `requirements.txt`, run `python beats.py refs/track.wav > beats.json`,
then align the animation to that grid. `node scripts/mux.mjs out/silent.mp4
refs/track.wav out/final.mp4` uses the track as its sole audio input; combine it with
SFX first if you need both. `npm run render:formats` renders silent 9:16, 1:1 and
16:9 variants; mux audio for each separately.

Generated media defaults to the manual Gemini workflow described in [GUIDE.md](../GUIDE.md).
Paid fal/ElevenLabs generation is optional and requires an explicit request.

Codex project instructions follow the official
[AGENTS.md guidance](https://learn.chatgpt.com/docs/agent-configuration/agents-md).
