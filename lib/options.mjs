// Render options: CLI flag → studio.config.json (per-machine, git-ignored) → default.
// `npm run bench` writes studio.config.json with the fastest settings for your machine.
import { existsSync, readFileSync } from 'node:fs';

let config = {};
if (existsSync('studio.config.json')) {
  try { config = JSON.parse(readFileSync('studio.config.json', 'utf8')); }
  catch (e) { console.warn(`Ignoring studio.config.json: ${e.message}`); }
}

export function opt(k, d, argv = process.argv) {
  const i = argv.indexOf('--' + k);
  if (i > 0) {
    const v = argv[i + 1];
    return v === undefined || v.startsWith('--') ? true : v; // bare flag → true
  }
  return config[k] ?? d;
}

export { config };
