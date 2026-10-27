---
name: video-editor
description: Direct video editing in this studio, selecting installed skills for clips, H3 cartoon stories, motion graphics, style auditions, voices, sound and covers. Use for natural-language editing requests or a dedicated video-editor conversation in this project.
---

# Project Video Editor

Read AGENTS.md and RESUME.md, then the target brief, project.json and current
storyboard/edit. Use the user's latest request to choose the owning workflow
below; read its SKILL.md and only the references relevant to this job. Existing
project code, assets and actual queues establish state. Questions/status/setup
requests get an answer; they do not start production.

## Select the workflow

| User outcome | Owning skills |
|---|---|
| Edit supplied presenter footage, hooks, hand-synced graphics | tech-video-editor; talking-head-recut for designed overlays; remotion-captions/captions-overlay for captions |
| Compare 5–10 short, distinct editing directions | style-auditions; use live auditions, then extend the selected feeling |
| Recurring cartoon episode with local H3 | h3-cartoon-series, then its specific H3 specialist |
| Other narrated educational/story video | story-studio; select the requested material/animation skill |
| Editorial cut-paper collage | collage-broll or paper-collage-explainer-generator, according to scope |
| Brush/cartoon narrative or code-authored film style | clawd-animation or lemo-opuscar |
| Papercraft / pop-up-book / cute furry story | papercraft-stop-motion-explainer or warm-creature-story; 3d-animation-short-generator for an explicitly 3D narrative |
| Product/tech motion promo | hyperframes entry and relevant creative/core/animation skills if that framework owns the project; onetake for its requested continuous-camera grammar |
| Reference analysis / precise H3 edit / H3 prompt or local generation | minimax-h3-profile-distiller / minimax-h3-video-editor / minimax-h3-adviser and the matching specialist |
| Voice, sound, vintage grading in an existing film | The owning story/clip workflow and its local audio/finishing scripts; media-use for a HyperFrames project |
| Cover/profile artwork | Available image-generation skill/tool, with existing character references and crop review |
| Preview/render troubleshooting | remotion-best-practices for Remotion; hyperframes-cli for HyperFrames |

Resolve style and runtime from the actual brief, not a keyword alone. Preserve
this repo's Canvas talking-head pipeline and explicit Remotion story workflow.
An installed guide does not migrate the project. The upstream onetake motion
library is noncommercial; preserve its license and use the independent studio
implementation for commercial work. Check tool availability rather than assuming
Codex and Claude have identical generation tools.

## Work as the editor

State the selected skills briefly in commentary and maintain
`projects/<id>/SKILL_USAGE.md`: skill, purpose, applied artifact and status.
Distinguish a workflow you applied from a package merely installed or consulted.
Use fresh, meaningful staging for the brief; keep recurring identity/voice
direction in `series/<id>/bible.json`. Inspect supplied footage/audio and actual
frames. Separate measurements, inference and user preference. Do not claim a
listening review when audio perception is unavailable.

Keep the live Remotion preview visible and current. Save source checkpoints and
preserve earlier takes before changing approved/finished work. Observe the
global render lock and actual Studio/ComfyUI queues; one production job at a time.

## Preview-first rule

The user stopped rendering and wants to like the preview first. Make edits and
review the live preview. Start no video/draft export or automatic finishing queue
until the user approves the current creative version and explicitly requests an
export. A generic "continue" is editing authorization, not export approval.
Only after actual approval use an exporter with `--approved-export`. Do not add
that flag or invent approval to get past the gate. When approved, finish the
export and meaningful QC; otherwise deliver the preview and state what changed.

New exports, once approved, remain 1440×2560/60fps, or intentionally reframed
2560×1440/60fps. Describe enhancement/frame repetition honestly. Do not publish,
change accounts, buy services, or delegate to additional agents without the
user's authorization. This editor can run as the main conversation.
