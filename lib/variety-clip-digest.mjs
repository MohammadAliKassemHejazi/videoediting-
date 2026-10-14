import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
export function varietyClipDigest(root,id){const cfg=JSON.parse(readFileSync(join(root,'projects',id,'project.json'),'utf8'));return createHash('sha256').update(cfg.sourceHash).update(JSON.stringify(cfg.shots)).update(readFileSync(join(root,'lib/variety-draw.js'))).update(readFileSync(join(root,'lib/variety-clip-spec.mjs'))).update(readFileSync(join(root,'lib/variety-clip-graphics.js'))).update(readFileSync(join(root,'projects',id,'scenes.js'))).update(readFileSync(join(root,'projects',id,'assets/sfx.wav'))).digest('hex')}
