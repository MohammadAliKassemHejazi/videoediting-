import {readFileSync,writeFileSync,mkdirSync,statSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {createServer} from 'node:http';
import {chromium} from 'playwright';
import {ROOT} from '../lib/project.mjs';
import {ffmpeg,probe} from '../lib/ffmpeg.mjs';
import {studioBrowserExecutable} from '../lib/studio-browser.mjs';
const input=resolve(process.argv[2]||''),id=process.argv[3];if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id||''))throw Error('Provide input video and project ID');
if(!statSync(input).isFile())throw Error('Missing reference video');
const folder=join(ROOT,'projects',id,'reference'),cache=join(ROOT,'.cache',id),out=join(ROOT,'out',id);for(const dir of [folder,cache,out])mkdirSync(dir,{recursive:true});
const metadata=probe(input),sourceHash=createHash('sha256').update(readFileSync(input)).digest('hex');
writeFileSync(join(folder,'source.json'),JSON.stringify({source:input,sourceHash,metadata,purpose:'User-provided narrative/pacing reference; preserve original and analyze before adapting to recurring Texas characters',at:new Date().toISOString()},null,2)+'\n');
await ffmpeg(['-threads','2','-i',input,'-vf',`fps=${16/metadata.duration},scale=240:-1,tile=4x4`,'-frames:v','1',join(out,'reference-contact.png')]);
await ffmpeg(['-threads','2','-i',input,'-vn','-ac','1','-ar','16000','-f','f32le',join(cache,'reference-voice.f32')]);
const pcm=readFileSync(join(cache,'reference-voice.f32'));
const server=createServer((req,res)=>{
 res.setHeader('Cross-Origin-Opener-Policy','same-origin');res.setHeader('Cross-Origin-Embedder-Policy','credentialless');
 if(req.url==='/voice.f32'){res.setHeader('Content-Type','application/octet-stream');res.end(pcm)}
 else if(req.url==='/'){res.setHeader('Content-Type','text/html');res.end('<!doctype html><title>Local reference narration analysis</title>')}
 else{res.statusCode=404;res.end()}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({headless:true,executablePath:studioBrowserExecutable(),args:['--disable-gpu']}),page=await browser.newPage();
try{
 const last={};await page.exposeFunction('report',event=>{const key=event.file||event.status,percent=Math.floor((event.progress||0)/50)*50;if(event.status==='ready'||event.status==='done'||percent>(last[key]??-1)){last[key]=percent;console.log('Local reference ASR '+event.status+' '+(event.file||'')+' '+percent+'%')}});
 await page.goto('http://127.0.0.1:'+server.address().port+'/');
 console.log('Recognizing reference locally in browser/WASM; model download only, no audio upload.');
 const heartbeat=setInterval(()=>console.log('Local reference speech analysis still running.'),30000);
 try{
  const result=await page.evaluate(async()=>{
   const {pipeline,env}=await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1/dist/transformers.min.js');env.allowLocalModels=false;env.backends.onnx.wasm.numThreads=2;
   const asr=await pipeline('automatic-speech-recognition','Xenova/whisper-small',{device:'wasm',dtype:'q8',progress_callback:event=>window.report(event)});
   return asr(new Float32Array(await(await fetch('/voice.f32')).arrayBuffer()),{language:'english',task:'transcribe',return_timestamps:'word',chunk_length_s:25,stride_length_s:4});
  });
  writeFileSync(join(folder,'transcript.raw.json'),JSON.stringify({...result,sourceHash,warning:'ASR estimates; inspect/correct names, numbers and narrative claims before adaptation. Not a listening review.'},null,2)+'\n');
  console.log('Saved reference transcript: '+(result.chunks?.length||0)+' estimated word intervals.');
 }finally{clearInterval(heartbeat)}
}finally{await browser.close();await new Promise(r=>server.close(r))}
