import {join} from 'node:path';
import {ROOT} from '../lib/project.mjs';
import {ffmpeg} from '../lib/ffmpeg.mjs';
import {STYLES} from '../lib/style-auditions.js';
import {STORY_STYLES} from '../lib/story-painters.js';
const mode=process.argv[2]||'story';
if(mode==='mux'){
 const styles=process.argv[3]?[STYLES.find(s=>s.id===process.argv[3])]:STYLES.slice(0,5);
 if(styles.some(s=>!s))throw Error('Unknown style');
 for(const s of styles){
  const folder=join(ROOT,'out/backend-checklist/styles');
  for(const t of [1,5,12,14])await ffmpeg(['-ss',String(t),'-i',join(folder,s.id+'.mp4'),'-vf','scale=360:640','-frames:v','1',join(folder,`${s.id}-mux-${t}.png`)]);
  const inputs=[1,5,12,14].flatMap(t=>['-i',join(folder,`${s.id}-mux-${t}.png`)]);
  await ffmpeg([...inputs,'-filter_complex','[0:v][1:v][2:v][3:v]hstack=inputs=4','-frames:v','1',join(folder,`${s.id}-mux-contact.png`)]);
 }
}else if(mode==='story')for(const s of STORY_STYLES){
 const folder=join(ROOT,'out/pip-last-light');
 await ffmpeg(['-framerate','1','-start_number','0','-i',join(folder,`${s.id}-%d.png`),'-vf','tile=4x2','-frames:v','1',join(folder,`${s.id}-contact.png`)]);
}else for(const s of STYLES.slice(0,5)){
 const folder=join(ROOT,'out/backend-checklist/styles');
 const inputs=[1,5,12,14].flatMap(t=>['-i',join(folder,`${s.id}-${t}.png`)]);
 await ffmpeg([...inputs,'-filter_complex','[0:v][1:v][2:v][3:v]hstack=inputs=4','-frames:v','1',join(folder,`${s.id}-contact.png`)]);
}
