# Local RTX 3060 character animation

Verified on 2026-10-15: RTX 3060 Laptop GPU **6GB**, 16GB RAM. Isolated ComfyUI
under `.cache/comfyui` and Python environment `.cache/comfyui-venv`. No paid API.
Model files and exact SHA-256 provenance are in the warm-creature project's
`workflows/LOCAL_MODEL_SOURCES.json` and `TURBO_MODEL_SOURCE.json`.

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/start-creature-gpu.ps1
# Wait for http://127.0.0.1:8188; do not start another render concurrently.
node scripts/generate-local-shot.mjs next-shot --folder projects/warm-creature-story --image assets/hug-keyframe.png --prompt-file projects/warm-creature-story/HUG_MOTION.txt --frames 145 --width 448 --height 800 --steps 4 --cfg 1 --shift 5 --lora Wan22_TI2V_5B_Turbo_lora_rank_64_fp16.safetensors --decode tiled --tile 512 --temporal 32
```

The generator saves a latent before decoding, then releases models and decodes in
a separate native graph. It records settings/history and copies real MP4s into
project assets. Latents can be decoded again with `--decode-latent <workspace-file>`.
Never overwrite a good shot with an unreviewed take. Source art, clips and series
bibles stay outside rebuildable cache. Model weights/cache/MP4s are Git-ignored.

Important findings from actual tests:

- Preload PyAV before Torch on this Windows wheel combination; otherwise startup
  froze in native PyAV import. The wrapper implements that order.
- CPU VAE was too slow here. Use bfloat16 CUDA VAE with model offloading.
- Tiny VAE tiles (256 spatial / 16 temporal) produced colored seams and exposure
  shifts. Full decoding removed those artifacts in a small test. For longer
  448×800 sources, 512-pixel / 32-frame tiles were practical here.
- Turbo 5B LoRA uses a four-step CFG-free recipe (CFG 1). This is different from
  simply reducing steps on the base model. GGUF LoRA support is experimental;
  inspect actual results and do not infer fidelity from model loading success.
- Long/complex instructions can invent accessories or deform backgrounds. Direct
  one action and reaction, maintain identity references, inspect and reject bad
  takes. The first moving-tram ending was replaced by a stable seated reaction.
- The installed Playwright headless shell lacks H.264 (`canPlayType` is empty).
  Actual playback inspection uses installed Chrome via `studio-browser.mjs`.
  Chrome played the real 2K/60fps fox draft without media errors.

Internal sources are **448×800 at 24fps**. Delivery is upscaled 1440×2560/60fps,
with repeated source frames. This does not create native 2K detail or 60 poses.
Final assembly can use the RTX's NVENC (`encoder: h264_nvenc` in the manifest).

Actual first creature draft: `out/warm-creature-story/assembled-draft.mp4`, 15s,
H.264/AAC, original score, three generated shots. Reviewed source contacts and
both actual cuts; designed cover inspected at phone size. No listening claimed.
Live: http://localhost:3000/warm-creature-story. Full story generation uses the
separate original Noor/Rami bible and scripts under story-projects/shadow-went-first.

Primary references: https://github.com/Comfy-Org/ComfyUI,
https://github.com/city96/ComfyUI-GGUF,
https://huggingface.co/quanhaol/Wan2.2-TI2V-5B-Turbo,
https://huggingface.co/hum-ma/Wan2.2-TI2V-5B-Turbo-GGUF.
