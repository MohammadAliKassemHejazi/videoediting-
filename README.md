# Your tech video studio

Edit TikToks and Instagram Reels with Codex. The approved look is a large speaker,
dark grid, clean UI demonstrations, speech-timed highlights, quiet clicks, and
occasional full-screen graphics. Each video gets its own visual concept and thumbnail.

## The easiest way

1. Put your video in `clips/`. Put an optional style reference in `refs/`.
2. Open this folder in Codex and say:

   > Edit `clips/my-video.mp4` for TikTok and Instagram. Understand the speech first,
   > use our approved style, invent visuals that explain this topic, and make a bold
   > thumbnail. Use English captions. Ask me for generated assets only if needed.

3. Codex checks the footage, aligns captions, and writes a shot list. If assets are
   needed, copy the prompts from your project's `ASSET_REQUESTS.md` into your image
   or video generator. Save results using the requested filenames, then say “continue.”
4. Review the video. Tell Codex what to change using timestamps.

**Delivery:** `out/<project>/final.mp4`, `thumbnail.png`, and `captions.en.srt`.
The current film is [developer-stack](out/developer-stack/final.mp4).
Its [approved original](out/developer-stack/approved.mp4) is preserved.

## Optional commands

First setup: Node.js 22+, then `npm run setup`.

```powershell
npm run studio -- new my-video --source "clips/my-video.mp4"
npm run studio -- inspect my-video
npm run studio -- transcribe my-video
npm run studio -- assets my-video
npm run studio -- draft my-video
# After actually inspecting the draft, contact, phone and strip images:
npm run studio -- review my-video --notes "Describe the review and any corrections"
npm run studio -- final my-video
npm run studio -- clean my-video          # preview only
npm run studio -- clean my-video --apply  # remove rebuildable intermediates
```

Codex writes the creative timeline; these commands do not invent an edit by themselves.
For the current project, `npm run draft` and `npm run build` are shortcuts.
Final delivery requires a current draft review and a saved thumbnail.

## Where things live

- `projects/<name>/`: brief, transcript, timeline, custom scenes and generated assets.
- `out/<name>/`: video, cover, captions and review images.
- `.cache/`: rebuildable render and segmentation files.
- `.agents/skills/tech-video-editor/`: the editing workflow Codex follows.

Video exports are portrait **1080×1920, 60 fps, H.264/AAC**. Upload the PNG as the
cover separately and check its crop in the app. Originals and approved cuts are
protected by the normal cleanup command. No paid generation is required.

[Detailed workflow](docs/WORKFLOW.md) · [Opus reference](opus_motion_studio_documentation.md)
· [Repository research and installed skills](docs/RESEARCH.md)
