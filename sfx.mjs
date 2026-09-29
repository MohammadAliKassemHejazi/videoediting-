// Procedural SFX: cues.json ([{ t, type }]) → 16-bit mono WAV.
//   node sfx.mjs [cues.json] [out/sfx.wav] [--dur 15]
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const SR = 48000;
const args = process.argv.slice(2).filter((a, i, all) => !a.startsWith('--') && !(all[i - 1] || '').startsWith('--'));
const durIdx = process.argv.indexOf('--dur');
const cuesPath = args[0] || 'cues.json';
const outPath = args[1] || 'out/sfx.wav';
const cues = JSON.parse(readFileSync(cuesPath, 'utf8'));

const maxT = Math.max(...cues.map((c) => c.t), 0);
const total = durIdx > 0 ? Number(process.argv[durIdx + 1]) : maxT + 2;
const buf = new Float32Array(Math.ceil(total * SR));

let seed = 42;
const noise = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 2147483648 - 1; };

const VOICES = {
  click:  [0.05, (t) => Math.sin(2 * Math.PI * 1800 * t) * Math.exp(-t * 90) * 0.5],
  pop:    [0.15, (t) => Math.sin(2 * Math.PI * (600 + 900 * t) * t) * Math.exp(-t * 30) * 0.4],
  thump:  [0.50, (t) => Math.sin(2 * Math.PI * (90 - 60 * t) * t) * Math.exp(-t * 9) * 0.9],
  whoosh: [0.35, (t) => noise() * Math.sin(Math.PI * Math.min(1, t / 0.35)) * 0.25]
};

for (const c of cues) {
  const voice = VOICES[c.type];
  if (!voice) { console.warn(`Unknown cue type "${c.type}" at ${c.t}s — skipped`); continue; }
  const [len, fn] = voice;
  const start = Math.floor(c.t * SR);
  const gain = c.gain ?? 1;
  for (let i = 0; i < len * SR && start + i < buf.length; i++) buf[start + i] += fn(i / SR) * gain;
}

const n = buf.length;
const wav = Buffer.alloc(44 + n * 2);
wav.write('RIFF', 0);
wav.writeUInt32LE(36 + n * 2, 4);
wav.write('WAVEfmt ', 8);
wav.writeUInt32LE(16, 16);
wav.writeUInt16LE(1, 20);       // PCM
wav.writeUInt16LE(1, 22);       // mono
wav.writeUInt32LE(SR, 24);
wav.writeUInt32LE(SR * 2, 28);
wav.writeUInt16LE(2, 32);
wav.writeUInt16LE(16, 34);
wav.write('data', 36);
wav.writeUInt32LE(n * 2, 40);
for (let i = 0; i < n; i++) {
  wav.writeInt16LE(Math.round(Math.max(-1, Math.min(1, buf[i])) * 32767), 44 + i * 2);
}

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, wav);
console.log(`Synthesized audio written to ${outPath}`);
