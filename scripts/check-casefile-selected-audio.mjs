import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {FFMPEG,duration} from '../lib/ffmpeg.mjs';
const project='texas-ten-thousand-steps',folder='story-projects/'+project+'/assets/',spec=JSON.parse(readFileSync('projects/'+project+'/editorial.json','utf8')),sound=JSON.parse(readFileSync(folder+'SOUND_EVENTS.json','utf8'));
if(spec.performanceVersion!==4||sound.performanceVersion!==4)throw Error('Wrong performance version');
let end=0;for(const shot of spec.shots){if(shot.startFrame!==end)throw Error('Timeline gap');end+=shot.durationFrames}
if(Math.abs(end/60-spec.duration)>.001||spec.words.length!==255||spec.words.some(w=>!Number.isFinite(w.start)||w.start<0||w.end>w.start+10||w.end>spec.duration+.02))throw Error('Word/timeline validation failed');
for(const cue of sound.events){
 if(cue.at<0||cue.at>=spec.duration)throw Error('Out-of-film cue '+cue.type);
 if(cue.source&&(!existsSync(cue.source)||createHash('sha256').update(readFileSync(cue.source)).digest('hex')!==cue.sha256||cue.license!=='CC0-1.0'))throw Error('Sample provenance failed');
}
for(const name of ['mix.wav','narration.wav','foley.wav','score.wav'])if(Math.abs(duration(folder+name)-spec.duration)>.02)throw Error('Track length mismatch '+name);
const result=spawnSync(FFMPEG,['-hide_banner','-nostats','-threads','2','-i',folder+'mix.wav','-filter_threads','1','-af','loudnorm=print_format=json','-f','null','-'],{encoding:'utf8',maxBuffer:1024*1024});
if(result.status!==0)throw Error('Mix decode failed');
const measured=JSON.parse(result.stderr.slice(result.stderr.lastIndexOf('{'),result.stderr.lastIndexOf('}')+1));
if(Math.abs(Number(measured.input_i)+16)>.5||Number(measured.input_tp)>-1.3)throw Error('Master level outside target '+JSON.stringify(measured));
const report={duration:spec.duration,version:4,wordCount:spec.words.length,shots:spec.shots.length,cueCount:sound.events.length,licensedSampleCues:sound.events.filter(e=>e.source).length,measuredMaster:measured,passed:true,videoExported:false,listeningReview:'Not performed; user listening approval pending.',mouthSync:'Existing H3 acting retimed per shot; new phoneme-perfect synchronization not claimed.'};
writeFileSync('projects/'+project+'/AUDIO_V4_QC.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
