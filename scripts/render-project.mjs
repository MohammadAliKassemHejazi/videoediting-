import {readFileSync,writeFileSync,mkdirSync,copyFileSync,existsSync,renameSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
import {join} from 'node:path';
import {project,projectHash,sourceHash} from '../lib/project.mjs';
import {chromium} from 'playwright';
import {ffmpeg,probe} from '../lib/ffmpeg.mjs';
const P=project(process.argv.find(x=>x.startsWith('--project='))?.split('=')[1]),F=P.film;
const final=process.argv.includes('--final'),review=process.argv.includes('--review'),w=final?1080:540,h=final?1920:960,fps=final?60:30,k=w/1080;
const prefix=join(P.out,final?'final':'draft');mkdirSync(P.out,{recursive:true});mkdirSync(P.cache,{recursive:true});
const hash=projectHash(P),meta=probe(P.source);if(Math.abs(meta.duration-F.duration)>.1)throw Error('Source and timeline durations differ; align the transcript first.');
if(final&&!review){const r=JSON.parse(readFileSync(join(P.out,'review.json'),'utf8'));if(r.sourceHash!==hash)throw Error('Render a draft, inspect contact/phone/strip, then record the current review.');if(!existsSync(join(P.dir,P.config.thumbnail.file)))throw Error('Generate the project thumbnail before final delivery.');}
const maskMeta=JSON.parse(readFileSync(join(P.cache,'person-mask.done.json'),'utf8'));if(maskMeta.sourceHash!==sourceHash(P)||maskMeta.framing!==JSON.stringify(P.config.framing))throw Error('Stale person mask. Run studio prepare.');
const browser=await chromium.launch();
try{
 const p=await browser.newPage({viewport:{width:1080,height:1920}}),errors=[];p.on('pageerror',e=>errors.push(e.message));const url=pathToFileURL(resolve('index.html'));url.search=`?project=${P.id}&render=1`;await p.goto(url.href);await p.evaluate(async()=>{await ASSETS_READY;await Promise.all(FONTS.map(f=>document.fonts.load(f)));});
 for(const kind of ['grid','cardmask']){
  const png=await p.evaluate(({kind,top})=>{const cc=document.createElement('canvas');cc.width=1080;cc.height=1920;const g=cc.getContext('2d');g.fillStyle=kind==='grid'?'#0B0B0C':'black';g.fillRect(0,0,1080,1920);if(kind==='grid'){g.strokeStyle='#FFFFFF0A';g.lineWidth=1.5;for(let x=0;x<=1080;x+=120){g.beginPath();g.moveTo(x,0);g.lineTo(x,1920);g.stroke();}for(let y=0;y<=1920;y+=120){g.beginPath();g.moveTo(0,y);g.lineTo(1080,y);g.stroke();}}else{g.fillStyle='white';g.beginPath();g.roundRect(0,top,1080,1920-top+100,100);g.fill();}return cc.toDataURL('image/png').split(',')[1];},{kind,top:P.config.framing.cardTop});writeFileSync(join(P.cache,kind+'.png'),Buffer.from(png,'base64'));
 }
 // Inspect all editorial sections and verify deterministic reverse seeks.
 const times=P.config.reviewTimes||[.2,F.duration/2,F.duration-.2];
 const hashes=new Map();for(const t of times){await p.evaluate(t=>seek(t),t);const buf=await p.locator('#c').screenshot({omitBackground:true});hashes.set(t,buf.toString('base64'));if(process.argv.includes('--frames'))writeFileSync(join(P.cache,`overlay-${t}.png`),buf);}
 for(const t of [...times].reverse()){await p.evaluate(t=>seek(t),t);const buf=await p.locator('#c').screenshot({omitBackground:true});if(buf.toString('base64')!==hashes.get(t))throw Error(`Non-deterministic frame ${t}`);}
 if(errors.length)throw Error(errors.join('\n'));console.log(`Checked ${times.length} scenes, forward/reverse.`);
}finally{await browser.close();}
if(!review){
 // Soft, short mechanical ticks; no music, risers or tonal beeps.
 const rate=48000,n=Math.ceil(F.duration*rate),pcm=Buffer.alloc(n*2);let seed=6241;
 for(const at of F.cues){let smooth=0;for(let j=0;j<rate*.036;j++){seed=(1664525*seed+1013904223)>>>0;const noise=(seed/4294967296)*2-1;smooth=.76*smooth+.24*noise;const tt=j/rate,env=Math.sin(Math.PI*tt/.036)**2*Math.exp(-tt*130),v=.035*env*(smooth+.25*Math.sin(tt*2*Math.PI*310));const off=Math.round(at*rate)+j;if(off<n)pcm.writeInt16LE(Math.round(v*32767),off*2);}}
 const head=Buffer.alloc(44);head.write('RIFF');head.writeUInt32LE(pcm.length+36,4);head.write('WAVEfmt ',8);head.writeUInt32LE(16,16);head.writeUInt16LE(1,20);head.writeUInt16LE(1,22);head.writeUInt32LE(rate,24);head.writeUInt32LE(rate*2,28);head.writeUInt16LE(2,32);head.writeUInt16LE(16,34);head.write('data',36);head.writeUInt32LE(pcm.length,40);writeFileSync(join(P.cache,'quiet-cues.wav'),Buffer.concat([head,pcm]));
 execFileSync(process.execPath,['render.mjs','--page','index.html','--query',`project=${P.id}`,'--w',String(w),'--h',String(h),'--fps',String(fps),'--sub',final?'2':'1','--workers',final?'6':'4','--gpu','false','--dur',String(F.duration),'--alpha','--alpha-codec','qtrle','--out',join(P.cache,final?'final_graphics.mov':'draft_graphics.mov')],{stdio:'inherit'});
 const enable=F.split.map(([a,b])=>`gte(t,${a})*lt(t,${b})`).join('+')||'0',sw=1080*k,sh=1922*k,offset=P.config.framing.sourceY*k,fx=P.config.framing.focusX,fy=P.config.framing.focusY;
 const cover=(ww,hh)=>`scale=${ww}:${hh}:force_original_aspect_ratio=increase:flags=lanczos,crop=${ww}:${hh}:(iw-ow)*${fx}:(ih-oh)*${fy}`;
 const mediaArgs=[],mediaFilters=[];let mediaIndex=0;
 for(const [i,a]of (P.config.assets||[]).entries()){
  if(!a.useInTimeline)continue;
  const ext=a.type==='video'?(a.background==='green'||a.background==='alpha'?'.mov':'.mp4'):'.png',file=join(P.cache,'media',String(i)+ext);
  if(!existsSync(file)){if(a.required!==false)throw Error('Missing prepared asset '+a.file);continue;}
  const at=a.at||0,dur=a.duration,ww=Math.round((a.width||1080)*k),hh=Math.round((a.height||1920)*k),x=Math.round((a.x||0)*k),y=Math.round((a.y||0)*k);
  if(!(dur>0&&at>=0&&at+dur<=F.duration+.01))throw Error('Invalid media timing '+a.file);
  if(a.type==='image')mediaArgs.push('-loop','1');mediaArgs.push('-i',file);
  mediaFilters.push(`[${6+mediaIndex}:v]trim=duration=${dur},setpts=PTS-STARTPTS+${at}/TB,scale=${ww}:${hh}:force_original_aspect_ratio=decrease,format=rgba,pad=${ww}:${hh}:(ow-iw)/2:(oh-ih)/2:color=0x00000000[media${mediaIndex}];[base${mediaIndex}][media${mediaIndex}]overlay=${x}:${y}:enable='gte(t,${at})*lt(t,${at+dur})':eof_action=pass:format=auto[base${mediaIndex+1}];`);mediaIndex++;
 }
 const filter=`[0:v]fps=${fps},split=3[s][f][punch];`+
  `[s]${cover(sw,sh)},pad=${w}:${Math.round(sh+offset)}:0:${offset},crop=${w}:${h}:0:0,setsar=1[speaker];`+
  `[1:v]fps=${fps},erosion,erosion,gblur=sigma=0.5,scale=${sw}:${sh}:flags=bilinear,pad=${w}:${Math.round(sh+offset)}:0:${offset},crop=${w}:${h}:0:0,format=gray[seg];`+
  `[2:v]scale=${w}:${h},format=gray[card];[seg][card]blend=all_mode=lighten[mask];[speaker][mask]alphamerge[cutout];`+
  `[3:v]scale=${w}:${h},format=rgba[grid];[grid][cutout]overlay=0:0:format=auto[split];`+
  `[f]${cover(1188*k,2114*k)},crop=${w}:${h}:${54*k}:${160*k},setsar=1[wide];`+
  `[punch]${cover(1296*k,2306*k)},crop=${w}:${h}:${108*k}:${250*k},setsar=1[tight];`+
  `[wide][tight]overlay=0:0:enable='${(F.punches||[]).map(([a,b])=>`gte(t,${a})*lt(t,${b})`).join('+')||'0'}'[full];`+
  `[full][split]overlay=0:0:enable='${enable}':format=auto[base0];${mediaFilters.join('')}[base${mediaIndex}][4:v]overlay=0:0:format=auto,tpad=stop_mode=clone:stop_duration=0.1,format=yuv420p[v];`+
  `[0:a]aresample=48000[voice];[voice][5:a]amix=inputs=2:duration=first:normalize=0[a]`;
 await ffmpeg(['-i',P.source,'-i',join(P.cache,'person-mask.mkv'),'-loop','1','-i',join(P.cache,'cardmask.png'),'-loop','1','-i',join(P.cache,'grid.png'),'-i',join(P.cache,final?'final_graphics.mov':'draft_graphics.mov'),'-i',join(P.cache,'quiet-cues.wav'),...mediaArgs,'-filter_complex',filter,'-map','[v]','-map','[a]','-c:v','libx264','-preset','fast','-crf',final?'17':'20','-r',String(fps),'-c:a','aac','-b:a','192k','-t',String(F.duration),'-movflags','+faststart','-progress',join(P.cache,'encode-progress.txt'),prefix+'.pending.mp4']);
 const encoded=probe(prefix+'.pending.mp4');if(encoded.width!==w||encoded.height!==h||!encoded.audio||Math.abs(encoded.duration-F.duration)>.1)throw Error('Encoded output failed metadata checks. Previous export preserved.');
 renameSync(prefix+'.pending.mp4',prefix+'.mp4');
}
await ffmpeg(['-i',prefix+'.mp4','-vf',`fps=${25/F.duration},scale=216:384,tile=5x5`,'-frames:v','1',join(P.out,'contact.png')]);
const samples=Array.from({length:6},(_,i)=>Math.round((P.config.reviewTimes||[F.duration/2])[Math.round(i*((P.config.reviewTimes?.length||1)-1)/5)]*fps));
await ffmpeg(['-i',prefix+'.mp4','-vf',`select='${samples.map(n=>`eq(n,${n})`).join('+')}',scale=360:640,tile=3x2`,'-frames:v','1',join(P.out,'phone.png')]);
await ffmpeg(['-ss',String(Math.max(0,(F.fullscreen?.[0]?.a||F.scenes?.[0]?.a||.1)-.1)),'-i',prefix+'.mp4','-vf','fps=10,scale=180:320,tile=8x1','-frames:v','1',join(P.out,'strip.png')]);
writeFileSync(prefix+'.json',JSON.stringify({sourceHash:hash,width:w,height:h,fps,duration:F.duration},null,2));
console.log(JSON.stringify(probe(prefix+'.mp4')));
if(final){copyFileSync(join(P.dir,P.config.thumbnail.file),join(P.out,'thumbnail.png'));const stamp=t=>{const ms=Math.round(t*1000);return `${String(Math.floor(ms/3600000)).padStart(2,'0')}:${String(Math.floor(ms/60000)%60).padStart(2,'0')}:${String(Math.floor(ms/1000)%60).padStart(2,'0')},${String(ms%1000).padStart(3,'0')}`;};writeFileSync(join(P.out,'captions.en.srt'),F.captions.map(([a,b,s],i)=>`${i+1}\n${stamp(a)} --> ${stamp(b)}\n${s}\n`).join('\n'));}
console.log(`Ready: ${prefix}.mp4`);
