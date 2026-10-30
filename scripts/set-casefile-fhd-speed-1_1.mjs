import {readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {ROOT} from '../lib/project.mjs';
const project='texas-ten-thousand-steps',folder=join(ROOT,'projects',project),editorial=join(folder,'editorial.json');
const spec=JSON.parse(readFileSync(editorial,'utf8'));
if(spec.performanceVersion!==5||spec.globalPlaybackRate)throw Error('Expected an unretimed V5 preview');
const factor=1.1,oldDuration=spec.duration;
let cursor=0;
for(const shot of spec.shots){
 const oldStart=shot.startFrame,oldEnd=oldStart+shot.durationFrames;
 const start=Math.round(oldStart/factor),end=Math.round(oldEnd/factor);
 if(start!==cursor||end<=start)throw Error('Retiming would introduce a seam at shot '+shot.id);
 shot.startFrame=start;shot.durationFrames=end-start;shot.playbackRate=shot.sourcePlaybackDuration/(shot.durationFrames/60);
 if(shot.playbackRate>2.2)throw Error('Unexpected source playback rate after retime '+shot.id);
 cursor=end;
}
for(const word of spec.words||[]){word.start/=factor;word.end/=factor}
for(const word of spec.captionWords||[]){word.start/=factor;word.end/=factor}
for(const item of spec.performanceMap||[]){item.newStart/=factor;item.duration/=factor;if(Number.isFinite(item.tempo))item.tempo*=factor}
spec.duration=cursor/60;
spec.voiceDuration/=factor;
spec.sourceDialogueEnd/=factor;
spec.dialogueDuration=spec.shots[6].startFrame/60;
spec.dialogueSpeed*=factor;
spec.narratorSpeed*=factor;
spec.audioPlaybackRate=factor;
spec.globalPlaybackRate=factor;
spec.width=1080;spec.height=1920;spec.fps=60;
spec.performanceVersion=6;
spec.performanceNote+=' V6: the complete edit and soundtrack play at 1.1x together, preserving speech/caption/lip timing; portrait delivery is reframed at 1080x1920. Present-day desaturation/sepia filter removed; Archive sepia remains for story-world distinction.';
if(cursor!==Math.round(oldDuration*60/factor))throw Error(`Duration/frame mismatch ${cursor} vs ${oldDuration*60/factor}`);
writeFileSync(editorial,JSON.stringify(spec,null,2)+'\n');
const projectFile=join(folder,'project.json'),projectSpec=JSON.parse(readFileSync(projectFile,'utf8'));
projectSpec.duration=spec.duration;projectSpec.width=1080;projectSpec.height=1920;projectSpec.fps=60;
projectSpec.export={width:1080,height:1920,fps:60};
projectSpec.style='Full-color PRESENT world, sepia ARCHIVE story world, original motion and caption rhythm at 1.1x, portrait Full HD 1080x1920.';
projectSpec.status='V6 Full HD 1.1x live preview; no video export approved.';
projectSpec.sourceLimit='352x640/24fps native local H3; preview takes are spatially enhanced. Final FHD 1080x1920/60fps export requires explicit user request.';
writeFileSync(projectFile,JSON.stringify(projectSpec,null,2)+'\n');
writeFileSync(join(folder,'PERFORMANCE_V6.json'),JSON.stringify({version:6,sourceVersion:'V5',resolution:{width:1080,height:1920,fps:60,aspectRatio:'9:16'},globalPlaybackRate:1.1,audioPlaybackRate:1.1,speechAndCaptions:'Both retimed with the complete film to keep mouth, voice and word captions synchronized.',colour:{present:'Original full color; saturation and sepia filter removed.',archive:'Sepia preserved to distinguish the historical story world.'},export:'Preview only; no export was started.'},null,2)+'\n');
console.log(`Updated V6 preview: ${spec.duration.toFixed(3)}s, 1080x1920 at 60fps, whole edit/audio 1.1x.`);
