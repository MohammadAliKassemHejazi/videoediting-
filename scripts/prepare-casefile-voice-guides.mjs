import {readFileSync,writeFileSync,mkdirSync,copyFileSync} from 'node:fs';
import {join} from 'node:path';
import {ROOT} from '../lib/project.mjs';
import {ffmpeg,probe,duration as mediaDuration} from '../lib/ffmpeg.mjs';
const project=process.argv[2];if(!/^[a-z0-9-]+$/.test(project||''))throw Error('Safe project ID required');
const folder=join(ROOT,'story-projects',project,'assets'),spec=JSON.parse(readFileSync(join(ROOT,'projects',project,'editorial.json'),'utf8')),out=join(folder,'speech-guides');mkdirSync(out,{recursive:true});
const raw=join(folder,'narration.raw.wav'),voice=join(folder,'narration.wav');
const graph=`[0:a]asplit=2[d][n];[d]atrim=end=${spec.sourceDialogueEnd},asetpts=PTS-STARTPTS,atempo=${spec.dialogueSpeed}[da];[n]atrim=start=${spec.sourceDialogueEnd},asetpts=PTS-STARTPTS,atempo=${spec.narratorSpeed}[na];[da][na]concat=n=2:v=0:a=1,highpass=f=65,apad,atrim=duration=${spec.duration}[a]`;
await ffmpeg(['-threads','2','-i',raw,'-filter_complex_threads','1','-filter_complex',graph,'-map','[a]','-ar','48000','-ac','1','-c:a','pcm_s16le',voice]);
if(Math.abs(mediaDuration(voice)-spec.duration)>.02)throw Error('Voice fit duration mismatch');
copyFileSync(voice,join(folder,'narration.fitted.wav'));
for(const shot of spec.shots.filter(s=>s.speaker)){
 const length=shot.durationFrames/60,rate=length/shot.sourcePlaybackDuration;
 await ffmpeg(['-threads','2','-ss',String(shot.startFrame/60),'-t',String(length),'-i',voice,'-filter_threads','1','-af',`atempo=${rate},adelay=125,apad,atrim=duration=${107/24}`,'-ar','32000','-ac','1','-c:a','pcm_s16le',join(out,shot.id+'.wav')]);
 console.log('Prepared audio guide '+shot.id+' / '+shot.speaker+' / 4-second performance plus handles');
}
writeFileSync(join(out,'GUIDES.json'),JSON.stringify({project,source:'narration.wav',method:'Each speaking shot is pitch-preservingly fitted into its exact selected source interval, with0.125s leading handle. The master retimes the same interval back to the canonical voice cut.',speakingShots:spec.shots.filter(s=>s.speaker).map(s=>s.id),review:'Audio guide preparation is not a lip-sync or listening approval.'},null,2)+'\n');
