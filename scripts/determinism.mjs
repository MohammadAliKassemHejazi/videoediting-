// Render the first 3s twice and compare hashes. Identical hashes = deterministic film.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
const hash = (f) => createHash('md5').update(readFileSync(f)).digest('hex');
const render = (out) => execFileSync(process.execPath, ['render.mjs', '--dur', '3', '--fps', '60', '--sub', '1', '--out', out], { stdio: 'ignore' });
render('out/det_a.mp4');
render('out/det_b.mp4');
const a = hash('out/det_a.mp4'), b = hash('out/det_b.mp4');
console.log(`pass 1: ${a}\npass 2: ${b}`);
if (a === b) console.log('DETERMINISTIC ✓');
else { console.log('NON-DETERMINISTIC ✗'); process.exit(1); }
