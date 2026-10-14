import {readFileSync,writeFileSync,mkdirSync,existsSync,openSync,closeSync,unlinkSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {execFileSync} from 'node:child_process';
import {createHash,randomUUID} from 'node:crypto';
import {chromium} from 'playwright';
import {ROOT,project,sourceHash} from '../lib/project.mjs';
import {ffmpeg,probe} from '../lib/ffmpeg.mjs';
import {replaceWorkspaceFile} from '../lib/replace-file.mjs';
import {PRO_CLIP_STYLES,proStyle,zoomExpression} from '../lib/pro-clip-spec.mjs';
import {proClipDigest} from '../lib/pro-clip-digest.mjs';
const [cmd='activate',id='all']=process.argv.slice(2),styles=id==='all'?PRO_CLIP_STYLES:id.split(',').map(proStyle),p=project('backend-checklist');
const spec=JSON.parse(readFileSync(join(ROOT,'remotion/pro-clips.json'),'utf8'));if(spec.sourceHash!==sourceHash(p))throw Error('Source changed; prepare current clip.');
const cache=join(ROOT,'.cache/pro-clips');mkdirSync(cache,{recursive:true});
function compileGraphics(){
 const definition=readFileSync(join(ROOT,'lib/pro-clip-spec.mjs'),'utf8').replace(/^export /gm,''),graphics=readFileSync(join(ROOT,'lib/pro-clip-graphics.js'),'utf8').replace(/^import[^\n]*\n/,'').replace(/^export /gm,'');
 writeFileSync(join(cache,'graphics.js'),definition+'\n'+graphics+'\nwindow.PRO_CLIP_GRAPHICS={paintClipBack,paintClipFront};window.PRO_CLIP_SPEC='+JSON.stringify(spec).replaceAll('<','\\u003c')+';\n');
}
compileGraphics();
if(cmd==='activate'){
 writeFileSync(join(ROOT,'remotion/index.jsx'),`import React from 'react';\nimport {registerRoot,Composition,Folder} from 'remotion';\nimport {ProClip} from './ProClip.jsx';\nimport spec from './pro-clips.json';\nimport {MidnightTransit} from '../projects/midnight-transit/scenes.jsx';\nimport {PaperRiot} from '../projects/paper-riot/scenes.jsx';\nimport {SignalNoise} from '../projects/signal-noise/scenes.jsx';\nregisterRoot(()=> <>\n${PRO_CLIP_STYLES.map(s=>`<Folder name="${s.id.slice(5).toUpperCase()}"><Composition id="${s.id}" component={ProClip} width={1440} height={2560} fps={60} durationInFrames={900} defaultProps={{spec,styleId:'${s.id}'}}/></Folder>`).join('\n')}\n<Folder name="Original-style-films"><Composition id="midnight-transit" component={MidnightTransit} width={1440} height={2560} fps={60} durationInFrames={900}/><Composition id="paper-riot" component={PaperRiot} width={1440} height={2560} fps={60} durationInFrames={900}/><Composition id="signal-noise" component={SignalNoise} width={1440} height={2560} fps={60} durationInFrames={900}/></Folder>\n</>);\n`);
 if(existsSync(join(ROOT,'remotion/variety-clips.json')))execFileSync(process.execPath,['scripts/variety-clips.mjs','activate'],{cwd:ROOT,stdio:'inherit'});
 console.log('Five masked talking-head projects are live.');process.exit(0);
}
if(!['stills','render'].includes(cmd))throw Error('pro-clips activate | stills [style] | render [style]');
const lock=join(ROOT,'.cache/render.lock');let fd;try{fd=openSync(lock,'wx');writeFileSync(fd,String(process.pid))}catch{throw Error('Wait for the active render.');}
function digest(s){return proClipDigest(ROOT,s.id)}
function composeFilter(s){
 const cam=`zoompan=z='${zoomExpression(s.id)}':x='iw*0.5-iw/zoom*0.5':y='ih*${s.anchor}-ih/zoom*${s.anchor}':d=1:s=1440x2560:fps=60`;
 const cut=cutawayExpression(s.id),halo=s.id==='clip-paper-evidence'||s.id==='clip-acid-print';
 let f=`[0:v]fps=60,scale=1440:2560:force_original_aspect_ratio=increase,crop=1440:2560:(iw-ow)*0.5:(ih-oh)*0.5,${cam},${s.grade},split=2[room][person];[1:v]fps=60,erosion,erosion,erosion,dilation,dilation,gblur=sigma=0.6,scale=1440:2560:flags=bilinear,${cam},format=gray,split=2[mask][outline];[2:v]split=2[bpack][fpack];[bpack]crop=1440:2560:0:0,format=rgba[back];[fpack]crop=1440:2560:1440:0,format=rgba[front];[room][back]overlay=0:0:format=auto[bg];[person][mask]alphamerge[cutout];`;
 if(halo){const color=s.id==='clip-paper-evidence'?'0xf5ecd9':'0xd9ff43';f+=`[outline]dilation,dilation,dilation,dilation,scale=1440:2560,format=gray[edge];color=c=${color}:s=1440x2560:r=60:d=15,format=rgb24[ink];[ink][edge]alphamerge[stroke];[bg][stroke]overlay=0:0:format=auto:enable='not(${cut})'[outlined];[outlined][cutout]overlay=0:0:format=auto:enable='not(${cut})'[stage];`;}else f+=`[outline]nullsink;[bg][cutout]overlay=0:0:format=auto:enable='not(${cut})'[stage];`;
 return f+`[stage][front]overlay=0:0:format=auto,format=yuv420p[v];[0:a]aresample=48000[voice];[voice][3:a]amix=inputs=2:duration=first:normalize=0[a]`;
}
function cutawayExpression(id){return id==='clip-redline'?'gte(t,7.12)*lt(t,8.85)':id==='clip-acid-print'?'gte(t,7)*lt(t,7.88)':id==='clip-chrome-depth'?'gte(t,7.88)*lt(t,8.6)':'0'}
try{
 const browser=await chromium.launch();
 try{
  for(const s of styles){
   const folder=join(ROOT,'out',s.id);mkdirSync(folder,{recursive:true});const page=await browser.newPage({viewport:{width:2880,height:2560}}),errors=[];page.on('pageerror',e=>errors.push(e.message));const url=pathToFileURL(join(ROOT,'pro-edits.html'));url.search='style='+s.id;await page.goto(url.href);await page.evaluate(async()=>{await ASSETS_READY;await document.fonts.ready;});
   const samples=[.2,1.2,2.5,4,5.5,8.2,10.7,14.4],hashes=new Map();
   for(const time of samples){await page.evaluate(t=>seek(t),time);const pixels=await page.locator('#c').screenshot({omitBackground:true});hashes.set(time,createHash('sha256').update(pixels).digest('hex'));const packed=join(cache,`${s.id}-${time}.png`);writeFileSync(packed,pixels);
    // Same full compositing order as export, sampled from source and matte at exact time.
    const zoom=s.zoom+s.bumps.reduce((v,[a,b,z])=>v+(time>=a&&time<b?z:0),0),filter=composeFilter(s).replaceAll(zoomExpression(s.id),String(zoom)).replaceAll('on/60',String(time));
    const stillFilter=filter.split(';[0:a]')[0].replace(/\bt\b/g,String(time)).replace('format=yuv420p[v]','format=yuv420p,scale=360:640[v]');
    await ffmpeg(['-ss',String(time),'-i',p.source,'-ss',String(time),'-i',join(p.cache,'person-mask.mkv'),'-loop','1','-framerate','60','-i',packed,'-filter_complex',stillFilter,'-map','[v]','-frames:v','1','-an',join(folder,`phone-${time}.png`)]);
   }
   for(const time of [...samples].reverse()){await page.evaluate(t=>seek(t),time);const pixels=await page.locator('#c').screenshot({omitBackground:true});if(createHash('sha256').update(pixels).digest('hex')!==hashes.get(time))throw Error('Reverse-seek mismatch '+s.id);}
   if(errors.length)throw Error(errors.join('\n'));await page.close();
   const inputs=samples.map(t=>join(folder,`phone-${t}.png`)).flatMap(f=>['-i',f]);await ffmpeg([...inputs,'-filter_complex','[0:v][1:v][2:v][3:v]hstack=inputs=4[top];[4:v][5:v][6:v][7:v]hstack=inputs=4[bottom];[top][bottom]vstack=inputs=2','-frames:v','1',join(folder,'contact.png')]);
   if(cmd==='render'){
    const graphics=join(cache,s.id+'-graphics.mov'),pending=join(folder,randomUUID()+'.pending.mp4'),frozen=digest(s);
    console.log('Rendering two depth layers for '+s.name);
    execFileSync(process.execPath,['render.mjs','--page','pro-edits.html','--query','style='+s.id,'--w','2880','--h','2560','--fps','60','--dur','15','--sub','1','--workers','4','--alpha','--alpha-codec','qtrle','--out',graphics],{cwd:ROOT,stdio:'inherit'});
    await ffmpeg(['-i',p.source,'-i',join(p.cache,'person-mask.mkv'),'-i',graphics,'-i',join(ROOT,'projects',s.id,'assets/sfx.wav'),'-filter_complex',composeFilter(s),'-map','[v]','-map','[a]','-t','15','-r','60','-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-movflags','+faststart',pending]);
    const meta=probe(pending);if(meta.width!==1440||meta.height!==2560||meta.fps!==60||!meta.audio||Math.abs(meta.duration-15)>.1)throw Error('Invalid pro clip');await ffmpeg(['-i',pending,'-f','null','-']);if(digest(s)!==frozen)throw Error('Source changed during render.');replaceWorkspaceFile(pending,join(folder,'draft.mp4'));unlinkSync(graphics);
    writeFileSync(join(folder,'pro-clip.json'),JSON.stringify({...meta,sourceDigest:frozen,style:s.id,sourceProject:p.id,renderedAt:new Date().toISOString(),reviewStatus:'draft; phone frames and transition review'},null,2)+'\n');console.log('Verified '+s.id);
   }
  }
 }finally{await browser.close()}
}finally{closeSync(fd);unlinkSync(lock)}
