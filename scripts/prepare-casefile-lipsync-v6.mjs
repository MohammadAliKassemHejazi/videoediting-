import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {ffmpeg,duration} from '../lib/ffmpeg.mjs';
const root=process.cwd(),project='texas-ten-thousand-steps';
const film=join(root,'projects',project),v5=join(film,'versions/v5-before-fhd-speed-colour');
const sourceEditorial=JSON.parse(readFileSync(join(v5,'editorial.json'),'utf8'));
const narration=join(v5,'audio/narration.wav');
const assets=join(root,'story-projects',project,'assets');
const guideDir=join(assets,'speech-guides-v6-corrected');
const promptDir=join(film,'prompts/motion/v6-lipsync');
mkdirSync(guideDir,{recursive:true});mkdirSync(promptDir,{recursive:true});
const selected=sourceEditorial.shots.filter(s=>s.speaker==='banker');
if(selected.map(s=>s.id).join(',')!=='01,03,05,28')throw Error('Unexpected visible Bird speech shots');
const direction={
 '01':'The Banker speaks with calm, measured, mysterious authority. Move only his lower hooked bill with subtle, natural syllable-sized openings, closely following the complete supplied audio guide from the first word to the last. No broad grin, teeth, tongue or human lips. Hold the beak closed during the pauses. His gloved hand makes one restrained onward gesture; Javelina listens silently.',
 '03':'The Banker alone delivers the line with serious, quiet confidence. His lower bill articulates the entire supplied audio guide from beginning to end, opening and closing on the audible syllables and staying still through pauses. Keep his eyes composed, never smiling; the upper hooked bill stays rigid. His raised finger lowers slightly only after the opening phrase.',
 '05':'The Banker speaks seriously while his fingertip hovers beside the watch. Follow the complete supplied audio guide with small lower-bill articulation; keep his upper bill fixed and expression intent, not smiling. Javelina’s hand reacts once while the watch remains attached and its display stays unchanged.',
 '28':'The Banker delivers the final question in a hushed, deliberate, mysterious tone. The lower bill forms small natural openings through the full spoken question and closes for the held final beat. Keep his upper hooked bill, eyes, face and proportions unchanged; no grin, teeth, tongue or human lips. Javelina walks silently in the soft background.'
};
const digest=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const records=[];
for(const shot of selected){
 const oldLength=shot.durationFrames/60,oldRate=shot.playbackRate,sourceDuration=shot.sourcePlaybackDuration;
 if(Math.abs(oldLength*oldRate-sourceDuration)>.035)throw Error('V5 source/timeline map inconsistent for '+shot.id);
 const guide=join(guideDir,shot.id+'.wav');
 // Timeline audio must be converted back into H3 source time. Since a source
 // plays at oldRate on the V5 timeline, atempo=1/oldRate maps every word to
 // the source frame where that mouth action will be shown.
 const filter=`atrim=start=${(shot.startFrame/60).toFixed(6)}:duration=${oldLength.toFixed(6)},asetpts=PTS-STARTPTS,atempo=${(1/oldRate).toFixed(8)},adelay=125|125,aresample=32000,apad=pad_dur=1,atrim=end_sample=142667,asetpts=N/SR/TB`;
 await ffmpeg(['-threads','2','-i',narration,'-filter_threads','1','-af',filter,'-ar','32000','-ac','1','-c:a','pcm_s16le',guide]);
 const wav=readFileSync(guide);let offset=12,dataBytes=0;
 while(offset+8<=wav.length){const chunk=wav.toString('ascii',offset,offset+4),size=wav.readUInt32LE(offset+4);if(chunk==='data'){dataBytes=size;break}offset+=8+size+(size%2)}
 if(dataBytes/2!==142667)throw Error('H3 audio-guide sample count mismatch '+shot.id);
 const image=shot.id==='01'?join(film,'assets/keyframes/01-v5-watch-blank.png'):join(film,'assets/keyframes',shot.id+'.png');
 const prompt=join(promptDir,shot.id+'.txt');
 const promptText=`For the target video, at 0.00 seconds into the target video, <Picture 1> (from [Shot ${shot.id}]) is fully referenced.\n\nIntegrated multimodal description: Create one continuous exactly 4-second hand-inked 2D cartoon animation from the supplied first frame. Preserve the Texas dusk PRESENT look, exact cast identities, clothes, face proportions, colors, prop attachment and composition. ${direction[shot.id]} The supplied mono audio is the complete selected Bird dialogue mapped into the H3 source-time domain; do not omit or compress away any words. Only the Banker articulates, with the lower beak alone; Javelina stays closed-mouth. Keep warm painted backgrounds, clean cel shading, thick ink outlines and readable action. Smooth restrained movement; no cuts, morphs, new text, symbols, objects or characters.\n`;
 writeFileSync(prompt,promptText,'utf8');
 records.push({shot:shot.id,role:'banker',transcript:shot.voiceover,sourceStart:shot.startFrame/60,sourceLengthSeconds:sourceDuration,v5TimelineLengthSeconds:oldLength,v5SourcePlaybackRate:oldRate,guideRate:1/oldRate,guideDurationSeconds:dataBytes/2/32000,leadHandleSeconds:.125,guide:`story-projects/${project}/assets/speech-guides-v6-corrected/${shot.id}.wav`,guideSHA256:digest(guide),sourceImage:image.slice(root.length+1),sourceImageSHA256:digest(image),prompt:`projects/${project}/prompts/motion/v6-lipsync/${shot.id}.txt`,promptSHA256:digest(prompt),take:`${shot.id}-v6-lipsync`});
 console.log(`${shot.id}: source speech expanded across ${sourceDuration.toFixed(3)} source seconds; guide ${records.at(-1).guideSHA256.slice(0,12)}`);
}
writeFileSync(join(guideDir,'MANIFEST.json'),JSON.stringify({version:6,sourceVersion:'V5 voice timing, current EQ mastering; V6 film runs 1.1x',mapping:'guide atempo is inverse source playback rate; complete speech is placed into H3 source time, with 125ms lead and 4.458344s total guide',shots:records},null,2)+'\n');
