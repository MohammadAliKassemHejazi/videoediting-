import {readFileSync,writeFileSync,mkdirSync,copyFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
import vm from 'node:vm';
import {chromium} from 'playwright';
import {ffmpeg,probe} from '../lib/ffmpeg.mjs';
const sandbox={window:{}};vm.createContext(sandbox);vm.runInContext(readFileSync('overlays/reference-edit.js','utf8'),sandbox);const F=sandbox.window.REFERENCE_EDIT;
const final=process.argv.includes('--final'),review=process.argv.includes('--review'),w=final?1080:540,h=final?1920:960,fps=final?60:30,k=w/1080;
const prefix=`out/${F.id}${final?'':'_draft'}`;mkdirSync('out/reference-edit',{recursive:true});
const browser=await chromium.launch();
try{
 const p=await browser.newPage({viewport:{width:1080,height:1920}});await p.goto(pathToFileURL(resolve('reference-edit.html')).href);await p.evaluate(async()=>{await Promise.all(FONTS.map(f=>document.fonts.load(f)));await ASSETS_READY;});
 for(const kind of ['grid','cardmask']){
  const png=await p.evaluate(kind=>{const cc=document.createElement('canvas');cc.width=1080;cc.height=1920;const g=cc.getContext('2d');g.fillStyle=kind==='grid'?'#0B0B0C':'black';g.fillRect(0,0,1080,1920);if(kind==='grid'){g.strokeStyle='#FFFFFF0A';g.lineWidth=1.5;for(let x=0;x<=1080;x+=120){g.beginPath();g.moveTo(x,0);g.lineTo(x,1920);g.stroke();}for(let y=0;y<=1920;y+=120){g.beginPath();g.moveTo(0,y);g.lineTo(1080,y);g.stroke();}}else{g.fillStyle='white';g.beginPath();g.roundRect(0,1120,1080,1000,100);g.fill();}return cc.toDataURL('image/png').split(',')[1];},kind);writeFileSync(`out/reference-edit/${kind}.png`,Buffer.from(png,'base64'));
 }
 // Inspect all editorial sections and verify deterministic reverse seeks.
 const times=[0,4.8,9,10.2,15,16.8,18,19.3,20.5,24.5,29.9,31.4,32.9,35.3,38.7,40.1,41.4,44,47,49.5,50.7,53.3,54.7,58.4,63.5];
 const hashes=new Map();for(const t of times){await p.evaluate(t=>seek(t),t);const buf=await p.locator('#c').screenshot({omitBackground:true});hashes.set(t,buf.toString('base64'));if(process.argv.includes('--frames'))writeFileSync(`out/reference-edit/overlay-${t}.png`,buf);}
 for(const t of [...times].reverse()){await p.evaluate(t=>seek(t),t);const buf=await p.locator('#c').screenshot({omitBackground:true});if(buf.toString('base64')!==hashes.get(t))throw Error(`Non-deterministic frame ${t}`);}
 console.log(`Checked ${times.length} scenes, forward/reverse.`);
}finally{await browser.close();}
if(!review){
 // Soft, short mechanical ticks; no music, risers or tonal beeps.
 const rate=48000,n=Math.ceil(F.duration*rate),pcm=Buffer.alloc(n*2);let seed=6241;
 for(const at of F.cues){let smooth=0;for(let j=0;j<rate*.036;j++){seed=(1664525*seed+1013904223)>>>0;const noise=(seed/4294967296)*2-1;smooth=.76*smooth+.24*noise;const tt=j/rate,env=Math.sin(Math.PI*tt/.036)**2*Math.exp(-tt*130),v=.035*env*(smooth+.25*Math.sin(tt*2*Math.PI*310));const off=Math.round(at*rate)+j;if(off<n)pcm.writeInt16LE(Math.round(v*32767),off*2);}}
 const head=Buffer.alloc(44);head.write('RIFF');head.writeUInt32LE(pcm.length+36,4);head.write('WAVEfmt ',8);head.writeUInt32LE(16,16);head.writeUInt16LE(1,20);head.writeUInt16LE(1,22);head.writeUInt32LE(rate,24);head.writeUInt32LE(rate*2,28);head.writeUInt16LE(2,32);head.writeUInt16LE(16,34);head.write('data',36);head.writeUInt32LE(pcm.length,40);writeFileSync('out/reference-edit/quiet-cues.wav',Buffer.concat([head,pcm]));
 execFileSync(process.execPath,['render.mjs','--page','reference-edit.html','--w',String(w),'--h',String(h),'--fps',String(fps),'--sub',final?'2':'1','--workers',final?'6':'4','--gpu','false','--dur',String(F.duration),'--alpha','--alpha-codec','qtrle','--out',prefix+'_graphics.mov'],{stdio:'inherit'});
 const enable=F.split.map(([a,b])=>`gte(t,${a})*lt(t,${b})`).join('+'),sw=1080*k,sh=1922*k,offset=400*k;
 const filter=`[0:v]fps=${fps},split=3[s][f][punch];`+
  `[s]scale=${sw}:${sh}:flags=lanczos,pad=${w}:${Math.round(sh+offset)}:0:${offset},crop=${w}:${h}:0:0,setsar=1[speaker];`+
  `[1:v]fps=${fps},erosion,erosion,gblur=sigma=0.5,scale=${sw}:${sh}:flags=bilinear,pad=${w}:${Math.round(sh+offset)}:0:${offset},crop=${w}:${h}:0:0,format=gray[seg];`+
  `[2:v]scale=${w}:${h},format=gray[card];[seg][card]blend=all_mode=lighten[mask];[speaker][mask]alphamerge[cutout];`+
  `[3:v]scale=${w}:${h},format=rgba[grid];[grid][cutout]overlay=0:0:format=auto[split];`+
  `[f]scale=${1188*k}:${2114*k}:flags=lanczos,crop=${w}:${h}:${54*k}:${160*k},setsar=1[wide];`+
  `[punch]scale=${1296*k}:${2306*k}:flags=lanczos,crop=${w}:${h}:${108*k}:${250*k},setsar=1[tight];`+
  `[wide][tight]overlay=0:0:enable='between(t,3.56,6.54)+between(t,24.06,26.3)+between(t,58.16,60.06)'[full];`+
  `[full][split]overlay=0:0:enable='${enable}':format=auto[base];[base][4:v]overlay=0:0:format=auto,format=yuv420p[v];`+
  `[0:a]aresample=48000[voice];[voice][5:a]amix=inputs=2:duration=first:normalize=0[a]`;
 await ffmpeg(['-i','clips/0928(5).mp4','-i','out/reference-edit/person-mask.mkv','-loop','1','-i','out/reference-edit/cardmask.png','-loop','1','-i','out/reference-edit/grid.png','-i',prefix+'_graphics.mov','-i','out/reference-edit/quiet-cues.wav','-filter_complex',filter,'-map','[v]','-map','[a]','-c:v','libx264','-preset','fast','-crf',final?'17':'20','-r',String(fps),'-c:a','aac','-b:a','192k','-t',String(F.duration),'-movflags','+faststart',prefix+'.mp4']);
}
await ffmpeg(['-i',prefix+'.mp4','-vf','fps=1/2.5,scale=216:384,tile=5x6','-frames:v','1',prefix+'_contact.png']);
await ffmpeg(['-ss','29.7','-i',prefix+'.mp4','-vf','fps=0.8,scale=360:640,tile=3x2','-frames:v','1',prefix+'_phone.png']);
await ffmpeg(['-ss','38.2','-i',prefix+'.mp4','-vf','fps=0.8,scale=360:640,tile=3x2','-frames:v','1',prefix+'_css.png']);
copyFileSync(prefix+'_contact.png','out/contact.png');
console.log(JSON.stringify(probe(prefix+'.mp4')));
if(final)copyFileSync(prefix+'.mp4','out/final.mp4');
console.log(`Ready: ${prefix}.mp4`);
