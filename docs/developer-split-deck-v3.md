# Modular split-deck revision (candidate V3)

Based on `modular_split_deck_tech_explainer_readme.md`: 1080x1920 at 60 fps, matte slate isometric grid, two rounded cards, red numbered chapters, official website captures, yellow marker wipes, red focus reticles, large year reveal, a strikethrough pivot, and four full-screen 1.16x speaker punches. Panels use 48 px side margins; captions end above the bottom 320 px platform zone. The background speaker card extends behind that zone as intended by the reference.

## Timing correction

The supplied SRT included a framework-fixes sentence absent from the recognized source audio. It introduced several seconds of drift. V3 instead uses a local browser/WASM Arabic word-timestamp pass of the actual clip, stored in `docs/audio-alignment/recognized-words.json`. English caption wording is corrected from the supplied transcript and mapped to the corresponding spoken Arabic phrases. These are estimated recognition boundaries, not manually certified forced-alignment results. A separate short recognition pass hallucinated and was discarded.

Examples: TypeScript 16.46s, Next.js 17.52s, React Router 30.86s, TanStack 32.48s, Tailwind discussion 35.08s, modern CSS 38.06s, browser APIs 39.48s, raw CSS 52.78s, like/comment/share 62.54/63.32/63.90s. Reveals and highlight wipes use absolute speech anchors; no accumulated per-scene delays.

## Audio

User selected very quiet clicks and marker sounds. Sparse synthesized ticks start at the same event timestamps, with approximately -34 dBFS peak. No music, low impacts, or whooshes. Voice remains at its original timing and gain, mixed without normalization; AAC is re-encoded for the mix. The separately exported SFX WAV and cue JSON allow adjustment. This revision has not been independently audited by listening.

## Build and review

`node scripts/developer-split-deck.mjs --draft`

`node scripts/developer-split-deck.mjs --final`

`node scripts/split-deck-qa.mjs` (add `--draft` for draft metadata)

Deliverables: `out/developer_split_deck_v3.mp4`, retimed full/short English SRT sidecars, contact sheet, phone strip, poster. V1 and V2 preserved. Candidate style remains pending user approval before being established as the future editing standard.
