// One command: add motion-graphics overlays (hooks, captions, stickers…) + SFX to your own clip.
//   npm run tiktok -- clips/my_clip.mp4 [--timeline overlays/example.js] [--sfx-volume 0.6]
//                     [--no-sfx] [--sub 2] [--capcut] [--out out/my_clip_motion.mp4]
// Outputs:
//   out/<name>_motion.mp4   your clip with the graphics burned in (upload this)
//   out/<name>_overlay.mov  with --capcut: the graphics alone as transparent ProRes 4444,
//                           to drag onto a CapCut overlay track (slower to render, larger file)
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { basename, extname } from 'node:path';
import vm from 'node:vm';
import { ffmpeg, probe } from '../lib/ffmpeg.mjs';
import { ENCODERS } from '../lib/encoders.mjs';
import { opt } from '../lib/options.mjs';

const clip = process.argv.slice(2).find((a, i, all) => !a.startsWith('--') && !(all[i - 1] || '').startsWith('--'));
if (!clip || !existsSync(clip)) {
  console.error('Usage: npm run tiktok -- <your_clip.mp4> [--timeline overlays/example.js]');
  process.exit(1);
}
const timeline = opt('timeline', 'overlays/example.js');
if (!existsSync(timeline)) { console.error(`Timeline not found: ${timeline}`); process.exit(1); }
const name = basename(clip, extname(clip));
const OUT = opt('out', `out/${name}_motion.mp4`);
const CAPCUT = process.argv.includes('--capcut');
// Burn-in only needs a fast lossless intermediate (qtrle: ~3× faster, ~3× smaller than ProRes).
const OVERLAY = CAPCUT ? `out/${name}_overlay.mov` : `out/.${name}_overlay_tmp.mov`;
const SFX_WAV = `out/${name}_sfx.wav`;
const SFX = !process.argv.includes('--no-sfx');
const SFX_VOL = Number(opt('sfx-volume', 0.6));
mkdirSync('out', { recursive: true });

const info = probe(clip);
const fps = Math.min(60, Math.round(info.fps * 1000) / 1000);
console.log(`Clip: ${info.width}×${info.height} @ ${fps} fps, ${info.duration.toFixed(2)}s${info.audio ? '' : ' (no audio)'}`);

// 1) Transparent overlay at the clip's exact size, fps and length.
const node = (args) => execFileSync(process.execPath, args, { stdio: 'inherit' });
node(['render.mjs', '--page', 'overlay.html', '--query', `timeline=${encodeURIComponent(timeline)}&dur=${info.duration}`,
  '--w', String(info.width), '--h', String(info.height), '--fps', String(fps), '--sub', String(opt('sub', 2)),
  '--dur', String(info.duration), '--alpha', '--alpha-codec', CAPCUT ? 'prores' : 'qtrle', '--out', OVERLAY,
  ...(opt('workers', null) ? ['--workers', String(opt('workers'))] : [])]);

// 2) SFX from the timeline events.
if (SFX) {
  const sandbox = { Motion: {} };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(readFileSync('lib/overlay-kit.js', 'utf8'), sandbox);
  vm.runInContext(readFileSync(timeline, 'utf8'), sandbox);
  const cues = sandbox.OverlayKit.cuesFor(sandbox.OVERLAY);
  const cuesFile = `out/${name}_cues.json`;
  writeFileSync(cuesFile, JSON.stringify(cues, null, 2));
  node(['sfx.mjs', cuesFile, SFX_WAV, '--dur', String(info.duration)]);
}

// 3) Composite: clip + overlay, original audio + SFX, loudness -14 LUFS.
const cfgEnc = String(opt('encoder', 'x264'));
const venc = cfgEnc === 'nvenc' || cfgEnc === 'qsv'
  ? ENCODERS[cfgEnc].args
  : ['-c:v', 'libx264', '-preset', 'fast', '-crf', '18', '-pix_fmt', 'yuv420p'];
const inputs = ['-i', clip, '-i', OVERLAY, ...(SFX ? ['-i', SFX_WAV] : [])];
let audio;
if (info.audio && SFX) audio = `[2:a]volume=${SFX_VOL}[s];[0:a][s]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11[a]`;
else if (info.audio) audio = `[0:a]loudnorm=I=-14:TP=-1.5:LRA=11[a]`;
else if (SFX) audio = `[2:a]volume=${SFX_VOL},loudnorm=I=-14:TP=-1.5:LRA=11[a]`;
const graph = `[0:v][1:v]overlay=0:0:format=auto:shortest=1,format=yuv420p[v]` + (audio ? ';' + audio : '');
console.log('Compositing…');
await ffmpeg([...inputs, '-filter_complex', graph, '-map', '[v]', ...(audio ? ['-map', '[a]', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000'] : []),
  ...venc.filter((a, i, all) => !['-map_metadata', '-fflags', '-flags:v'].includes(a) && !['-map_metadata', '-fflags', '-flags:v'].includes(all[i - 1])),
  '-r', String(fps), '-t', String(info.duration), '-movflags', '+faststart', OUT]);

if (!CAPCUT) rmSync(OVERLAY, { force: true });
console.log(`\nDone:\n  ${OUT}   ← upload this`);
if (CAPCUT) console.log(`  ${OVERLAY}   ← transparent overlay: drag onto a CapCut track above your clip`);
