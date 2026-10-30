import {readFileSync,writeFileSync,copyFileSync,mkdirSync,existsSync} from 'node:fs';
import {join,dirname} from 'node:path';
import {createHash} from 'node:crypto';
import {probe} from '../lib/ffmpeg.mjs';
const root=process.cwd(),id='texas-ten-thousand-steps',p=join(root,'projects',id),pub=join(root,'remotion/public'),sha=f=>createHash('sha256').update(readFileSync(f)).digest('hex');
const spec=JSON.parse(readFileSync(join(p,'editorial.json'),'utf8'));if(spec.performanceVersion!==8)throw Error('Expected V8');
const backup=join(p,'versions/v8-before-speaking-bookends');if(existsSync(backup))throw Error('V8 checkpoint already exists');mkdirSync(backup,{recursive:true});
for(const name of ['editorial.json','project.json','CONTINUOUS_V8.json','scenes.jsx'])copyFileSync(join(p,name),join(backup,name));
for(const key of ['opening','ending']){
 const take=key+'-v9-15s',enhanced=join(root,'.cache',id,'enhancement',take+'-x4.mp4'),native=join(p,'assets/shots',take+'.mp4'),guide=join(root,'story-projects',id,'assets/bookend-speech-v9',key+'.wav');
 const meta=probe(enhanced);if(Math.abs(meta.duration-362/24)>.04)throw Error('Incorrect long-take duration');
 const target=id+'/continuous/'+take+'.mp4';mkdirSync(dirname(join(pub,target)),{recursive:true});copyFileSync(enhanced,join(pub,target));
 spec.continuousBookends[key]={source:target,version:sha(enhanced).slice(0,16),nativeTake:'projects/'+id+'/assets/shots/'+take+'.mp4',durationFrames:900,loop:false,speechGuided:true};
 const sample=JSON.parse(readFileSync(join(root,'.cache',id,take+'-sample-submitted.json'),'utf8'));
 writeFileSync(join(p,'assets/shots',take+'-generation.json'),JSON.stringify({native:probe(native),sha256:sha(native),promptId:sample.promptId,seed:sample.seed,frames:362,steps:8,turbo:true,audioGuide:{file:guide.slice(root.length+1),sha256:sha(guide),mapping:'Final-speed voice at1.1x, direct15-second source time, no offset'},characterReference:'assets/keyframes/01-v5-watch-blank.png',characterReferenceSHA256:sha(join(p,'assets/keyframes/01-v5-watch-blank.png')),review:'Contact frames inspected for character identity and visible articulation; no phoneme-perfect or listening claim.'},null,2)+'\n');
}
spec.performanceVersion=9;spec.performanceNote+=' V9: regenerated both15-second continuous scenes with actual speech guidance and explicit speaker turns. Ending now uses the same clear Javelina image as the opening. Middle, sound master and timings remain V8.';
writeFileSync(join(p,'editorial.json'),JSON.stringify(spec,null,2)+'\n');
const project=JSON.parse(readFileSync(join(p,'project.json'),'utf8'));project.status='V9: continuous15-second speaking bookends and matching Javelina reference; user review pending.';writeFileSync(join(p,'project.json'),JSON.stringify(project,null,2)+'\n');
writeFileSync(join(p,'CONTINUOUS_V9.json'),JSON.stringify({opening:[0,15],ending:[spec.duration-15,spec.duration],bookends:spec.continuousBookends,identityReference:'assets/keyframes/01-v5-watch-blank.png',soundMaster:spec.actionSound.master,review:'Character identity and mouth-action contact frames checked; user listening and exact syllable review remain separate.'},null,2)+'\n');
console.log('Registered speech-guided15-second bookends with matching Javelina reference.');
