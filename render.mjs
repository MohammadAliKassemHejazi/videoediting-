// Headless Chromium → H.264.
//   node render.mjs [--fps 60] [--dur <film>] [--from 0] [--sub 4] [--w 1080] [--h 1920]
//                   [--workers auto] [--out out/silent.mp4]
//
// Speed-ups over a naive "screenshot every subframe" loop:
//  * Motion blur is blended on the GPU inside the page (running average of SUB subframes
//    drawn into an accumulation canvas), so each output frame costs one screenshot, not SUB.
//  * The film is a pure function of time, so the timeline is split into chunks rendered by
//    parallel browser contexts, each feeding its own encoder; chunks are joined losslessly.
//  * page.screenshot (clipped) instead of locator.screenshot — ~1.7× faster per capture.
import { chromium } from 'playwright';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { cpus } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { arg, assertFfmpeg, ffmpeg, ffmpegPipe } from './lib/ffmpeg.mjs';

const FPS = Number(arg('fps', 60));
const SUB = Math.max(1, Number(arg('sub', 4)));
const FROM = Number(arg('from', 0));
const W = Number(arg('w', 1080));
const H = Number(arg('h', 1920));
const OUT = arg('out', 'out/silent.mp4');
const WORKERS_ARG = arg('workers', 'auto');

assertFfmpeg();
mkdirSync(dirname(OUT), { recursive: true });

// CHROMIUM_PATH lets you reuse a preinstalled Chromium when the Playwright version differs.
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const url = pathToFileURL(resolve('index.html'));
url.search = `?w=${W}&h=${H}`;

async function openPage() {
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => { console.error('Page error:', e.message); process.exitCode = 1; });
  await page.goto(url.href);
  // Canvas text loads fonts lazily; load every declared face up front so frame 0 isn't a fallback font.
  await page.evaluate(async () => {
    await Promise.all((window.FONTS || []).map((f) => document.fonts.load(f)));
    await document.fonts.ready;
    const film = document.getElementById('c');
    const acc = document.createElement('canvas');
    acc.width = film.width; acc.height = film.height;
    acc.style.cssText = 'position:fixed;left:0;top:0';
    document.body.appendChild(acc);
    const g = acc.getContext('2d');
    // Paint output frame at time t: running average of `sub` subframes spaced 1/rate apart.
    window.__frame = (t, sub, rate) => {
      for (let s = 0; s < sub; s++) {
        window.seek(t + s / rate);
        g.globalAlpha = 1 / (s + 1);
        g.drawImage(film, 0, 0);
      }
    };
  });
  return { ctx, page };
}

const first = await openPage();
const DUR = Number(arg('dur', await first.page.evaluate(() => window.DURATION || 15)));
const frames = Math.round(DUR * FPS);
const workers = Math.max(1, Math.min(
  WORKERS_ARG === 'auto' ? Math.max(1, Math.min(4, cpus().length - 1)) : Number(WORKERS_ARG),
  Math.ceil(frames / FPS) // at least a second of footage per worker
));

const chunkDir = join(dirname(OUT), '.chunks');
rmSync(chunkDir, { recursive: true, force: true });
mkdirSync(chunkDir, { recursive: true });

let done = 0;
const started = Date.now();
const progress = setInterval(() => {
  const s = (Date.now() - started) / 1000;
  process.stdout.write(`\rRendered ${done}/${frames} frames  ${(done / s || 0).toFixed(1)} fps  ${workers} worker(s)   `);
}, 1000);

async function renderChunk(idx, startFrame, endFrame, handle) {
  const { ctx, page } = handle || (await openPage());
  const file = join(chunkDir, `chunk_${String(idx).padStart(3, '0')}.mp4`);
  const enc = ffmpegPipe([
    '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
    '-c:v', 'libx264', '-crf', '16', '-pix_fmt', 'yuv420p',
    // single-threaded + bitexact keeps output byte-identical between runs
    '-threads', '1', '-fflags', '+bitexact', '-flags:v', '+bitexact', '-map_metadata', '-1',
    file
  ]);
  const rate = FPS * SUB;
  for (let f = startFrame; f < endFrame; f++) {
    await page.evaluate(([t, sub, r]) => window.__frame(t, sub, r), [FROM + f / FPS, SUB, rate]);
    const png = await page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: W, height: H } });
    if (!enc.proc.stdin.write(png)) await new Promise((r) => enc.proc.stdin.once('drain', r));
    done++;
  }
  enc.proc.stdin.end();
  await enc.done;
  await ctx.close();
  return file;
}

const per = Math.ceil(frames / workers);
const files = await Promise.all(
  Array.from({ length: workers }, (_, i) =>
    renderChunk(i, i * per, Math.min(frames, (i + 1) * per), i === 0 ? first : null))
);
clearInterval(progress);
await browser.close();

if (files.length === 1) {
  rmSync(OUT, { force: true });
  await ffmpeg(['-i', files[0], '-c', 'copy', '-map_metadata', '-1', '-fflags', '+bitexact', OUT]);
} else {
  const list = join(chunkDir, 'list.txt');
  writeFileSync(list, files.map((f) => `file '${resolve(f).replace(/\\/g, '/')}'`).join('\n'));
  await ffmpeg(['-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', '-map_metadata', '-1', '-fflags', '+bitexact', OUT]);
}
rmSync(chunkDir, { recursive: true, force: true });

const secs = (Date.now() - started) / 1000;
console.log(`\nVideo render completed: ${OUT}  (${frames} frames in ${secs.toFixed(1)}s, ${(frames / secs).toFixed(1)} fps)`);
