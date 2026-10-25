import {spawn} from 'node:child_process';
import {existsSync,readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {ROOT} from '../lib/project.mjs';
import {probe,ffmpeg} from '../lib/ffmpeg.mjs';
const folder=join(ROOT,'projects/texas-cinema-myth'),watch=process.argv.includes('--watch'),cache=join(ROOT,'.cache/texas-cinema-myth');mkdirSync(cache,{recursive:true});
const startIndex=Number(process.argv.find(a=>a.startsWith('--start='))?.split('=')[1]||2);
const hash=file=>createHash('sha256').update(readFileSync(file)).digest('hex');
for(let n=startIndex;n<=23;n++){
 const id=String(n).padStart(2,'0'),prompt=join(folder,'prompts/motion',id+'.txt');
 let scene;
 for(;;){
  const plan=JSON.parse(readFileSync(join(folder,'production-scenes.json'),'utf8'));scene=plan.scenes.find(s=>s.id===id);
  if(scene&&existsSync(join(folder,scene.keyframe))&&existsSync(prompt))break;
  if(!watch)throw Error('Missing reviewed production source for shot '+id);
  console.log('Waiting for source artwork '+id+'; no render running.');await new Promise(resolve=>setTimeout(resolve,15000));
 }
 const image=join(folder,scene.keyframe),output=join(folder,'assets/shots/'+id+'-h3.mp4'),record=join(folder,'assets/shots/'+id+'-generation.json');
 const signature={imageHash:hash(image),promptHash:hash(prompt),modelManifestHash:hash(join(folder,'H3_MODELS.json')),generatorHash:hash(join(ROOT,'scripts/generate-h3-shot.mjs')),adapterHash:hash(join(ROOT,'lib/h3-studio-nodes.py')),width:352,height:640,frames:107,steps:8,turbo:true,seed:1957001+n*137};
 if(existsSync(output)){
  if(existsSync(record)&&JSON.stringify(JSON.parse(readFileSync(record,'utf8')).input)===JSON.stringify(signature)){console.log('Already generated '+id+'; visual review remains separate.');continue;}
  throw Error('Existing take differs; preserve it and select a new take ID before regenerating '+id);
 }
 // Native generation and encoding remain strictly sequential on the shared GPU.
 await new Promise((resolve,reject)=>{const child=spawn(process.execPath,[join(ROOT,'scripts/generate-h3-shot.mjs'),id+'-h3','--width','352','--height','640','--frames','107','--steps','8','--turbo','--seed',String(signature.seed),'--image',image,'--prompt',prompt],{cwd:ROOT,stdio:'inherit'});child.on('error',reject);child.on('exit',code=>code===0?resolve():reject(Error('H3 shot '+id+' failed ('+code+')')))});
 const metadata=probe(output);if(metadata.width!==352||metadata.height!==640||metadata.fps!==24||metadata.duration<4.25)throw Error('Invalid H3 source '+id);
 await ffmpeg(['-v','error','-i',output,'-f','null','-']);
 writeFileSync(record,JSON.stringify({input:signature,metadata,status:'Generated and decode-checked; visual review pending',createdAt:new Date().toISOString()},null,2)+'\n');
 console.log('Completed H3 source '+id+'/23; queued sources are not automatically creative-approved.');
}
console.log('All episode source clips generated. Assemble and inspect the complete film before delivery.');
