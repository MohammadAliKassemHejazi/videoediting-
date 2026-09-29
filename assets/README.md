# assets/

| Folder / file | What goes here | Who puts it there |
| --- | --- | --- |
| `manifest.json` | list of images / videos / voice lines a video needs, with prompts | Claude (`prompts/G_asset_requests.txt`) or you |
| `inbox/` | **your downloads from Gemini**, saved with the exact name from `docs/asset_requests.md` | you |
| `ready/` | processed files the timelines use (green screen removed, formats fixed) | `npm run assets` |
| `brand/` | logo, product screenshots, brand fonts | you, or Claude via Playwright |

Naming: `<project>_<what>`, lowercase with underscores, e.g. `gym_fire_sticker`, `gym_broll_city`.
The extension doesn't matter in `inbox/`; `ready/` always gets `.png` (images), `.mp4` (video), `.wav` (voice).
