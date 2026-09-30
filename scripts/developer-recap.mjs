// V2 candidate: fixed split screen with original audio only.
// node scripts/developer-recap.mjs --draft | --final | --review
import {execFileSync} from 'node:child_process';
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import vm from 'node:vm';
import {ffmpeg,probe} from '../lib/ffmpeg.mjs';

mkdirSync('out',{recursive:true});
const box={window:{}};vm.createContext(box);vm.runInContext(readFileSync('overlays/developer-recap.js','utf8'),box);
vm.runInContext(readFileSync('overlays/developer-2026.js','utf8'),box);
const F=box.window.RECAP,info=probe(F.source),final=process.argv.includes('--final');
const width=final?1080:540,height=final?1920:960,scale=width/1080;
const prefix=final?'out/developer_recap_v2':'out/developer_recap_v2_draft';
const p=Object.fromEntries(Object.entries(F.panel).map(([k,v])=>[k,Math.round(v*scale/2)*2]));
// Captures are accompanied by source metadata loaded as a classic script.
writeFileSync('assets/brand/developer-recap/sources.js','window.RECAP_SOURCES = '+readFileSync('assets/brand/developer-recap/sources.json','utf8')+';\n');
if(!process.argv.includes('--review')){
  execFileSync(process.execPath,['render.mjs','--page','developer-recap.html','--w',String(width),'--h',String(height),
    '--fps','30','--sub',final?'2':'1','--workers',final?'6':'4','--gpu','false',
    '--dur',String(info.duration),'--alpha','--alpha-codec','qtrle','--out',prefix+'_graphics.mov'],{stdio:'inherit'});
  await ffmpeg(['-i',F.source,'-i',prefix+'_graphics.mov',
    '-filter_complex',`[0:v]scale=${p.w}:-2:flags=lanczos,crop=${p.w}:${p.h}:0:${p.cropY},setsar=1,pad=${width}:${height}:${p.x}:${p.y}:color=0x10131b[base];[base][1:v]overlay=0:0:format=auto,format=yuv420p[v]`,
    '-map','[v]','-map','0:a:0','-c:v','libx264','-preset','fast','-crf',final?'17':'20',
    '-r','30','-c:a','copy','-t',String(info.duration),'-movflags','+faststart',prefix+'.mp4']);
}
await ffmpeg(['-i',prefix+'.mp4','-vf','fps=1/2.5,scale=216:384,tile=5x6','-frames:v','1',prefix+'_contact.png']);
await ffmpeg(['-ss','17.4','-i',prefix+'.mp4','-vf','fps=2,scale=360:640,tile=3x2','-frames:v','1',prefix+'_phone.png']);
await ffmpeg(['-ss','45.5','-i',prefix+'.mp4','-frames:v','1',prefix+'_poster.png']);
const stamp=t=>{const ms=Math.round(t*1000);return `${String(Math.floor(ms/3600000)).padStart(2,'0')}:${String(Math.floor(ms/60000)%60).padStart(2,'0')}:${String(Math.floor(ms/1000)%60).padStart(2,'0')},${String(ms%1000).padStart(3,'0')}`;};
writeFileSync('out/developer_recap_v2.en.srt',box.window.DEVELOPER_FILM.captions.map(([a,b,s],i)=>`${i+1}\n${stamp(a)} --> ${stamp(b)}\n${s}\n`).join('\n'));
console.log(`V2 delivered: ${prefix}.mp4. Original audio only; no SFX or music added.`);
