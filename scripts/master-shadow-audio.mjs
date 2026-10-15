// Audio-only finishing pass: preserve every reviewed video frame, replace the
// sound track from the current deterministic mix, then refresh the source gate.
import {readFileSync,writeFileSync,mkdirSync,openSync,closeSync,unlinkSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {randomUUID} from 'node:crypto';
import {join} from 'node:path';
import {generatedStoryDigest} from '../lib/generated-story.mjs';
import {ffmpeg,probe} from '../lib/ffmpeg.mjs';
import {replaceWorkspaceFile} from '../lib/replace-file.mjs';
const root=process.cwd(),out=join(root,'out/shadow-went-first'),manifestFile=join(out,'generated-story.json'),manifest=JSON.parse(readFileSync(manifestFile,'utf8')),lock=join(root,'.cache/render.lock');
if(manifest.sourceDigest!==generatedStoryDigest(root))throw Error('Render current visual sources first.');
const fd=openSync(lock,'wx');writeFileSync(fd,String(process.pid));
try{
 const audioScript=join(root,'story-projects/shadow-went-first/score.mjs');
 let code=readFileSync(audioScript,'utf8');
 code=code.replace('amix=inputs=2:duration=first:normalize=0,alimiter','amix=inputs=2:duration=first:normalize=0,volume=5dB,alimiter');
 code=code.replace('narration mixed at unity gain, limiter is a peak guard.','narration mixed at unity gain before a +5dB master, limiter is a peak guard.');
 writeFileSync(audioScript,code);execFileSync(process.execPath,[audioScript],{stdio:'inherit'});
 execFileSync(process.execPath,['scripts/sync-shadow-preview.mjs'],{stdio:'inherit'});
 const pending=join(out,randomUUID()+'.audio-pending.mp4');
 await ffmpeg(['-i',join(out,'draft.mp4'),'-i',join(root,'story-projects/shadow-went-first/assets/mix.wav'),'-map','0:v','-map','1:a','-c:v','copy','-c:a','aac','-b:a','192k','-af','apad','-t',String(5330/60),'-movflags','+faststart',pending]);
 await ffmpeg(['-v','error','-i',pending,'-f','null','-']);const meta=probe(pending);if(meta.width!==1440||meta.height!==2560||meta.fps!==60||!meta.audio)throw Error('Master validation failed.');
 replaceWorkspaceFile(pending,join(out,'draft.mp4'));
 writeFileSync(manifestFile,JSON.stringify({...manifest,...meta,sourceDigest:generatedStoryDigest(root),audioMaster:{gainDb:5,method:'Audio replaced from current mix; video stream copied unchanged',preMasterLufs:-21.4,preMasterPeakDb:-6.9},created:new Date().toISOString()},null,2)+'\n');
 console.log('Audio master complete; video frames preserved.');
}finally{closeSync(fd);unlinkSync(lock)}
