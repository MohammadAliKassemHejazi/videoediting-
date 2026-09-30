import {execFileSync} from 'node:child_process';
import {mkdirSync,readFileSync,writeFileSync,copyFileSync} from 'node:fs';
import vm from 'node:vm';
import {ffmpeg,probe} from './ffmpeg.mjs';
import {artifactHash} from './artifact-review.mjs';

mkdirSync('out',{recursive:true});
const box={window:{}};vm.createContext(box);vm.runInContext(readFileSync('overlays/developer-aligned.js','utf8'),box);
vm.runInContext(readFileSync('overlays/developer-artifacts.js','utf8'),box);
const F={...box.window.ALIGNED,...box.window.ARTIFACT_FILM},final=process.argv.includes('--final'),width=final?1080:540,height=final?1920:960,fps=final?60:30,k=width/1080;
const prefix=`out/${F.id}${final?'':'_draft'}`;
const even=v=>Math.round(v*k/2)*2,p=Object.fromEntries(Object.entries(F.panel).map(([key,v])=>[key,even(v)]));

// Sparse, deterministic ticks: no music, bass hits, or whooshes. Peak -34 dBFS.
const cueEvents=F.events,cues=[...new Set(cueEvents.map(e=>e.t))].sort((a,b)=>a-b);
writeFileSync('cues.json',JSON.stringify(cueEvents.map(e=>({t:e.t,type:'click',gain:.025,event:e.id,action:e.action})),null,2));
writeFileSync('beats.json',JSON.stringify({source:F.source,clock:'speech-anchored events; not music tempo',bpm:null,beats:cues,hits:cues,events:cueEvents},null,2));
const rate=48000,samples=Math.ceil(F.duration*rate),pcm=Buffer.alloc(samples*2);
for(const at of cues){const marker=cueEvents.some(e=>e.t===at&&e.action==='highlight'),dur=marker?.045:.026;
  for(let i=0;i<dur*rate;i++){const t=i/rate,env=Math.sin(Math.PI*t/dur)**2*Math.exp(-t*90),v=.018*env*(Math.sin(2*Math.PI*(marker?1250:1750)*t)+.15*Math.sin(2*Math.PI*3200*t));
    const pos=Math.round(at*rate)+i;if(pos<samples)pcm.writeInt16LE(Math.max(-32768,Math.min(32767,pcm.readInt16LE(pos*2)+Math.round(v*32767))),pos*2);
  }
}
const wav=Buffer.alloc(44);wav.write('RIFF');wav.writeUInt32LE(36+pcm.length,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(rate,24);wav.writeUInt32LE(rate*2,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(pcm.length,40);
writeFileSync(`out/${F.id}_sfx.wav`,Buffer.concat([wav,pcm]));writeFileSync(`out/${F.id}_sfx.json`,JSON.stringify({peakDbfs:-34.9,cues},null,2));

if(!process.argv.includes('--review')){
  if(final){const review=JSON.parse(readFileSync('out/artifact-review.json','utf8'));if(!review.approvedForRender||review.sourceHash!==artifactHash())throw Error('Review out/contact.png and complete the artifact audit for the current source before final render.');}
  writeFileSync(prefix+'_render.json',JSON.stringify({sourceHash:artifactHash(),width,height,fps,duration:F.duration},null,2));
  execFileSync(process.execPath,['render.mjs','--page','index.html','--w',String(width),'--h',String(height),'--fps',String(fps),'--sub',final?'2':'1','--workers',final?'6':'4','--gpu','false','--dur',String(F.duration),'--alpha','--alpha-codec','qtrle','--out',prefix+'_graphics.mov'],{stdio:'inherit'});
  const fh=Math.max(even(854/480*F.panel.foregroundW),p.h+p.foregroundCropY),padBottom=fh-even(854/480*F.panel.foregroundW);
  const punchW=even(1080*1.16),punchH=even(1920*1.16),enable=F.breakouts.map(([a,b])=>`gte(t,${a})*lt(t,${b})`).join('+');
  const filter=`[0:v]fps=${fps},split=3[back][front][punch];`+
    `[back]scale=${p.w}:${p.h}:force_original_aspect_ratio=increase,crop=${p.w}:${p.h},gblur=sigma=26,eq=brightness=-0.12:saturation=0.85[blur];`+
    `[front]scale=${p.foregroundW}:-2:flags=lanczos,pad=${p.foregroundW}:${fh}:0:0${padBottom>0?`,fillborders=bottom=${padBottom}:mode=smear`:''},crop=${p.foregroundW}:${p.h}:0:${p.foregroundCropY}[face];`+
    `[blur][face]overlay=${(p.w-p.foregroundW)/2}:0,setsar=1,pad=${width}:${height}:${p.x}:${p.y}:color=0x0B0F17[stage];`+
    `[punch]scale=${punchW}:${punchH},crop=${width}:${height}:${(punchW-width)/2}:${Math.round((punchH-height)*.4)}[full];`+
    `[stage][full]overlay=0:0:enable='${enable}'[base];[base][1:v]overlay=0:0:format=auto,format=yuv420p[v];`+
    `[0:a]aresample=48000[voice];[voice][2:a]amix=inputs=2:duration=first:normalize=0[a]`;
  await ffmpeg(['-i',F.source,'-i',prefix+'_graphics.mov','-i',`out/${F.id}_sfx.wav`,'-filter_complex',filter,'-map','[v]','-map','[a]','-c:v','libx264','-preset','fast','-crf',final?'17':'20','-r',String(fps),'-c:a','aac','-b:a','192k','-t',String(F.duration),'-movflags','+faststart',prefix+'.mp4']);
}
await ffmpeg(['-i',prefix+'.mp4','-vf','fps=1/2.5,scale=216:384,tile=5x6','-frames:v','1',prefix+'_contact.png']);
await ffmpeg(['-ss','16.6','-i',prefix+'.mp4','-vf','fps=2,scale=360:640,tile=3x2','-frames:v','1',prefix+'_phone.png']);
await ffmpeg(['-ss','38.1','-i',prefix+'.mp4','-vf','fps=0.7,scale=360:640,tile=3x2','-frames:v','1',prefix+'_native_phone.png']);
await ffmpeg(['-ss','28.7','-i',prefix+'.mp4','-vf','fps=1,scale=360:640,tile=3x2','-frames:v','1',prefix+'_routes_phone.png']);
await ffmpeg(['-ss','40.9','-i',prefix+'.mp4','-frames:v','1',prefix+'_poster.png']);
const syncFrames=[35.03,35.3,37.99,38.3,52.7,53.1].map(t=>`eq(n,${Math.round(t*fps)})`).join('+');
await ffmpeg(['-i',prefix+'.mp4','-vf',`select='${syncFrames}',scale=360:640,tile=3x2`,'-frames:v','1',prefix+'_sync.png']);
if(!final){copyFileSync(prefix+'_contact.png','out/contact.png');copyFileSync(prefix+'_phone.png','out/phone.png');}
else copyFileSync(prefix+'.mp4','out/final.mp4');
const stamp=t=>{const ms=Math.round(t*1000);return `${String(Math.floor(ms/3600000)).padStart(2,'0')}:${String(Math.floor(ms/60000)%60).padStart(2,'0')}:${String(Math.floor(ms/1000)%60).padStart(2,'0')},${String(ms%1000).padStart(3,'0')}`;};
for(const [name,caps] of [['en',F.fullCaptions],['short.en',F.captions]])writeFileSync(`out/${F.id}.${name}.srt`,caps.map(([a,b,s],i)=>`${i+1}\n${stamp(a)} --> ${stamp(b)}\n${s}\n`).join('\n'));
console.log(`Delivered ${prefix}.mp4 (${fps} fps). Voice at original timing and gain; quiet speech-anchored ticks.`);
