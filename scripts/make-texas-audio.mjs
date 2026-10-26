import {readFileSync,writeFileSync,mkdirSync,openSync,closeSync,unlinkSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {FFMPEG,ffmpeg,duration as mediaDuration} from '../lib/ffmpeg.mjs';
import {ROOT} from '../lib/project.mjs';
const folder=join(ROOT,'story-projects/texas-cinema-myth/assets'),project=join(ROOT,'projects/texas-cinema-myth');
const spec=JSON.parse(readFileSync(join(project,'editorial.json'),'utf8'));
const lock=join(ROOT,'.cache/render.lock'),fd=openSync(lock,'wx');writeFileSync(fd,String(process.pid));
const rate=48000,total=90,events=[];let seed=1957003;
const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2147483648-1};
const at=id=>spec.shots.find(s=>s.id===id).startFrame/60;
const fade=(t,length)=>Math.max(0,Math.min(1,t/.012,(length-t)/.15));
function track(){return [new Float32Array(rate*total),new Float32Array(rate*total)]}
function add(stereo,at,length,pan,paint){
 const left=Math.sqrt((1-pan)/2),right=Math.sqrt((1+pan)/2),start=Math.round(at*rate);
 for(let i=0;i<Math.round(length*rate);i++){
  const j=start+i;if(j<0||j>=stereo[0].length)continue;
  const value=paint(i/rate,i)*fade(i/rate,length);
  stereo[0][j]+=value*left;stereo[1][j]+=value*right;
 }
}
function pluck(stereo,when,freq,gain=.021,pan=-.15){
 events.push({type:'original synthesized guitar-like pluck',at:when,freq,gain});
 add(stereo,when,3.4,pan,t=>{
  const tone=Math.sin(2*Math.PI*freq*t)*Math.exp(-1.5*t)+.43*Math.sin(2*Math.PI*freq*2.002*t)*Math.exp(-3.3*t)+.2*Math.sin(2*Math.PI*freq*3.003*t)*Math.exp(-5.7*t);
  return gain*tone*(1-Math.exp(-t*420));
 });
}
function breathTone(stereo,when,freq,length,gain,pan=.12){
 events.push({type:'original soft reed-like harmonic',at:when,freq,length,gain});
 add(stereo,when,length,pan,t=>gain*Math.sin(Math.PI*t/length)**1.5*(Math.sin(2*Math.PI*freq*t)+.15*Math.sin(2*Math.PI*freq*3*t)));
}
function noise(stereo,when,length,gain,kind,pan=0){
 events.push({type:kind,at:when,length,gain});let low=0;
 add(stereo,when,length,pan,(t,i)=>{const white=random();low+=.11*(white-low);const p=t/length;
  if(kind==='ink wipe')return (low*.8+(white-low)*.12)*Math.sin(Math.PI*p)**1.6*gain;
  if(kind==='paper / leather')return (white-low)*gain*Math.sin(Math.PI*p)**2*(.6+.4*Math.sin(t*47));
  if(kind==='stamp contact')return gain*((white-low)*.24*Math.exp(-t*70)+Math.sin(2*Math.PI*115*t)*Math.exp(-t*33));
  if(kind==='boardwalk footstep')return gain*(low*.5+Math.sin(2*Math.PI*94*t)*.23)*Math.exp(-t*28);
  return gain*low*Math.sin(Math.PI*p)**2;
 });
}
function metalContact(stereo,when){
 events.push({type:'original light film-reel contact',at:when,gain:.045});
 add(stereo,when,.65,-.15,t=>.045*(Math.sin(2*Math.PI*1830*t)*Math.exp(-t*18)+.3*Math.sin(2*Math.PI*2771*t)*Math.exp(-t*24)));
}
function saveWave(path,stereo){
 const n=stereo[0].length,wav=Buffer.alloc(44+n*4);wav.write('RIFF');wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(2,22);wav.writeUInt32LE(rate,24);wav.writeUInt32LE(rate*4,28);wav.writeUInt16LE(4,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(n*4,40);
 for(let i=0;i<n;i++){const env=Math.max(0,Math.min(1,i/rate/.08,(total-i/rate)/.7));for(let c=0;c<2;c++)wav.writeInt16LE(Math.round(Math.max(-.98,Math.min(.98,stereo[c][i]*env))*32767),44+i*4+c*2)}
 writeFileSync(path,wav);
}
function loudness(inputs,graph,target){
 const result=spawnSync(FFMPEG,['-hide_banner',...inputs,'-filter_complex_threads','1','-filter_complex',graph+`,loudnorm=I=${target}:TP=-1.5:LRA=9:print_format=json[a]`,'-map','[a]','-f','null','-'],{encoding:'utf8',maxBuffer:1024*1024});
 if(result.status!==0)throw Error(result.stderr.slice(-2000));
 const stderr=result.stderr;return JSON.parse(stderr.slice(stderr.lastIndexOf('{'),stderr.lastIndexOf('}')+1));
}
function norm(measured,target){return `loudnorm=I=${target}:TP=-1.5:LRA=9:measured_I=${measured.input_i}:measured_TP=${measured.input_tp}:measured_LRA=${measured.input_lra}:measured_thresh=${measured.input_thresh}:offset=${measured.target_offset}:linear=true`}
try{
 mkdirSync(folder,{recursive:true});
 const raw=join(folder,'narration.raw.wav'),voice=join(folder,'narration.wav'),scorePath=join(folder,'score.wav'),foleyPath=join(folder,'foley.wav');
 const voiceMetadata=JSON.parse(readFileSync(join(folder,'narration.raw.json'),'utf8'));
 if(Math.abs(mediaDuration(raw)-voiceMetadata.duration)>.1||voiceMetadata.scriptHash!==spec.sourceNarrationHash)throw Error('Unexpected raw narration source');
 const voiceGraph=`[0:a]atempo=${spec.voiceSpeed.toFixed(10)},highpass=f=65`;
 const measuredVoice=loudness(['-i',raw],voiceGraph,-18.5);
 await ffmpeg(['-threads','2','-i',raw,'-filter_threads','1','-af',`atempo=${spec.voiceSpeed.toFixed(10)},highpass=f=65,${norm(measuredVoice,-18.5)},apad,atrim=duration=90`,'-ar','48000','-ac','2','-c:a','pcm_s16le',voice]);
 const score=track();
 const bass=[82.4069,65.4064,73.4162,61.7354],motif=[329.6276,293.6648,246.9417,293.6648];
 for(let bar=0;bar<24;bar++){
  const when=bar*3.28+.12;if(when>79)break;
  const root=bass[bar%4];pluck(score,when,root,.022,-.18);pluck(score,when+1.6,root*2,.014,.18);
  if(bar%2===0)pluck(score,when+.82,motif[(bar/2)%4],.016,.12);
 }
 breathTone(score,at('04')+.4,246.9417,5,.006);
 breathTone(score,at('11')+.5,293.6648,4,.0065);
 breathTone(score,at('17')+.2,391.9954,4,.006);
 // The resolution develops the opening motif into G major; it does not restart
 // the soundtrack at each scene boundary.
 pluck(score,80.1,97.9989,.02,-.15);pluck(score,81.75,195.9977,.014,.15);
 for(const [i,f]of [195.9977,246.9417,293.6648].entries())pluck(score,86.6+i*.045,f,.018,i*.15-.15);
 pluck(score,88.3,391.9954,.013,.08);saveWave(scorePath,score);
 const foley=track();
 metalContact(foley,at('03')+.035);
 noise(foley,at('03')+.15,2.1,.06,'ink wipe',.15);
 noise(foley,at('14')+.08,2.6,.055,'ink wipe',-.15);
 noise(foley,at('05')+.6,.35,.02,'paper / leather',-.15);
 noise(foley,at('09')+.6,.6,.035,'paper / leather',.1);
 noise(foley,at('10')+.4,.35,.025,'paper / leather',-.1);
 noise(foley,at('11')+.7,.4,.027,'paper / leather',.1);
 noise(foley,at('16')+.02,.18,.028,'paper / leather',.1);
 noise(foley,at('17')+1.75,.18,.023,'paper / leather',-.1);
 for(let i=0;i<5;i++)noise(foley,at('16')+.18+i*.53,.16,.045,'boardwalk footstep',i%2?.15:-.15);
 noise(foley,at('19')+.8,.5,.035,'paper / leather',-.1);
 // This cue is moved to the inspected physical-contact frame by the finishing
 // pass if H3 places the actual contact elsewhere in the performance.
 const contact=spec.stampContactTime??spec.stampTime-.17;
 noise(foley,contact,.22,.19,'stamp contact');
 const archiveStart=at('04'),archiveEnd=at('15');
 events.push({type:'original synthesized film-projector mechanism',at:archiveStart,length:archiveEnd-archiveStart,gain:.009});
 add(foley,archiveStart,archiveEnd-archiveStart,-.2,(t)=>.009*(Math.sin(2*Math.PI*72*t)*.15+random()*.25)*(.48+.52*Math.max(0,Math.sin(2*Math.PI*24*t))));
 for(const [begin,length]of [[0,archiveStart],[archiveEnd,total-archiveEnd]]){
  let wind=0;events.push({type:'original quiet frontier wind',at:begin,length,gain:.006});
  add(foley,begin,length,.12,t=>{wind+=.014*(random()-wind);return wind*.006*(.7+.3*Math.sin(t*.8))});
 }
 saveWave(foleyPath,foley);
 const inputs=['-i',voice,'-i',scorePath,'-i',foleyPath],mixGraph='[0:a][1:a][2:a]amix=inputs=3:duration=first:normalize=0';
 const measuredMix=loudness(inputs,mixGraph,-16);
 await ffmpeg(['-threads','2',...inputs,'-filter_complex_threads','1','-filter_complex',mixGraph+`,${norm(measuredMix,-16)},apad,atrim=duration=90[a]`,'-map','[a]','-ar','48000','-ac','2','-c:a','pcm_s16le',join(folder,'mix.wav')]);
 const sha=file=>createHash('sha256').update(readFileSync(file)).digest('hex');
 writeFileSync(join(folder,'SOUND_EVENTS.json'),JSON.stringify({duration:90,originalScore:true,originalProceduralFoley:true,recordedSamplesUsed:false,voiceEngine:'Kokoro ONNX am_michael',voiceSpeed:spec.voiceSpeed,voiceTargetLufs:-18.5,masterTargetLufs:-16,truePeakCeilingDb:-1.5,measuredVoiceBeforeMaster:measuredVoice,measuredMixBeforeMaster:measuredMix,files:{raw:sha(raw),voice:sha(voice),score:sha(scorePath),foley:sha(foleyPath),mix:sha(join(folder,'mix.wav'))},events,review:'Numerical mastering and cue preparation; no listening review claimed.'},null,2)+'\n');
 console.log('Prepared continuous90s voice/original guitar-like score/Foley and -16LUFS-target mix; listening remains pending.');
}finally{closeSync(fd);unlinkSync(lock)}
