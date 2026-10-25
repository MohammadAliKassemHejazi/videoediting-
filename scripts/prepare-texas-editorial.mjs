import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {ROOT} from '../lib/project.mjs';
const folder=join(ROOT,'projects/texas-cinema-myth');
const raw=JSON.parse(readFileSync(join(ROOT,'story-projects/texas-cinema-myth/assets/narration.raw.json'),'utf8'));
const plan=JSON.parse(readFileSync(join(folder,'production-scenes.json'),'utf8'));
const fps=60,duration=90,voiceDuration=89.4,ratio=voiceDuration/raw.duration;
const words=raw.words.map(w=>({...w,start:w.start*ratio,end:w.end*ratio}));
let cursor=0;
const shots=plan.scenes.map((scene,index)=>{
 const line=scene.voiceover.trim().split(/\s+/),first=cursor;
 for(const text of line){if(words[cursor]?.text!==text)throw Error(`Narration differs in scene ${scene.id}: ${text} / ${words[cursor]?.text}`);cursor++;}
 return {id:scene.id,world:scene.world,voiceover:scene.voiceover,wordFrom:first,wordTo:cursor,startFrame:index===0?0:Math.round(words[first].start*fps),source:`texas-cinema-myth/shots/${scene.id}-h3.mp4`,keyframe:`texas-cinema-myth/keyframes/${scene.id}.png`,sourceStart:3/24,sourceUnitDuration:4,transitionIn:['04','15'].includes(scene.id)?'ink-reveal':'cut'};
});
if(cursor!==words.length||shots.length!==23)throw Error('Narration or shot coverage incomplete');
for(const [i,shot]of shots.entries()){
 shot.durationFrames=(shots[i+1]?.startFrame??duration*fps)-shot.startFrame;
 if(shot.durationFrames<45)throw Error('Unreadably short scene '+shot.id);
 shot.playbackRate=shot.sourceUnitDuration/(shot.durationFrames/fps);
}
const captionPhrases=[];let phrase=[];
for(const word of words){
 if(phrase.length&&(phrase.map(w=>w.text).join(' ').length+word.text.length>27||phrase.length>=5)){captionPhrases.push(phrase);phrase=[];}
 phrase.push(word);if(/[.!?]$/.test(word.text)){captionPhrases.push(phrase);phrase=[];}
}
if(phrase.length)captionPhrases.push(phrase);
const stampWord=words.find(w=>w.text==='MYTH.');if(!stampWord)throw Error('Missing closing stamp cue');
const spec={project:plan.project,series:plan.series,width:1440,height:2560,fps,duration,voiceDuration,voiceSpeed:raw.duration/voiceDuration,voice:'texas-cinema-myth/audio/narration.wav',score:'texas-cinema-myth/audio/score.wav',foley:'texas-cinema-myth/audio/foley.wav',font:'texas-cinema-myth/fonts/source-serif-4-latin-600-normal.woff2',shots,words,captionPhrases,stampTime:stampWord.start,sourceDeliveryNote:'Local H3 352x640/24fps sources; 4-second generated performance units editorially retimed to continuous narration; 1440x2560/60fps upscale/repetition, not native detail or unique poses.',timingMethod:raw.timingMethod,sourceNarrationHash:raw.scriptHash};
const serialized=JSON.stringify(spec,null,2)+'\n';
writeFileSync(join(folder,'editorial.json'),serialized);
mkdirSync(join(ROOT,'remotion'),{recursive:true});writeFileSync(join(ROOT,'remotion/texas-film.json'),serialized);
writeFileSync(join(folder,'EDITORIAL.md'),`# Continuous episode edit\n\nThe approved ${words.length}-word narration is uninterrupted. Its ${raw.duration.toFixed(2)}s raw take is pitch-preservingly fitted to ${voiceDuration}s, leaving the final beat to breathe within a 90s film. Captions use the model's measured phoneme durations, not evenly spaced guesses. Listening remains pending.\n\nEach H3 performance has a separately prepared 4-second source unit. Editorial cut lengths follow the spoken argument, with source performance retiming; the final movie does not falsely claim every cut remains exactly four seconds. Native sources are 352×640/24fps; delivery is an upscale to 1440×2560/60fps.\n\n| Shot | World | In | Length | Spoken beat |\n|---|---|---:|---:|---|\n`+shots.map(s=>`| ${s.id} | ${s.world} | ${(s.startFrame/fps).toFixed(2)} | ${(s.durationFrames/fps).toFixed(2)} | ${s.voiceover} |`).join('\n')+`\n\nThe editorial MYTH mark is timed to ${stampWord.start.toFixed(2)}s. Ink scenes03/14 carry their smoke into the next world's reveal. Main-character outfit, prop and screen-direction continuity remain per-shot visual-review gates.\n\nTiming source SHA-256: ${createHash('sha256').update(readFileSync(join(ROOT,'story-projects/texas-cinema-myth/assets/narration.raw.json'))).digest('hex')}\n`);
console.log(`Prepared ${shots.length} linked editorial scenes, ${words.length} real-timed words, MYTH ${stampWord.start.toFixed(2)}s; no media render performed.`);
