# Three original 15-second films

The current creative showcase is saved as three independent projects:

| Project | Medium | Reusable feeling |
| --- | --- | --- |
| `midnight-transit` | Three.js clockwork, chrome courier, night architecture | Dark material cinema; object-led camera; pressure, silence, release |
| `paper-riot` | Brush-style ink character, photographic halftone hand, torn paper | Handmade rebellion; expressive takes; ripping and folding as plot |
| `signal-noise` | Native SVG, optical print geometry, huge kinetic typography | Graphic force; compression and contact; bold editorial print |

These are three separate scripts, renderers and scores. They use no supplied
talking-head footage. Each is 15 seconds, 1440 × 2560, 60fps. Earlier drafts remain
available through **Older drafts** in the gallery.

```powershell
npm run studio -- projects
npm run studio -- inspect midnight-transit
node scripts/showcase-sound.mjs
node scripts/showcase.mjs activate
npm run preview
node scripts/showcase.mjs stills paper-riot
node scripts/showcase.mjs render signal-noise
```

Render one project at a time. `scenes.jsx` holds its actual choreography and
geometry. `STORYBOARD.md` records visual causes, reads and sound events.
`assets/SOUND_EVENTS.json` stores its sound score; `showcase-sound.mjs` builds
original stereo material sounds with a shared room and distinct dynamic arc.
The WAVs and public mirrors are rebuildable; sources, provenance, the cutout prop
and designed covers belong in Git. Run the sound builder before exporting a
fresh checkout. Its loudness processing is a technical check, not a listening review.

The gallery displays the new projects first, provides a live link for each, and
saves choices in `projects/<id>/choice.json`. It refreshes completed exports
without interrupting an actively playing film. There is no automatic publication.

For a new film, carry over the chosen palette, materials, type vocabulary and
motion grammar. Write fresh content, camera coverage, actions and sound events.
Do not rename the demo, route an unrelated story through its clock/page plot,
or put every topic into a stack of cards. For related narrative episodes, preserve
the series bible and character designs. A 15-second style sample may develop
into a longer film after its direction is selected.

Five requested skill families inform these films: Lemo's material/print guides,
onetake's continuous carriers and sound direction, Collage B-roll's tactile
cutout metaphor, Clawd's acting and line boil, and HyperFrames' choreography and
typography direction. Their paid setup/generation paths are unused. No onetake
runtime, audio palette or case source is imported into these independently authored
renderers. Its noncommercial license remains with the downloaded reference package.
