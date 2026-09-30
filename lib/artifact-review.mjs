import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
export const reviewInputs=['index.html','lib/artifact-studio.js','lib/export-artifact-film.mjs','lib/motion.js','overlays/developer-artifacts.js','overlays/developer-aligned.js','assets/demos/native-css.html','assets/demos/native/verification.json',...['has-off','has-on','container-wide','container-narrow','subgrid'].map(id=>`assets/demos/native/${id}.png`),'clips/0928(5).mp4'];
export const artifactHash=()=>{const hash=createHash('sha256');for(const path of reviewInputs)hash.update(path).update(readFileSync(path));return hash.digest('hex');};
