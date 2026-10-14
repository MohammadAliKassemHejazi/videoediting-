import {writeFileSync,copyFileSync} from 'node:fs';
import {join} from 'node:path';
import {ROOT} from '../lib/project.mjs';
import {PRO_CLIP_STYLES} from '../lib/pro-clip-spec.mjs';
const rate=48000,n=15*rate;
for(const [index,s]of PRO_CLIP_STYLES.entries()){
 const left=new Float32Array(n),right=new Float32Array(n),events=[];let seed=3441+index*313;
 const noise=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296*2-1};
 function place(at,kind,gain,pan=0){const dur=kind==='air'?.34:kind==='paper'?.20:kind==='metal'||kind==='glass'?.28:.13;events.push({at,kind,gain,pan});let low=0;
  for(let i=0;i<dur*rate;i++){const off=Math.round(at*rate)+i;if(off>=n)break;const age=i/rate,p=age/dur,rnd=noise();low+=.11*(rnd-low);let v=0,env=Math.sin(Math.PI*p);
   if(kind==='air')v=low*env*1.7;
   else if(kind==='paper')v=(rnd-low)*env*(.4+.6*Math.abs(Math.sin(age*71)));
   else if(kind==='metal'||kind==='glass'){const f=kind==='metal'?350:730;v=(Math.sin(2*Math.PI*f*age)*.4+Math.sin(2*Math.PI*f*2.76*age)*.18+(rnd-low)*Math.exp(-age*100)*.4)*Math.exp(-age*19)*Math.min(1,age*350);}
   else v=(Math.sin(2*Math.PI*(150*age-45*age*age))*.5+low*.5)*Math.exp(-age*34)*Math.min(1,age*350);
   v*=gain;const l=Math.sqrt((1-pan)/2),r=Math.sqrt((1+pan)/2);left[off]+=v*l;right[off]+=v*r;
   for(const [delay,send]of [[.022,.13],[.058,.075],[.101,.04]]){const e=off+Math.floor(delay*rate);if(e<n){left[e]+=v*r*send;right[e]+=v*l*send;}}
  }
 }
 for(const [i,at]of [0,.58,1.68,3.14,4.64,7,7.88,9.18,10.24,11,11.9,13.18].entries())place(at,s.sound,i<6?.065:.036,i%2?.3:-.3);
 if(s.id==='clip-redline'){place(7.12,'air',.07,.3);place(8.85,'metal',.055,0)}
 if(s.id==='clip-paper-evidence'){place(4.64,'wood',.07,.4);place(13.18,'paper',.07,0)}
 if(s.id==='clip-acid-print'){place(3.14,'wood',.085,0);place(7,'air',.075,.5)}
 const buffer=Buffer.alloc(44+n*4);buffer.write('RIFF');buffer.writeUInt32LE(buffer.length-8,4);buffer.write('WAVEfmt ',8);buffer.writeUInt32LE(16,16);buffer.writeUInt16LE(1,20);buffer.writeUInt16LE(2,22);buffer.writeUInt32LE(rate,24);buffer.writeUInt32LE(rate*4,28);buffer.writeUInt16LE(4,32);buffer.writeUInt16LE(16,34);buffer.write('data',36);buffer.writeUInt32LE(n*4,40);
 for(let i=0;i<n;i++){buffer.writeInt16LE(Math.round(left[i]*32767),44+i*4);buffer.writeInt16LE(Math.round(right[i]*32767),46+i*4)}
 const file=join(ROOT,'projects',s.id,'assets/sfx.wav');writeFileSync(file,buffer);copyFileSync(file,join(ROOT,'remotion/public/pro-clips',s.id+'-sfx.wav'));writeFileSync(join(ROOT,'projects',s.id,'assets/SOUND_EVENTS.json'),JSON.stringify({originalVoiceGain:1,normalization:false,events},null,2)+'\n');
}
console.log('Five original quiet material scores; source voice gain stays at 1.');
