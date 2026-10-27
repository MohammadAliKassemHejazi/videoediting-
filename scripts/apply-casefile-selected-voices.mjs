// Fits selected voices to the current acting and updates preview sources only.
import {readFileSync,writeFileSync,mkdirSync,copyFileSync,existsSync} from 'node:fs';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {ffmpeg,duration} from '../lib/ffmpeg.mjs';
const project='texas-ten-thousand-steps',folder=join('projects',project),assets=join('story-projects',project,'assets'),voices=join(assets,'selected-voices');
const checkpoint=join(folder,'versions/v3-before-selected-cast'),audioCheckpoint=join(assets,'versions/v3-before-selected-cast');
if(!existsSync(join(checkpoint,'editorial.json'))){
 mkdirSync(checkpoint,{recursive:true});mkdirSync(audioCheckpoint,{recursive:true});
 for(const name of ['editorial.json','project.json','NARRATION.json','VOICE_DIRECTION.json'])copyFileSync(join(folder,name),join(checkpoint,name));
 for(const name of ['narration.wav','narration.fitted.wav','mix.wav','score.wav','foley.wav','SOUND_EVENTS.json','narration.raw.json'])if(existsSync(join(assets,name)))copyFileSync(join(assets,name),join(audioCheckpoint,name));
}
const spec=JSON.parse(readFileSync(join(checkpoint,'editorial.json'),'utf8'));
const summary=JSON.parse(readFileSync(join(voices,'ALIGNMENT_SUMMARY.json'),'utf8'));
if(summary.lines.length!==28||summary.minimumAgreement<.77)throw Error('Voice transcript QC failed');
const work=join('.cache',project,'voice-v4');mkdirSync(work,{recursive:true});
const words=[],map=[];let frame=0;
for(const shot of spec.shots){
 const wav=join(voices,shot.id+'.wav'),record=JSON.parse(readFileSync(join(voices,shot.id+'.json'),'utf8')),align=summary.lines.find(x=>x.id===shot.id),oldStart=shot.startFrame/60;
 const hash=createHash('sha256').update(readFileSync(wav)).digest('hex');if(hash!==align.sourceSHA256||hash!==record.sha256)throw Error('Stale voice alignment '+shot.id);
 // Preserve room for physical reactions; extend a shot rather than over-speed
 // the selected voice. No pitch or tremolo transform is applied.
 const raw=duration(wav),oldLength=shot.durationFrames/60,role=shot.speaker||'narrator';
 const frames=Math.max(shot.durationFrames,Math.ceil((raw/1.18+.06)*60));
 const length=frames/60,tempo=Math.max(.96,Math.min(1.18,raw/Math.max(.2,length-.07)));
 shot.startFrame=frame;shot.durationFrames=frames;shot.playbackRate=shot.sourcePlaybackDuration/length;frame+=frames;
 const filter=`atempo=${tempo},afade=t=in:d=0.004,afade=t=out:st=${Math.max(0,raw/tempo-.008)}:d=0.008,apad,atrim=duration=${length}`;
 await ffmpeg(['-threads','2','-i',wav,'-filter_threads','1','-af',filter,'-ar','48000','-ac','1','-c:a','pcm_s16le',join(work,shot.id+'.wav')]);
 const wordFrom=words.length;
 for(const w of align.words)words.push({...w,start:shot.startFrame/60+w.start/tempo,end:Math.min(frame/60,shot.startFrame/60+w.end/tempo),speaker:role});
 shot.wordFrom=wordFrom;shot.wordTo=words.length;
 map.push({id:shot.id,role,oldStart,newStart:shot.startFrame/60,duration:length,rawVoiceDuration:raw,tempo,pitchSemitones:0,sourceSHA256:hash});
}
const list=join(work,'concat.txt');writeFileSync(list,spec.shots.map(s=>"file '"+s.id+".wav'").join('\n')+'\n');
const fitted=join(work,'narration-v4.wav');await ffmpeg(['-threads','2','-f','concat','-safe','0','-i',list,'-ar','48000','-ac','1','-c:a','pcm_s16le',fitted]);
const captionWords=[],numbers=[['eight thousand four hundred','8,400'],['sixteen hundred','1,600'],['ten thousand','10,000'],['nineteen sixty-four','1964'],['nineteen sixty-five','1965'],['twenty nineteen','2019'],['twenty twenty-five','2025'],['fifty-seven','57'],['seven thousand','7,000']];
for(let i=0;i<words.length;){let match=false;for(const [phrase,label]of numbers){const count=phrase.split(' ').length,slice=words.slice(i,i+count);if(slice.map(w=>w.text.toLowerCase().replace(/[.,!?]$/,'')).join(' ')===phrase){captionWords.push({...slice[0],text:label+(/[.,!?]$/.test(slice.at(-1).text)?slice.at(-1).text.slice(-1):''),end:slice.at(-1).end});i+=count;match=true;break}}if(!match){captionWords.push({...words[i],text:words[i].text.replace(/^ten-thousand-step/i,'10,000-step')});i++}}
spec.duration=frame/60;spec.voiceDuration=words.at(-1).end;spec.dialogueDuration=spec.shots[6].startFrame/60;spec.performanceVersion=4;spec.words=words;spec.captionWords=captionWords;spec.performanceMap=map;
spec.performanceNote='User-selected Bird/Javelina reference voices, generated locally with Qwen3-TTS 1.7B Base. Canonical word captions follow ASR estimates; existing H3 acting retimed per shot. New phoneme-perfect lip sync is not claimed.';
if(Math.abs(duration(fitted)-spec.duration)>.02)throw Error('Fitted duration mismatch');
copyFileSync(fitted,join(assets,'narration.fitted.wav'));copyFileSync(fitted,join(assets,'narration.wav'));
writeFileSync(join(folder,'editorial.json'),JSON.stringify(spec,null,2)+'\n');
writeFileSync(join(folder,'PERFORMANCE_V4.json'),JSON.stringify({version:4,duration:spec.duration,map,selectedReferences:'series/texas-casefiles/voice-casting/SELECTED.json',model:'Qwen3-TTS-12Hz-1.7B-Base',review:'Preview edit only; listening and exact lip-sync approval pending.'},null,2)+'\n');
const info=JSON.parse(readFileSync(join(folder,'project.json'),'utf8'));info.duration=spec.duration;info.status='V4 selected-voice and scene-sound preview. Export stopped pending user approval.';writeFileSync(join(folder,'project.json'),JSON.stringify(info,null,2)+'\n');
console.log('Applied selected cast: '+spec.duration+'s, '+words.length+' caption words. No video exported.');
