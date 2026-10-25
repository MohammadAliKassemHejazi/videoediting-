import {bundle} from '@remotion/bundler';
import {selectComposition,renderMedia,renderStill} from '@remotion/renderer';
import {existsSync,mkdirSync,readFileSync,writeFileSync,openSync,closeSync,unlinkSync,cpSync} from 'node:fs';
import {createHash,randomUUID} from 'node:crypto';
import {join} from 'node:path';
import {ROOT} from '../lib/project.mjs';
import {studioBrowserExecutable} from '../lib/studio-browser.mjs';
import {ffmpeg,probe} from '../lib/ffmpeg.mjs';
import {replaceWorkspaceFile} from '../lib/replace-file.mjs';
import {texasDigest,texasSources} from '../lib/texas-film.mjs';
const cache=join(ROOT,'.cache/texas-cinema-myth'),out=join(ROOT,'out/texas-cinema-myth'),pub=join(cache,'render-public');
const spec=JSON.parse(readFileSync(join(ROOT,'remotion/texas-film.json'),'utf8'));
if(!spec.complete||spec.shots.some(s=>!s.available))throw Error('Generate every source shot before exporting the episode');
if(!spec.audioMasterReady)throw Error('Prepare the continuous90s audio master first');
if(spec.shots.length!==23||spec.duration!==90||spec.fps!==60)throw Error('Unexpected episode format');
mkdirSync(cache,{recursive:true});mkdirSync(out,{recursive:true});mkdirSync(pub,{recursive:true});
const lock=join(ROOT,'.cache/render.lock'),fd=openSync(lock,'wx');writeFileSync(fd,String(process.pid));
try{
 const frozen=texasDigest(ROOT),sources=texasSources(ROOT);
 cpSync(join(ROOT,'remotion/public/texas-cinema-myth'),join(pub,'texas-cinema-myth'),{recursive:true});
 const serveUrl=await bundle({entryPoint:join(ROOT,'remotion/TexasExport.jsx'),publicDir:pub,outDir:join(cache,'episode-bundle')});
 const browserExecutable=studioBrowserExecutable(),composition=await selectComposition({serveUrl,id:'texas-cinema-myth',browserExecutable});
 const stillArg=process.argv.find(a=>a.startsWith('--stills='));
 if(stillArg){
  for(const value of stillArg.slice(9).split(',')){
   const time=Number(value);if(!Number.isFinite(time)||time<0||time>=90)throw Error('Invalid review time');
   await renderStill({serveUrl,composition,browserExecutable,frame:Math.min(5399,Math.round(time*60)),output:join(out,'review-'+value+'.png'),imageFormat:'png'});
  }
  console.log('Full-resolution review frames prepared; inspect actual images.');
 }else if(process.argv.includes('--reverse-check')){
  const hashes=[];
  for(const [i,frame]of [108,5040,1935,108].entries()){
   const path=join(out,'seek-'+i+'.png');await renderStill({serveUrl,composition,browserExecutable,frame,scale:.25,output:path,imageFormat:'png'});hashes.push(createHash('sha256').update(readFileSync(path)).digest('hex'));
  }
  if(hashes[0]!==hashes[3])throw Error('Repeated reverse-order seek changed pixels');
  writeFileSync(join(out,'determinism.json'),JSON.stringify({sourceDigest:frozen,frames:[108,5040,1935,108],hashes,passed:true},null,2)+'\n');console.log('Episode repeated-frame hashes match after reverse seeking.');
 }else{
  const pending=join(out,randomUUID()+'.pending.mp4');let last=-1;
  await renderMedia({serveUrl,composition,browserExecutable,outputLocation:pending,codec:'h264',pixelFormat:'yuv420p',hardwareAcceleration:'if-possible',videoBitrate:'16M',audioBitrate:'192k',concurrency:3,offthreadVideoThreads:2,onProgress:p=>{const percent=Math.floor(p.progress*20)*5;if(percent!==last){last=percent;console.log('Full90s episode: '+percent+'% ('+p.renderedFrames+' frames)')}}});
  if(texasDigest(ROOT)!==frozen)throw Error('Episode sources changed during export; pending file preserved');
  const metadata=probe(pending);if(metadata.width!==1440||metadata.height!==2560||metadata.fps!==60||!metadata.audio||Math.abs(metadata.duration-90)>.05)throw Error('Delivery metadata failed');
  await ffmpeg(['-threads','2','-v','error','-i',pending,'-f','null','-']);replaceWorkspaceFile(pending,join(out,'draft.mp4'));
  writeFileSync(join(out,'render-manifest.json'),JSON.stringify({...metadata,sourceDigest:frozen,sources,outputHash:createHash('sha256').update(readFileSync(join(out,'draft.mp4'))).digest('hex'),sourceFormat:'352x640/24fps MiniMax H3',enhancedShots:spec.shots.filter(s=>s.enhanced).map(s=>s.id),conversion:'AI-enhanced or Lanczos-upscaled source detail, repeated source frames at60fps; not native H3 2K detail or60 unique poses',audio:'Continuous locally generated Kokoro narration, original procedural music/Foley; final mix numerical mastering, listening review separate',status:'Rendered draft; full-film visual review and listening statuses recorded separately',createdAt:new Date().toISOString()},null,2)+'\n');
  console.log('Verified90s/1440x2560/60fps video with audio: '+join(out,'draft.mp4'));
 }
 if(texasDigest(ROOT)!==frozen)throw Error('Episode changed during review render');
}finally{closeSync(fd);unlinkSync(lock)}
