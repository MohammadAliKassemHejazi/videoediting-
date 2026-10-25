import {existsSync,mkdirSync} from 'node:fs';
import {ffmpeg} from '../lib/ffmpeg.mjs';
mkdirSync('out/texas-cinema-myth',{recursive:true});
const ids=process.argv.slice(2);
for(const id of ids){
 if(!/^\d{2}(?:-[a-z0-9-]+)?$/.test(id))throw Error('Invalid shot ID');
 const source=`projects/texas-cinema-myth/assets/shots/${id}${id.length===2?'-h3':''}.mp4`;
 if(!existsSync(source))throw Error('Source not generated: '+source);
 await ffmpeg(['-i',source,'-vf','fps=2,scale=220:400,tile=3x3','-frames:v','1',`out/texas-cinema-myth/${id}-contact.png`]);
 await ffmpeg(['-i',source,'-frames:v','1',`out/texas-cinema-myth/${id}-first.png`]);
 console.log('Contact ready: '+id+'; visual inspection is separate.');
}
