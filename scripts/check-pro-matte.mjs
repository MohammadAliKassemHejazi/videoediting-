import {ffmpeg,FFMPEG} from '../lib/ffmpeg.mjs';
import {spawnSync} from 'node:child_process';
await ffmpeg(['-ss','1','-i','.cache/backend-checklist/person-mask.mkv','-vf','scale=360:640','-frames:v','1','.cache/pro-clips/mask-check.png']);
await ffmpeg(['-c:v','libvpx-vp9','-i','remotion/public/pro-clips/person.webm','-ss','1','-vf','alphaextract,scale=360:640','-frames:v','1','.cache/pro-clips/alpha-check.png']);
for(const file of ['.cache/pro-clips/mask-check.png','.cache/pro-clips/alpha-check.png']){
 const r=spawnSync(FFMPEG,['-v','error','-i',file,'-vf','scale=36:64','-f','rawvideo','-pix_fmt','gray','-'],{maxBuffer:100000});if(r.status!==0)throw Error(String(r.stderr));
 console.log(file,{min:Math.min(...r.stdout),max:Math.max(...r.stdout),mean:r.stdout.reduce((a,b)=>a+b,0)/r.stdout.length});
}
