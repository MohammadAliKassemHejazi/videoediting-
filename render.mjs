// Headless Chromium → H.264.
//   node render.mjs [--fps 60] [--dur <film>] [--from 0] [--sub 4] [--w 1080] [--h 1920]
//                   [--workers auto] [--encoder x264|nvenc|qsv|auto] [--gpu] [--out out/silent.mp4]
// Any option can also be set per machine in studio.config.json (see `npm run bench`).
//
// Speed-ups over a naive "screenshot every subframe" loop:
//  * Motion blur is blended on the GPU inside the page (running average of SUB subframes
//    drawn into an accumulation canvas), so each output frame costs one screenshot, not SUB.
//  * The film is a pure function of time, so the timeline is split into chunks rendered by
//    parallel browser contexts, each feeding its own encoder; chunks are joined losslessly.
//  * Frames are captured over CDP with optimizeForSpeed (fast lossless PNG): ~3× faster per
//    capture than locator.screenshot.
import { chromium } from 'playwright';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { cpus, freemem, platform } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { assertFfmpeg, ffmpeg, ffmpegPipe } from './lib/ffmpeg.mjs';
import { ENCODERS, pickEncoder } from './lib/encoders.mjs';
import { opt } from './lib/options.mjs';

const FPS = Number(opt('fps', 60));
const SUB = Math.max(1, Number(opt('sub', 4)));
const FROM = Number(opt('from', 0));
const W = Number(opt('w', 1080));
const H = Number(opt('h', 1920));
const OUT = opt('out', 'out/silent.mp4');
const WORKERS_ARG = opt('workers', 'auto');
const GPU = [true, 'true', '1'].includes(opt('gpu', false));

assertFfmpeg();
const ENCODER = pickEncoder(opt('encoder', 'x264'));
mkdirSync(dirname(OUT), { recursive: true });

// --gpu: hardware-accelerated canvas in Chromium (full headless build, D3D11 on Windows).
// Default is the software rasteriser, which is identical on every machine.
const launch = {};
if (process.env.CHROMIUM_PATH) launch.executablePath = process.env.CHROMIUM_PATH;
if (GPU) {
  launch.channel = 'chromium';
  launch.args = ['--ignore-gpu-blocklist', '--enable-gpu-rasterization', '--enable-accelerated-2d-canvas',
    ...(platform() === 'win32' ? ['--use-angle=d3d11'] : [])];
}
const browser = await chromium.launch(launch);
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
  const cdp = await ctx.newCDPSession(page);
  return { ctx, page, cdp };
}

const first = await openPage();
const DUR = Number(opt('dur', await first.page.evaluate(() => window.DURATION || 15)));
const frames = Math.round(DUR * FPS);
// auto: ~0.6 workers per logical core (hyper-threads help Chromium less than real cores),
// capped by free memory (~500 MB per worker at 1080×1920) and the encoder's session limit.
const autoWorkers = Math.min(12,
  Math.floor(cpus().length * 0.6),
  Math.floor(freemem() / (500 * 1024 * 1024) * Math.min(1, (1080 * 1920) / (W * H))));
const workers = Math.max(1, Math.min(
  WORKERS_ARG === 'auto' ? autoWorkers : Number(WORKERS_ARG),
  ENCODERS[ENCODER].maxWorkers,
  Math.ceil(frames / (FPS / 4)) // at least a quarter second of footage per worker
));
console.log(`Rendering ${W}×${H} @ ${FPS} fps, ${SUB} subframe(s), ${workers} worker(s), encoder ${ENCODER}${GPU ? ', GPU canvas' : ''}`);

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
  const { ctx, page, cdp } = handle || (await openPage());
  const file = join(chunkDir, `chunk_${String(idx).padStart(3, '0')}.mp4`);
  const enc = ffmpegPipe([
    '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
    ...ENCODERS[ENCODER].args,
    file
  ]);
  const rate = FPS * SUB;
  for (let f = startFrame; f < endFrame; f++) {
    await page.evaluate(([t, sub, r]) => window.__frame(t, sub, r), [FROM + f / FPS, SUB, rate]);
    const { data } = await cdp.send('Page.captureScreenshot', { format: 'png', optimizeForSpeed: true });
    const png = Buffer.from(data, 'base64');
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
