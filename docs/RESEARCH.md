# Sources and what this studio takes from them

Reviewed 2026-09-30. These are design/engineering references, not mandatory runtime
dependencies. The supplied [Opus document](../opus_motion_studio_documentation.md)
remains intact. Its generic installation snippets do not replace this repo's commands.

| Source | Useful lesson applied here |
|---|---|
| [Remotion skills](https://github.com/remotion-dev/skills) | Explicit caption timing and separation of content from render logic; installed best-practices and caption skills for optional Remotion work. |
| [HyperFrames](https://github.com/heygen-com/hyperframes) | Speech-driven graphic packaging, beat concepts before layout, hierarchy sized for video. Installed creative, talking-head and motion-doctrine skill packages. |
| [ClaudeAnimationBase](https://github.com/JohnHeibel/ClaudeAnimationBase) | Storyboard before authoring, reusable scene vocabulary, inspect contact sheets. Its current implementation is p5.js/p5.brush character animation, not a drop-in Canvas dependency. |
| [PDoomVideo](https://github.com/JohnHeibel/PDoomVideo) | Separate scene modules and visual handoffs across a long timeline. We do not import its music or characters. |
| [claude-animation-skill](https://github.com/buildwithhanif/claude-animation-skill) | Surface/detail planning, forward/reverse frame checks, inspect fast-action strips, preserve good exports. |
| [Battle of Austerlitz](https://github.com/WinterArc21/Battle-of-Austerlitz-Film) | Build an explanation from evidence and spatial relationships; avoid implying generated visuals are documentary proof. |
| [Awesome AI Motion](https://github.com/guanmo-ai/awesome-ai-motion) | Source-linked visual references for choosing a concept before choosing effects. |
| [Awesome Opus videos](https://github.com/athemeroy/awesome-opus-5-5-videos) | Distinguish code rendering, generated media and edited supplied footage when deciding a production route. |

Our choices: keep Canvas/Playwright/FFmpeg, project-specific shot lists, keyed caches,
reusable painters, optional supplied alpha media, source-hash review gates, original
voice checks, and a required cover. We do not import blanket ambient wobble, mandatory
multi-agent runs, fixed three-pass reviews, or another framework's build gates.

Installed skills are in `.agents/skills/`. The local `tech-video-editor` skill is the
entry point for this repo. Framework skills apply when that framework is actually
used; their install does not authorize a migration or paid service. Upstream skill
folders are preserved as downloaded; [source/license metadata](../.agents/skills/upstream.json)
records repository heads and confirms each installed entry matched that commit.
