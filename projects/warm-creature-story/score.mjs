import {writeFileSync} from 'node:fs';
const rate=48000,duration=15,n=Math.ceil(rate*duration),left=new Float32Array(n),right=new Float32Array(n),events=[];
let seed=94651;const noise=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296*2-1};
function tone(at,freq,length,gain,pan=0,type='felt'){
 events.push({at,type,freq,length,gain,pan});
 for(let k=0;k<length*rate;k++){const j=Math.round(at*rate)+k;if(j>=n)break;const t=k/rate,attack=1-Math.exp(-t*90),release=Math.min(1,(length-t)*10),decay=Math.exp(-t*(type==='bell'?2.4:1.7));
  const harmonics=Math.sin(2*Math.PI*freq*t)+.21*Math.sin(2*Math.PI*freq*2.003*t)*Math.exp(-t*3)+.05*Math.sin(2*Math.PI*freq*4.01*t);
  const value=harmonics*attack*release*decay*gain;left[j]+=value*Math.sqrt((1-pan)/2);right[j]+=value*Math.sqrt((1+pan)/2);
 }
}
// Deliberate sparse motif, resolving only after Ember chooses the next tram.
for(const [at,f,length,gain]of [[.12,293.66,2.8,.055],[2.35,369.99,2.6,.044],[4.65,440,3.1,.048],[7.05,369.99,2.7,.04],[10.1,293.66,3.4,.044],[11.5,392,3.4,.039],[12.2,493.88,2.8,.033],[13.1,587.33,1.9,.025]])tone(at,f,length,gain);
tone(.72,1174.66,1.25,.042,-.1,'bell');tone(.76,1567.98,.95,.018,-.1,'bell');
tone(9.9,1174.66,1.2,.026,.35,'bell');tone(9.94,1567.98,.9,.011,.35,'bell');
let low=0,cloth=0;
for(let j=0;j<n;j++){const t=j/rate,q=noise();low+=.0035*(q-low);cloth+=.09*(q-cloth);
 const tram=t<9.7?.008:.016*Math.max(0,1-(t-11.2)/3.8),wheel=(Math.sin(t*17)+Math.sin(t*31))*.0009;
 const rustle=Math.exp(-(((t-4.9)/.22)**2))*.009*cloth;
 const pan=Math.max(-.25,Math.min(.9,(t-9)/5)),v=low*tram+wheel*tram+rustle;
 left[j]+=v*(1-pan);right[j]+=v*(1+pan);
 const fade=Math.min(1,t/.12,(duration-t)/.65);left[j]*=Math.max(0,fade);right[j]*=Math.max(0,fade);
}
const wav=Buffer.alloc(44+n*4);wav.write('RIFF');wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(2,22);wav.writeUInt32LE(rate,24);wav.writeUInt32LE(rate*4,28);wav.writeUInt16LE(4,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(n*4,40);
const masterGain=5;
for(let j=0;j<n;j++){wav.writeInt16LE(Math.round(Math.max(-1,Math.min(1,left[j]*masterGain))*32767),44+j*4);wav.writeInt16LE(Math.round(Math.max(-1,Math.min(1,right[j]*masterGain))*32767),46+j*4)}
writeFileSync(new URL('./assets/score.wav',import.meta.url),wav);writeFileSync(new URL('./assets/SOUND_EVENTS.json',import.meta.url),JSON.stringify({original:true,rate,duration,masterGainDb:20*Math.log10(masterGain),events,review:'Designed synthetic score and Foley; no listening review claimed.'},null,2)+'\n');
