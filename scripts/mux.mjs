// Mux silent video + audio, loudness-normalised to -14 LUFS. Audio is padded with silence
// or trimmed so the output always matches the video length exactly.
//   node scripts/mux.mjs [video=out/silent.mp4] [audio=out/sfx.wav] [out=out/final.mp4]
import { duration, ffmpeg } from '../lib/ffmpeg.mjs';
const [video = 'out/silent.mp4', audio = 'out/sfx.wav', out = 'out/final.mp4'] = process.argv.slice(2);
const d = duration(video).toFixed(3);
await ffmpeg([
  '-i', video, '-i', audio, '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy',
  '-af', `loudnorm=I=-14:TP=-1.5:LRA=11,apad=whole_dur=${d},atrim=0:${d}`,
  '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-t', d, out
]);
console.log(`Muxed: ${out} (${d}s)`);
