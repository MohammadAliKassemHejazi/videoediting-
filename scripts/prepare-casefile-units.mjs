import {existsSync,readFileSync,writeFileSync,mkdirSync,openSync,closeSync,unlinkSync} from 'node:fs';
import {join} from 'node:path';
import {ROOT} from '../lib/project.mjs';
import {ffmpeg,probe} from '../lib/ffmpeg.mjs';
const project=process.argv[2];if(!/^[a-z0-9-]+$/.test(project||''))throw Error('Safe project ID required');
const folder=join(ROOT,'projects',project),plan=JSON.parse(readFileSync(join(folder,'production-scenes.json'),'utf8')),out=join(ROOT,'.cache',project,'four-second-units');mkdirSync(out,{recursive:true});
const lock=join(ROOT,'.cache/render.lock'),fd=openSync(lock,'wx');writeFileSync(fd,String(process.pid));
try{
 for(const shot of plan.scenes){const source=join(folder,'assets/shots',shot.id+'-h3.mp4'),output=join(out,shot.id+'.mp4');if(!existsSync(output))await ffmpeg(['-threads','2','-ss','0.125','-i',source,'-frames:v','96','-an','-c:v','libx264','-preset','fast','-crf','17','-pix_fmt','yuv420p','-movflags','+faststart',output]);const m=probe(output);if(m.width!==352||m.height!==640||m.fps!==24||Math.abs(m.duration-4)>.015)throw Error('Exact4s unit failed '+shot.id);console.log('Verified4s performance unit '+shot.id)}
 writeFileSync(join(out,'units.json'),JSON.stringify({sourceHandlesPreserved:true,durationPerUnit:4,framesPerUnit:96,fps:24,count:plan.scenes.length,note:'Generated source handles are preserved. The final voiced film trims/retimes these performances to semantic cut lengths.'},null,2)+'\n');
}finally{closeSync(fd);unlinkSync(lock)}
