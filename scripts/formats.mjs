// Render the same timeline in 9:16, 1:1 and 16:9. Extra args are passed to render.mjs.
import { execFileSync } from 'node:child_process';
const extra = process.argv.slice(2);
for (const [w, h, name] of [[1080, 1920, '9x16'], [1080, 1080, '1x1'], [1920, 1080, '16x9']]) {
  console.log(`\n== ${name}`);
  execFileSync(process.execPath, ['render.mjs', '--w', String(w), '--h', String(h), '--out', `out/final_${name}_silent.mp4`, ...extra], { stdio: 'inherit' });
}
