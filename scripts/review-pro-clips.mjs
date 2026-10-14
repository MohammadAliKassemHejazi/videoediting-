import {readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {ROOT,project} from '../lib/project.mjs';
import {ffmpeg,FFMPEG,probe} from '../lib/ffmpeg.mjs';
import {PRO_CLIP_STYLES} from '../lib/pro-clip-spec.mjs';

// Review the exported files, rather than relying on renderer screenshots.
const source=project('backend-checklist').source;
function samples(file){
 const r=spawnSync(FFMPEG,['-hide_banner','-loglevel','error','-i',file,'-t','15','-vn','-ac','1','-ar','16000','-f','f32le','pipe:1'],{maxBuffer:4*1024*1024});
 if(r.status!==0)throw Error(r.stderr.toString());
 return Float32Array.from({length:r.stdout.length/4},(_,i)=>r.stdout.readFloatLE(i*4));
}
const original=samples(source),times=[.2,1.2,2.5,4,5.5,8.2,10.7,14.4];
for(const style of PRO_CLIP_STYLES){
 const folder=join(ROOT,'out',style.id),file=join(folder,'draft.mp4'),audio=samples(file);
 let best={correlation:-1};
 // +/- 20ms catches accidental offsets; compare speech after the hook transient.
 for(let lag=-320;lag<=320;lag++){
  let xx=0,yy=0,xy=0;
  for(let i=8000;i<Math.min(original.length,audio.length)-400;i+=4){const x=original[i],y=audio[i+lag];xx+=x*x;yy+=y*y;xy+=x*y;}
  const correlation=xy/Math.sqrt(xx*yy);
  if(correlation>best.correlation)best={correlation,lagMs:lag/16,estimatedVoiceGain:xy/xx};
 }
 let peak=0;for(const x of audio)peak=Math.max(peak,Math.abs(x));
 if(best.correlation<.97||Math.abs(best.lagMs)>2||Math.abs(best.estimatedVoiceGain-1)>.08||peak>=1)throw Error('Audio alignment/level failed '+style.id+' '+JSON.stringify({...best,peak}));
 for(const t of times)await ffmpeg(['-ss',String(t),'-i',file,'-frames:v','1','-vf','scale=360:640','-an',join(folder,`export-${t}.png`)]);
 await ffmpeg([...times.flatMap(t=>['-i',join(folder,`export-${t}.png`)]),'-filter_complex','[0:v][1:v][2:v][3:v]hstack=inputs=4[top];[4:v][5:v][6:v][7:v]hstack=inputs=4[bottom];[top][bottom]vstack=inputs=2','-frames:v','1',join(folder,'export-contact.png')]);
 const seam=style.id==='clip-redline'?8.85:style.id==='clip-acid-print'?7.88:style.id==='clip-chrome-depth'?8.6:3.14;
 const seamTimes=[seam-.08,seam-.0167,seam,seam+.1];
 for(let i=0;i<4;i++)await ffmpeg(['-ss',String(seamTimes[i]),'-i',file,'-frames:v','1','-vf','scale=270:480','-an',join(folder,`seam-${i}.png`)]);
 await ffmpeg([...seamTimes.flatMap((_,i)=>['-i',join(folder,`seam-${i}.png`)]),'-filter_complex','[0:v][1:v][2:v][3:v]hstack=inputs=4','-frames:v','1',join(folder,'export-seam.png')]);
 const report={file:'draft.mp4',...probe(file),audio:{...best,peak,listeningReview:false},frameTimes:times,seamTimes,checkedAt:new Date().toISOString()};
 writeFileSync(join(folder,'export-check.json'),JSON.stringify(report,null,2)+'\n');
 console.log(style.id,JSON.stringify(report.audio));
}
