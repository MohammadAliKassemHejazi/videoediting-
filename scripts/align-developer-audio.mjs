// Local browser/WASM ASR fallback; the source audio never leaves localhost.
// Native CTranslate2 is blocked by this machine's Windows Application Control.
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFileSync,writeFileSync,mkdirSync } from 'node:fs';
import { ffmpeg } from '../lib/ffmpeg.mjs';

mkdirSync('out/alignment',{recursive:true});
await ffmpeg(['-i','clips/0928(5).mp4','-vn','-ac','1','-ar','16000','-f','f32le','out/alignment/voice.f32']);
const from=process.argv.includes('--from')?Number(process.argv[process.argv.indexOf('--from')+1]):0;
const duration=process.argv.includes('--dur')?Number(process.argv[process.argv.indexOf('--dur')+1]):65.04;
const full=readFileSync('out/alignment/voice.f32');
const pcm=full.subarray(Math.round(from*16000)*4,Math.round((from+duration)*16000)*4);
const server=createServer((req,res)=>{
  res.setHeader('Cross-Origin-Opener-Policy','same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy','credentialless');
  if(req.url==='/voice.f32'){res.setHeader('Content-Type','application/octet-stream');res.end(pcm);}
  else if(req.url==='/'){res.setHeader('Content-Type','text/html');res.end('<!doctype html><title>Local speech timing analysis</title>');}
  else{res.statusCode=404;res.end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch();
try{
  const page=await browser.newPage();
  page.on('pageerror',e=>console.error(e.message));
  page.on('console',m=>{if(m.type()==='error')console.error(m.text());});
  const last={};
  await page.exposeFunction('report',e=>{
    if(e.message){console.log(e.message);return;}
    const key=e.file||e.status,percent=Math.floor((e.progress||0)/25)*25;
    if(e.status==='done'||e.status==='ready'||(e.status==='progress'&&percent>(last[key]??-1))){last[key]=percent;console.log(`${e.status} ${key} ${percent}%`);}
  });
  await page.goto(`http://127.0.0.1:${server.address().port}/`);
  console.log('Loading browser speech recognition. Downloading model weights, not uploading audio.');
  const heartbeat=setInterval(()=>console.log('Local word-timing analysis is still running…'),20000);
  try{
    const result=await page.evaluate(async()=>{
      const {pipeline,env}=await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1/dist/transformers.min.js');
      env.allowLocalModels=false;env.backends.onnx.wasm.numThreads=4;
      const asr=await pipeline('automatic-speech-recognition','Xenova/whisper-small',{
        device:'wasm',dtype:'q8',progress_callback:e=>window.report(e)
      });
      await window.report({message:'Model ready. Recognizing Arabic/English speech with word timestamps.'});
      const audio=new Float32Array(await(await fetch('/voice.f32')).arrayBuffer());
      return await asr(audio,{language:'arabic',task:'transcribe',return_timestamps:'word',chunk_length_s:25,stride_length_s:4});
    });
    if(from)for(const chunk of result.chunks||[])chunk.timestamp=chunk.timestamp.map(t=>t==null?null:t+from);
    const output=from?`out/alignment/recognized-${from}.json`:'out/alignment/recognized-words.json';
    writeFileSync(output,JSON.stringify(result,null,2));
    console.log(`Saved ${result.chunks?.length||0} word intervals to ${output}`);
  }finally{clearInterval(heartbeat);}
}finally{await browser.close();await new Promise(r=>server.close(r));}
