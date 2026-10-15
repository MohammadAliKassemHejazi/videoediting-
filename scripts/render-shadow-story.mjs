import {bundle} from '@remotion/bundler';
import {selectComposition,renderMedia,renderStill} from '@remotion/renderer';
import {existsSync,mkdirSync,readFileSync,writeFileSync,openSync,closeSync,unlinkSync,cpSync} from 'node:fs';
import {createHash,randomUUID} from 'node:crypto';
import {join} from 'node:path';
import {studioBrowserExecutable} from '../lib/studio-browser.mjs';
import {ffmpeg,probe} from '../lib/ffmpeg.mjs';
import {replaceWorkspaceFile} from '../lib/replace-file.mjs';
import {generatedStorySources,generatedStoryDigest} from '../lib/generated-story.mjs';
const root=process.cwd(),cache=join(root,'.cache/shadow-went-first'),out=join(root,'out/shadow-went-first'),pub=join(cache,'render-public');
const spec=JSON.parse(readFileSync('remotion/shadow-work.json','utf8'));
if(spec.shots.some(s=>!s.available))throw Error('Generate every shot before rendering.');
const sources=generatedStorySources(root),digest=()=>generatedStoryDigest(root);
mkdirSync(cache,{recursive:true});mkdirSync(out,{recursive:true});mkdirSync(pub,{recursive:true});const lock=join(root,'.cache/render.lock');let fd;
try{fd=openSync(lock,'wx');writeFileSync(fd,String(process.pid))}catch{throw Error('Wait for the active production job.');}
try{
 const sourceDigest=digest();
 cpSync('remotion/public/shadow-went-first',join(pub,'shadow-went-first'),{recursive:true});cpSync('remotion/public/fonts',join(pub,'fonts'),{recursive:true});
 const serveUrl=await bundle({entryPoint:join(root,'remotion/ShadowExport.jsx'),publicDir:pub,outDir:join(cache,'bundle')});
 const browserExecutable=studioBrowserExecutable(),composition=await selectComposition({serveUrl,id:'shadow-went-first',browserExecutable});
 const frameArg=process.argv.find(x=>x.startsWith('--stills='));
 if(frameArg){for(const t of frameArg.slice(9).split(',').map(Number)){await renderStill({serveUrl,composition,browserExecutable,frame:Math.min(composition.durationInFrames-1,Math.round(t*60)),output:join(out,'review-'+t+'.png'),imageFormat:'png'});console.log('Inspected-frame candidate '+t+'s');}process.exitCode=0;}
 else{
  const pending=join(out,randomUUID()+'.pending.mp4');let last=-1;
  await renderMedia({serveUrl,composition,browserExecutable,outputLocation:pending,codec:'h264',pixelFormat:'yuv420p',hardwareAcceleration:'if-possible',videoBitrate:'14M',audioBitrate:'192k',concurrency:4,offthreadVideoThreads:2,onProgress:p=>{const pc=Math.floor(p.progress*100/5)*5;if(pc!==last){console.log('Full story '+pc+'% ('+p.renderedFrames+' frames)');last=pc;}}});
  if(sourceDigest!==digest())throw Error('Sources changed during render.');
  const meta=probe(pending);if(meta.width!==1440||meta.height!==2560||meta.fps!==60||!meta.audio||Math.abs(meta.duration-spec.duration)>.15)throw Error('Delivery metadata failed.');
  await ffmpeg(['-v','error','-i',pending,'-f','null','-']);replaceWorkspaceFile(pending,join(out,'draft.mp4'));
  writeFileSync(join(out,'generated-story.json'),JSON.stringify({...meta,sourceDigest,sources,conversion:spec.conversion,status:'Draft; visual review recorded separately, listening pending',created:new Date().toISOString()},null,2)+'\n');console.log('Verified full story: '+join(out,'draft.mp4'));
 }
}finally{closeSync(fd);unlinkSync(lock)}
