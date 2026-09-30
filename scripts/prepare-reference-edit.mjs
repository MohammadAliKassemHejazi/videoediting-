import {mkdirSync,writeFileSync,existsSync,readFileSync,statSync} from 'node:fs';
import {createServer} from 'node:http';
import {chromium} from 'playwright';
import {ffmpeg,ffmpegPipe} from '../lib/ffmpeg.mjs';
import {once} from 'node:events';

const dir='assets/reference-edit';mkdirSync(dir,{recursive:true});mkdirSync('out/reference-edit/frames',{recursive:true});
const files={
 'vision.mjs':'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs',
 'vision_wasm_internal.js':'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm/vision_wasm_internal.js',
 'vision_wasm_internal.wasm':'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm/vision_wasm_internal.wasm',
 'selfie.tflite':'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite',
 'typescript.svg':'https://cdn.simpleicons.org/typescript/3178C6',
 'next.svg':'https://cdn.simpleicons.org/nextdotjs/FFFFFF',
 'react.svg':'https://cdn.simpleicons.org/react/61DAFB',
 'tailwind.svg':'https://cdn.simpleicons.org/tailwindcss/38BDF8',
 'router.svg':'https://cdn.simpleicons.org/reactrouter/F44250',
};
for(const [name,url]of Object.entries(files)){if(existsSync(`${dir}/${name}`))continue;const res=await fetch(url);if(!res.ok)throw Error(`${name}: ${res.status}`);writeFileSync(`${dir}/${name}`,Buffer.from(await res.arrayBuffer()));console.log(`Prepared ${name}`);}
writeFileSync(`${dir}/sources.json`,JSON.stringify(files,null,2));
if(existsSync('out/reference-edit/person-mask.done.json'))process.exit(0);
await ffmpeg(['-i','clips/0928(5).mp4','-vf','fps=30','-q:v','2','out/reference-edit/frames/%05d.jpg']);
const server=createServer((req,res)=>{
 const name=decodeURIComponent(req.url.split('?')[0]);
 const path=name.startsWith('/frame/')?'out/reference-edit/frames/'+name.slice(7):dir+'/'+name.slice(1);
 if(name==='/'){res.setHeader('Content-Type','text/html');res.end('<canvas id="c"></canvas>');return;}
 if(!existsSync(path)){res.statusCode=404;res.end();return;}
 res.setHeader('Content-Type',name.endsWith('.mjs')||name.endsWith('.js')?'application/javascript':name.endsWith('.wasm')?'application/wasm':name.endsWith('.jpg')?'image/jpeg':'application/octet-stream');res.end(readFileSync(path));
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch();const {proc,done}=ffmpegPipe(['-f','image2pipe','-framerate','30','-i','pipe:0','-c:v','ffv1','-pix_fmt','gray','out/reference-edit/person-mask.mkv']);
try{
 const page=await browser.newPage();page.on('pageerror',e=>console.log(e.message));page.on('console',m=>{if(m.type()==='error')console.log(m.text());});await page.goto(`http://127.0.0.1:${server.address().port}`);
 await page.exposeFunction('saveMask',async(data,n)=>{if(!proc.stdin.write(Buffer.from(data,'base64')))await once(proc.stdin,'drain');if(n%150===0)console.log(`Person mask ${n}/1951`);});
 await page.evaluate(async()=>{
  const {FilesetResolver,ImageSegmenter}=await import('/vision.mjs');
  const segmenter=await ImageSegmenter.createFromOptions(await FilesetResolver.forVisionTasks(location.origin),{baseOptions:{modelAssetPath:'/selfie.tflite',delegate:'CPU'},runningMode:'VIDEO',outputConfidenceMasks:true,outputCategoryMask:false});
  const c=document.getElementById('c'),ctx=c.getContext('2d');c.width=480;c.height=854;
  for(let n=1;n<=1950;n++){
   const img=await createImageBitmap(await(await fetch('/frame/'+String(n).padStart(5,'0')+'.jpg')).blob());
   const result=segmenter.segmentForVideo(img,n*1000/30),mask=result.confidenceMasks[0],p=mask.getAsFloat32Array(),small=document.createElement('canvas');small.width=mask.width;small.height=mask.height;
   const sc=small.getContext('2d'),rgba=sc.createImageData(mask.width,mask.height);
   for(let j=0;j<p.length;j++){const v=Math.max(0,Math.min(1,(p[j]-.2)/.6));const z=v*v*(3-2*v)*255;rgba.data[j*4]=rgba.data[j*4+1]=rgba.data[j*4+2]=z;rgba.data[j*4+3]=255;}
   sc.putImageData(rgba,0,0);ctx.drawImage(small,0,0,480,854);await window.saveMask(c.toDataURL('image/png').split(',')[1],n);result.close();img.close();
  }
  segmenter.close();
 });
 proc.stdin.end();await done;writeFileSync('out/reference-edit/person-mask.done.json',JSON.stringify({frames:1950,fps:30}));
}finally{await browser.close();server.close();}
