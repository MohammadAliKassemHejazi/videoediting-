import {spawn} from 'node:child_process';
import {existsSync,readFileSync,writeFileSync,mkdirSync,openSync,closeSync,unlinkSync,createWriteStream,readdirSync,statfsSync} from 'node:fs';
import {join} from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
import {ROOT} from '../lib/project.mjs';
import {ffmpeg,probe} from '../lib/ffmpeg.mjs';
const folder=join(ROOT,'projects/texas-cinema-myth'),cache=join(ROOT,'.cache/texas-cinema-myth/enhancement'),bin=join(ROOT,'.cache/video-finishing/realesrgan');
const manifest=JSON.parse(readFileSync(join(folder,'FINISHING_TOOLS.json'),'utf8'));
const hash=file=>createHash('sha256').update(readFileSync(file)).digest('hex');
for(const [file,expected]of Object.entries(manifest.files))if(hash(join(bin,file))!==expected)throw Error('Enhancer hash mismatch: '+file);
const test=process.argv.includes('--test'),ids=test?['01']:process.argv.includes('--all')?Array.from({length:23},(_,n)=>String(n+1).padStart(2,'0')):process.argv.slice(2).filter(x=>/^\d{2}$/.test(x));
if(!ids.length)throw Error('Choose --test, --all or shot IDs');
mkdirSync(cache,{recursive:true});const lock=join(ROOT,'.cache/render.lock'),fd=openSync(lock,'wx');writeFileSync(fd,String(process.pid));
try{
 await fetch('http://127.0.0.1:8189/free',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({unload_models:true,free_memory:true})});
 for(const id of ids){
  const disk=statfsSync(ROOT);if(Number(disk.bavail)*Number(disk.bsize)<9*1024**3)throw Error('Keep9GiB free before another enhancement; partial sources are preserved.');
  const source=join(folder,'assets/shots/'+id+'-h3.mp4');
  if(!existsSync(source))throw Error('Source not generated: '+id);
  const signature={sourceHash:hash(source),toolsHash:hash(join(folder,'FINISHING_TOOLS.json')),generatorHash:hash(new URL(import.meta.url)),settings:manifest.settings};
  const record=join(cache,id+'-enhancement.json'),output=join(cache,id+'-x4.mp4');
  if(!test&&existsSync(output)){
   if(existsSync(record)&&JSON.stringify(JSON.parse(readFileSync(record,'utf8')).input)===JSON.stringify(signature)){console.log('Already enhanced '+id);continue;}
   throw Error('Preserve the existing enhancement and choose a fresh pass before replacing '+id);
  }
  const work=join(cache,id+(test?'-test':'')+'-'+randomUUID()),input=join(work,'input'),images=join(work,'output');mkdirSync(input,{recursive:true});mkdirSync(images,{recursive:true});
  await ffmpeg(['-threads','2','-i',source,...(test?['-vf','select=eq(n\\,0)+eq(n\\,48)+eq(n\\,96)']:[]),'-vsync','0','-start_number','0',join(input,'%08d.png')]);
  const total=readdirSync(input).filter(f=>f.endsWith('.png')).length,logFile=join(work,'enhancer.log'),log=createWriteStream(logFile);let header='',completed=0,last=-1;
  console.log('GPU enhancement '+id+': '+total+' native frames; no concurrent H3/render job.');
  await new Promise((resolve,reject)=>{
   const child=spawn(join(bin,'realesrgan-ncnn-vulkan.exe'),['-i',input,'-o',images,'-m',join(bin,'models'),'-n',manifest.settings.model,'-s','4','-t',String(manifest.settings.tile),'-g',String(manifest.settings.gpu),'-j',manifest.settings.workers,'-f','png'],{cwd:bin,windowsHide:true,stdio:['ignore','pipe','pipe']});
   const report=chunk=>{const text=String(chunk);log.write(text);if(header.length<5000)header+=text;completed+=(text.match(/100\.00%/g)||[]).length;const progress=Math.min(100,Math.floor(completed/total*4)*25);if(progress!==last){last=progress;console.log('Enhance '+id+': '+progress+'%');}};
   child.stdout.on('data',report);child.stderr.on('data',report);child.on('error',reject);child.on('exit',code=>{log.end();code===0?resolve():reject(Error('Enhancer failed '+code+'; '+logFile))});
  });
  const count=readdirSync(images).filter(f=>f.endsWith('.png')).length;if(count!==total)throw Error('Missing enhanced frames: '+id);
  if(test){writeFileSync(join(cache,'test.json'),JSON.stringify({source,input,images,logFile,gpuHeader:header,signature,status:'Visual comparison required'},null,2)+'\n');console.log('Three-frame comparison ready: '+images);continue;}
  await ffmpeg(['-threads','2','-framerate','24','-start_number','0','-i',join(images,'%08d.png'),'-an','-c:v','libx264','-preset','medium','-crf','17','-pix_fmt','yuv420p','-movflags','+faststart',output]);
  const metadata=probe(output);if(metadata.width!==1408||metadata.height!==2560||metadata.fps!==24||Math.abs(metadata.duration-107/24)>.04)throw Error('Enhanced source metadata mismatch: '+id);
  await ffmpeg(['-threads','2','-v','error','-i',output,'-f','null','-']);
  writeFileSync(record,JSON.stringify({input:signature,outputHash:hash(output),metadata,work,gpuHeader:header,status:'4x enhanced source; visual review separate, native H3 originals preserved',at:new Date().toISOString()},null,2)+'\n');
  console.log('Enhanced source complete '+id+'/23');
 }
}finally{closeSync(fd);unlinkSync(lock)}
