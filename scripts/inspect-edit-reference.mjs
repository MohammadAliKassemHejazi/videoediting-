import {mkdirSync,writeFileSync,readdirSync} from 'node:fs';
import {join} from 'node:path';
import {ROOT} from '../lib/project.mjs';
import {ffmpeg,probe} from '../lib/ffmpeg.mjs';
const romance=process.argv[2]==='romance',name=romance?readdirSync(ROOT).find(f=>f.startsWith('He')&&f.includes('got places')&&f.endsWith('.mp4')):'اهم إصدارات و تحديثات اوبن اي آي.mp4';if(!name)throw Error('Missing named story reference');const file=join(ROOT,name),folder=join(ROOT,'out',romance?'reference-romance':'reference-openai');mkdirSync(folder,{recursive:true});const meta=probe(file);console.log({file,...meta});
const times=romance?Array.from({length:12},(_,i)=>Number((.1+(meta.duration-.25)*i/11).toFixed(3))):[.2,1.2,2.5,4,5.5,7,9,12,15,20,25,30].filter(t=>t<meta.duration);for(const t of times)await ffmpeg(['-ss',String(t),'-i',file,'-frames:v','1','-vf','scale=360:640:force_original_aspect_ratio=decrease,pad=360:640:(ow-iw)/2:(oh-ih)/2','-an',join(folder,'frame-'+t+'.png')]);
await ffmpeg([...times.flatMap(t=>['-i',join(folder,'frame-'+t+'.png')]),'-filter_complex','[0:v][1:v][2:v][3:v]hstack=inputs=4[a];[4:v][5:v][6:v][7:v]hstack=inputs=4[b];[8:v][9:v][10:v][11:v]hstack=inputs=4[c];[a][b][c]vstack=inputs=3','-frames:v','1',join(folder,'contact.png')]);
writeFileSync(join(folder,'reference.json'),JSON.stringify({file,meta,times},null,2)+'\n');
