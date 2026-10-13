import {writeFileSync} from 'node:fs';
// Original low-gain foley. Voice is never normalized or ducked.
export function writeStoryFoley(path,spec){
 const rate=48000,samples=new Float32Array(Math.ceil((spec.duration+.1)*rate));let seed=173;
 const noise=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296*2-1;};
 const hit=(time,kind)=>{const length=kind==='light'?1.6:.13,frequency=kind==='light'?440:kind==='wood'?170:90;
   for(let i=0;i<length*rate;i++){const index=Math.round(time*rate)+i;if(index>=samples.length)break;const age=i/rate,envelope=Math.exp(-age*(kind==='light'?3:32))*Math.min(1,age*300);
     const tone=Math.sin(2*Math.PI*frequency*age)+(kind==='light'?.4*Math.sin(2*Math.PI*frequency*1.5*age):noise()*.8);
     samples[index]+=tone*envelope*(kind==='light'?.022:.035);
   }
 };
 for(const scene of spec.scenes){
   if(['approach','cross'].includes(scene.action))for(let i=0;i<6;i++)hit(scene.at+scene.duration*(.08+i*.09),'step');
   if(scene.action==='fail')hit(scene.at+.12,'wood');
   if(scene.action==='build')for(const p of [.05,.27,.49])hit(scene.at+scene.duration*p,'wood');
   if(scene.action==='test')for(const p of [.1,.45])hit(scene.at+scene.duration*p,'wood');
   if(scene.action==='cross')hit(scene.at+scene.duration*.91,'light');
 }
 const wav=Buffer.alloc(44+samples.length*2);wav.write('RIFF',0);wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(rate,24);wav.writeUInt32LE(rate*2,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(samples.length*2,40);
 for(let i=0;i<samples.length;i++)wav.writeInt16LE(Math.round(Math.max(-1,Math.min(1,samples[i]))*32767),44+i*2);writeFileSync(path,wav);
}
