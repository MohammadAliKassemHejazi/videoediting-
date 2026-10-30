import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {join} from 'node:path';
import {ffmpeg} from '../lib/ffmpeg.mjs';
const root=process.cwd(),id='texas-ten-thousand-steps',p=join(root,'projects',id),assets=join(root,'story-projects',id,'assets');
const spec=JSON.parse(readFileSync(join(p,'editorial.json'),'utf8'));
const dir=join(assets,'bookend-speech-v9');mkdirSync(dir,{recursive:true});
for(const key of ['opening','ending']){
 const start=key==='opening'?0:spec.duration-15;
 await ffmpeg(['-threads','2','-i',join(assets,'narration.wav'),'-af',`atempo=1.1,atrim=start=${start}:duration=15,asetpts=PTS-STARTPTS,aresample=32000,apad=pad_dur=0.5,atrim=end_sample=482667,asetpts=N/SR/TB`,'-ar','32000','-ac','1','-c:a','pcm_s16le',join(dir,key+'.wav')]);
 const base=readFileSync(join(p,'prompts/motion',`v8-${key}15.txt`),'utf8').replace('No exact lip-sync requirement.','');
 const schedule=key==='opening'?'0.00-3.88 seconds: only the Vulture Banker speaks, Javelina listens with a closed mouth. 3.88-7.05 seconds: only Javelina speaks, Banker listens. 7.05-12.30 seconds: only the Banker speaks. 12.30-15.00 seconds: only Javelina speaks. Match the small beak or mouth articulations to the supplied audio guide during each assigned turn.':'Throughout this15-second ending, the Banker provides the supplied speech while Javelina acts silently. Match the Banker lower beak movements to the entire guide; at11.52seconds he turns toward the camera to deliver the final question. Javelina never moves his mouth as if speaking.';
 const prompt=base.replace('integrated_multimodal_description:','integrated_multimodal_description: SPEECH PERFORMANCE: '+schedule+' Keep small natural articulation, closed mouths in pauses, no giant grin or human teeth on the bird. Preserve the original walking, stop and camera beats below. ');
 writeFileSync(join(p,'prompts/motion',`v9-${key}15.txt`),prompt,'utf8');
 console.log(key+': exact final-speed voice guide prepared for15-second source time, no offset or source retiming.');
}
