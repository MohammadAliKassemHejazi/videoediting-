// Generated media (images, video, voice) for your films and TikTok overlays.
//
// FREE workflow (Gemini app, no API):
//   1. assets/manifest.json lists what's needed (Claude writes it with prompts/G_asset_requests.txt).
//   2. npm run assets           → writes docs/asset_requests.md: copy-paste prompts + exact file names.
//   3. Generate each item in the Gemini app, download, save into assets/inbox/ with that name
//      (any extension: .png .jpg .webp .mp4 .mov .mp3 .wav).
//   4. npm run assets           → converts them into assets/ready/ (green screen removed, formats fixed)
//                                 and shows what's still missing.
//
// PAID workflow (optional, later): put FAL_KEY / ELEVENLABS_API_KEY in .env, then
//   npm run assets -- --generate   → creates the missing items automatically, then prepares them.
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { extname, join, basename } from 'node:path';
import { ffmpeg } from '../lib/ffmpeg.mjs';

const MANIFEST = 'assets/manifest.json';
const INBOX = 'assets/inbox';
const READY = 'assets/ready';
const SHEET = 'docs/asset_requests.md';
for (const d of [INBOX, READY, 'docs']) mkdirSync(d, { recursive: true });

if (!existsSync(MANIFEST)) {
  console.log(`No ${MANIFEST} yet.
Create one by asking Claude (prompts/G_asset_requests.txt), or copy assets/manifest.example.json to ${MANIFEST}.`);
  process.exit(0);
}
const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8'));
const items = manifest.items || [];

// ---------- prompt building ----------
const GREEN = 'Place the subject on a solid, flat, pure green (#00FF00) background, like a green screen. ' +
  'No shadows on the background, no green anywhere on the subject, whole subject visible with some margin, no text.';
function fullPrompt(it) {
  const parts = [it.prompt.trim().replace(/([^.!?])$/, '$1.')];
  if (it.type === 'image') {
    if (it.style || manifest.style) parts.push(`Style: ${it.style || manifest.style}.`);
    if (it.background === 'green') parts.push(GREEN);
    parts.push(`Aspect ratio ${it.aspect || '1:1'}.`);
  } else if (it.type === 'video') {
    if (it.style || manifest.style) parts.push(`Style: ${it.style || manifest.style}.`);
    parts.push(`Aspect ratio ${it.aspect || '9:16'}, about ${it.seconds || 8} seconds, no text or captions, no music.`);
  }
  return parts.join(' ');
}
const stem = (f) => basename(f, extname(f));
const readyName = (it) => stem(it.file) + (it.type === 'image' ? '.png' : it.type === 'video' ? '.mp4' : '.wav');
const readyPath = (it) => join(READY, readyName(it));
const findInbox = (it) => {
  const want = stem(it.file).toLowerCase();
  return readdirSync(INBOX).map((f) => join(INBOX, f)).find((f) => stem(f).toLowerCase() === want);
};

// ---------- optional paid generation ----------
function loadEnv() {
  if (!existsSync('.env')) return;
  for (const line of readFileSync('.env', 'utf8').split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (m && m[2] && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
async function download(url, file) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`download failed ${r.status}`);
  writeFileSync(file, Buffer.from(await r.arrayBuffer()));
}
async function falRun(model, body) {
  const r = await fetch(`https://fal.run/${model}`, {
    method: 'POST',
    headers: { Authorization: `Key ${process.env.FAL_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!r.ok) throw new Error(`fal ${model}: ${r.status} ${await r.text()}`);
  return r.json();
}
const FAL_SIZES = { '1:1': 'square_hd', '9:16': 'portrait_16_9', '16:9': 'landscape_16_9', '4:3': 'landscape_4_3', '3:4': 'portrait_4_3' };
async function generate(it) {
  const prompt = fullPrompt(it);
  if (it.type === 'image' && process.env.FAL_KEY) {
    const model = process.env.FAL_IMAGE_MODEL || 'fal-ai/flux/schnell';
    const res = await falRun(model, { prompt, image_size: FAL_SIZES[it.aspect || '1:1'] || 'square_hd' });
    const url = res.images?.[0]?.url;
    if (!url) throw new Error('no image in response');
    await download(url, join(INBOX, stem(it.file) + '.png'));
    return true;
  }
  if (it.type === 'video' && process.env.FAL_KEY) {
    const model = process.env.FAL_VIDEO_MODEL || 'fal-ai/kling-video/v2.1/standard/text-to-video';
    const res = await falRun(model, { prompt, aspect_ratio: it.aspect || '9:16', duration: String(it.seconds && it.seconds <= 5 ? 5 : 10) });
    const url = res.video?.url;
    if (!url) throw new Error('no video in response');
    await download(url, join(INBOX, stem(it.file) + '.mp4'));
    return true;
  }
  if (it.type === 'voice' && process.env.ELEVENLABS_API_KEY) {
    const voice = it.voice_id || process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
      method: 'POST',
      headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
      body: JSON.stringify({ text: it.text || it.prompt, model_id: process.env.ELEVENLABS_MODEL || 'eleven_multilingual_v2' })
    });
    if (!r.ok) throw new Error(`ElevenLabs ${r.status} ${await r.text()}`);
    writeFileSync(join(INBOX, stem(it.file) + '.mp3'), Buffer.from(await r.arrayBuffer()));
    return true;
  }
  return false;
}

// ---------- preparation ----------
async function prepare(it, src) {
  const out = readyPath(it);
  if (it.type === 'image') {
    const filters = [];
    if (it.background === 'green') {
      filters.push(`colorkey=0x00FF00:${it.key_similarity ?? 0.3}:${it.key_blend ?? 0.08}`, 'despill=type=green');
      // Gemini puts a small sparkle watermark in the bottom-right corner; erase that corner on keyed images.
      if (it.clean_corner !== false) filters.push("format=rgba,geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='if(gt(X,W*0.86)*gt(Y,H*0.86),0,alpha(X,Y))'");
    }
    filters.push('format=rgba');
    await ffmpeg(['-i', src, '-vf', filters.join(','), '-frames:v', '1', out]);
  } else if (it.type === 'video') {
    await ffmpeg(['-i', src, '-c:v', 'libx264', '-preset', 'fast', '-crf', '18', '-pix_fmt', 'yuv420p',
      ...(it.keep_audio ? ['-c:a', 'aac'] : ['-an']), '-movflags', '+faststart', out]);
  } else if (it.type === 'voice') {
    await ffmpeg(['-i', src, '-ar', '48000', '-ac', '1', out]);
  }
}

// ---------- main ----------
const GENERATE = process.argv.includes('--generate');
if (GENERATE) loadEnv();

const rows = [];
for (const it of items) {
  let src = findInbox(it);
  if (!src && GENERATE) {
    try {
      process.stdout.write(`Generating ${it.file}… `);
      const ok = await generate(it);
      console.log(ok ? 'done' : 'skipped (no API key for this type)');
      src = findInbox(it);
    } catch (e) { console.log(`failed: ${e.message}`); }
  }
  let status = 'missing';
  if (src) {
    const out = readyPath(it);
    const fresh = existsSync(out) && statSync(out).size > 0 && statSync(out).mtimeMs >= statSync(src).mtimeMs;
    if (!fresh) {
      try { await prepare(it, src); } catch (e) { console.error(`Could not prepare ${src}: ${e.message}`); }
    }
    status = existsSync(out) ? 'ready' : 'error';
  }
  rows.push({ it, status });
}

// Checklist for the Gemini app.
const icon = { ready: '✅', missing: '⬜', error: '⚠️' };
let md = `# Asset requests${manifest.project ? `: ${manifest.project}` : ''}\n\n` +
  `Generate each item in the **Gemini app** (gemini.google.com): images with the image tool, videos with the video (Veo) tool.\n` +
  `Download it and save it into \`assets/inbox/\` with **exactly the file name shown** (any extension is fine).\n` +
  `Then run \`npm run assets\` again: finished files appear in \`assets/ready/\`.\n\n`;
rows.forEach(({ it, status }, i) => {
  md += `## ${icon[status]} ${i + 1}. \`${stem(it.file)}\` (${it.type}${it.type === 'voice' ? '' : `, ${it.aspect || (it.type === 'image' ? '1:1' : '9:16')}`})\n\n`;
  if (it.use) md += `**Used for:** ${it.use}\n\n`;
  if (it.type === 'voice') {
    md += `**Text to speak:**\n\n\`\`\`text\n${it.text || it.prompt}\n\`\`\`\n\nRecord it yourself (phone voice memo) or use a TTS tool, save as \`assets/inbox/${stem(it.file)}.mp3\`.\n\n`;
  } else {
    md += `**Prompt (copy into Gemini):**\n\n\`\`\`text\n${fullPrompt(it)}\n\`\`\`\n\n`;
    md += `**Save as:** \`assets/inbox/${stem(it.file)}.${it.type === 'image' ? 'png' : 'mp4'}\` → **used from:** \`${readyPath(it).replace(/\\/g, '/')}\`\n\n`;
  }
});
writeFileSync(SHEET, md);

// Console summary
const n = (s) => rows.filter((r) => r.status === s).length;
for (const { it, status } of rows) console.log(`${icon[status]}  ${it.type.padEnd(5)} ${stem(it.file).padEnd(32)} ${status === 'ready' ? readyPath(it).replace(/\\/g, '/') : status}`);
console.log(`\n${n('ready')}/${rows.length} ready. Prompts + file names: ${SHEET}`);
if (n('missing')) console.log(`Next: generate the missing items in Gemini, save them in ${INBOX}/, then run npm run assets again.`);
