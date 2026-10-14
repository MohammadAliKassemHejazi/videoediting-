import {mkdirSync,writeFileSync,readFileSync,existsSync,copyFileSync} from 'node:fs';
import {join} from 'node:path';
import {ROOT,project,sourceHash} from '../lib/project.mjs';
import {ffmpeg,probe} from '../lib/ffmpeg.mjs';
import {PRO_CLIP_STYLES} from '../lib/pro-clip-spec.mjs';
const p=project('backend-checklist'),meta=JSON.parse(readFileSync(join(p.cache,'person-mask.done.json'),'utf8'));
if(meta.sourceHash!==sourceHash(p)||meta.framing!==JSON.stringify(p.config.framing))throw Error('Refresh the source person mask before editing.');
const publicDir=join(ROOT,'remotion/public/pro-clips');mkdirSync(publicDir,{recursive:true});mkdirSync(join(ROOT,'.cache/pro-clips'),{recursive:true});
const key=sourceHash(p)+'-proclip-v2',keyFile=join(publicDir,'prepared.sha256');
if(!existsSync(keyFile)||readFileSync(keyFile,'utf8')!==key){
 await ffmpeg(['-i',p.source,'-t','15','-vf','scale=1440:2560:force_original_aspect_ratio=increase,crop=1440:2560:(iw-ow)*0.5:(ih-oh)*0.5,fps=60','-c:v','libx264','-crf','18','-preset','fast','-pix_fmt','yuv420p','-an','-movflags','+faststart',join(publicDir,'base.mp4')]);
 await ffmpeg(['-i',p.source,'-t','15','-vn','-ar','48000','-ac','2','-c:a','pcm_s16le',join(publicDir,'voice.wav')]);
 await ffmpeg(['-i',p.source,'-i',join(p.cache,'person-mask.mkv'),'-filter_complex','[0:v]fps=30,scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280:(iw-ow)*0.5:(ih-oh)*0.5,format=rgb24[src];[1:v]fps=30,erosion,erosion,erosion,dilation,dilation,gblur=sigma=0.6,scale=720:1280:flags=bilinear,format=gray[m];[src][m]alphamerge[v]','-map','[v]','-t','15','-an','-c:v','libvpx-vp9','-pix_fmt','yuva420p','-crf','24','-b:v','0','-deadline','realtime','-cpu-used','6','-row-mt','1','-auto-alt-ref','0',join(publicDir,'person.webm')]);
 writeFileSync(keyFile,key);
}
await ffmpeg(['-c:v','libvpx-vp9','-i',join(publicDir,'person.webm'),'-ss','1','-frames:v','1',join(ROOT,'.cache/pro-clips/person-check.png')]);
// The authored source/meaning are shared; each treatment has its own choreography.
const captions=p.film.captions.filter(([a])=>a<15).map(([a,b,text])=>[a,Math.min(b,15),text]);
mkdirSync(join(p.dir,'pro-edits'),{recursive:true});
writeFileSync(join(ROOT,'remotion/pro-clips.json'),JSON.stringify({sourceProject:p.id,duration:15,sourceHash:sourceHash(p),captions,styles:PRO_CLIP_STYLES.map(s=>s.id)},null,2)+'\n');
for(const style of PRO_CLIP_STYLES){
 const folder=join(ROOT,'projects',style.id);mkdirSync(join(folder,'assets'),{recursive:true});
 const config={...style,kind:'clip-audition',title:style.name,sourceProject:p.id,source:p.config.source,start:0,duration:15,export:{width:1440,height:2560,fps:60},composition:style.id,thumbnail:{file:'assets/thumbnail.png'},media:'pro-clips',sourceHash:sourceHash(p)};
 writeFileSync(join(folder,'project.json'),JSON.stringify(config,null,2)+'\n');
 if(!existsSync(join(folder,'assets/thumbnail.png')))copyFileSync(join(p.dir,'assets/thumbnail.png'),join(folder,'assets/thumbnail.png'));
 writeFileSync(join(folder,'BRIEF.md'),`# ${style.name}\n\nSame original 0–15 second backend clip, Arabic speech at original gain and corrected English captions. ${style.style}. Real moving speaker matte enables background/type occlusion. This is a creative sample, not a reviewed full film. Sources, approved reference and original exports are preserved.\n`);
 writeFileSync(join(folder,'STYLE_RESEARCH.md'),'# 2026-10-14 creative research\n\nhttps://www.capcut.com/resource/how-to-put-text-behind-a-person-in-capcut documents the background/text/foreground-cutout depth technique.\nhttps://ads.tiktok.com/business/en-US/creative-codes recommends a hook/body/close structure and intentional motion, text and sound. These are creative-platform guidance, not proof that this clip will go viral.\n\nTreatment: '+style.style+'. Exact text follows the corrected transcript in projects/backend-checklist/timeline.js. Code examples are labeled illustrative.\n');
}
console.log('Prepared original voice, aligned moving cutout and five clip projects.');
console.log(probe(join(publicDir,'base.mp4')));
