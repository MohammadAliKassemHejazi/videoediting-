# Developer recap V2 — candidate edit

Status: **awaiting the user's visual approval**. This is an edit in the requested
reference direction, not an approved standard for future projects. Promote its
format to project instructions only after the user says they like the output.

## Direction

Replace the rejected lime overlays and SFX with a fixed split screen. The upper
half carries one relevant visual at a time; the speaker remains in a rounded
card below. A subtle dark engineering grid connects the two. There are three
red numbered chapters, white floating cards, yellow marker wipes and selective
red focus boxes. The code still uses deterministic springs for all motion.

The user's example concerned an OpenAI recap. This video retains the actual
developer-stack topic and the user's revised 65-second transcript.

## Sources and attribution

Seven real official pages were captured with Playwright. The source URL, title,
capture time and heading coordinates are in
[`sources.json`](../assets/brand/developer-recap/sources.json).

- [TypeScript](https://www.typescriptlang.org/)
- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Router](https://reactrouter.com/)
- [TanStack Router](https://tanstack.com/router/latest)
- [CSS / MDN](https://developer.mozilla.org/en-US/docs/Web/CSS)

Screenshot cards identify their actual domain. Narrative cards use “From this
video” or “The takeaway”, so the speaker's opinions are not attributed to an
official website. UI examples are authored illustrations. No invented prices,
performance statistics, job listings or third-party testimonials are used.

## Layout and pacing

- 1080×1920 design coordinates.
- Chapter badge and title begin at y=179.
- One floating card at x=64, y=292, width=952, height=554.
- English subtitles occupy the gap between the visual and speaker; they never
  cover the face or the screenshot.
- Speaker card: x=64, y=1064, width=952, height=792, radius=44.
- The source is scaled to the card width and cropped vertically with a 390-pixel
  offset at export size. Its original timing is preserved.
- Chapter 1 starts at 9.8 seconds; chapter 2 at 23.5; chapter 3 at 39.1.
- Actual websites appear when each tool is named; explanatory white cards and
  examples support the remaining narration.
- No full-screen graphic takeover hides the speaker.

## Audio

**Original source audio only.** The AAC audio stream is copied into the output;
there is no SFX, music, loudness filter or speed change. The user disliked the
previous sounds, so numbered badges do not add audio in this version.

## Reproduce

```powershell
node scripts/developer-recap.mjs --draft
node scripts/recap-qa.mjs --draft
node scripts/developer-recap.mjs --final
node scripts/recap-qa.mjs
```

Use `node scripts/capture-tech-screens.mjs` only to deliberately refresh the
official-site screenshots. Open `developer-recap.html` for a live preview.
Edit the scene plan and speaker geometry in `overlays/developer-recap.js`,
the design in `lib/recap-design.js`, and the captions in
`overlays/developer-2026.js`.

## Deliverables

- `out/developer_recap_v2.mp4`: full-resolution candidate
- `out/developer_recap_v2_contact.png`: frames across the full video
- `out/developer_recap_v2_phone.png`: stack sequence at phone size
- `out/developer_recap_v2_poster.png`: CSS screenshot scene
- `out/developer_recap_v2.en.srt`: English sidecar subtitles
- `out/developer_recap_v2_graphics.mov`: lossless alpha layer aligned to this layout

The V1 deliverables remain available for comparison. Source footage is preserved.

## Review

The full-duration draft contact sheet and 360-pixel stack sequence were inspected.
The revised layout keeps graphics and speech captions away from the presenter.
Screenshot labels were strengthened and stray cutaway connector lines removed.
Visual review: hook 8/10, phone readability 8/10, motion 8/10, variety 8/10,
composition 9/10. This is an internal review; the user's judgment determines
whether this style becomes the future standard.

Automated QA covers arbitrary seek order, screenshot loading, transparent speaker
aperture, caption bounds, export dimensions/duration and byte-identical original
audio packets. Listening-based editorial review is not claimed.

Final checks passed: 1080×1920 at 30 fps, expected 65-second duration, all 1,951
video frames decode, and the compressed audio packet hash matches the original
clip exactly. The final full-duration contact sheet and CSS poster were inspected.
The existing seven motion-library tests also pass.
