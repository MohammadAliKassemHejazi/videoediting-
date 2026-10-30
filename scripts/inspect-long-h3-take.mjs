import {mkdirSync} from 'node:fs';
import {ffmpeg} from '../lib/ffmpeg.mjs';
const take=process.argv[2];if(!/^(opening|ending)-v9-15s$/.test(take||''))throw Error('Expected V9 long take');
mkdirSync('.cache/texas-ten-thousand-steps/v9-review',{recursive:true});
const close=process.argv.includes('--javelina'),frames=close?[96,108,120,132,144,156,162,168]:[12,60,108,156,204,252,300,348];
const select=frames.map(n=>`eq(n\\,${n})`).join('+');
await ffmpeg(['-i',`projects/texas-ten-thousand-steps/assets/shots/${take}.mp4`,'-vf',`select=${select},scale=320:576,tile=4x2`,'-frames:v','1','-update','1',`.cache/texas-ten-thousand-steps/v9-review/${take}${close?'-javelina':''}.png`]);
