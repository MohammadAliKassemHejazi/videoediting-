# Your project Video Editor

Open this project in Codex or Claude and describe the edit naturally. AGENTS.md
and CLAUDE.md route video requests through the shared `video-editor` skill. It
selects skills for the requested outcome and records actual use in the episode's
SKILL_USAGE.md. It does not start a job from a question or on startup.

For a dedicated terminal conversation, from the project folder run:

```powershell
powershell -NoProfile -File scripts/video-editor-agent.ps1 -Assistant codex
powershell -NoProfile -File scripts/video-editor-agent.ps1 -Assistant claude
```

These launch an interactive editor using the installed CLI/account. Codex invokes
`$video-editor`; Claude uses the named project agent `video-editor`. You can also
invoke `$video-editor` in Codex or `/video-editor` in Claude directly. Skills added
on disk are available on the next agent turn; restart an older client if its list
is cached. The launcher does not change models or permissions, install software,
start a render, or open multiple agents. Use one conversation to own an active
production job; another session can inspect without starting competing jobs.

Examples:

- “Give this clip five distinct hook directions in live preview.”
- “Continue the Texas series with these characters and this script.”
- “Make Javelina sound thinner and nervous; keep the Bird serious.”
- “Make this explanation into magazine collage.”
- “Use a Clawd brush animation for this story.”
- “I like this preview. Export this version at 2K/60fps.”

Preview comes first. Only the last kind of explicit approval authorizes an export;
“continue” alone means keep editing/previewing. The stopped Episode 2 v3 export
will not resume automatically. Its live preview is
http://localhost:3002/texas-ten-thousand-steps. The earlier completed 110s v2 movie
is preserved separately; it is not the revised 102.7s preview export.

## H3 capabilities added

Nine MIT-licensed skills from
[MiniMax-H3-Codex-Drama](https://github.com/chiphoton/MiniMax-H3-Codex-Drama), pinned
to `4f16b7f12a27167f279a01456764d5b765338b08`, add advice, full production, reference
distillation, precise editing, first-frame, text, reference and audio prompting,
and ComfyUI execution guidance. License and UPSTREAM.json travel with each package.
They complement the existing official H3/style skills and studio code.

The new `h3-cartoon-series` skill adapts those workflows to this 2D series and the
validated local RTX3060 pipeline. It preserves our projects/series, voice guides,
8-step graph and Remotion workflow. Upstream templates have not replaced the
working model setup. No extra weights, services or paid APIs were installed.

Sources checked 2026-10-27:

- [MiniMax's H3 integration index](https://github.com/MiniMax-AI/awesome-minimax-h3-integration)
- [Official H3 animation workflow](https://github.com/MiniMax-AI/MiniMax-H3/blob/main/skills/3d-animation-short-generator/SKILL.md) — useful narrative guidance; its default 3D look does not override our 2D brief.
- [Codex skills](https://learn.chatgpt.com/docs/build-skills) and [project instructions](https://learn.chatgpt.com/docs/agent-configuration/agents-md)
- [Claude named agents and preloaded skills](https://code.claude.com/docs/en/sub-agents)
