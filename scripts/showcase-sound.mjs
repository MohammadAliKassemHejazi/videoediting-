import {readFileSync,writeFileSync,mkdirSync,copyFileSync} from 'node:fs';
import {join} from 'node:path';
import {ROOT} from '../lib/project.mjs';
import {ffmpeg} from '../lib/ffmpeg.mjs';
const films=JSON.parse(readFileSync(join(ROOT,'remotion/showcase.json'),'utf8')),rate=48000,n=rate*15;
for(const film of films){
 const left=new Float32Array(n),right=new Float32Array(n),events=[];let seed=film.id.length*291;
 const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296*2-1;};
 function place(time,length,kind,gain=.2,pan=0,f=220){
  events.push({time,length,kind,gain,pan,frequency:f});let low=0,body=0;
  for(let i=0;i<Math.floor(length*rate);i++){const index=Math.round(time*rate)+i;if(index>=n)break;const age=i/rate,p=age/length;
   const noise=rnd();low+=.12*(noise-low);body+=.025*(noise-body);
   let sample=0,envelope=Math.sin(Math.PI*clamp(p));
   if(kind==='air')sample=(low-body)*envelope*(.4+p*.6);
   else if(kind==='paper')sample=(noise-low)*(.35+.65*Math.abs(Math.sin(age*83)))*envelope;
   else if(kind==='pencil')sample=(noise-low)*(.2+.8*Math.abs(Math.sin(age*59)))*envelope;
   else if(kind==='sub'){sample=Math.tanh(2*(Math.sin(2*Math.PI*(f*age-14*age*age))*.7+body*.3));envelope=Math.exp(-age*8)*Math.min(1,age*120);}
   else if(kind==='metal'){sample=Math.sin(age*f*2*Math.PI)*.5+Math.sin(age*f*2.76*2*Math.PI)*.25+Math.sin(age*f*5.4*2*Math.PI)*.12+(noise-low)*Math.exp(-age*80)*.6;envelope=Math.exp(-age*7)*Math.min(1,age*250);}
   else if(kind==='wood'){sample=Math.sin(2*Math.PI*(f*age-80*age*age))*.6+low*.5;envelope=Math.exp(-age*32)*Math.min(1,age*350);}
   else if(kind==='drone'){sample=(Math.sin(age*f*2*Math.PI)*.33+Math.sin(age*f*1.502*2*Math.PI)*.15+body)*envelope;}
   else{sample=(noise-low)*Math.exp(-age*70);envelope=Math.min(1,age*300);}
   const l=Math.sqrt((1-pan)/2),r=Math.sqrt((1+pan)/2),v=sample*envelope*gain;
   left[index]+=v*l;right[index]+=v*r;
   // One room per film: early reflections share the object palette, no stock end chord.
   for(const [delay,send]of [[.027,.13],[.061,.09],[.109,.055],[.193,.03]]){const echo=index+Math.floor(delay*rate);if(echo<n){left[echo]+=v*r*send;right[echo]+=v*l*send;}}
  }
 }
 if(film.id==='midnight-transit'){
  place(0,8.65,'drone',.14,0,55);for(let t=.15;t<8.4;t+=.75)place(t,.27,'metal',.16,(t%1.5)-.75,1050);
  place(.4,.2,'wood',.26,-.1,185);place(2.75,.85,'air',.5,-.5);for(let t=3;t<8.2;t+=.37)place(t,.18,'metal',.06,Math.sin(t)*.5,650);
  place(6.05,.5,'sub',.7,0,75);place(6.15,.65,'metal',.22,.3,380);place(8.15,.53,'air',.3,0);
  place(9.18,.85,'sub',.85,0,63);for(let i=0;i<8;i++)place(9.18+i*.045,.6,'metal',.14,(i-4)/6,650+i*123);
  place(9.22,1.4,'air',.6,.4);for(const [time,f]of [[12,220],[12.65,329.63],[13.35,440],[14.05,659.25]])place(time,.8,'metal',.14,0,f);
 }else if(film.id==='paper-riot'){
  place(.15,2.2,'pencil',.38,.35);place(.58,.12,'wood',.26,-.4,160);place(1.35,.12,'wood',.2,-.5,200);
  place(3.05,1.3,'pencil',.35,.45);for(let t=3.2;t<4.8;t+=.24)place(t,.08,'wood',.2,-.4,160);
  place(5.06,.22,'wood',.8,.45,130);place(5.28,.5,'metal',.14,0,640);place(6.47,1.85,'paper',.64,-.3);place(8.55,.25,'air',.2,0);
  place(9.18,.14,'paper',.8,-.3);place(9.72,.14,'paper',.8,.3);place(10.12,1.1,'air',.7,0);
  for(let t=10.4;t<14.8;t+=.56)place(t,.14,'paper',.15,Math.sin(t)*.5);
  for(const [time,f]of [[12.05,523.25],[12.33,659.25],[12.61,783.99],[13.25,1046.5]])place(time,.3,'wood',.18,0,f);
 }else{
  for(let t=.1;t<14.8;t+=.4){if(t>5.8&&t<6.3||t>8.7&&t<9.15)continue;place(t,.16,'sub',t%1.6<.45?.6:.24,0,70);place(t+.2,.065,'click',.15,Math.sin(t)*.6);}
  place(0,.65,'air',.3,-.5);for(let t=.25;t<2.8;t+=.19)place(t,.045,'click',.18,Math.sin(t*12)*.7);
  place(3.43,.09,'wood',.7,0,260);place(4.05,1.75,'air',.5,0);place(6.04,.45,'sub',.9,0,68);
  for(let i=0;i<4;i++)place(9.15+i*.32,.18,'metal',.16,(i-2)*.25,440*2**(i/7));place(11.3,.65,'air',.42,0);place(12.06,.65,'sub',.85,0,62);place(12.08,.14,'paper',.4,0);
 }
 const wav=Buffer.alloc(44+n*4);wav.write('RIFF');wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(2,22);wav.writeUInt32LE(rate,24);wav.writeUInt32LE(rate*4,28);wav.writeUInt16LE(4,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(n*4,40);
 for(let i=0;i<n;i++){const fade=Math.min(1,i/(rate*.008),(n-i)/(rate*.08));for(const [channel,data]of [[0,left],[1,right]])wav.writeInt16LE(Math.round(Math.tanh(data[i]*1.25)*.82*fade*32767),44+i*4+channel*2);}
 const folder=join(ROOT,'projects',film.id,'assets'),raw=join(ROOT,'.cache',film.id+'-score-raw.wav'),final=join(folder,'score.wav');mkdirSync(join(ROOT,'.cache'),{recursive:true});writeFileSync(raw,wav);
 await ffmpeg(['-i',raw,'-af','loudnorm=I=-16:TP=-2:LRA=9','-ar','48000','-c:a','pcm_s16le',final]);
 mkdirSync(join(ROOT,'remotion/public/showcase',film.id),{recursive:true});copyFileSync(final,join(ROOT,'remotion/public/showcase',film.id,'score.wav'));writeFileSync(join(folder,'SOUND_EVENTS.json'),JSON.stringify({duration:15,rate,composition:'Original material score; no licensed onetake source imports.',events},null,2)+'\n');
 console.log('Scored '+film.id);
}
function clamp(x){return Math.max(0,Math.min(1,x))}
