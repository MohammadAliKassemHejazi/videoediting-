// Dedicated deliverable pipeline, leaving the sample film and source clip intact.
// node scripts/developer-film.mjs --draft | --final | --review
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import vm from 'node:vm';
import { ffmpeg, probe } from '../lib/ffmpeg.mjs';

mkdirSync('out',{recursive:true});
const source='clips/0928(5).mp4', info=probe(source);
const sandbox={window:{}};vm.createContext(sandbox);
vm.runInContext(readFileSync('overlays/developer-2026.js','utf8'),sandbox);
const film=sandbox.window.DEVELOPER_FILM;
const draft=!process.argv.includes('--final');
const width=draft?540:1080, height=draft?960:1920;
const prefix=draft?'out/developer_2026_draft':'out/developer_2026';
const run=args=>execFileSync(process.execPath,args,{stdio:'inherit'});
if(!process.argv.includes('--review')) {
  run(['render.mjs','--page','developer-2026.html','--w',String(width),'--h',String(height),
    '--fps','30','--sub',draft?'1':'2','--dur',String(info.duration),'--workers',draft?'4':'6',
    '--gpu','false','--alpha','--alpha-codec','qtrle','--out',prefix+'_graphics.mov']);
  const cues=film.scenes.map(([t,,name],i)=>({t:t+.05,type:i%3===0?'whoosh':i%3===1?'pop':'click',gain:.35}));
  for(const t of [17.2,18,18.9,19.7,30.6,31.7,44.6,45,47.1,53.6,57.3,63.25,63.5,63.8])cues.push({t,type:'click',gain:.3});
  writeFileSync('out/developer_2026_cues.json',JSON.stringify(cues,null,2));
  run(['sfx.mjs','out/developer_2026_cues.json','out/developer_2026_sfx.wav','--dur',String(info.duration)]);
  await ffmpeg(['-i',source,'-i',prefix+'_graphics.mov','-i','out/developer_2026_sfx.wav',
    '-filter_complex',`[0:v]scale=${width}:${height}:flags=lanczos,crop=${width}:${height-Math.round(170*height/1920)}:0:${Math.round(170*height/1920)},pad=${width}:${height}:0:0:color=0x101512,setsar=1[base];[base][1:v]overlay=0:0:format=auto,format=yuv420p[v];[0:a]volume=1[a0];[2:a]volume=0.35[a1];[a0][a1]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11[a]`,
    '-map','[v]','-map','[a]','-c:v','libx264','-preset','fast','-crf',draft?'20':'17','-r','30',
    '-c:a','aac','-b:a','192k','-ar','48000','-t',String(info.duration),'-movflags','+faststart',prefix+'.mp4']);
}
// Full-duration review sheet; the standard critique contact sheet covers only 15s.
await ffmpeg(['-i',prefix+'.mp4','-vf','fps=1/2.5,scale=216:384,tile=5x6','-frames:v','1',prefix+'_contact.png']);
await ffmpeg(['-ss','17','-i',prefix+'.mp4','-vf','fps=4,scale=180:320,tile=6x2','-frames:v','1',prefix+'_stack_strip.png']);
await ffmpeg(['-ss','45','-i',prefix+'.mp4','-vf','fps=2,scale=360:640,tile=3x2','-frames:v','1',prefix+'_phone.png']);
await ffmpeg(['-ss','20.4','-i',prefix+'.mp4','-frames:v','1',prefix+'_poster.png']);
const stamp=t=>{const ms=Math.round(t*1000);return `${String(Math.floor(ms/3600000)).padStart(2,'0')}:${String(Math.floor(ms/60000)%60).padStart(2,'0')}:${String(Math.floor(ms/1000)%60).padStart(2,'0')},${String(ms%1000).padStart(3,'0')}`;};
writeFileSync('out/developer_2026.en.srt',film.captions.map(([a,b,s],i)=>`${i+1}\n${stamp(a)} --> ${stamp(b)}\n${s}\n`).join('\n'));
console.log(`Delivered ${prefix}.mp4, review sheets, poster and English SRT.`);
