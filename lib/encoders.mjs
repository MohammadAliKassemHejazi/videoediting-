// Video encoders. x264 (CPU) is the default and byte-deterministic.
// Hardware encoders free the CPU for Chromium, which is where render time goes:
//   nvenc — NVIDIA GeForce/RTX (e.g. RTX 3050)      qsv — Intel Quick Sync (Iris Xe / UHD iGPU)
// They are fast and visually equivalent, but not guaranteed byte-identical between runs.
import { spawnSync } from 'node:child_process';
import { FFMPEG } from './ffmpeg.mjs';

const BITEXACT = ['-fflags', '+bitexact', '-flags:v', '+bitexact', '-map_metadata', '-1'];

export const ENCODERS = {
  x264: {
    codec: 'libx264',
    args: ['-c:v', 'libx264', '-crf', '16', '-pix_fmt', 'yuv420p', '-threads', '1', ...BITEXACT],
    maxWorkers: Infinity
  },
  nvenc: {
    codec: 'h264_nvenc',
    args: ['-c:v', 'h264_nvenc', '-preset', 'p5', '-tune', 'hq', '-rc', 'vbr', '-cq', '17', '-b:v', '0',
      '-pix_fmt', 'yuv420p', ...BITEXACT],
    // GeForce drivers cap concurrent NVENC sessions (currently 8).
    maxWorkers: 8
  },
  qsv: {
    codec: 'h264_qsv',
    args: ['-c:v', 'h264_qsv', '-preset', 'slow', '-global_quality', '18', '-pix_fmt', 'nv12', ...BITEXACT],
    maxWorkers: 8
  }
};

// True if ffmpeg has the encoder AND the hardware actually initialises (tiny test encode).
const cache = {};
export function encoderWorks(name) {
  if (name in cache) return cache[name];
  const enc = ENCODERS[name];
  if (!enc) return (cache[name] = false);
  if (name === 'x264') return (cache[name] = true);
  const r = spawnSync(FFMPEG, ['-hide_banner', '-loglevel', 'error', '-f', 'lavfi', '-i', 'color=black:s=256x256:r=30',
    '-frames:v', '2', ...enc.args, '-f', 'null', '-'], { timeout: 20000 });
  return (cache[name] = !r.error && r.status === 0);
}

// Resolve 'auto' | name → a working encoder name, falling back to x264 with a warning.
export function pickEncoder(requested = 'x264') {
  if (requested === 'auto') return ['nvenc', 'qsv'].find(encoderWorks) || 'x264';
  if (!ENCODERS[requested]) {
    console.warn(`Unknown encoder "${requested}" (use x264, nvenc, qsv or auto) — using x264`);
    return 'x264';
  }
  if (!encoderWorks(requested)) {
    console.warn(`Encoder "${requested}" is not available on this machine/ffmpeg build — using x264`);
    return 'x264';
  }
  return requested;
}
