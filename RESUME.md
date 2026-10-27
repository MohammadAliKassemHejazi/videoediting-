# Preview-only checkpoint — 2026-10-27

LATEST PROCESS CLEANUP: At the user's request, stopped the idle H3 engine8189,
both episode media-sync watchers, and gallery3001 with its npm/cmd wrappers.
Only the Remotion preview service3002 is intentionally retained. Its static
media still work without the GPU engine/watchers. Do not restart stopped
services until needed for user-authorized work. No render/export is active.
User browser, Docker3000 and unrelated applications were left alone.

LATEST AUDIO FEEDBACK: the user dislikes the current voices and reports missing
surrounding/action sound. Read the episode's REQUESTED_AUDIO_REVISION.md before
changing voices. New clean voice auditions and a connected scene-specific sound
revision have NOT started: user asked for an ETA first. Agent setup is complete
and mirrored (44 skills). Estimate given:25–40minutes of work plus user review.
Rendering remains stopped; no export approval exists.

The user explicitly said “stop the rendering” and “i only render when i like th
video.” This supersedes earlier instructions to finish exports automatically.
Do not restart a render, generation queue or finisher from “continue” alone.
Make requested preview edits; export only after explicit approval of the current
creative version and an export request. The three Episode 2 exporter/finisher
commands now require --approved-export, which must never be supplied without
that real approval. Negative checks confirmed they refuse unapproved exports.

## Current Episode 2

Live: http://localhost:3002/texas-ten-thousand-steps

All 28 actual H3 takes and all 28 RTX3060 enhancements are complete. Version 3 is
a **102.7-second live preview**, with all story beats retained: Bird/narrator 6%
faster, Javelina 16% faster with a higher/thinner, lightly trembling voice, original
surface/contact-timed steps and Foley, and an old-cinema matte grade/grain/dust
overlay beneath captions. Original speech-guided source intervals and words were
retimed together. Reference sound analysis is numerical/inferred, not a listening
review or voice clone. Actual early/middle/late preview frames were inspected.

The v3 MP4 export was stopped around 20%. Renderer PID29888 and its descendants
were terminated; its supervisor exited, and its stale render lock was released.
No export is active. Studio3002 remains available. Gallery3001, media-sync
watchers and the idle H3 engine8189 were subsequently stopped at user request. Check actual process ownership if state changes.
Do not remove user footage, models, source takes or older completed videos.

The old **110-second v2** render completed and passed decode before the requested
voice/filter revision. It is preserved at:

- out/texas-ten-thousand-steps/versions/v2/draft.mp4
- out/texas-ten-thousand-steps/versions/v2/render-manifest.json
- projects/texas-ten-thousand-steps/versions/v2/
- story-projects/texas-ten-thousand-steps/assets/versions/v2/

The root out/.../draft.mp4 is also the older v2, not an approved v3 export. Do not
present it as the revised result. The gallery's source-hash gate correctly treats
it as stale. The interrupted v3 temporary output is retained, not delivered.

## Editor/skills setup

44 skill packages are installed in .agents/skills and identically mirrored to
.claude/skills. Nine new pinned MIT H3 packages came from
chiphoton/MiniMax-H3-Codex-Drama, revision4f16b7f12a27167f279a01456764d5b765338b08.
Their setup scripts/models were not executed or installed. video-editor routes
natural-language requests; h3-cartoon-series adapts H3 workflows to this series.
The named Claude agent is .claude/agents/video-editor.md. Codex uses the shared
project instructions and $video-editor. Both CLI paths/flags and launcher check
mode were verified without starting another agent conversation.

Read docs/VIDEO_EDITOR_AGENT.md for invocation. The current episode's
SKILL_USAGE.md distinguishes applied, consulted and merely installed skills.
Both new skills passed the skill validator; all44 mirror checks passed.

## Preserved completed work and remaining work

Episode 1 remains rendered and its source hash still matches
2d4b1d387c3428c5792c405b7b74115bb4d42c2a2b1453c774ddb5d8e4150e39.
Series profile master is series/texas-casefiles/branding/profile-v1.png; three
platform copies and ZIP are in out/texas-casefiles-branding. Circular crops were
inspected at320/160/96/48px. The designed Episode 2 cover is
projects/texas-ten-thousand-steps/assets/covers/youtube.png, inspected at phone size.

Await the user's preview feedback. Make revisions without exporting. Once the
user actually approves and requests export, run the guarded revision finisher;
inspect the newly exported movie's contacts/phone/seams and browser playback.
Listening/precise lip-sync/user creative approval remain separate. Render-based
determinism checks are deferred while rendering is stopped;17 unit checks passed.
Current official YouTube monetization/Shorts/disclosure notes are in the episode's
YOUTUBE_NOTES.md; no acceptance, views or earnings are guaranteed.

Ollama is not used by this project, is not running and was not uninstalled. The
user was told removing it does not affect local ComfyUI/H3 or Kokoro.
