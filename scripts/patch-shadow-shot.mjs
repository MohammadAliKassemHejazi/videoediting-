import {bundle} from '@remotion/bundler';
import {selectComposition,renderMedia} from '@remotion/renderer';
import {readFileSync,writeFileSync,existsSync,openSync,closeSync,unlinkSync,copyFileSync,cpSync} from 'node:fs';
import {createHash,randomUUID} from 'node:crypto';
import {join} from 'node:path';
import assert from 'node:assert/strict';
import {studioBrowserExecutable} from '../lib/studio-browser.mjs';
import {generatedStoryDigest} from '../lib/generated-story.mjs';
import {ffmpeg,probe} from '../lib/ffmpeg.mjs';
import {replaceWorkspaceFile} from '../lib/replace-file.mjs';
const root=process.cwd(),out=join(root,'out/shadow-went-first'),cache=join(root,'.cache/shadow-went-first'),lock=join(root,'.cache/render.lock');
const baseline=JSON.parse(readFileSync(join(cache,'patch-baseline.json'),'utf8')),spec=JSON.parse(readFileSync('remotion/shadow-work.json','utf8')),manifest=JSON.parse(readFileSync(join(out,'generated-story.json'),'utf8')),index=4;
const hash=f=>createHash('sha256').update(readFileSync(f)).digest('hex');
assert.equal(manifest.sourceDigest,baseline.sourceDigest,'Snapshot must match existing render.');assert.equal(hash(join(out,'draft.mp4')),baseline.filmSha,'Film changed since patch snapshot.');
for(const [file,digest]of Object.entries(baseline.sources))if(!['remotion/shadow-work.json','story-projects/shadow-went-first/assets/shots/04.mp4'].includes(file))assert.equal(hash(file),digest,'Unrelated source changed: '+file);
const oldSpec=structuredClone(baseline.spec),newSpec=structuredClone(spec);oldSpec.shots[index]=null;newSpec.shots[index]=null;assert.deepEqual(newSpec,oldSpec,'Only selected shot may change.');
for(const key of ['id','at','duration','in','frames','file'])assert.equal(spec.shots[index][key],baseline.spec.shots[index][key],'Timing/source slot changed.');
const from=Math.ceil(spec.shots[index].at*60),end=Math.ceil(spec.shots[index+1].at*60),sourceDigest=generatedStoryDigest(root),fd=openSync(lock,'wx');writeFileSync(fd,String(process.pid));
try{
 const pub=join(cache,'render-public');cpSync('remotion/public/shadow-went-first',join(pub,'shadow-went-first'),{recursive:true});cpSync('remotion/public/fonts',join(pub,'fonts'),{recursive:true});
 const serveUrl=await bundle({entryPoint:join(root,'remotion/ShadowExport.jsx'),publicDir:pub,outDir:join(cache,'patch-bundle')}),browserExecutable=studioBrowserExecutable(),composition=await selectComposition({serveUrl,id:'shadow-went-first',browserExecutable}),patch=join(cache,'shot-04-replacement.mp4');let last=-1;
 await renderMedia({serveUrl,composition,browserExecutable,outputLocation:patch,codec:'h264',pixelFormat:'yuv420p',hardwareAcceleration:'if-possible',videoBitrate:'14M',frameRange:[from,end-1],muted:true,concurrency:4,offthreadVideoThreads:2,onProgress:p=>{const pc=Math.floor(p.progress*10)*10;if(pc!==last){console.log('Replacement shot '+pc+'%');last=pc}}});
 const backup=join(out,'before-04-repair.mp4');if(!existsSync(backup))copyFileSync(join(out,'draft.mp4'),backup);
 const pending=join(out,randomUUID()+'.patch-pending.mp4');
 await ffmpeg(['-i',join(out,'draft.mp4'),'-i',patch,'-filter_complex',`[0:v]split=2[head][tail];[head]trim=end_frame=${from},setpts=PTS-STARTPTS[a];[1:v]setpts=PTS-STARTPTS[b];[tail]trim=start_frame=${end},setpts=PTS-STARTPTS[c];[a][b][c]concat=n=3:v=1:a=0,fps=60[v]`,'-map','[v]','-map','0:a','-c:v','h264_nvenc','-preset','p5','-cq','18','-b:v','0','-pix_fmt','yuv420p','-c:a','copy','-movflags','+faststart',pending]);
 await ffmpeg(['-v','error','-i',pending,'-f','null','-']);const meta=probe(pending);assert.equal(meta.width,1440);assert.equal(meta.height,2560);assert.equal(meta.fps,60);assert.ok(meta.audio&&Math.abs(meta.duration-spec.duration)<.15);assert.equal(generatedStoryDigest(root),sourceDigest,'Sources changed during patch.');
 replaceWorkspaceFile(pending,join(out,'draft.mp4'));writeFileSync(join(out,'generated-story.json'),JSON.stringify({...manifest,...meta,sourceDigest,patch:{shot:'04',fromFrame:from,endFrameExclusive:end,baselineDigest:baseline.sourceDigest,method:'Remotion replacement frames; exact frame trims and NVENC reassembly; original mastered audio copied'},created:new Date().toISOString()},null,2)+'\n');console.log('Repaired shot integrated; full decode passed.');
}finally{closeSync(fd);unlinkSync(lock)}
