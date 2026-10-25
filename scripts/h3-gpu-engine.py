"""Instrumented H3 entry using the existing isolated ComfyUI environment."""
import faulthandler
import runpy
import sys
from pathlib import Path

faulthandler.enable()
print("H3 startup: preload PyAV", flush=True)
import av
print("H3 startup: PyAV ready; enter ComfyUI (allocator configured before Torch)", flush=True)
engine = Path(__file__).resolve().parents[1] / ".cache" / "comfyui"
sys.path.insert(0, str(engine))
sys.argv[0] = str(engine / "main.py")
runpy.run_path(str(engine / "main.py"), run_name="__main__")
