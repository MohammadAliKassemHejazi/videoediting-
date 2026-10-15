import {readFileSync,writeFileSync,mkdirSync,copyFileSync,existsSync,openSync,closeSync,unlinkSync} from 'node:fs';
import {join,resolve,relative,basename} from 'node:path';
import {randomUUID} from 'node:crypto';
import {ROOT} from '../lib/project.mjs';

const [id,...args]=process.argv.slice(2),opt=(k,d)=>{const n=args.indexOf('--'+k);return n<0?d:args[n+1]};
if(!id||!/^[a-z0-9-]+$/.test(id))throw Error('Provide a safe shot ID.');
const inside=p=>{const r=relative(ROOT,p);if(r.startsWith('..')||resolve(ROOT,r)!==p)throw Error('Keep files in the workspace.');return p};
const folder=inside(resolve(ROOT,opt('folder','projects/warm-creature-story'))),project=basename(folder),cache=join(ROOT,'.cache',project),engine='http://127.0.0.1:8188';
mkdirSync(cache,{recursive:true});mkdirSync(join(folder,'assets/shots'),{recursive:true});
const frames=Number(opt('frames',97)),width=Number(opt('width',352)),height=Number(opt('height',640)),steps=Number(opt('steps',20)),seed=Number(opt('seed',271828)),cfg=Number(opt('cfg',5)),shift=Number(opt('shift',8));
if(![frames,width,height,steps,seed,cfg,shift].every(Number.isFinite)||frames<9||frames>241||(frames-1)%4||width<128||height<128||width%32||height%32||steps<1||steps>60)throw Error('Invalid sampling parameters.');
const prefix=project+'/'+id,vae={class_type:'VAELoader',inputs:{vae_name:'wan2.2_vae.safetensors'}};
let graph;
if(opt('decode-latent')){
 const file=inside(resolve(ROOT,opt('decode-latent'))),name=project+'-'+id+'.latent';copyFileSync(file,join(ROOT,'.cache/comfyui/input',name));
 graph={'39':vae,'60':{class_type:'LoadLatent',inputs:{latent:name}}};
}else{
 const file=inside(resolve(folder,opt('image','assets/keyframe.png'))),name=project+'-'+id+'.png';if(!existsSync(file))throw Error('Missing keyframe: '+file);copyFileSync(file,join(ROOT,'.cache/comfyui/input',name));
 const positive=readFileSync(inside(resolve(ROOT,opt('prompt-file','projects/warm-creature-story/contact-motion.txt'))),'utf8');
 const negative='flicker, flashing light, exposure change, rainbow artifacts, text, subtitles, watermark, extra limbs, deformed hands, merged paws, duplicate tails, distorted face, sliding feet, sudden camera cut';
 graph={
  '37':{class_type:'UnetLoaderGGUF',inputs:{unet_name:opt('model','Wan2.2-TI2V-5B-Q4_K_M.gguf')}},
  '38':{class_type:'CLIPLoaderGGUF',inputs:{clip_name:'umt5-xxl-encoder-Q4_K_M.gguf',type:'wan'}},
  '39':vae,'56':{class_type:'LoadImage',inputs:{image:name}},
  '55':{class_type:'Wan22ImageToVideoLatent',inputs:{vae:['39',0],width,height,length:frames,batch_size:1,start_image:['56',0]}},
  '48':{class_type:'ModelSamplingSD3',inputs:{model:['37',0],shift}},
  '6':{class_type:'CLIPTextEncode',inputs:{clip:['38',0],text:positive}},
  '7':{class_type:'CLIPTextEncode',inputs:{clip:['38',0],text:cfg===1?'':negative}},
  '3':{class_type:'KSampler',inputs:{model:['48',0],positive:['6',0],negative:['7',0],latent_image:['55',0],seed,steps,cfg,sampler_name:opt('sampler','uni_pc'),scheduler:'simple',denoise:1}},
  '60':{class_type:'SaveLatent',inputs:{samples:['3',0],filename_prefix:prefix}}
 };
 if(opt('lora')){graph['47']={class_type:'LoraLoaderModelOnly',inputs:{model:['37',0],lora_name:opt('lora'),strength_model:Number(opt('lora-strength',1))}};graph['48'].inputs.model=['47',0]}
}
graph['8']=opt('decode','tiled')==='full'?{class_type:'VAEDecode',inputs:{samples:['60',0],vae:['39',0]}}:{class_type:'VAEDecodeTiled',inputs:{samples:['60',0],vae:['39',0],tile_size:Number(opt('tile',512)),overlap:64,temporal_size:Number(opt('temporal',32)),temporal_overlap:8}};
graph['57']={class_type:'CreateVideo',inputs:{images:['8',0],fps:24}};
graph['58']={class_type:'SaveVideo',inputs:{video:['57',0],filename_prefix:prefix,format:'mp4',codec:'h264'}};
const lock=join(ROOT,'.cache/render.lock');let fd;
try{fd=openSync(lock,'wx');writeFileSync(fd,String(process.pid))}catch{throw Error('Wait for the active render/generation.');}
try{
 async function run(stage,nodes,target){
  const response=await fetch(engine+'/prompt',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt:nodes,client_id:randomUUID()})}),submitted=await response.json();
  if(!response.ok||submitted.error)throw Error(JSON.stringify(submitted));
  const promptId=submitted.prompt_id;writeFileSync(join(cache,id+'-'+stage+'-submitted.json'),JSON.stringify({promptId,frames,width,height,steps,seed,cfg,shift,graph:nodes,startedAt:new Date().toISOString()},null,2)+'\n');
  console.log('Queued '+project+'/'+id+' '+stage+' ('+promptId+')');let polls=0;
  for(;;){
   const response=await fetch(engine+'/history/'+promptId),history=await response.json(),result=history[promptId];
   if(result){writeFileSync(join(cache,id+'-'+stage+'-history.json'),JSON.stringify(result,null,2)+'\n');
    if(result.status?.status_str==='error')throw Error(JSON.stringify(result.status.messages.filter(([kind])=>kind.includes('error')||kind.includes('interrupted'))));
    if(result.outputs?.[target])return result.outputs[target];
   }
   await new Promise(r=>setTimeout(r,3000));if(++polls%10===0)console.log(id+' '+stage+': running '+polls*3+'s');
  }
 }
 if(!opt('decode-latent')){
  const sampling={...graph};for(const key of ['8','57','58'])delete sampling[key];
  const output=await run('sample',sampling,'60'),latent=output.latents[0],name=project+'-'+id+'.latent';
  copyFileSync(join(ROOT,'.cache/comfyui/output',latent.subfolder,latent.filename),join(ROOT,'.cache/comfyui/input',name));
  graph={'39':vae,'60':{class_type:'LoadLatent',inputs:{latent:name}},'8':graph['8'],'57':graph['57'],'58':graph['58']};
 }
 await fetch(engine+'/free',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({unload_models:true,free_memory:true})});await new Promise(r=>setTimeout(r,1500));
 const output=await run('decode',graph,'58'),video=output.images[0],destination=join(folder,'assets/shots',id+'.mp4');
 copyFileSync(join(ROOT,'.cache/comfyui/output',video.subfolder,video.filename),destination);console.log('Completed '+relative(ROOT,destination));
}finally{closeSync(fd);unlinkSync(lock)}
