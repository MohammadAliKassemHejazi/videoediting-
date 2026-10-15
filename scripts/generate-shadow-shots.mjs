import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {join} from 'node:path';
import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
import {ROOT} from '../lib/project.mjs';
import {probe} from '../lib/ffmpeg.mjs';

const spec=JSON.parse(readFileSync(join(ROOT,'story-projects/shadow-went-first/director.json'),'utf8')),folder=join(ROOT,'story-projects',spec.id),watch=process.argv.includes('--watch');
const only=process.argv.includes('--only')?process.argv[process.argv.indexOf('--only')+1]:null;
for(const shot of spec.shots.filter(s=>!only||s.id===only)){
 const image=join(folder,shot.image),prompt=join(ROOT,shot.promptFile),output=join(folder,shot.file),record=join(ROOT,'.cache',spec.id,shot.id+'-accepted-generation.json');
 while(!existsSync(image)){if(!watch)throw Error('Missing directed keyframe '+image);console.log('Waiting for directed keyframe '+shot.id);await new Promise(r=>setTimeout(r,15000));}
 const settings={frames:shot.frames,width:448,height:800,steps:4,cfg:1,shift:5,seed:shot.seed??271828+Number(shot.id)*101,lora:'Wan22_TI2V_5B_Turbo_lora_rank_64_fp16.safetensors',tile:512,temporal:32};
 const digest=createHash('sha256').update(readFileSync(image)).update(readFileSync(prompt)).update(JSON.stringify(settings)).update(readFileSync(join(ROOT,'scripts/generate-local-shot.mjs'))).digest('hex');
 if(existsSync(output)&&existsSync(record)&&JSON.parse(readFileSync(record,'utf8')).sourceDigest===digest){console.log('Keep completed shot '+shot.id);continue}
 console.log('Generating original story shot '+shot.id+' / '+spec.shots.length+' ('+shot.duration.toFixed(2)+'s of story)');
 const args=['scripts/generate-local-shot.mjs',shot.id,'--folder','story-projects/'+spec.id,'--image',shot.image,'--prompt-file',shot.promptFile,...Object.entries(settings).flatMap(([k,v])=>['--'+k,String(v)]),'--decode','tiled'];
 await new Promise((resolve,reject)=>{const child=spawn(process.execPath,args,{cwd:ROOT,stdio:'inherit'});child.on('error',reject);child.on('exit',code=>code===0?resolve():reject(Error('Shot '+shot.id+' failed with '+code)))});
 const meta=probe(output);if(meta.fps!==24||meta.duration<shot.in+shot.duration-.02)throw Error('Shot '+shot.id+' is too short or has unexpected fps.');
 writeFileSync(record,JSON.stringify({id:shot.id,sourceDigest:digest,settings,...meta,review:'Generation complete; actual acting review still required.'},null,2)+'\n');
 await new Promise((resolve,reject)=>{const sync=spawn(process.execPath,['scripts/sync-shadow-preview.mjs'],{cwd:ROOT,stdio:'inherit'});sync.on('error',reject);sync.on('exit',code=>code===0?resolve():reject(Error('Preview sync failed.')))});
}
console.log('All requested original story shots generated.');
