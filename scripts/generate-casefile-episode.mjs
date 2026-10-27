import {spawn} from 'node:child_process';
import {existsSync,readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {ROOT} from '../lib/project.mjs';
import {probe,ffmpeg} from '../lib/ffmpeg.mjs';
const project=process.argv[2];if(!/^[a-z0-9-]+$/.test(project||''))throw Error('Safe project ID required');
const folder=join(ROOT,'projects',project),cache=join(ROOT,'.cache',project),watch=process.argv.includes('--watch');mkdirSync(cache,{recursive:true});
const first=Number(process.argv.find(a=>a.startsWith('--start='))?.split('=')[1]||1);
const last=Number(process.argv.find(a=>a.startsWith('--end='))?.split('=')[1]||999);
const hash=file=>createHash('sha256').update(readFileSync(file)).digest('hex');
const plan=JSON.parse(readFileSync(join(folder,'production-scenes.json'),'utf8'));
for(const scene of plan.scenes.slice(first-1,last)){
 const id=scene.id,image=join(folder,scene.keyframe),prompt=join(folder,'prompts/motion',id+'.txt'),guide=scene.speaker?join(ROOT,'story-projects',project,'assets/speech-guides',id+'.wav'):null;
 for(;;){
  if(existsSync(image)&&existsSync(prompt)&&(!guide||existsSync(guide))&&!existsSync(join(ROOT,'.cache/render.lock'))){
   const html=await(await fetch('http://localhost:3002/texas-cinema-myth')).text();
   const m=html.match(/window\.remotion_initialRenderQueue = (.*?);<\/script>/);
   if(m&&!JSON.parse(m[1]).some(j=>['running','idle'].includes(j.status)))break;
  }
  if(!watch)throw Error('Missing reviewed art or active job for '+id);
  console.log('Waiting for artwork or clear GPU/render queue: '+id);await new Promise(r=>setTimeout(r,15000));
 }
 const output=join(folder,'assets/shots',id+'-h3.mp4'),record=join(folder,'assets/shots',id+'-generation.json');
 const input={imageHash:hash(image),promptHash:hash(prompt),audioGuideHash:guide?hash(guide):null,modelManifestHash:hash(join(folder,'H3_MODELS.json')),generatorHash:hash(join(ROOT,'scripts/generate-h3-casefile-shot.mjs')),adapterHash:hash(join(ROOT,'lib/h3-studio-nodes.py')),width:352,height:640,frames:107,steps:8,turbo:true,seed:1965001+Number(id)*137};
 if(existsSync(output)){
  if(existsSync(record)&&JSON.stringify(JSON.parse(readFileSync(record,'utf8')).input)===JSON.stringify(input)){console.log('Already generated '+id);continue;}
  throw Error('Preserve existing take with differing provenance: '+id);
 }
 await new Promise((resolve,reject)=>{const child=spawn(process.execPath,[join(ROOT,'scripts/generate-h3-casefile-shot.mjs'),id+'-h3','--project',project,'--width','352','--height','640','--frames','107','--steps','8','--turbo','--seed',String(input.seed),'--image',image,'--prompt',prompt,...(guide?['--audio',guide]:[])],{cwd:ROOT,stdio:'inherit',windowsHide:true});child.on('error',reject);child.on('exit',code=>code===0?resolve():reject(Error('H3 source failed '+id+' ('+code+')')))});
 const metadata=probe(output);if(metadata.width!==352||metadata.height!==640||metadata.fps!==24||Math.abs(metadata.duration-107/24)>.04)throw Error('Invalid H3 source '+id);
 await ffmpeg(['-threads','2','-i',output,'-f','null','-']);
 writeFileSync(record,JSON.stringify({input,metadata,status:'Generated and full-decode checked; visual review separate',createdAt:new Date().toISOString()},null,2)+'\n');
 console.log('Completed actual H3 source '+id+'/'+plan.scenes.length);
}
console.log('All actual source clips generated. Finishing and creative review remain.');
