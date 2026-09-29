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

// Load the timeline in Node (for SFX cues and b-roll).
const sandbox = { Motion: {} };
sandbox.window = sandbox;
vm.createContext(sandbox);
vm.runInContext(readFileSync('lib/overlay-kit.js', 'utf8'), sandbox);
vm.runInContext(readFileSync(timeline, 'utf8'), sandbox);
const TL = sandbox.OVERLAY;

// 2) SFX from the timeline events.
if (SFX) {
  const cues = sandbox.OverlayKit.cuesFor(TL);
  const cuesFile = `out/${name}_cues.json`;
  writeFileSync(cuesFile, JSON.stringify(cues, null, 2));
  node(['sfx.mjs', cuesFile, SFX_WAV, '--dur', String(info.duration)]);
}

// 3) Composite: clip → b-roll inserts → graphics; original audio + SFX, loudness -14 LUFS.
//    b-roll: { type: 'broll', src: 'assets/ready/x.mp4', t, dur, mode: 'full' | 'pip', x, y, w, from }
const broll = (TL.elements || []).filter((e) => e.type === 'broll' && e.src);
for (const b of broll) if (!existsSync(b.src)) { console.error(`b-roll not found: ${b.src} (run npm run assets)`); process.exit(1); }
const cfgEnc = String(opt('encoder', 'x264'));
const venc = cfgEnc === 'nvenc' || cfgEnc === 'qsv'
  ? ENCODERS[cfgEnc].args
  : ['-c:v', 'libx264', '-preset', 'fast', '-crf', '18', '-pix_fmt', 'yuv420p'];
const inputs = ['-i', clip, '-i', OVERLAY, ...(SFX ? ['-i', SFX_WAV] : [])];
const W = info.width, H = info.height;
const vparts = [];
let base = '[0:v]';
broll.forEach((b, i) => {
  const idx = inputs.length / 2;
  inputs.push('-i', b.src);
  const dur = b.dur ?? 2, from = b.from ?? 0;
  const full = (b.mode || 'full') === 'full';
  const bw = full ? W : Math.round(((b.w ?? 0.45) * W) / 2) * 2;
  const fit = full
    ? `scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H}`
    : `scale=${bw}:-2`;
  const x = full ? 0 : `${Math.round((b.x ?? 0.5) * W)}-w/2`;
  const y = full ? 0 : `${Math.round((b.y ?? 0.35) * H)}-h/2`;
  vparts.push(`[${idx}:v]trim=start=${from}:duration=${dur},setpts=PTS-STARTPTS+${b.t}/TB,${fit},setsar=1[b${i}]`);
  vparts.push(`${base}[b${i}]overlay=x=${x}:y=${y}:eof_action=pass:enable='between(t,${b.t},${b.t + dur})'[v${i}]`);
  base = `[v${i}]`;
});
vparts.push(`${base}[1:v]overlay=0:0:format=auto:eof_action=pass,format=yuv420p[v]`);
// Voice-overs: { type: 'voice', src: 'assets/ready/x.wav', t, volume }
const voices = (TL.elements || []).filter((e) => e.type === 'voice' && e.src);
for (const v of voices) if (!existsSync(v.src)) { console.error(`voice not found: ${v.src} (run npm run assets)`); process.exit(1); }
const vo = voices.map((v, i) => {
  const idx = inputs.length / 2;
  inputs.push('-i', v.src);
  const ms = Math.round(v.t * 1000);
  return { label: `[vo${i}]`, filter: `[${idx}:a]adelay=${ms}|${ms},volume=${v.volume ?? 1}[vo${i}]` };
});
let audio;
if (vo.length) {
  // Mix original audio (ducked a little under voice-over), SFX and voices.
  const srcs = [];
  const pre = vo.map((v) => v.filter);
  if (info.audio) { pre.push(`[0:a]volume=${opt('bg-volume', 0.8)}[orig]`); srcs.push('[orig]'); }
  if (SFX) { pre.push(`[2:a]volume=${SFX_VOL}[s]`); srcs.push('[s]'); }
  srcs.push(...vo.map((v) => v.label));
  audio = pre.join(';') + `;${srcs.join('')}amix=inputs=${srcs.length}:duration=longest:normalize=0,apad,atrim=0:${info.duration},loudnorm=I=-14:TP=-1.5:LRA=11[a]`;
} else if (info.audio && SFX) audio = `[2:a]volume=${SFX_VOL}[s];[0:a][s]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11[a]`;
else if (info.audio) audio = `[0:a]loudnorm=I=-14:TP=-1.5:LRA=11[a]`;
else if (SFX) audio = `[2:a]volume=${SFX_VOL},loudnorm=I=-14:TP=-1.5:LRA=11[a]`;
const graph = vparts.join(';') + (audio ? ';' + audio : '');
console.log(`Compositing${broll.length ? ` (+${broll.length} b-roll)` : ''}…`);
await ffmpeg([...inputs, '-filter_complex', graph, '-map', '[v]', ...(audio ? ['-map', '[a]', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000'] : []),
  ...venc.filter((a, i, all) => !['-map_metadata', '-fflags', '-flags:v'].includes(a) && !['-map_metadata', '-fflags', '-flags:v'].includes(all[i - 1])),
  '-r', String(fps), '-t', String(info.duration), '-movflags', '+faststart', OUT]);

if (!CAPCUT) rmSync(OVERLAY, { force: true });
console.log(`\nDone:\n  ${OUT}   ← upload this`);
if (CAPCUT) console.log(`  ${OVERLAY}   ← transparent overlay: drag onto a CapCut track above your clip`);
