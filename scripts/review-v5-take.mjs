import {mkdirSync} from 'node:fs';
import {ffmpeg,probe} from '../lib/ffmpeg.mjs';
const id=process.argv[2];
if(!/^\d{2}(?:-[a-z0-9-]+)?$/.test(id||''))throw Error('Expected a safe take ID');
const input=`projects/texas-ten-thousand-steps/assets/shots/${id}.mp4`;
const out='.cache/texas-ten-thousand-steps/v5-review';mkdirSync(out,{recursive:true});
console.log(probe(input));
for(const [name,time] of [['open',.125],['middle',2.1],['close',4.0]]){
 await ffmpeg(['-ss',String(time),'-i',input,'-frames:v','1','-update','1',`${out}/${id}-${name}.png`]);
}
