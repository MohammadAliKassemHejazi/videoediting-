// Headless Chromium → FFmpeg. Renders SUB subframes per output frame and blends them
// with tmix for physically-plausible motion blur.
//   node render.mjs [--fps 60] [--dur 15] [--sub 4] [--from 0] [--w 1080] [--h 1920] [--out out/silent.mp4]
import { chromium } from 'playwright';
import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const argv = process.argv;
const raw = (k) => { const i = argv.indexOf('--' + k); return i > 0 ? argv[i + 1] : undefined; };
const num = (k, d) => (raw(k) !== undefined ? Number(raw(k)) : d);

const FPS = num('fps', 60);
const SUB = num('sub', 4);
const FROM = num('from', 0);
const W = num('w', 1080);
const H = num('h', 1920);
const OUT = raw('out') || 'out/silent.mp4';
const FFMPEG = process.env.FFMPEG || 'ffmpeg';

if (spawnSync(FFMPEG, ['-version']).error) {
  console.error(`ffmpeg not found (${FFMPEG}). Install it or set FFMPEG=/path/to/ffmpeg.`);
  process.exit(1);
}
mkdirSync(dirname(OUT), { recursive: true });

// CHROMIUM_PATH lets you reuse a preinstalled Chromium when the Playwright version differs.
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
const url = pathToFileURL(resolve('index.html'));
url.search = `?w=${W}&h=${H}`;
await page.goto(url.href);
await page.evaluate(() => document.fonts.ready);
const DUR = num('dur', await page.evaluate(() => window.DURATION || 15));

const vf = SUB > 1
  ? `tmix=frames=${SUB},select='eq(mod(n\\,${SUB})\\,${SUB - 1})',setpts=N/${FPS}/TB`
  : 'null';
const ff = spawn(FFMPEG, [
  '-y', '-loglevel', 'error',
  '-f', 'image2pipe', '-framerate', String(FPS * SUB), '-i', '-',
  '-vf', vf, '-r', String(FPS),
  '-c:v', 'libx264', '-crf', '16', '-pix_fmt', 'yuv420p',
  // bitexact + single thread keep output hashes stable for determinism checks
  '-threads', '1', '-fflags', '+bitexact', '-flags:v', '+bitexact', '-map_metadata', '-1',
  OUT
], { stdio: ['pipe', 'inherit', 'inherit'] });
const closed = new Promise((res) => ff.on('close', res));

const rate = FPS * SUB;
const total = Math.round(DUR * rate);
for (let i = 0; i < total; i++) {
  const t = FROM + i / rate;
  await page.evaluate((ts) => window.seek(ts), t);
  const png = await page.locator('#c').screenshot({ type: 'png' });
  if (!ff.stdin.write(png)) await new Promise((r) => ff.stdin.once('drain', r));
  if (i % rate === 0) console.log(`Rendered ${Math.round(i / rate)}s / ${DUR}s`);
}

ff.stdin.end();
const code = await closed;
await browser.close();
if (code !== 0) { console.error(`ffmpeg exited with ${code}`); process.exit(code); }
console.log(`Video render completed: ${OUT}`);
