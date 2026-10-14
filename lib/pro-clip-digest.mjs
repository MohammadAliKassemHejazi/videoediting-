import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
export function proClipDigest(root,id){
 const config=JSON.parse(readFileSync(join(root,'projects',id,'project.json'),'utf8'));
 return createHash('sha256').update(config.sourceHash).update(readFileSync(join(root,'lib/pro-clip-spec.mjs'))).update(readFileSync(join(root,'lib/pro-clip-graphics.js'))).update(readFileSync(join(root,'projects',id,'assets/sfx.wav'))).digest('hex');
}
