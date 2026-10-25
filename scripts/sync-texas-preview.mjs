import {existsSync,mkdirSync,readFileSync,copyFileSync,writeFileSync,statSync} from 'node:fs';
import {join} from 'node:path';
import {ROOT} from '../lib/project.mjs';
import {writeStudioRoot} from '../lib/remotion-projects.mjs';
const folder=join(ROOT,'projects/texas-cinema-myth'),target=join(ROOT,'remotion/public/texas-cinema-myth');mkdirSync(target,{recursive:true});
copyFileSync(join(folder,'assets/keyframes/01.png'),join(target,'01.png'));
const video=join(folder,'assets/shots/01-h3.mp4');
const spec={duration:4,image:'texas-cinema-myth/01.png',video:null,status:'keyframe',note:'Work preview only; not a completed story video.'};
if(existsSync(video)){copyFileSync(video,join(target,'01-h3.mp4'));spec.video='texas-cinema-myth/01-h3.mp4';spec.version=Math.trunc(statSync(video).mtimeMs);spec.status='H3 source review';}
writeFileSync(join(ROOT,'remotion/texas-preview.json'),JSON.stringify(spec,null,2)+'\n');
writeStudioRoot(ROOT,readFileSync(join(ROOT,'remotion/index.jsx'),'utf8'));
console.log('Texas first-shot preview: http://localhost:3002/texas-cinema-myth-workbench ('+spec.status+')');
