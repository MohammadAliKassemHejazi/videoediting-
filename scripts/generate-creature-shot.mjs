import {readFileSync,writeFileSync,mkdirSync,copyFileSync,existsSync} from 'node:fs';import {join,resolve,relative} from 'node:path';import {randomUUID} from 'node:crypto';import {ROOT} from '../lib/project.mjs';
const [id='contact-test',...args]=process.argv.slice(2),option=(key,fallback)=>{const i=args.indexOf('--'+key);return i<0?fallback:args[i+1]},engine='http://127.0.0.1:8188',folder=resolve(ROOT,option('folder','projects/warm-creature-story')),projectId=folder.split(/[\\/]/).at(-1),cache=join(ROOT,'.cache',projectId);mkdirSync(cache,{recursive:true});
const inside=path=>{const part=relative(ROOT,path);if(part.startsWith('..')||resolve(ROOT,part)!==path)throw Error('Keep project, prompts and keyframes inside the workspace.');return path};inside(folder);
if(!/^[a-z0-9-]+$/.test(id))throw Error('Use a safe shot ID');const frames=Number(option('frames',25)),steps=Number(option('steps',12)),width=Number(option('width',352)),height=Number(option('height',640)),seed=Number(option('seed',271828));if(frames<9||frames>241||(frames-1)%4||width%32||height%32||steps<1||steps>50)throw Error('Invalid dimensions/frame count/step count');
const input=option('image','assets/keyframe.png'),keyframe=inside(resolve(folder,input)),inputName=projectId+'-'+id+'-keyframe.png';if(!existsSync(keyframe))throw Error('Missing shot keyframe');copyFileSync(keyframe,join(ROOT,'.cache/comfyui/input',inputName));const template=JSON.parse(readFileSync(join(ROOT,'projects/warm-creature-story/workflows/contact-test-5b.json'),'utf8')),positive=option('prompt-file')?readFileSync(inside(resolve(ROOT,option('prompt-file'))),'utf8'):template.nodes.find(n=>n.id===6).widgets_values[0],negative=template.nodes.find(n=>n.id===7).widgets_values[0];
const graph={
 '37':{class_type:'UnetLoaderGGUF',inputs:{unet_name:'Wan2.2-TI2V-5B-Q4_K_M.gguf'}},
 '38':{class_type:'CLIPLoaderGGUF',inputs:{clip_name:'umt5-xxl-encoder-Q4_K_M.gguf',type:'wan'}},
 '39':{class_type:'VAELoader',inputs:{vae_name:'wan2.2_vae.safetensors'}},
 '56':{class_type:'LoadImage',inputs:{image:inputName}},
 '55':{class_type:'Wan22ImageToVideoLatent',inputs:{vae:['39',0],width,height,length:frames,batch_size:1,start_image:['56',0]}},
 '48':{class_type:'ModelSamplingSD3',inputs:{model:['37',0],shift:8}},
 '6':{class_type:'CLIPTextEncode',inputs:{clip:['38',0],text:positive}},
 '7':{class_type:'CLIPTextEncode',inputs:{clip:['38',0],text:negative}},
 '3':{class_type:'KSampler',inputs:{model:['48',0],positive:['6',0],negative:['7',0],latent_image:['55',0],seed,steps,cfg:5,sampler_name:'uni_pc',scheduler:'simple',denoise:1}},
 '8':{class_type:'VAEDecodeTiled',inputs:{samples:['3',0],vae:['39',0],tile_size:256,overlap:64,temporal_size:16,temporal_overlap:4}},
 '57':{class_type:'CreateVideo',inputs:{images:['8',0],fps:24}},
 '58':{class_type:'SaveVideo',inputs:{video:['57',0],filename_prefix:projectId+'/'+id,format:'mp4',codec:'h264'}}
};
const lock=join(ROOT,'.cache/render.lock');const {openSync,closeSync,unlinkSync}=await import('node:fs');let fd;try{fd=openSync(lock,'wx');writeFileSync(fd,String(process.pid))}catch{throw Error('Wait for the active render before GPU generation.');}
try{const response=await fetch(engine+'/prompt',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt:graph,client_id:randomUUID()})}),submitted=await response.json();if(!response.ok||submitted.error)throw Error(JSON.stringify(submitted));const promptId=submitted.prompt_id;writeFileSync(join(cache,id+'-submitted.json'),JSON.stringify({promptId,frames,steps,width,height,seed,keyframe:input,graph,startedAt:new Date().toISOString()},null,2)+'\n');console.log('Queued GPU shot '+id+' / '+promptId);let polls=0;
 for(;;){const r=await fetch(engine+'/history/'+promptId),history=await r.json(),result=history[promptId];if(result){writeFileSync(join(cache,id+'-history.json'),JSON.stringify(result,null,2)+'\n');if(result.status?.status_str==='error')throw Error(JSON.stringify(result.status.messages));if(result.outputs?.['58']){console.log('Completed '+id+': '+JSON.stringify(result.outputs['58']));break}}
 await new Promise(resolve=>setTimeout(resolve,3000));if(++polls%10===0)console.log(id+': awaiting GPU generation ('+polls*3+'s)');
 }
}finally{closeSync(fd);unlinkSync(lock)}
