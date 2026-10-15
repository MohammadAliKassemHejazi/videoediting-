$ErrorActionPreference = 'Stop'
$studioRoot = Split-Path -Parent $PSScriptRoot
$enginePython = Join-Path $studioRoot '.cache/comfyui-venv/Scripts/python.exe'
$engineMain = Join-Path $studioRoot 'scripts/creature-gpu-engine.py'
if (-not (Test-Path -LiteralPath $enginePython) -or -not (Test-Path -LiteralPath $engineMain)) {
    throw 'Prepare the isolated ComfyUI environment first; see docs/WARM_CREATURE_STORIES.md.'
}
# One 6GB GPU: offload between stages and tile the CUDA VAE in bfloat16.
# CPU VAE proved too slow here. No partner API calls; local access only.
& $enginePython $engineMain --listen 127.0.0.1 --port 8188 --offline --disable-dynamic-vram --bf16-vae --reserve-vram 0.7 --disable-pinned-memory --use-pytorch-cross-attention --preview-method latent2rgb --cache-ram 1
exit $LASTEXITCODE
