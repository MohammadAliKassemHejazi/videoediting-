import {readFileSync,writeFileSync,mkdirSync,copyFileSync,openSync,closeSync,unlinkSync} from 'node:fs';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {ffmpeg,duration} from '../lib/ffmpeg.mjs';
import {ROOT} from '../lib/project.mjs';
const project=process.argv[2];if(project!=='texas-ten-thousand-steps')throw Error('Prepared Episode2 required');
const folder=join(ROOT,'projects',project),assets=join(ROOT,'story-projects',project,'assets'),base=JSON.parse(readFileSync(join(folder,'versions/v2/editorial.json'),'utf8')),direction=JSON.parse(readFileSync(join(folder,'VOICE_DIRECTION.json'),'utf8'));
const source=join(assets,'versions/v2/narration.fitted.wav'),work=join(ROOT,'.cache',project,'voice-v3');mkdirSync(work,{recursive:true});
const lock=join(ROOT,'.cache/render.lock'),fd=openSync(lock,'wx');writeFileSync(fd,String(process.pid));
try{
 const spec=structuredClone(base),map=[];let cursor=0;
 for(const [i,shot]of spec.shots.entries()){
  const previous=base.shots[i],role=shot.speaker||'narrator',cfg=direction[role],frames=Math.round(previous.durationFrames/cfg.tempo),length=frames/60,tempo=(previous.durationFrames/60)/length;
  shot.startFrame=cursor;shot.durationFrames=frames;shot.playbackRate=shot.sourcePlaybackDuration/length;cursor+=frames;
  map.push({id:shot.id,role,oldStart:previous.startFrame/60,oldEnd:(previous.startFrame+previous.durationFrames)/60,newStart:shot.startFrame/60,newEnd:cursor/60,tempo,pitchSemitones:cfg.pitchSemitones});
  const pitch=2**(cfg.pitchSemitones/12),tone=role==='javelina'?',highpass=f=115,equalizer=f=190:t=o:w=1:g=-2.2,equalizer=f=2700:t=o:w=1:g=1.4,tremolo=f=6.3:d=0.035':'';
  const filter=`rubberband=tempo=${tempo}:pitch=${pitch}:formant=preserved:pitchq=quality:transients=smooth:detector=soft${tone},afade=t=in:d=0.002,afade=t=out:st=${Math.max(0,length-.003)}:d=0.003,apad,atrim=duration=${length}`;
  await ffmpeg(['-threads','2','-ss',String(previous.startFrame/60),'-t',String(previous.durationFrames/60),'-i',source,'-filter_threads','1','-af',filter,'-ar','48000','-ac','1','-c:a','pcm_s16le',join(work,shot.id+'.wav')]);
  console.log('Retimed '+shot.id+' / '+role+' / '+tempo.toFixed(3)+'x');
 }
 const transform=t=>{const m=map.find(x=>t<x.oldEnd)||map.at(-1);return m.newStart+(t-m.oldStart)/m.tempo};
 spec.words=base.words.map(w=>({...w,start:transform(w.start),end:transform(w.end)}));spec.captionWords=base.captionWords.map(w=>({...w,start:transform(w.start),end:transform(w.end)}));
 spec.duration=cursor/60;spec.voiceDuration=transform(base.voiceDuration);spec.dialogueDuration=spec.shots[6].startFrame/60;spec.performanceVersion=3;spec.performanceMap=map;
 spec.performanceNote='Original guided performances retimed together: Bird/narration +6%, Javelina +16% and +7semitones with vocal formants preserved, brighter EQ and subtle tremble. Source guide WAVs and H3 takes remain unchanged.';
 const list=join(work,'concat.txt');writeFileSync(list,map.map(m=>"file '"+join(work,m.id+'.wav').replaceAll('\\','/')+"'").join('\n')+'\n');
 const fitted=join(work,'narration-v3.wav');await ffmpeg(['-threads','2','-f','concat','-safe','0','-i',list,'-ar','48000','-ac','1','-c:a','pcm_s16le',fitted]);
 if(Math.abs(duration(fitted)-spec.duration)>.02)throw Error('Retimed voice duration mismatch');
 copyFileSync(fitted,join(assets,'narration.fitted.wav'));copyFileSync(fitted,join(assets,'narration.wav'));
 writeFileSync(join(folder,'editorial.json'),JSON.stringify(spec,null,2)+'\n');
 writeFileSync(join(folder,'PERFORMANCE_V3.json'),JSON.stringify({version:3,duration:spec.duration,baseDuration:base.duration,sourceVoiceSHA256:createHash('sha256').update(readFileSync(source)).digest('hex'),fittedVoiceSHA256:createHash('sha256').update(readFileSync(fitted)).digest('hex'),direction,map,note:'Replaces the old sound master after make-casefile-audio; model-guide intervals stay paired with the same transformed speech. Listening approval is separate.'},null,2)+'\n');
 console.log('Prepared revised performance: '+spec.duration.toFixed(2)+'s; all28 cuts and words follow the faster voices.');
}finally{closeSync(fd);unlinkSync(lock)}
