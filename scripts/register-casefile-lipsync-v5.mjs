import {readFileSync,writeFileSync,mkdirSync,copyFileSync,existsSync,statSync} from 'node:fs';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {probe} from '../lib/ffmpeg.mjs';

const project='texas-ten-thousand-steps',root=process.cwd();
const folder=join(root,'projects',project),shots=join(folder,'assets/shots');
const guideRoot=join(root,'story-projects',project,'assets/speech-guides-v5-mysterious-bird');
const manifest=JSON.parse(readFileSync(join(guideRoot,'MANIFEST.json'),'utf8'));
const ids=['01','03','05','28'];
if(ids.some(id=>!existsSync(join(shots,id+'-v5b-lipsync.mp4'))))throw Error('All four approved candidate take files are required');
const editorialPath=join(folder,'editorial.json');
const spec=JSON.parse(readFileSync(editorialPath,'utf8'));
if(spec.performanceVersion!==4)throw Error('Refuse to replace a non-V4 baseline');
const checkpoint=join(folder,'versions/v4-before-bird-lipsync');
if(existsSync(join(checkpoint,'editorial.json'))){
 const saved=JSON.parse(readFileSync(join(checkpoint,'editorial.json'),'utf8'));if(saved.performanceVersion!==4)throw Error('Existing checkpoint is not V4');
}else{
 mkdirSync(checkpoint,{recursive:true});
 for(const file of ['editorial.json','project.json','PERFORMANCE_V4.json','PREVIEW_POLISH_REVIEW.json','OPENING_POLISH.md']){
  const p=join(folder,file);if(existsSync(p))copyFileSync(p,join(checkpoint,file));
 }
}
const assets=join(root,'story-projects',project,'assets'),audioBackup=join(assets,'versions/v4-before-bird-lipsync');
mkdirSync(audioBackup,{recursive:true});
for(const file of ['narration.wav','narration.fitted.wav','mix.wav','score.wav','foley.wav','SOUND_EVENTS.json']){
 const p=join(assets,file),saved=join(audioBackup,file);if(existsSync(p)&&!existsSync(saved))copyFileSync(p,saved);
}
const sha=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const rootGeneration=JSON.parse(readFileSync(join(shots,'03-generation.json'),'utf8'));
for(const id of ids){
 const take=id+'-v5b-lipsync',video=join(shots,take+'.mp4'),genPath=join(shots,take+'-generation.json');
 if(existsSync(genPath))throw Error('Preserve existing generation record '+genPath);
 const item=manifest.shots.find(s=>s.shot===id),keyframe=join(root,item.sourceImage),prompt=join(root,item.sourcePrompt),guide=join(root,item.guide);
 if(sha(guide)!==item.guideSHA256)throw Error('Guide checksum mismatch '+id);
 const submission=join(root,'.cache',project,take+'-sample-submitted.json');
 const decodeSubmission=join(root,'.cache',project,take+'-decode-submitted.json');
 const sample=JSON.parse(readFileSync(submission,'utf8'));
 const decoded=JSON.parse(readFileSync(decodeSubmission,'utf8'));
 const metadata=probe(video);
 if(metadata.width!==352||metadata.height!==640||metadata.fps!==24||Math.abs(metadata.duration-107/24)>.04||metadata.audio)throw Error('Unexpected native take metadata '+id);
 const record={input:{imageHash:sha(keyframe),promptHash:sha(prompt),audioGuideHash:sha(guide),modelManifestHash:rootGeneration.input.modelManifestHash,generatorHash:rootGeneration.input.generatorHash,adapterHash:rootGeneration.input.adapterHash,width:352,height:640,frames:107,steps:8,turbo:true,seed:sample.seed},metadata,status:'Speech-guided alternative take; full decode checked by pinned generator; visual review separate.',voiceGuide:{source:item.guide,sha256:item.guideSHA256,transcript:item.voiceLine,performanceTiming:'V4 fitted Bird voice, mapped by shot playbackRate including 125ms source handle'},promptIds:{sample:sample.promptId,decode:decoded.promptId},artifacts:{video:video.slice(root.length+1),videoSHA256:sha(video),image:item.sourceImage,imageSHA256:sha(keyframe),prompt:item.sourcePrompt,promptSHA256:sha(prompt)},createdAt:statSync(video).mtime.toISOString()};
 writeFileSync(genPath,JSON.stringify(record,null,2)+'\n');
 const shot=spec.shots.find(s=>s.id===id);shot.previewTake=take;
 if(id==='01'||id==='05')shot.previewTrack=`v5-lipsync/${id}.json`;
}
spec.performanceVersion=5;
spec.performanceNote='V5 preview: Bird mouth source takes regenerated with the exact V4 fitted dialogue as H3 AddGuide audio, time-mapped to each shot playback rate. User-selected Bird timbre is retained with a restrained, time-limited low-mid warmth and reduced upper presence; no pitch shift, modulation, hiss or echo. New takes are preserved separately from V4. Voice tone and visual sync remain subject to user review.';
writeFileSync(editorialPath,JSON.stringify(spec,null,2)+'\n');
writeFileSync(join(folder,'PERFORMANCE_V5.json'),JSON.stringify({version:5,duration:spec.duration,sourceVersion:'V4',voiceDirection:'same Bird identity, more serious, measured and mysterious; light low-mid warmth and reduced top-end presence only',voiceEffect:'EQ only; 190 Hz +1.3 dB and 4.6 kHz -1.2 dB, enabled only during Bird voice lines; no pitch/time change',lipSync:{method:'MiniMax H3 AddGuide conditioned on exact fitted voice track per shot',shots:ids,guideDirectory:'story-projects/texas-ten-thousand-steps/assets/speech-guides-v5-mysterious-bird',playbackRateMatched:true,sourceHandlesSeconds:.125},otherCast:'Javelina, narrator timing, captions, footage and story unchanged',approval:'Preview only; no video export.'},null,2)+'\n');
console.log('Registered separate V5 speech-guided takes for '+ids.join(', ')+'. V4 sources, audio and composition checkpoint preserved.');
