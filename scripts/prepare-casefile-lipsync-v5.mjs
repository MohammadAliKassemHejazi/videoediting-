import {readFileSync,writeFileSync,mkdirSync,copyFileSync} from 'node:fs';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {ffmpeg,duration} from '../lib/ffmpeg.mjs';

const project='texas-ten-thousand-steps';
const root=process.cwd();
const film=join(root,'projects',project);
const assets=join(root,'story-projects',project,'assets');
const guideDir=join(assets,'speech-guides-v5-mysterious-bird');
const promptDir=join(film,'prompts','motion','v5-mysterious-bird');
mkdirSync(guideDir,{recursive:true});mkdirSync(promptDir,{recursive:true});
const spec=JSON.parse(readFileSync(join(film,'editorial.json'),'utf8'));
if(spec.performanceVersion!==4)throw Error('Expected the reviewed V4 performance source');
const narration=join(assets,'narration.fitted.wav');
const selected=spec.shots.filter(s=>s.speaker==='banker');
if(selected.map(s=>s.id).join(',')!=='01,03,05,28')throw Error('Unexpected Bird speaking-shot list');
const prompts={
 '01':'The Banker delivers a quiet, deliberate instruction with restrained, unsettling certainty. Keep his authority calm and intimate; no shouting or broad comic mouth movement. The lower beak forms small speech shapes to the supplied audio, with a brief closed-beak pause after the first sentence. He gives one firm onward gesture while the worried Javelina listens with a closed mouth. Preserve the original framing, wardrobe, characters, watch and number artwork. Slow push toward their faces.',
 '03':'The Banker speaks with calm, mysterious confidence, as though revealing a rule everyone accepts without questioning it. Precise small lower-beak articulation follows the supplied speech guide; leave the short sentence breaks visible as stillness. His raised finger slowly lowers after the first phrase, and his eyes settle on the viewer. Maintain his exact design and the low-angle composition; keep the Javelina absent.',
 '05':'The Banker speaks softly and knowingly while his gloved fingertip approaches the watch bezel and stops. Keep the beak movement small and closely guided by the supplied voice. His gaze remains on the Javelina’s watch; the Javelina’s wrist recoils slightly. Preserve the number and watch design exactly, with no additional text or digits. Restrained lateral camera slide.',
 '28':'The Banker asks the final question in a measured, mysterious, quietly serious manner. Match the small lower-beak movements to the supplied voice guide, then close the beak and hold eye contact for a beat. His open palm remains steady; the Javelina continues walking softly in the background. Slow push toward the Banker’s eyes. Preserve the final shot composition and character identities.'
};
const records=[];
for(const shot of selected){
 const guide=join(guideDir,shot.id+'.wav');
 const start=shot.startFrame/60,length=shot.durationFrames/60,rate=shot.playbackRate;
 if(!(rate>0&&rate<=1.3&&length*rate<=4.03))throw Error('Unexpected source/time map for '+shot.id);
 const filter=`atrim=start=${start.toFixed(6)}:duration=${length.toFixed(6)},asetpts=PTS-STARTPTS,atempo=${rate.toFixed(8)},adelay=125|125,aresample=32000,apad=pad_dur=0.5,atrim=end_sample=142667,asetpts=N/SR/TB`;
 await ffmpeg(['-threads','2','-i',narration,'-filter_threads','1','-af',filter,'-ar','32000','-ac','1','-c:a','pcm_s16le',guide]);
 const wave=readFileSync(guide);let offset=12,dataBytes=0;
 while(offset+8<=wave.length){const chunk=wave.toString('ascii',offset,offset+4),size=wave.readUInt32LE(offset+4);if(chunk==='data'){dataBytes=size;break}offset+=8+size+(size%2)}
 const exactSamples=dataBytes/2;
 if(exactSamples!==142667)throw Error('Unexpected H3 guide sample count '+shot.id+': '+exactSamples);
 const guideHash=createHash('sha256').update(readFileSync(guide)).digest('hex');
 const prompt=join(promptDir,shot.id+'.txt');
 const body=`For the target video, at 0.00 seconds into the target video, <Picture 1> (from [Shot ${shot.id}]) is fully referenced.\n\nIntegrated multimodal description: Create one continuous exactly 4-second cinematic hand-inked 2D cartoon animation from the supplied first frame. Preserve the PRESENT Texas dusk look and exact character identities, clothing, face, proportions, colors, prop attachment, framing and drawn style. ${prompts[shot.id]} The supplied audio guide is the exact current performance transformed to the source clip's playback timebase. Make the named speaker alone articulate to it; the other visible character listens with a closed mouth. BEAK ANATOMY LOCK: Bird has one smooth, hooked, closed upper bill and one short lower bill pivoting at its hinge. Move only the lower bill a small amount, never more than 8% of head height. No teeth, gums, tongue, human lips or smile; never widen the bill into a grin. Keep the upper bill shape rigid and identical to the first frame. Keep Bird's eyes serious and composed. One focal subject, warm lantern rim light, painted background, clean cel shading, white gloves, thick ink outlines. Smooth simple movement, no cuts, morphing, new characters, new objects, added text or lettering, no change of style.\n`;
 writeFileSync(prompt,body,'utf8');
 records.push({shot:shot.id,role:'banker',voiceLine:shot.voiceover,start,length,sourcePlaybackRate:rate,guide:guide.slice(root.length+1),guideSHA256:guideHash,prompt:prompt.slice(root.length+1),sourceImage:`projects/${project}/assets/keyframes/${shot.id}.png`,sourcePrompt:`projects/${project}/prompts/motion/v5-mysterious-bird/${shot.id}.txt`,previewTake:`${shot.id}-v5b-lipsync`});
 console.log(`Prepared speech guide ${shot.id}: ${(exactSamples/32000).toFixed(6)}s; source playback ${rate.toFixed(4)}x; ${guideHash.slice(0,12)}`);
}
const manifest={version:5,sourcePerformance:'projects/texas-ten-thousand-steps/editorial.json (V4, unchanged)',voiceDirection:'Same user-selected Bird identity; restrained, measured, mysterious authority. No hiss, tremolo or added reverb.',guideConstruction:'Extract exact per-shot voice from V4 fitted narration; transform by matching source playback rate; 125ms handle; mono 32kHz; 4.458333s.',model:{name:'MiniMax H3',route:'studio pinned local image-to-video + MiniMaxH3AddGuide',resolution:'352x640',fps:24,frames:107,turbo:true,steps:8},shots:records};
writeFileSync(join(guideDir,'MANIFEST.json'),JSON.stringify(manifest,null,2)+'\n');
