# Style auditions

The three new original films, without supplied footage, are described in
[ORIGINAL_STYLE_FILMS.md](ORIGINAL_STYLE_FILMS.md). They live in `projects/` and
have their own live Remotion folders, storyboards, assets, scores and export commands.
The gallery currently defaults to the five new clip editing structures in
[VARIETY_CLIP_EDITS.md](VARIETY_CLIP_EDITS.md). The original films have their own
tab; the earlier five behind-the-person edits are under Behind-the-person styles.
Starter auditions remain under Older drafts.

`npm run preview` opens Remotion Studio at http://localhost:3000. Leave it visible
while Codex or Claude edits. Studio refreshes React, painter and content changes.
`npm run gallery` opens the companion server at http://localhost:3001 for playing
the rendered candidates and saving a direction. Reload after an export finishes.
The exported drafts are real MP4s with original voice. The active audition project
is stored in `remotion/active.json`; project records live under `style-lab/`.

```powershell
npm run styles -- list
npm run styles -- init backend-checklist --count 5
npm run preview
npm run styles -- render backend-checklist
npm run styles -- select backend-checklist --style paper-collage
```

Use `--count 10`, `--start <seconds>` or `--styles <comma-separated-ids>` to compare
5–10 candidates using the same 15-second window. These are 2K portrait exports,
1440×2560 at 60fps. Low-resolution PNGs are inspection images, not video exports.
The source recording retains its native detail/frame rate; exporting at 2K/60fps
cannot recover footage detail that was never recorded.

Before init, the agent authors `projects/<id>/STYLE_CONTENT.json` from corrected
speech. Each beat has `at`, `phase`, `eyebrow`, `title`, `items` and optional absolute
`itemTimes`. Illustrative content must be identified in provenance; do not invent
quotes, benchmarks or claims. Example: a contract row appears at the word "inputs",
not at an arbitrary animation interval. Add a distinct painter in
`lib/style-auditions.js` when a topic needs a new visual treatment.

The ten starter directions are Product UI, one continuous world, paper collage,
brush character story, cinematic blueprint, terminal forensics, Swiss type,
isometric systems, editorial evidence, and hologram. Five defaults represent the
requested five families; they are candidate directions, not measured "top" rankings.
The five installed upstream packages and Clawd starter kit remain available for
deeper work. `vendor/motion-guides/sources.json` records pinned text-reference
commits and hashes, including all 43 Lemo style guides. Downloaded tools do not
automatically make every guide a finished selectable composition.

After the user chooses, `style-lab/choice.json` stores the direction. The agent
extends it into an original full-length treatment and edits the project's normal
scenes/timeline, or creates a story composition. Selecting a style is not a render
command and does not automatically invent the rest of the film.

Run `npm run skills:sync` after changing canonical `.agents/skills`; run
`npm run skills:check` to verify matching Claude copies. The synchronizer preserves
independent Claude edits by refusing conflicting overwrites. Both clients share
the same docs, sources, story bibles and project choices.
