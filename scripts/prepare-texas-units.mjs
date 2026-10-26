import {readFileSync,writeFileSync,existsSync,mkdirSync,openSync,closeSync,unlinkSync} from 'node:fs';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {ROOT} from '../lib/project.mjs';
import {ffmpeg,probe} from '../lib/ffmpeg.mjs';
const folder=join(ROOT,'projects/texas-cinema-myth/assets/shots'),units=join(ROOT,'.cache/texas-cinema-myth/four-second-units');mkdirSync(units,{recursive:true});
const lock=join(ROOT,'.cache/render.lock'),fd=openSync(lock,'wx');writeFileSync(fd,String(process.pid));
const hash=file=>createHash('sha256').update(readFileSync(file)).digest('hex');
try{
 for(let n=1;n<=23;n++){
  const id=String(n).padStart(2,'0'),source=join(folder,id+'-h3.mp4'),output=join(units,id+'.mp4'),record=join(units,id+'.json'),sourceHash=hash(source);
  if(existsSync(output)){if(existsSync(record)&&JSON.parse(readFileSync(record,'utf8')).sourceHash===sourceHash)continue;throw Error('Preserve differing prior unit '+id)}
  await ffmpeg(['-threads','2','-ss','0.125','-i',source,'-an','-frames:v','96','-r','24','-c:v','libx264','-crf','17','-preset','fast','-pix_fmt','yuv420p',output]);
  const metadata=probe(output);if(metadata.width!==352||metadata.height!==640||metadata.fps!==24||Math.abs(metadata.duration-4)>.01)throw Error('Source-unit duration failed '+id);
  writeFileSync(record,JSON.stringify({sourceHash,sourceStart:.125,frames:96,duration:4,metadata,purpose:'Native intermediate performance unit, not a2K delivery export; the final master uses narrative editorial retiming'},null,2)+'\n');
 }
 console.log('All23 native intermediate units are exactly4s/96frames; original handles preserved.');
}finally{closeSync(fd);unlinkSync(lock)}
