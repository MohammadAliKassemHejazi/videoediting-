"""Start the isolated local engine; preload PyAV before Torch on Windows.

With this machine's PyAV 19/CUDA 13 wheels, importing PyAV after Torch stalls
inside the native extension loader. Preloading preserves both real libraries.
"""
import av
import runpy
import sys
from pathlib import Path

engine = Path(__file__).resolve().parents[1] / ".cache" / "comfyui"
sys.path.insert(0, str(engine))
sys.argv[0] = str(engine / "main.py")
runpy.run_path(str(engine / "main.py"), run_name="__main__")
