$ErrorActionPreference = 'Stop'
$studioRoot = Split-Path -Parent $PSScriptRoot
$h3Python = Join-Path $studioRoot '.cache/comfyui-venv/Scripts/python.exe'
$h3Main = Join-Path $studioRoot 'scripts/h3-gpu-engine.py'
$h3Base = Join-Path $studioRoot '.cache/h3-engine'
if (-not (Test-Path -LiteralPath $h3Python) -or -not (Test-Path -LiteralPath $h3Base)) {
    throw 'Prepare the isolated H3 components first.'
}
# Separate model/custom-node/input/output folders; no changes to the Wan engine.
# Preload PyAV through the existing wrapper, then use native H3 nodes + pinned GGUF fork.
& $h3Python $h3Main --base-directory $h3Base --listen 127.0.0.1 --port 8189 --offline --disable-dynamic-vram --reserve-vram 0.7 --disable-pinned-memory --async-offload 1 --use-pytorch-cross-attention --preview-method none --cache-none
exit $LASTEXITCODE
