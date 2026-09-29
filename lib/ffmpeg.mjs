// Cross-platform ffmpeg resolution + runner (Windows, macOS, Linux, Docker).
// Order: $FFMPEG → bundled ffmpeg-static (includes libx264) → `ffmpeg` on PATH.
import { spawn, spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

function resolveFfmpeg() {
  if (process.env.FFMPEG) return process.env.FFMPEG;
  try {
    const bin = createRequire(import.meta.url)('ffmpeg-static');
    if (bin) return bin;
  } catch {}
  return 'ffmpeg';
}

export const FFMPEG = resolveFfmpeg();

export function assertFfmpeg() {
  if (spawnSync(FFMPEG, ['-version']).error) {
    console.error(`ffmpeg not found (${FFMPEG}). Run \`npm install\` or set FFMPEG=/path/to/ffmpeg.`);
    process.exit(1);
  }
}

// Run ffmpeg to completion; rejects on non-zero exit.
export function ffmpeg(args, opts = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(FFMPEG, ['-y', '-hide_banner', '-loglevel', 'error', ...args], { stdio: 'inherit', ...opts });
    p.on('error', reject);
    p.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited with ${code}`))));
  });
}

// Spawn ffmpeg reading from stdin; returns { proc, done }.
export function ffmpegPipe(args) {
  const proc = spawn(FFMPEG, ['-y', '-hide_banner', '-loglevel', 'error', ...args], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((resolve, reject) => {
    proc.on('error', reject);
    proc.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited with ${code}`))));
  });
  return { proc, done };
}

export const arg = (k, d, argv = process.argv) => {
  const i = argv.indexOf('--' + k);
  return i > 0 && argv[i + 1] !== undefined ? argv[i + 1] : d;
};

// Media duration in seconds, parsed from ffmpeg's header output (no ffprobe needed).
export function duration(file) {
  const r = spawnSync(FFMPEG, ['-hide_banner', '-i', file], { encoding: 'utf8' });
  const m = /Duration: (\d+):(\d+):([\d.]+)/.exec(r.stderr || '');
  if (!m) throw new Error(`Could not read duration of ${file}`);
  return +m[1] * 3600 + +m[2] * 60 + +m[3];
}
