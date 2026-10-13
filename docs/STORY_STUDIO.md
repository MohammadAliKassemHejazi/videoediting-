# Script to a narrated film

The three story demo directions are educational 3D, illustrated character
storytelling and cinematic story animation. The demo script is an original fictional
sample; a user's own script is the authority for production. English and Arabic
narration are selectable per project. Drafts and final exports target portrait
1440×2560 at 60fps, with story films lasting at least 60 seconds.

An additional ink-sketch adventure treatment is available. The current audience
preference is ages 13–17: strong curiosity, original recurring characters, visible
stakes and a meaningful payoff. Research current examples for each topic and
record the sources. Use deliberate staging and continuous useful development;
camera drift, particles or title swaps alone do not make a story professional.
Inspect actual acting, contact, eye direction, camera framing, material quality,
sound and seams before calling a film ready. No promises of virality or perfection.

The agent reads the script, researches any educational claims, writes a treatment
and casts consistent characters. It builds environments, props and timed acting
that communicate the story visually. Narration and captions support that story.
Reuse the selected motion vocabulary, but direct fresh shots for each episode.
Split-screen is optional. Full-screen narrative scenes are the default here.

```powershell
npm run story -- new episode-2 --script scripts/my-story.txt --series lantern-valley --language ar
# Agent authors story.json scene actions, STORYBOARD.md and scenes.js first.
python scripts/story-voice.py story-projects/episode-2
npm run story -- prepare episode-2
npm run story -- activate episode-2
npm run preview
npm run story -- render episode-2
```

Each new script gets its own `scenes.js` renderer module. The agent authors
`createStoryWorld(canvas,bible,style)`, `paintIllustrated(ctx,time,spec)` and
`storyState(time,spec)`. The demo's bridge story is an example, not a universal
plot. Reuse character builders/assets within the series while designing fresh
locations, props and actions. The CLI intentionally blocks undirected AUTHOR
scenes rather than silently sending a different story through the bridge template.

`story-projects/<episode>/story.json` holds script, scene actions, voice configuration
and the series ID. `series/<series>/bible.json` locks character identity, silhouette,
colors, proportions and world facts. Related episodes load the same bible and
assets. Record an episode's outcome in its own continuity file; the agent reads
previous outcomes before directing a sequel. User declarations connect episodes;
unrelated scripts get separate series. Model sheets and assets belong in the series,
never in rebuildable cache.

The free `edge-tts` client creates neural speech through Microsoft's online service,
with no API key. Script text is sent to that service; voices and availability are
verified when used. The project stores the chosen voice so sequels can reuse it.
Generate narration before final timing. Supplied audio can replace generated speech.
Read Arabic captions with a local Arabic font and RTL direction. Original talking-head
speech stays untouched; story voiceover is a separate workflow.

For an educational film, choose a visual explanation and show why it works. For a
story, establish a goal, obstacle, attempt, consequence and earned resolution.
Character acting needs gaze, anticipation, contact, reaction and stillness. A camera
move must reveal something. Do not hold unrelated diagrams to fill a minute.

Use free assets only with verified file licenses; "free" alone is not provenance.
Polyfork is a discovery source supplied by the user. Poly Haven, Kenney and the
Three.js examples are additional sources. Procedural geometry can avoid asset
dependencies entirely. Save attribution and acquisition details in ASSET_SOURCES.md.
Download only assets needed for the treatment; do not bulk-download libraries.

Preview live in Remotion, render drafts serially, inspect contact sheets, phone frames,
seams and the generated cover, then fix substantive weaknesses. Decode-check 2K/60fps,
duration and audio. Record only actual visual/listening review, and preserve draft
status until it is earned. No quality scores or claims of listening from numerical checks.
