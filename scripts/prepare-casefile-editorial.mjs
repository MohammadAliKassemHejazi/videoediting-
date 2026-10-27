import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {join} from 'node:path';
import {ROOT} from '../lib/project.mjs';
const project=process.argv[2];if(!/^[a-z0-9-]+$/.test(project||''))throw Error('Safe project ID required');
const folder=join(ROOT,'projects',project),plan=JSON.parse(readFileSync(join(folder,'production-scenes.json'),'utf8'));
if(existsSync(join(folder,'editorial.json'))&&JSON.parse(readFileSync(join(folder,'editorial.json'),'utf8')).performanceVersion>=3)throw Error('Preserve v3 performance mapping: use retime-casefile-performance.mjs, not base timing preparation.');
const raw=JSON.parse(readFileSync(join(ROOT,'story-projects',project,'assets/narration.raw.json'),'utf8'));
const duration=plan.duration,fps=60,voiceDuration=duration-.65;
const sourceDialogueEnd=raw.segments.find(s=>s.speaker==='narrator').start,dialogueDuration=28;
const dialogueSpeed=sourceDialogueEnd/dialogueDuration,narratorSpeed=(raw.duration-sourceDialogueEnd)/(voiceDuration-dialogueDuration);
const mapTime=t=>t<sourceDialogueEnd?t/dialogueSpeed:dialogueDuration+(t-sourceDialogueEnd)/narratorSpeed;
const words=raw.words.map(w=>({...w,start:mapTime(w.start),end:mapTime(w.end)}));let cursor=0;
const shots=plan.scenes.map((s,i)=>{const first=cursor;for(const text of s.voiceover.trim().split(/\s+/)){if(words[cursor]?.text!==text)throw Error('Canonical narration mismatch '+s.id+' '+text);cursor++}return{...s,wordFrom:first,wordTo:cursor,startFrame:i?Math.round(words[first].start*fps):0,source:project+'/shots/'+s.id+'-h3.mp4',keyframe:project+'/keyframes/'+s.id+'.png',sourceStart:3/24,sourceUnitDuration:4}});
if(cursor!==words.length)throw Error('Incomplete narration coverage');
for(const [i,s]of shots.entries()){s.durationFrames=(shots[i+1]?.startFrame??duration*fps)-s.startFrame;if(s.durationFrames<24)throw Error('Unusable cut '+s.id);s.sourcePlaybackDuration=Math.min(4,s.durationFrames/fps*1.03);s.playbackRate=s.sourcePlaybackDuration/(s.durationFrames/fps)}
const overrideFile=join(folder,'EDITORIAL_OVERRIDES.json');
if(existsSync(overrideFile))for(const [id,override]of Object.entries(JSON.parse(readFileSync(overrideFile,'utf8')).shots)){
 const shot=shots.find(s=>s.id===id);if(!shot||shot.speaker)throw Error('Overrides must preserve speaking-guide intervals: '+id);
 const start=override.sourceStart??shot.sourceStart,length=override.sourcePlaybackDuration??shot.sourcePlaybackDuration;
 if(!Number.isFinite(start)||!Number.isFinite(length)||start<0||length<=0||start+length>107/24)throw Error('Invalid source excerpt '+id);
 shot.sourceStart=start;shot.sourcePlaybackDuration=length;shot.playbackRate=length/(shot.durationFrames/fps);shot.editorialReason=override.reason;
}
const captionWords=[];
const numbers=[['eight thousand four hundred','8,400'],['sixteen hundred','1,600'],['ten thousand','10,000'],['nineteen sixty-four','1964'],['nineteen sixty-five','1965'],['twenty nineteen','2019'],['twenty twenty-five','2025'],['fifty-seven','57'],['seven thousand','7,000']];
for(let i=0;i<words.length;){let match=false;for(const [phrase,label]of numbers){const count=phrase.split(' ').length,slice=words.slice(i,i+count);if(slice.map(w=>w.text.toLowerCase().replace(/[.,!?]$/,'')).join(' ')===phrase){captionWords.push({...slice[0],text:label+(/[.,!?]$/.test(slice.at(-1).text)?slice.at(-1).text.slice(-1):''),end:slice.at(-1).end});i+=count;match=true;break}}if(!match){captionWords.push({...words[i],text:words[i].text.replace(/^ten-thousand-step/i,'10,000-step')});i++}}
const spec={project,series:plan.series,width:1440,height:2560,fps,duration,voiceDuration,voiceSpeed:raw.duration/voiceDuration,sourceDialogueEnd,dialogueDuration,dialogueSpeed,narratorSpeed,shots,words,captionWords,font:project+'/fonts/source-serif-4-latin-600-normal.woff2',sourceNarrationHash:raw.scriptHash,timingMethod:raw.timingMethod,sourceDeliveryNote:'H3 native352x640/24fps; enhanced/upscaled2K60 delivery repeats source poses.'};
writeFileSync(join(folder,'editorial.json'),JSON.stringify(spec,null,2)+'\n');
writeFileSync(join(folder,'EDITORIAL.md'),'# Continuous110-second edit\n\n'+words.length+' canonical words, '+raw.duration.toFixed(2)+'s raw voice fitted to '+voiceDuration+'s. Single-word captions follow model-derived phoneme timings. Listening remains separate. Four-second generated performance units are editorially trimmed/retimed, with real source handles preserved.\n\n|Shot|World|In|Duration|Spoken beat|\n|---|---|---:|---:|---|\n'+shots.map(s=>`|${s.id}|${s.world}|${(s.startFrame/fps).toFixed(2)}|${(s.durationFrames/fps).toFixed(2)}|${s.voiceover}|`).join('\n')+'\n');
console.log('Prepared '+shots.length+' voice-timed shots, '+words.length+' words, target'+duration+'s.');
