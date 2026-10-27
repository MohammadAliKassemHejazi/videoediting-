---
name: h3-cartoon-series
description: Produce or revise recurring 2D cartoon story episodes with the studio's local MiniMax H3 pipeline, stable characters, contrasting voices, speech-guided mouths, causal sound, continuous editing and a live preview. Use for this project's H3 cartoon series and related episodes.
---

# Local H3 Cartoon Series

Read the owning story brief, `series/<id>/bible.json`, current episode sources and
[the local H3 production notes](../../../docs/TEXAS_H3_PRODUCTION.md). For Episode 2,
read [its current production notes](../../../docs/TEXAS_EPISODE_2.md). Preserve the
requested 2D hand-inked design; a 3D guide's default style does not change it.

## Choose the specialist

- Full new episode: story-studio and minimax-h3-drama-producer for story, cast,
  shot/asset roles, continuity, sound and QC. Keep the existing project contract.
- Literal opening/ending keyframes: minimax-h3-frame-to-video.
- Identity/style/camera/performance references: minimax-h3-reference-to-video.
- Invent a shot without controlling media: minimax-h3-text-to-video.
- Localized change to an existing shot: minimax-h3-video-editor; record the
  change/preserve pairs. Use local post-production when it satisfies the change
  without regenerating a good performance.
- Reusable reference grammar: minimax-h3-profile-distiller; separate measured,
  observed and chosen rules. Do not claim to have heard a soundtrack from metrics.
- Ambiguous mode or failed generation: minimax-h3-adviser.
- New H3-native sound: minimax-h3-audio only when requested/useful and compatible
  with the installed model. Existing local stock voices/own Foley remain valid.

Read minimax-h3-comfyui before executing a new H3 job. Its bundled defaults are
references: this studio has a validated, pinned local adapter. Do not replace it
or install models/nodes just because another skill recommends a different graph.
Use h3-prompt-writing for the structured schema accepted by the current adapter.
Use available character/material skills for the actual requested look.

## Local execution and continuity

The active engine is ComfyUI on 8189, separate from Wan. H3 model/adapter hashes
and take provenance are frozen in the episode records. The tested RTX3060 path
uses 352×640/24fps, 107 native frames including handles, an 8-step Turbo recipe
and serial sampling/decoding. Four-second performance units are extracted after
generation. Preserve the originals and describe enhanced 2K/60fps output as
enhancement/frame repetition, not native 2K or 60 new poses.

Load the cast/prop locks before every new image/shot. Reuse exact references and
stable identity IDs across related episodes. Assign each reference a bounded
role. Keep outfits, face proportions, palette and prop placement consistent;
Archive extras are separate from the main duo. Read the existing series' world
rules instead of imposing Texas/Archive mythology on unrelated series.

Actual speech requires selected-speaker mouth/beak articulation. The current
pipeline supplies the stock voice guide through H3 AddGuide/audio VAE and adds
the mastered voice afterward. For a tempo/timbre revision, retime the SAME guided
source interval with the speech, including words/captions and prop tracks. Do not
overwrite the original guide WAVs or claim approximate mouth movement is perfect
lip-sync. Inspect acting and perform/listen to audio when supported.

Series voice direction is low/serious/brisk Bird versus higher/thinner, somewhat
scared Javelina speaking faster. Episode 2's exact transform is documented in
VOICE_DIRECTION.json/PERFORMANCE_V3.json; those numerical settings describe that
performance, not a universal requirement for every future script. Sound follows
visible contacts and surfaces: steps, cloth, watch, paper, cane and transitions.
Use original/cleared audio; the reference supplies concept, not copied voices or
recordings. Research factual claims and population limits; do not invent studies.

## Revise and review

Preserve a source/audio/movie version before changes. Episode 2's v2 110s render
is archived; v3 is a 102.7s preview with faster contrasting voices, contact-timed
Foley and a deterministic old-film finish. Current helpers are project-specific:
do not point a new episode at Episode 2's files. Its retiming helper reads the
preserved v2 performance; base timing/voice-guide preparers refuse v3 overwrite.

Use live Remotion for review and inspect actual frames and seams. The current
grain/grade/dust treatment overlays the images beneath readable captions. Keep
motion deterministic under reverse seeking. Save skill-use evidence and new
episode continuity. Generated keyframes are not completed animation.

The user's preview-first rule overrides upstream production defaults and earlier
render instructions: no export or automatic finisher until the user likes this
version and explicitly requests export. Only then pass `--approved-export` and
complete dimensions/audio/decode/source-hash, visual and playback checks. Preserve
listening/user approval as separate states; no virality or monetization guarantee.
