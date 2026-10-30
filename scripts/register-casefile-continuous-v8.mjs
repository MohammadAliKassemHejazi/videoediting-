import {readFileSync,writeFileSync,copyFileSync,mkdirSync,existsSync} from 'node:fs';
import {join,dirname} from 'node:path';
import {createHash} from 'node:crypto';
import {probe} from '../lib/ffmpeg.mjs';
const root=process.cwd(),id='texas-ten-thousand-steps',folder=join(root,'projects',id),pub=join(root,'remotion/public'),hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const spec=JSON.parse(readFileSync(join(folder,'editorial.json'),'utf8'));
if(spec.performanceVersion!==7)throw Error('Expected V7 baseline');
const backup=join(folder,'versions/v7-before-full-15s-scenes');if(existsSync(backup))throw Error('V7 checkpoint already exists');
mkdirSync(backup,{recursive:true});for(const name of ['editorial.json','project.json','PERFORMANCE_V7.json'])copyFileSync(join(folder,name),join(backup,name));
copyFileSync(join(folder,'versions/v6-before-v7-bookends/scenes.jsx'),join(backup,'scenes.jsx'));
const copy=(source,target)=>{mkdirSync(dirname(target),{recursive:true});copyFileSync(source,target);return hash(source).slice(0,16)};
const bookends={};
for(const key of ['opening','ending']){
 const take=key+'-v8-15s',source=join(root,'.cache',id,'enhancement',take+'-x4.mp4');
 const meta=probe(source);if(Math.abs(meta.duration-362/24)>.04)throw Error('Expected a single complete 362-frame source');
 const path=id+'/continuous/'+take+'.mp4';bookends[key]={source:path,version:copy(source,join(pub,path)),nativeTake:'projects/'+id+'/assets/shots/'+take+'.mp4',durationFrames:900,loop:false};
 const native=join(folder,'assets/shots',take+'.mp4'),sample=JSON.parse(readFileSync(join(root,'.cache',id,take+'-sample-submitted.json'),'utf8'));
 writeFileSync(join(folder,'assets/shots',take+'-generation.json'),JSON.stringify({native:probe(native),sha256:hash(native),samplePromptId:sample.promptId,seed:sample.seed,frames:362,steps:8,turbo:true,status:'One continuous native H3 take; trimmed to15seconds without looping. Spatially enhanced for preview.'},null,2)+'\n');
}
spec.continuousBookends=bookends;
const fxBase=id+'/action-sound',samples={};
for(let n=0;n<5;n++){const file='footstep_wood_00'+n+'.ogg';samples['step'+n]=fxBase+'/'+file;copy(join(root,'assets/audio/kenney/impact/Audio',file),join(pub,samples['step'+n]))}
for(const file of ['cloth1.ogg','cloth2.ogg','metalClick.ogg']){samples[file]=fxBase+'/'+file;copy(join(root,'assets/audio/kenney/rpg/Audio',file),join(pub,samples[file]))}
const foley=fxBase+'/middle-foley.wav',foleyVersion=copy(join(root,'story-projects',id,'assets/foley.wav'),join(pub,foley));
const events=[],ending=spec.duration-15;
const cue=(time,source,volume,name,seconds=.65)=>events.push({frame:Math.round(time*60),frames:Math.round(seconds*60),source,volume,name});
for(const [offset,start,end] of [[0,.3,4.9],[0,10.3,14.7],[ending,.3,5.9]]){
 let n=0;for(let t=start;t<end;t+=.67){cue(offset+t,samples['step'+n%5],.4,'Javelina boardwalk contact');if(t+.22<end)cue(offset+t+.22,samples['step'+(n+2)%5],.23,'Bird boardwalk contact');n++}
}
for(const t of [5.2,7.7,10.1,ending+6.3,ending+10.9])cue(t,samples['cloth1.ogg'],.15,'Coat, glove and wrist movement',.9);
for(const t of [8.1,ending+8.4])cue(t,samples['metalClick.ogg'],.2,'Watch handling',.5);
spec.actionSound={foley,foleyVersion,events,license:'Kenney CC0, preserved source records in assets/audio/kenney/SOURCES.md',notes:'New footsteps follow walking windows in the new bookends; pauses contain cloth and watch handling. Existing middle Foley reinforced.'};
spec.performanceVersion=8;
spec.performanceNote+=' V8: complete first15seconds and final15seconds are each one continuous H3 take, with no internal cuts or loops. Added audible action Foley.';
writeFileSync(join(folder,'editorial.json'),JSON.stringify(spec,null,2)+'\n');
const project=JSON.parse(readFileSync(join(folder,'project.json'),'utf8'));project.status='V8: first15seconds and last15seconds replaced by full continuous scenes; audible action sound added; preview only.';writeFileSync(join(folder,'project.json'),JSON.stringify(project,null,2)+'\n');
writeFileSync(join(folder,'CONTINUOUS_V8.json'),JSON.stringify({bookends,duration:spec.duration,opening:[0,15],middle:[15,spec.duration-15],ending:[spec.duration-15,spec.duration],actionEvents:events,previewOnly:true},null,2)+'\n');
console.log('Full 15-second continuous opening and ending registered with '+events.length+' action sound cues.');
