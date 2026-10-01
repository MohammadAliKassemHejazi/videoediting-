import {mkdirSync,readFileSync,writeFileSync,existsSync} from 'node:fs';
import {join,resolve,sep} from 'node:path';
import {project,digest} from '../lib/project.mjs';
import {ffmpeg,probe} from '../lib/ffmpeg.mjs';
const P=project(process.argv[2]);mkdirSync(join(P.dir,'assets/inbox'),{recursive:true});mkdirSync(join(P.cache,'media'),{recursive:true});
const requests=[`# Assets for ${P.config.title}`,`Save generated assets under projects/${P.id}/assets/inbox/. Real UI screenshots and brand logos should come from official sources.`,
 `## Thumbnail\nFile: ${P.config.thumbnail.file}\nCreate a striking portrait 9:16 tech cover using a clear frame of the actual speaker as identity reference. Preserve identity. Large headline exactly: "${P.config.thumbnail.headline}". One focal idea, dark editorial treatment with red accent unless this project's brief changes it. Keep all essential text and face inside a centered 3:4 crop, and inspect at 360px width. No invented quotes, stats or claims. Generate with Codex imagegen or the user's image tool. Save the PNG to the file above.`];
let missing=0;
for(const [i,a]of (P.config.assets||[]).entries()){
 const input=resolve(P.dir,a.file);if(!input.startsWith(P.dir+sep))throw Error('Asset file must be inside this project.');
 const ext=a.type==='video'?(a.background==='green'||a.background==='alpha'?'.mov':'.mp4'):'.png',out=join(P.cache,'media',String(i)+ext);
 const green=a.background==='green'?' Flat #00FF00 background, evenly lit, no green in the subject, no background shadows, complete subject inside frame.':' Preserve true alpha when requested.';
 requests.push(`## ${a.id||i}\nFile: ${a.file}\nPurpose: ${a.purpose}\nSpeech anchor: ${a.anchor||a.at+'s'}\nUse: ${a.at}s for ${a.duration}s; ${a.aspect||'9:16'}\nPrompt: ${a.prompt}${green}${a.type==='video'?' Silent video; stable camera unless specified; 0.5s clean entry/exit handles; no baked text or captions.':''}\nRequired: ${a.required!==false}`);
 if(!existsSync(input)){if(a.required!==false)missing++;continue;}
 const key=digest([input,import.meta.filename])+JSON.stringify(a),meta=out+'.json';if(existsSync(out)&&existsSync(meta)&&JSON.parse(readFileSync(meta,'utf8')).key===key)continue;
 const filter=a.background==='green'?`chromakey=0x00FF00:${a.keySimilarity||.15}:${a.keyBlend||.06},format=rgba,despill=type=green`:'format=rgba';
 if(a.type==='video'){
  const p=probe(input);if(p.duration<(a.duration||0)-.05)throw Error(`${a.file} is shorter than its scheduled interval.`);
  await ffmpeg(['-i',input,'-an',...(ext==='.mov'?['-vf',filter,'-c:v','qtrle']:['-c:v','libx264','-pix_fmt','yuv420p','-crf','18']),out]);
 }else await ffmpeg(['-i',input,'-vf',filter,'-frames:v','1',out]);
 writeFileSync(meta,JSON.stringify({key,input,output:out}));
}
writeFileSync(join(P.dir,'ASSET_REQUESTS.md'),requests.join('\n\n')+'\n');
console.log(`Asset prompts: projects/${P.id}/ASSET_REQUESTS.md; ${missing} required media item(s) missing.`);
if(missing&&process.argv.includes('--required'))process.exitCode=1;
