# Five edits of the supplied backend clip

The first 15 seconds of `clips/1012 (1).mp4` are edited in five ways. Original
Arabic speech stays at gain 1, with corrected English captions from the existing
timeline. No synthetic voice, fabricated quotation or generated replacement face
is used in the film. Generated covers are separate designed assets.

| Project | Direction |
| --- | --- |
| `clip-monument` | Large ivory type behind the real speaker; natural room and editorial punches |
| `clip-redline` | Dark red security dossier; scan motion; a full-screen illustrative API beat |
| `clip-paper-evidence` | Muted photographic cutout; torn paper; serif headlines and marks |
| `clip-acid-print` | Chartreuse/violet kinetic print; optical paths; high-impact type cuts |
| `clip-chrome-depth` | Extruded metal type; amber perspective rails; restrained depth reveal |

All exports are 1440×2560 at 60fps. The source's native detail/frame rate remains
the limit on the recorded footage. Background type is composited in the actual
order: footage, back graphics, aligned moving person matte, front graphics and
captions. The matte receives a small morphological opening to remove false
background fragments; inspect hair, mic and hand edges rather than trusting its
cache record. Speaker and matte share the same crop and camera expression.

```powershell
node scripts/prepare-pro-clips.mjs
node scripts/pro-clip-sound.mjs
node scripts/pro-clips.mjs activate
npm run preview
node scripts/pro-clips.mjs stills clip-monument
node scripts/pro-clips.mjs render clip-monument
node scripts/pro-clips.mjs render clip-redline,clip-paper-evidence,clip-acid-print,clip-chrome-depth
```

Preview is Remotion. Production uses the existing Canvas/Playwright/FFmpeg
renderer. `pro-edits.html` renders both graphics layers into one packed alpha
movie, then FFmpeg places the real moving speaker between them. This avoids
re-decoding the source inside every browser frame. Render jobs stay serial.
Graphics are checked in forward and reverse order before export.

These five treatments remain in the gallery's Behind-the-person styles tab
(`http://localhost:3001/?depth=1`). The next set uses different editing structures;
see [VARIETY_CLIP_EDITS.md](VARIETY_CLIP_EDITS.md). Select one in the gallery; it is saved in
`projects/backend-checklist/pro-edits/choice.json`. The agent then extends its
direction through the full corrected transcript. These painters are authored
for this topic; a different clip needs fresh wording, proof, action and timing.
Keep the selected material/type grammar without repeating the same backend plot.

Research is recorded per project, using CapCut's documented depth-type technique
and TikTok's hook/body/close creative guidance. Neither is a guarantee of virality.
SFX are original quiet material sounds; original speech is not normalized or ducked.
Numerical audio alignment and peak checks do not count as a listening review.
