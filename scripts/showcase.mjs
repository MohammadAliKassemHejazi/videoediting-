import {readFileSync,writeFileSync,mkdirSync,existsSync,openSync,closeSync,unlinkSync,copyFileSync} from 'node:fs';
import {join} from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
import {ROOT} from '../lib/project.mjs';
import {probe,ffmpeg} from '../lib/ffmpeg.mjs';
import {replaceWorkspaceFile} from '../lib/replace-file.mjs';
const [cmd='activate',id='all']=process.argv.slice(2),films=JSON.parse(readFileSync(join(ROOT,'remotion/showcase.json'),'utf8'));
const chosen=id==='all'?films:films.filter(f=>f.id===id);if(!chosen.length)throw Error('Unknown showcase project');
mkdirSync(join(ROOT,'remotion/public/world'),{recursive:true});copyFileSync(join(ROOT,'assets/story-library/studio_small_09.hdr'),join(ROOT,'remotion/public/world/studio_small_09.hdr'));
for(const film of chosen){
 const publicAssets=join(ROOT,'remotion/public/showcase',film.id);mkdirSync(publicAssets,{recursive:true});
 for(const name of ['score.wav','pencil-hand.png']){const source=join(ROOT,'projects',film.id,'assets',name);if(existsSync(source))copyFileSync(source,join(publicAssets,name));}
 if(cmd!=='activate'&&!existsSync(join(publicAssets,'score.wav')))throw Error('Build the score first: node scripts/showcase-sound.mjs');
}
const root=`import React from 'react';\nimport {registerRoot,Composition,Folder} from 'remotion';\nimport {MidnightTransit} from '../projects/midnight-transit/scenes.jsx';\nimport {PaperRiot} from '../projects/paper-riot/scenes.jsx';\nimport {SignalNoise} from '../projects/signal-noise/scenes.jsx';\nimport './fonts.css';\nregisterRoot(()=> <>\n<Folder name="01-MIDNIGHT-TRANSIT"><Composition id="midnight-transit" component={MidnightTransit} width={1440} height={2560} fps={60} durationInFrames={900}/></Folder>\n<Folder name="02-PAPER-RIOT"><Composition id="paper-riot" component={PaperRiot} width={1440} height={2560} fps={60} durationInFrames={900}/></Folder>\n<Folder name="03-SIGNAL-NOISE"><Composition id="signal-noise" component={SignalNoise} width={1440} height={2560} fps={60} durationInFrames={900}/></Folder>\n</>);\n`;
if(cmd==='activate'){writeFileSync(join(ROOT,'remotion/index.jsx'),root);console.log('Three independent project folders are live in Remotion.');process.exit(0)}
if(!['stills','render'].includes(cmd))throw Error('showcase activate | stills [id] | render [id]');
const lock=join(ROOT,'.cache/render.lock');let fd;try{fd=openSync(lock,'wx');writeFileSync(fd,String(process.pid))}catch{throw Error('Wait for the active render.')}
try{
 const {bundle}=await import('@remotion/bundler'),{selectComposition,renderMedia,renderStill}=await import('@remotion/renderer'),{chromium}=await import('playwright');
 const browserExecutable=chromium.executablePath().replace(/chromium-(\d+)/,'chromium_headless_shell-$1').replace(/chrome\.exe$/,'headless_shell.exe');
 const serveUrl=await bundle({entryPoint:join(ROOT,'remotion/index.jsx'),publicDir:join(ROOT,'remotion/public')});
 for(const film of chosen){
  const folder=join(ROOT,'out',film.id);mkdirSync(folder,{recursive:true});const composition=await selectComposition({serveUrl,id:film.id,browserExecutable}),options={serveUrl,composition,browserExecutable,chromiumOptions:{gl:'angle'}};
  const requestedTime=process.argv[4]===undefined?null:Number(process.argv[4]);
  if(requestedTime!==null&&(!Number.isFinite(requestedTime)||requestedTime<0||requestedTime>=15))throw Error('Frame time must be within the 15-second film.');
  for(const t of requestedTime!==null?[requestedTime]:[.6,2.1,4.4,5.6,7.3,9.8,11.4,13.4])await renderStill({...options,frame:Math.round(t*60),scale:.25,output:join(folder,`phone-${t}.png`)});
  const inputs=[.6,2.1,4.4,5.6,7.3,9.8,11.4,13.4].flatMap(t=>['-i',join(folder,`phone-${t}.png`)]);
  await ffmpeg([...inputs,'-filter_complex','[0:v][1:v][2:v][3:v]hstack=inputs=4[top];[4:v][5:v][6:v][7:v]hstack=inputs=4[bottom];[top][bottom]vstack=inputs=2','-frames:v','1',join(folder,'contact.png')]);
  if(cmd==='render'){
   const pending=join(folder,randomUUID()+'.pending.mp4');let last=-1;console.log('Rendering '+film.id+' at 1440×2560 / 60fps.');
   await renderMedia({...options,outputLocation:pending,codec:'h264',crf:18,pixelFormat:'yuv420p',concurrency:4,onProgress:({progress})=>{const p=Math.floor(progress*10)*10;if(p!==last){last=p;console.log(film.id+': '+p+'%')}}});
   const info=probe(pending);if(info.width!==1440||info.height!==2560||info.fps!==60||Math.abs(info.duration-15)>.1||!info.audio)throw Error('Invalid export');await ffmpeg(['-i',pending,'-f','null','-']);replaceWorkspaceFile(pending,join(folder,'draft.mp4'));
   const sourceDigest=createHash('sha256').update(readFileSync(join(ROOT,'projects',film.id,'scenes.jsx'))).update(readFileSync(join(ROOT,'projects',film.id,'assets/score.wav'))).digest('hex');
   writeFileSync(join(folder,'showcase.json'),JSON.stringify({...film,...info,sourceDigest,renderedAt:new Date().toISOString(),reviewStatus:'draft; actual frame inspection recorded separately'},null,2)+'\n');
   console.log('Verified '+film.id);
  }
 }
}finally{closeSync(fd);unlinkSync(lock)}
