import {bundle} from '@remotion/bundler';
import {selectComposition,renderMedia,renderStill} from '@remotion/renderer';
import {existsSync,mkdirSync,readFileSync,writeFileSync,openSync,closeSync,unlinkSync,cpSync,statfsSync} from 'node:fs';
import {createHash,randomUUID} from 'node:crypto';
import {join} from 'node:path';
import {ROOT} from '../lib/project.mjs';
import {studioBrowserExecutable} from '../lib/studio-browser.mjs';
import {ffmpeg,probe} from '../lib/ffmpeg.mjs';
import {replaceWorkspaceFile} from '../lib/replace-file.mjs';
import {casefileDigest,casefileSources} from '../lib/casefile-film.mjs';
const project=process.argv[2];if(project!=='texas-ten-thousand-steps')throw Error('Select prepared Episode2');
if(!process.argv.includes('--approved-export'))throw Error('Preview-first policy: wait for the user to like the current preview and explicitly request export; then pass --approved-export.');
const cache=join(ROOT,'.cache',project),out=join(ROOT,'out',project),pub=join(cache,'render-public'),spec=JSON.parse(readFileSync(join(ROOT,'remotion/texas-steps-film.json'),'utf8'));
if(!spec.complete||!spec.audioMasterReady||spec.shots.some(s=>!s.available))throw Error('Generate every actual shot and audio master first');
const disk=statfsSync(ROOT);if(Number(disk.bavail)*Number(disk.bsize)<3*1024**3)throw Error('Keep3GiB free for final render');
const html=await(await fetch('http://localhost:3002/'+project)).text(),jobs=JSON.parse(html.match(/window\.remotion_initialRenderQueue = (.*?);<\/script>/)[1]);if(jobs.some(j=>['running','idle'].includes(j.status)))throw Error('A Studio render is already active');
const gpu=await(await fetch('http://127.0.0.1:8189/queue')).json();if(gpu.queue_running.length||gpu.queue_pending.length)throw Error('H3 is still generating');
mkdirSync(cache,{recursive:true});mkdirSync(out,{recursive:true});
const lock=join(ROOT,'.cache/render.lock'),fd=openSync(lock,'wx');writeFileSync(fd,String(process.pid));
const frozen=casefileDigest(ROOT,project),sources=casefileSources(ROOT,project);
try{
 mkdirSync(pub,{recursive:true});cpSync(join(ROOT,'remotion/public',project),join(pub,project),{recursive:true});
 const serveUrl=await bundle({entryPoint:join(ROOT,'remotion/TexasStepsExport.jsx'),publicDir:pub,outDir:join(cache,'episode-bundle')}),browserExecutable=studioBrowserExecutable();
 const composition=await selectComposition({serveUrl,id:project,browserExecutable});
 if(process.argv.includes('--reverse-check')){
  const frames=[90,spec.shots.at(-1).startFrame+54,spec.shots[9].startFrame+36,90],hashes=[];
  for(const [i,frame]of frames.entries()){const path=join(out,'seek-'+i+'.png');await renderStill({serveUrl,composition,browserExecutable,frame,scale:.25,output:path,imageFormat:'png'});hashes.push(createHash('sha256').update(readFileSync(path)).digest('hex'))}
  if(hashes[0]!==hashes[3])throw Error('Repeated reverse seek changed pixels');writeFileSync(join(out,'determinism.json'),JSON.stringify({sourceDigest:frozen,frames,hashes,passed:true},null,2)+'\n');
 }else{
  const pending=join(out,randomUUID()+'.pending.mp4');let last=-1;
  await renderMedia({serveUrl,composition,browserExecutable,outputLocation:pending,codec:'h264',pixelFormat:'yuv420p',hardwareAcceleration:'if-possible',videoBitrate:'16M',audioBitrate:'192k',concurrency:3,offthreadVideoThreads:2,onProgress:p=>{const value=Math.floor(p.progress*20)*5;if(value!==last){last=value;console.log('Episode2 '+value+'% / '+p.renderedFrames+' of '+composition.durationInFrames+' frames')}}});
  if(casefileDigest(ROOT,project)!==frozen)throw Error('Sources changed during export; pending movie retained');
  const metadata=probe(pending);if(metadata.width!==1440||metadata.height!==2560||metadata.fps!==60||!metadata.audio||Math.abs(metadata.duration-spec.duration)>.05)throw Error('Delivery metadata failed');
  await ffmpeg(['-threads','2','-i',pending,'-f','null','-']);replaceWorkspaceFile(pending,join(out,'draft.mp4'));
  writeFileSync(join(out,'render-manifest.json'),JSON.stringify({...metadata,sourceDigest:frozen,sources,outputHash:createHash('sha256').update(readFileSync(join(out,'draft.mp4'))).digest('hex'),sourceFormat:'352x640/24fps local MiniMax H3',enhancedShots:spec.shots.filter(s=>s.enhanced).map(s=>s.id),speakingShots:spec.shots.filter(s=>s.speaker).map(s=>s.id),conversion:'AI-enhanced/upscaled2K delivery with repeated24fps source poses at60fps, not native2K detail or60 unique poses',sound:'Original local stock-voice performances, original procedural music/Foley. Listening review is separate.',status:'Rendered draft; final visual, mouth and listening review statuses recorded separately',fullDecodePassed:true,createdAt:new Date().toISOString()},null,2)+'\n');
  console.log('Verified Episode2: '+join(out,'draft.mp4'));
 }
 if(casefileDigest(ROOT,project)!==frozen)throw Error('Sources changed during validation');
}finally{closeSync(fd);unlinkSync(lock)}
