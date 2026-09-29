// Find the fastest render settings for THIS machine and save them to studio.config.json.
//   npm run bench            (≈ 2–4 minutes; plug the laptop in and use a performance power mode)
import { execFileSync } from 'node:child_process';
import { rmSync, writeFileSync, existsSync } from 'node:fs';
import { cpus } from 'node:os';
import { encoderWorks } from '../lib/encoders.mjs';

const DUR = 4, FPS = 60, SUB = 4, FRAMES = DUR * FPS;
rmSync('studio.config.json', { force: true }); // measure without a previous config

function run(opts) {
  const args = ['render.mjs', '--dur', DUR, '--fps', FPS, '--sub', SUB, '--out', 'out/bench.mp4',
    '--workers', opts.workers, '--encoder', opts.encoder, ...(opts.gpu ? ['--gpu'] : [])].map(String);
  const t = Date.now();
  try { execFileSync(process.execPath, args, { stdio: 'ignore' }); }
  catch { return 0; }
  return FRAMES / ((Date.now() - t) / 1000);
}

const results = [];
const test = (o) => {
  const fps = run(o);
  results.push({ ...o, fps });
  console.log(`  workers=${String(o.workers).padEnd(2)} encoder=${o.encoder.padEnd(5)} gpu=${o.gpu ? 'on ' : 'off'}  ${fps ? fps.toFixed(1) + ' fps' : 'failed'}`);
  return fps;
};

const n = cpus().length;
console.log(`${n} logical cores. Final-quality frames (60 fps × 4 subframes) per second, higher is better:\n`);

console.log('1) Worker count (CPU encoder)');
const counts = [...new Set([2, 4, 6, 8, 10, 12, 16].filter((w) => w <= n))];
let best = { workers: 1, encoder: 'x264', gpu: false, fps: 0 };
for (const w of counts) {
  const fps = test({ workers: w, encoder: 'x264', gpu: false });
  if (fps > best.fps) best = { workers: w, encoder: 'x264', gpu: false, fps };
  else if (fps < best.fps * 0.97) break; // past the peak
}

console.log('\n2) Hardware encoders');
for (const enc of ['nvenc', 'qsv']) {
  if (!encoderWorks(enc)) { console.log(`  ${enc}: not available`); continue; }
  for (const w of [...new Set([best.workers, Math.min(8, best.workers + 2)])]) {
    const fps = test({ workers: w, encoder: enc, gpu: false });
    if (fps > best.fps * 1.05) best = { workers: w, encoder: enc, gpu: false, fps };
  }
}

console.log('\n3) GPU canvas in Chromium');
{
  const fps = test({ ...best, gpu: true });
  if (fps > best.fps * 1.05) best = { ...best, gpu: true, fps };
}

rmSync('out/bench.mp4', { force: true });
const cfg = { workers: best.workers, encoder: best.encoder, gpu: best.gpu };
writeFileSync('studio.config.json', JSON.stringify(cfg, null, 2) + '\n');
const secs = (15 * 60) / best.fps;
console.log(`\nFastest: ${JSON.stringify(cfg)} → ${best.fps.toFixed(1)} fps (a 15 s film ≈ ${Math.round(secs)} s)`);
console.log('Saved to studio.config.json — render.mjs uses it automatically. CLI flags still override it.');
if (best.encoder !== 'x264' || best.gpu) {
  console.log('Note: hardware encoding / GPU canvas are fast but not byte-deterministic.');
  console.log('`npm run determinism` always uses the deterministic CPU path.');
}
