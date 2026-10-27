import {readFileSync,writeFileSync,mkdirSync,openSync,closeSync,unlinkSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {join} from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
import {FFMPEG,ffmpeg,duration as mediaDuration} from '../lib/ffmpeg.mjs';
import {ROOT} from '../lib/project.mjs';
import {replaceWorkspaceFile} from '../lib/replace-file.mjs';
const projectId=process.argv[2];if(!/^[a-z0-9-]+$/.test(projectId||''))throw Error('Safe project ID required');
const folder=join(ROOT,'story-projects',projectId,'assets'),project=join(ROOT,'projects',projectId);
const spec=JSON.parse(readFileSync(join(project,'editorial.json'),'utf8'));
const lock=join(ROOT,'.cache/render.lock'),fd=openSync(lock,'wx');writeFileSync(fd,String(process.pid));
const rate=48000,total=spec.duration,events=[];let seed=1965009;
const selectedCast=spec.performanceVersion>=4;
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
  if(kind==='boardwalk footstep')return gain*((low*.45+Math.sin(2*Math.PI*94*t)*.23)*Math.exp(-t*28)+(white-low)*.11*Math.exp(-t*95));
  if(kind==='dirt footstep')return gain*((white-low)*.22+low*.35)*Math.exp(-t*16);
  if(kind==='nervous inhale')return gain*(white-low)*Math.sin(Math.PI*p)**1.5*(.7+.3*Math.sin(t*43));
  if(kind==='cane contact')return gain*(Math.sin(2*Math.PI*370*t)*.28+low*.25)*Math.exp(-t*36);
  return gain*low*Math.sin(Math.PI*p)**2;
 });
}
function metalContact(stereo,when){
 events.push({type:'original brass watch bezel click',at:when,gain:.045});
 add(stereo,when,.65,-.15,t=>.045*(Math.sin(2*Math.PI*1830*t)*Math.exp(-t*18)+.3*Math.sin(2*Math.PI*2771*t)*Math.exp(-t*24)));
}
function saveWave(path,stereo){
 const n=stereo[0].length,wav=Buffer.alloc(44+n*4);wav.write('RIFF');wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(2,22);wav.writeUInt32LE(rate,24);wav.writeUInt32LE(rate*4,28);wav.writeUInt16LE(4,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(n*4,40);
 for(let i=0;i<n;i++){const env=Math.max(0,Math.min(1,i/rate/.08,(total-i/rate)/.7));for(let c=0;c<2;c++)wav.writeInt16LE(Math.round(Math.max(-.98,Math.min(.98,stereo[c][i]*env))*32767),44+i*4+c*2)}
 writeFileSync(path,wav);
}
const sampleCache=new Map();
function sample(stereo,when,pack,name,gain,pan=0,label=name){
 const source=join(ROOT,'assets/audio/kenney',pack,'Audio',name+'.ogg');
 if(!sampleCache.has(source)){
  const decoded=spawnSync(FFMPEG,['-v','error','-i',source,'-ar',String(rate),'-ac','1','-f','f32le','-'],{maxBuffer:8*1024*1024});
  if(decoded.status!==0)throw Error('Cannot decode licensed sample '+source);
  const raw=decoded.stdout,values=new Float32Array(raw.length/4);let peak=0;
  for(let i=0;i<values.length;i++){values[i]=raw.readFloatLE(i*4);peak=Math.max(peak,Math.abs(values[i]))}
  if(peak<.001)throw Error('Silent sample '+name);for(let i=0;i<values.length;i++)values[i]/=peak;
  sampleCache.set(source,values);
 }
 const values=sampleCache.get(source);
 events.push({type:label,at:when,length:values.length/rate,gain,pan,source:'assets/audio/kenney/'+pack+'/Audio/'+name+'.ogg',license:'CC0-1.0',sha256:createHash('sha256').update(readFileSync(source)).digest('hex')});
 add(stereo,when,values.length/rate,pan,(t,i)=>values[i]*gain);
}
function loudness(inputs,graph,target){
 const result=spawnSync(FFMPEG,['-hide_banner',...inputs,'-filter_complex_threads','1','-filter_complex',graph+`,loudnorm=I=${target}:TP=-1.5:LRA=9:print_format=json[a]`,'-map','[a]','-f','null','-'],{encoding:'utf8',maxBuffer:1024*1024});
 if(result.status!==0)throw Error(result.stderr.slice(-2000));
 const stderr=result.stderr;return JSON.parse(stderr.slice(stderr.lastIndexOf('{'),stderr.lastIndexOf('}')+1));
}
function norm(measured,target){return `loudnorm=I=${target}:TP=-1.5:LRA=9:measured_I=${measured.input_i}:measured_TP=${measured.input_tp}:measured_LRA=${measured.input_lra}:measured_thresh=${measured.input_thresh}:offset=${measured.target_offset}:linear=true`}
try{
 mkdirSync(folder,{recursive:true});
 const voice=join(folder,'narration.wav'),fitted=join(folder,'narration.fitted.wav'),scorePath=join(folder,'score.wav'),foleyPath=join(folder,'foley.wav');
 const voiceMetadata=JSON.parse(readFileSync(join(folder,'narration.raw.json'),'utf8'));
 if(voiceMetadata.scriptHash!==spec.sourceNarrationHash||Math.abs(mediaDuration(voice)-total)>.02)throw Error('Unexpected fitted voice source');
 // Keep the unmastered timing-locked voice before replacing its loudness master.
 if(Math.abs(mediaDuration(fitted)-total)>.02)throw Error('Missing preserved fitted voice');
 const soft=spec.shots.filter(s=>s.speaker==='javelina').map(s=>'between(t,'+(s.startFrame/60)+','+((s.startFrame+s.durationFrames)/60)+')').join('+');
 const voiceGraph=selectedCast?'[0:a]highpass=f=55':"[0:a]highpass=f=65,volume=0.87:enable='"+soft+"'";
 const measuredVoice=loudness(['-i',fitted],voiceGraph,-18.5);
 const pendingVoice=join(folder,randomUUID()+'.pending.wav');
 await ffmpeg(['-threads','2','-i',fitted,'-filter_complex_threads','1','-filter_complex',voiceGraph+','+norm(measuredVoice,-18.5)+'[a]','-map','[a]','-ar','48000','-ac','2','-c:a','pcm_s16le',pendingVoice]);
 if(Math.abs(mediaDuration(pendingVoice)-total)>.02)throw Error('Normalized voice duration failed');
 await ffmpeg(['-threads','2','-i',pendingVoice,'-f','null','-']);replaceWorkspaceFile(pendingVoice,voice);
 const score=track(),roots=[73.4162,55,65.4064,61.7354],melody=[220,246.9417,293.6648,261.6256];
 for(let bar=0;bar<31;bar++){
  const when=.18+bar*3.45;if(when>99)break;
  const root=roots[bar%4];pluck(score,when,root,.018,-.2);pluck(score,when+1.73,root*2,.011,.18);
  if(bar%3===1)pluck(score,when+.86,melody[Math.floor(bar/3)%4],.011,.12);
 }
 breathTone(score,at('07')+.15,220,5,.0048);
 breathTone(score,at('16')+.2,246.9417,5,.0045);
 // Leave the defeated-walker beat spacious, then resolve into an open question.
 for(const [i,f]of [164.8138,195.9977,246.9417].entries())pluck(score,at('24')+i*.055,f,.013,i*.15-.15);
 pluck(score,at('28')+.15,146.8324,.016,-.12);pluck(score,total-1.5,293.6648,.009,.12);
 saveWave(scorePath,score);
 const foley=track();
 if(!selectedCast){
 noise(foley,at('01')+.8,.12,.035,'paper / leather',-.1);
 metalContact(foley,at('05')+.25);
 noise(foley,at('07')-.45,.65,.042,'ink wipe',.12);
 noise(foley,at('21')-.5,.7,.043,'ink wipe',-.12);
 for(const id of ['09','10','11','12','13','16','18'])noise(foley,at(id)+.32,.3,.022,'paper / leather',Number(id)%2?.12:-.12);
 const native=(id,time)=>{const s=spec.shots.find(s=>s.id===id);return at(id)+(time-s.sourceStart)/s.playbackRate};
 const contacts={
  '01':[.8], '14':[.45,1.1,1.8,2.5,3.2,3.85], '17':[.55,1.35,2.1,3],
  '19':[.8,1.6,2.4,3.2], '20':[.4,.95,1.7,2.55,3.3],
  '24':[1.55,2.42], '26':[.5,1.2], '27':[1.35,2.15]
 };
 for(const [id,times]of Object.entries(contacts)){
  const s=spec.shots.find(s=>s.id===id);for(const [i,time]of times.entries())if(time>=s.sourceStart&&time<s.sourceStart+s.sourcePlaybackDuration)noise(foley,native(id,time),.17,id==='01'?.026:id==='24'||id==='26'||id==='27'?.063:.032,['17','19','20'].includes(id)?'dirt footstep':'boardwalk footstep',i%2?.14:-.14);
 }
 for(const t of [.22,1.65,3])noise(foley,native('20',t),.12,.029,'cane contact',-.14);
 noise(foley,native('24',1.02),.32,.035,'paper / leather',-.1);
 noise(foley,native('13',.75),.18,.026,'stamp contact',.12);
 for(const s of spec.shots.filter(s=>s.speaker==='javelina'))noise(foley,Math.max(0,s.startFrame/60-.13),.18,.016,'nervous inhale',-.08);
 const archiveStart=at('07'),archiveEnd=at('21');
 events.push({type:'original quiet archive mechanism',at:archiveStart,length:archiveEnd-archiveStart,gain:.005});
 add(foley,archiveStart,archiveEnd-archiveStart,-.16,t=>.005*(Math.sin(2*Math.PI*60*t)*.13+random()*.2)*(.6+.4*Math.max(0,Math.sin(2*Math.PI*24*t))));
 for(const [begin,length]of [[0,archiveStart],[archiveEnd,total-archiveEnd]]){
  let wind=0;events.push({type:'original restrained frontier air',at:begin,length,gain:.005});
  add(foley,begin,length,.1,t=>{wind+=.014*(random()-wind);return wind*.005*(.8+.2*Math.sin(t*.7))});
 }
 }else{
  const native=(id,time)=>{const s=spec.shots.find(s=>s.id===id);return at(id)+(time-s.sourceStart)/s.playbackRate};
  const cue=(id,time,pack,name,gain,pan,label)=>sample(foley,native(id,time),pack,name,gain,pan,label);
  // Selected source contacts: no footsteps under static close-ups. Samples vary
  // within one surface, with the nearby protagonist louder than archive crowds.
  const contacts={'01':[.8],'06':[1.1,2.5],'14':[.45,1.1,1.8,2.5,3.2,3.85],'15':[.65],'17':[.55,1.35,2.1,3],'19':[.8,1.6,2.4,3.2],'20':[.4,.95,1.7,2.55,3.3],'24':[1.55,2.42,3.3],'26':[.5,1.2,2,2.8,3.5],'27':[.8,1.65,2.5,3.25],'28':[1.1,2.05,3.05]};
  for(const [id,times]of Object.entries(contacts)){
   const s=spec.shots.find(s=>s.id===id),dirt=['17','19','20'].includes(id),close=['01','06','24','26','27'].includes(id);
   for(const [i,t]of times.entries())if(t>=s.sourceStart&&t<s.sourceStart+s.sourcePlaybackDuration){
    if(dirt)cue(id,t,'rpg','footstep0'+(i%10),.105,i%2?.12:-.12,'dirt-path foot contact');
    else cue(id,t,'impact','footstep_wood_00'+(i%5),close?.18:.10,i%2?.14:-.14,'wooden-boardwalk foot contact');
   }
  }
  for(const [id,t,g]of [['01',.5,.07],['03',1.1,.055],['04',.7,.045],['06',1.4,.05],['21',.5,.075],['22',.9,.045],['23',1,.06],['24',1.02,.09],['25',.8,.045],['28',.7,.04]])cue(id,t,'rpg','cloth'+(Number(id)%4+1),g,-.08,'gloves / clothing movement');
  cue('01',1.2,'rpg','metalClick',.045,-.1,'watch tap');
  cue('05',.65,'rpg','handleSmallLeather',.065,-.1,'watch strap shifts');
  cue('08',1,'rpg','metalClick',.07,.1,'clockmaker turns mechanism');
  for(const t of [.45,1.45,2.45,3.45])cue('08',t,'rpg','metalClick',.022,.2,'quiet workshop clock tick');
  cue('09',.65,'rpg','bookPlace1',.095,-.1,'pedometer box slides onto bench');
  cue('10',1.8,'impact','impactWood_light_000',.045,.06,'pencil settles on desk');
  cue('11',1.2,'rpg','bookFlip1',.06,.1,'campaign map handling');
  cue('12',1.3,'rpg','bookOpen',.08,-.1,'research folder page lifts');
  cue('13',.8,'rpg','bookFlip2',.11,-.1,'press sheet pulled');
  cue('13',2.25,'rpg','bookPlace2',.10,.1,'printed sheet laid on stack');
  cue('15',1.4,'rpg','handleSmallLeather2',.05,-.1,'worried grip on wrist strap');
  cue('16',1.1,'rpg','bookFlip3',.065,.1,'research chart turns');
  cue('18',.55,'rpg','bookFlip1',.085,-.12,'study bundle gathered');
  cue('18',1.8,'rpg','bookPlace1',.105,.12,'paper edges aligned on desk');
  for(const t of [.4,1.65,3])cue('20',t,'impact','impactWood_light_002',.09,-.15,'walking cane plants before weight shift');
  cue('21',.8,'rpg','creak1',.10,-.08,'bench takes seated weight');
  cue('24',.45,'rpg','creak2',.07,-.1,'bench unloads as Javelina stands');
  cue('25',2.4,'rpg','bookFlip3',.045,.1,'sales card lowers');
  for(const id of ['07','21'])noise(foley,at(id)-.42,.95,.105,'ink wipe',id==='07'?.14:-.14);
  // Long overlapping beds bridge cuts; no noise is added to the voice files.
  let air=0;events.push({type:'original continuous town / outdoor wind bed',at:0,length:total,gain:.018,license:'Original studio synthesis'});
  add(foley,0,total,0,t=>{air+=.025*(random()-air);const present=t<at('07')||t>at('21');return air*(present?.14:.065)*(.8+.2*Math.sin(t*.31))});
  for(const [begin,end]of [[0,at('07')+.3],[at('21')-.35,total]]){
   for(let t=begin+.9;t<end;t+=3.4){const start=t;events.push({type:'original distant dusk cricket chirps',at:start,length:.75,gain:.0018});add(foley,start,.75,.5,x=>.0018*Math.sin(2*Math.PI*3400*x)*Math.max(0,Math.sin(2*Math.PI*13*x))**5*Math.sin(Math.PI*x/.75)**2)}
  }
  const archiveStart=at('07')-.2,archiveEnd=at('21')+.25;
  events.push({type:'original archive projector mechanism bridge',at:archiveStart,length:archiveEnd-archiveStart,gain:.012});
  let motor=0;add(foley,archiveStart,archiveEnd-archiveStart,-.18,t=>{motor+=.08*(random()-motor);return .012*(motor*.7+Math.sin(2*Math.PI*48*t)*.1)*(.35+.65*Math.max(0,Math.sin(2*Math.PI*24*t))**8)});
 }
 saveWave(foleyPath,foley);
 const inputs=['-i',voice,'-i',scorePath,'-i',foleyPath],mixGraph=selectedCast?'[0:a]asplit=3[dialogue][key1][key2];[1:a][key1]sidechaincompress=threshold=0.035:ratio=3:attack=15:release=250[music];[2:a][key2]sidechaincompress=threshold=0.06:ratio=1.6:attack=8:release=160[effects];[dialogue][music][effects]amix=inputs=3:duration=first:normalize=0':'[0:a][1:a][2:a]amix=inputs=3:duration=first:normalize=0',measuredMix=loudness(inputs,mixGraph,-16);
 const pendingMix=join(folder,randomUUID()+'.pending.wav');
 await ffmpeg(['-threads','2',...inputs,'-filter_complex_threads','1','-filter_complex',mixGraph+','+norm(measuredMix,-16)+',apad,atrim=duration='+total+'[a]','-map','[a]','-ar','48000','-ac','2','-c:a','pcm_s16le',pendingMix]);
 if(Math.abs(mediaDuration(pendingMix)-total)>.02)throw Error('Master duration failed');
 await ffmpeg(['-threads','2','-i',pendingMix,'-f','null','-']);replaceWorkspaceFile(pendingMix,join(folder,'mix.wav'));
 const sha=file=>createHash('sha256').update(readFileSync(file)).digest('hex');
 writeFileSync(join(folder,'SOUND_EVENTS.json'),JSON.stringify({duration:total,originalScore:true,originalProceduralFoley:!selectedCast,recordedSamplesUsed:selectedCast,performanceVersion:spec.performanceVersion||2,voices:selectedCast?{banker:'User-selected audio.wav, local Qwen3-TTS cloning',javelina:'User-selected audio (1).wav, local Qwen3-TTS cloning',narrator:'Same selected Bird identity'}:{banker:'Kokoro am_michael, serious; v3 tempo1.06',javelina:'Kokoro am_puck transformed: v3 tempo1.16, pitch+7semitones with formants preserved, bright/thin EQ and subtle tremble',narrator:'Kokoro am_michael, same Bird identity; v3 tempo1.06'},footsteps:selectedCast?'CC0 Kenney surface-specific samples at selected native source contacts; foreground contacts louder than archive crowds.':'Original surface-specific synthesis, timed to sampled native source contacts through each editorial playback rate; reference recording not copied.',voiceTargetLufs:-18.5,masterTargetLufs:-16,truePeakCeilingDb:-1.5,measuredVoiceBeforeMaster:measuredVoice,measuredMixBeforeMaster:measuredMix,files:{fitted:sha(fitted),voice:sha(voice),score:sha(scorePath),foley:sha(foleyPath),mix:sha(join(folder,'mix.wav'))},events,review:'Numerical mastering and original cue preparation; listening/subjective voice and mouth synchronization reviews remain separate.'},null,2)+'\n');
 console.log('Prepared'+total+'s original voice/music/Foley mix; listening remains separate.');
}finally{closeSync(fd);unlinkSync(lock)}
