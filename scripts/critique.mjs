// Diagnostic images for the vision self-critique loop.
//   node scripts/critique.mjs [video=out/final.mp4] [stripAt=4.1]
import { mkdirSync } from 'node:fs';
import { duration, ffmpeg } from '../lib/ffmpeg.mjs';
const [input = 'out/final.mp4', at = '4.1'] = process.argv.slice(2);
mkdirSync('out', { recursive: true });
await Promise.all([
  // 1. Macro pacing contact sheet (2 fps, 6 columns)
  ffmpeg(['-i', input, '-vf', 'fps=2,scale=270:-1,tile=6x5', '-frames:v', '1', 'out/contact.png']),
  // 2. Frame strip (12 frames around an action beat)
  ffmpeg(['-ss', at, '-i', input, '-vf', 'scale=320:-1,tile=12x1', '-frames:v', '1', 'out/strip.png']),
  // 3. Mobile simulation (360px wide)
  ffmpeg(['-i', input, '-vf', 'fps=1,scale=360:-1,tile=5x3', '-frames:v', '1', 'out/phone.png']),
  // 4. Poster frame (thumbnail) at 1/3 of the film
  ffmpeg(['-ss', String(duration(input) / 3), '-i', input, '-frames:v', '1', 'out/poster.png']),
  // 5. Loop seam check (sequence played twice)
  ffmpeg(['-stream_loop', '1', '-i', input, '-c', 'copy', 'out/loop_check.mp4'])
]);
console.log('Wrote out/contact.png out/strip.png out/phone.png out/poster.png out/loop_check.mp4');
console.log('Next: run the evaluation prompt in prompts/evaluation.md');
