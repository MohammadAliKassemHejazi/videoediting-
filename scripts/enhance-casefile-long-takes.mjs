import {spawn} from 'node:child_process';
import {existsSync,readFileSync,writeFileSync,mkdirSync,openSync,closeSync,unlinkSync,createWriteStream,readdirSync,statSync,statfsSync} from 'node:fs';
import {join} from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
import {ROOT} from '../lib/project.mjs';
import {ffmpeg,probe} from '../lib/ffmpeg.mjs';
import {replaceWorkspaceFile} from '../lib/replace-file.mjs';
const project=process.argv[2];if(!/^[a-z0-9-]+$/.test(project||''))throw Error('Safe project ID required');
const folder=join(ROOT,'projects',project),cache=join(ROOT,'.cache',project,'enhancement'),bin=join(ROOT,'.cache/video-finishing/realesrgan');
const manifest=JSON.parse(readFileSync(join(folder,'FINISHING_TOOLS.json'),'utf8')),plan=JSON.parse(readFileSync(join(folder,'production-scenes.json'),'utf8'));
const hash=file=>createHash('sha256').update(readFileSync(file)).digest('hex');
for(const [file,expected]of Object.entries(manifest.files))if(hash(join(bin,file))!==expected)throw Error('Enhancer hash mismatch '+file);
const selected=process.argv.slice(3).filter(x=>/^[a-z0-9-]+$/i.test(x)),ids=selected.length?selected:plan.scenes.map(s=>s.id);
mkdirSync(cache,{recursive:true});const lock=join(ROOT,'.cache/render.lock'),fd=openSync(lock,'wx');writeFileSync(fd,String(process.pid));
try{
 const q=await(await fetch('http://127.0.0.1:8189/queue')).json();if(q.queue_running.length||q.queue_pending.length)throw Error('H3 queue still active');
 await fetch('http://127.0.0.1:8189/free',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({unload_models:true,free_memory:true})});
 // A fixed, strictly bounded frame pool avoids accumulating or deleting folders.
 // Every source has exactly362frames; completed encodes are validated before reuse.
 const work=join(cache,'long-working-frames'),input=join(work,'input'),images=join(work,'output');mkdirSync(input,{recursive:true});mkdirSync(images,{recursive:true});
 for(const dir of [input,images])for(const f of readdirSync(dir,{withFileTypes:true}))if(!f.isFile()||!/^\d{8}\.png$/.test(f.name))throw Error('Unexpected file in rebuildable frame pool');
 for(const id of ids){
  const disk=statfsSync(ROOT);if(Number(disk.bavail)*Number(disk.bsize)<3*1024**3)throw Error('Keep3GiB free before enhancement; originals preserved');
  const source=join(folder,'assets/shots',id+'.mp4'),record=join(cache,id+'-enhancement.json'),output=join(cache,id+'-x4.mp4');
  const signature={sourceHash:hash(source),toolsHash:hash(join(folder,'FINISHING_TOOLS.json')),generatorHash:hash(new URL(import.meta.url)),settings:manifest.settings};
  if(existsSync(output)){
   if(existsSync(record)&&JSON.stringify(JSON.parse(readFileSync(record,'utf8')).input)===JSON.stringify(signature)){console.log('Already enhanced '+id);continue}
   throw Error('Preserve existing enhancement with different provenance '+id);
  }
  await ffmpeg(['-threads','2','-i',source,'-vsync','0','-start_number','0',join(input,'%08d.png')]);
  if(readdirSync(input).filter(f=>f.endsWith('.png')).length!==362)throw Error('Native source must have362frames '+id);
  const began=Date.now(),log=createWriteStream(join(cache,id+'-enhancer.log'));let header='',last=-1;
  console.log('RTX3060 enhancement '+id+'/'+plan.scenes.length+'; using bounded362-frame pool.');
  await new Promise((resolve,reject)=>{
   const child=spawn(join(bin,'realesrgan-ncnn-vulkan.exe'),['-i',input,'-o',images,'-m',join(bin,'models'),'-n',manifest.settings.model,'-s','4','-t',String(manifest.settings.tile),'-g',String(manifest.settings.gpu),'-j',manifest.settings.workers,'-f','png'],{cwd:bin,windowsHide:true,stdio:['ignore','pipe','pipe']});
   const timer=setInterval(()=>{const n=readdirSync(images).filter(f=>/^\d{8}\.png$/.test(f)&&statSync(join(images,f)).mtimeMs>=began-2).length,p=Math.floor(n/362*4)*25;if(p!==last){last=p;console.log('Enhance '+id+': '+p+'% ('+n+'/362 frames)')}},2000);
   const capture=chunk=>{const value=String(chunk);log.write(value);if(header.length<5000)header+=value};child.stdout.on('data',capture);child.stderr.on('data',capture);
   child.on('error',e=>{clearInterval(timer);log.end();reject(e)});child.on('exit',code=>{clearInterval(timer);log.end();code===0?resolve():reject(Error('Enhancer failed '+id+' '+code))});
  });
  const files=readdirSync(images).filter(f=>/^\d{8}\.png$/.test(f));if(files.length!==362||files.some(f=>statSync(join(images,f)).mtimeMs<began-2))throw Error('Missing or stale enhanced frames '+id);
  const pending=join(cache,id+'-'+randomUUID()+'.pending.mp4');
  await ffmpeg(['-threads','2','-framerate','24','-start_number','0','-i',join(images,'%08d.png'),'-an','-c:v','libx264','-preset','medium','-crf','17','-pix_fmt','yuv420p','-movflags','+faststart',pending]);
  const metadata=probe(pending);if(metadata.width!==1280||metadata.height!==2304||metadata.fps!==24||Math.abs(metadata.duration-362/24)>.04)throw Error('Enhanced source metadata mismatch '+id);
  await ffmpeg(['-threads','2','-i',pending,'-f','null','-']);replaceWorkspaceFile(pending,output);
  writeFileSync(record,JSON.stringify({input:signature,outputHash:hash(output),metadata,work,gpuHeader:header,status:'4x enhanced source; visual review separate; native originals preserved',at:new Date().toISOString()},null,2)+'\n');
  console.log('Enhanced '+id+'; verified encode permits next use of fixed frame pool.');
 }
}finally{closeSync(fd);unlinkSync(lock)}
