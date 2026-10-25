import {readFileSync,writeFileSync,mkdirSync,copyFileSync,existsSync,openSync,closeSync,unlinkSync} from 'node:fs';
import {join,resolve,relative} from 'node:path';
import {randomUUID} from 'node:crypto';
import {ROOT} from '../lib/project.mjs';
const [id,...args]=process.argv.slice(2),opt=(name,fallback)=>{const n=args.indexOf('--'+name);return n<0?fallback:args[n+1]};
if(!id||!/^[a-z0-9-]+$/.test(id))throw Error('Provide a safe shot ID');
const folder=join(ROOT,'projects/texas-cinema-myth'),base=join(ROOT,'.cache/h3-engine'),cache=join(ROOT,'.cache/texas-cinema-myth'),engine='http://127.0.0.1:8189';
const turbo=args.includes('--turbo');
const width=Number(opt('width',320)),height=Number(opt('height',576)),frames=Number(opt('frames',107)),steps=Number(opt('steps',turbo?8:16)),seed=Number(opt('seed',1957001));
if(![width,height,frames,steps,seed].every(Number.isFinite)||width%32||height%32||width<128||height<128||frames<22||frames>362||(frames-5)%17||steps<1||steps>60)throw Error('Invalid H3 sampling geometry');
const image=resolve(ROOT,opt('image','projects/texas-cinema-myth/assets/keyframes/01.png'));
if(relative(ROOT,image).startsWith('..'))throw Error('Keep source art inside workspace');
mkdirSync(cache,{recursive:true});mkdirSync(join(base,'input'),{recursive:true});mkdirSync(join(folder,'assets/shots'),{recursive:true});
const sourceName='texas-'+id+'.png';copyFileSync(image,join(base,'input',sourceName));
const text=readFileSync(resolve(ROOT,opt('prompt','projects/texas-cinema-myth/prompts/motion/01.txt')),'utf8');
const graph={
 '1':{class_type:'StudioH3UNETLoaderGGUF',inputs:{unet_name:'minimax_h3_fl2va_pruned-Q3_K.gguf'}},
 '2':{class_type:'StudioH3CLIPLoaderGGUF',inputs:{clip_name:'qwen3vl_32b_minimax_h3-Q2_K_M.gguf'}},
 '3':{class_type:'VAELoader',inputs:{vae_name:'minimax_h3_video_vae_int8_convrot.safetensors'}},
 '4':{class_type:'LoadImage',inputs:{image:sourceName}},
 '5':{class_type:'MiniMaxH3ImageToVideo',inputs:{clip:['2',0],vae:['3',0],prompt:text,width,height,length:frames,first_frame:['4',0]}},
 '6':{class_type:'MiniMaxH3SigmaShift',inputs:{model:['1',0],shift_video:12,shift_audio:3}},
 '7':{class_type:'BasicGuider',inputs:{model:['6',0],conditioning:['5',0]}},
 '8':{class_type:'RandomNoise',inputs:{noise_seed:seed}},
 '9':{class_type:'KSamplerSelect',inputs:{sampler_name:turbo?'euler':'res_multistep'}},
 '10':{class_type:'BasicScheduler',inputs:{model:['6',0],scheduler:'simple',steps,denoise:1}},
 '11':{class_type:'SamplerCustomAdvanced',inputs:{noise:['8',0],guider:['7',0],sampler:['9',0],sigmas:['10',0],latent_image:['5',1]}},
 '12':{class_type:'LTXVSeparateAVLatent',inputs:{av_latent:['11',0]}},
 '13':{class_type:'SaveLatent',inputs:{samples:['12',0],filename_prefix:'texas-cinema-myth/'+id}}
};
if(turbo){graph['14']={class_type:'LoraLoaderModelOnly',inputs:{model:['1',0],lora_name:'minimax_h3_fl2v_turbo_8step_v1.0_comfyui_bf16.safetensors',strength_model:1}};graph['6'].inputs.model=['14',0];}
const lock=join(ROOT,'.cache/render.lock');let fd;
try{fd=openSync(lock,'wx');writeFileSync(fd,String(process.pid))}catch{throw Error('Wait for the active render or generation')}
async function run(stage,nodes,target){
 const response=await fetch(engine+'/prompt',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt:nodes,client_id:randomUUID()})});const submitted=await response.json();
 if(!response.ok||submitted.error)throw Error(JSON.stringify(submitted));
 const promptId=submitted.prompt_id;writeFileSync(join(cache,id+'-'+stage+'-submitted.json'),JSON.stringify({promptId,width,height,frames,steps,seed,graph:nodes,startedAt:new Date().toISOString()},null,2)+'\n');
 console.log('Queued H3 '+id+' '+stage+' '+promptId);
 for(let poll=0;;poll++){
  const history=await(await fetch(engine+'/history/'+promptId)).json(),result=history[promptId];
  if(result){writeFileSync(join(cache,id+'-'+stage+'-history.json'),JSON.stringify(result,null,2)+'\n');if(result.status?.status_str==='error')throw Error(JSON.stringify(result.status.messages.filter(([type])=>type.includes('error')||type.includes('interrupted'))));if(result.outputs?.[target])return result.outputs[target];}
  if(poll%10===0)console.log(id+' '+stage+' waiting '+poll*3+'s');await new Promise(resolve=>setTimeout(resolve,3000));
 }
}
try{
 const output=await run('sample',graph,'13'),latent=output.latents[0],latentName='texas-'+id+'.latent';
 copyFileSync(join(base,'output',latent.subfolder,latent.filename),join(base,'input',latentName));
 await fetch(engine+'/free',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({unload_models:true,free_memory:true})});
 const decode={
  '3':graph['3'],'20':{class_type:'LoadLatent',inputs:{latent:latentName}},
  '21':{class_type:'VAEDecodeTiled',inputs:{samples:['20',0],vae:['3',0],tile_size:512,overlap:64,temporal_size:32,temporal_overlap:8}},
  '22':{class_type:'CreateVideo',inputs:{images:['21',0],fps:24}},
  '23':{class_type:'SaveVideo',inputs:{video:['22',0],filename_prefix:'texas-cinema-myth/'+id,format:'mp4',codec:'h264'}}
 };
 const saved=await run('decode',decode,'23'),video=saved.images[0],destination=join(folder,'assets/shots',id+'.mp4');
 if(existsSync(destination))throw Error('Preserve existing take; use a new shot/take ID');
 copyFileSync(join(base,'output',video.subfolder,video.filename),destination);
 console.log('Saved actual H3 source '+relative(ROOT,destination)+'; not yet visually reviewed.');
}finally{closeSync(fd);unlinkSync(lock)}
