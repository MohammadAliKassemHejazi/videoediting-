import {writeFileSync} from 'node:fs';
import {ffmpeg} from '../../lib/ffmpeg.mjs';
const rate=48000,duration=88.83,n=Math.ceil(rate*duration),l=new Float32Array(n),r=new Float32Array(n),events=[];
let seed=5327;const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296*2-1};
function note(at,freq,length,gain,pan=0){events.push({at,type:'felt/bell',freq,length,gain});for(let i=0;i<length*rate;i++){const j=Math.round(at*rate)+i;if(j>=n)break;const t=i/rate,env=(1-Math.exp(-t*120))*Math.exp(-t*1.4)*Math.min(1,(length-t)*5),v=(Math.sin(t*freq*2*Math.PI)+.13*Math.sin(t*freq*4.006*Math.PI))*env*gain;l[j]+=v*Math.sqrt((1-pan)/2);r[j]+=v*Math.sqrt((1+pan)/2)}}
function foley(at,length,gain,type,pan=0){events.push({at,type,length,gain});let low=0;for(let i=0;i<length*rate;i++){const j=Math.round(at*rate)+i;if(j>=n)break;const t=i/rate,p=t/length,q=rnd();low+=.12*(q-low);const env=Math.sin(Math.PI*p)**2,v=(type==='paper'?(q-low)*.35:low)*env*gain;l[j]+=v*(1-pan);r[j]+=v*(1+pan)}}
// Sparse mystery in E minor; the same motif resolves into G when she sits down.
for(let at=0;at<34;at+=4.1){const notes=[329.63,369.99,392,293.66];note(at+.3,notes[Math.floor(at/4.1)%4],3.5,.027,-.15);if(at>13)note(at+2.1,164.81,3,.019,.12)}
for(let at=42.3;at<78;at+=4.5){const i=Math.floor((at-42.3)/4.5),f=[196,246.94,293.66,261.63][i%4];note(at,f,4,.032,-.12);note(at+1.5,f*2,2.5,.019,.18)}
note(78.15,196,4,.03);note(80.3,246.94,3.5,.026);note(82.7,293.66,3,.023);note(87.1,392,1.5,.035,.15);note(87.3,493.88,1.2,.023,-.15);
for(const at of [1.6,2.15,2.7,3.25,9.8,10.2,10.6,11,11.4])foley(at,.12,.025,'shoe',-.3);
foley(14.1,1.45,.022,'shadow',-.4);foley(16,.25,.045,'latch',-.35);
for(const at of [20.5,21.6,23.1,44.1,45.9,47.1])foley(at,.65,.018,'paper');
foley(35,.08,.02,'phone');foley(43,.14,.035,'phone-down',.1);foley(51.3,.6,.028,'paper',-.3);
foley(56.4,.6,.02,'paper',.25);foley(58.2,.14,.025,'shoe',.3);foley(58.6,.14,.025,'shoe',.3);
foley(66.75,.42,.025,'breath');foley(71.7,2.7,.018,'shadow',-.25);foley(85.5,.45,.027,'cake');
const wav=Buffer.alloc(44+n*4);wav.write('RIFF');wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(2,22);wav.writeUInt32LE(rate,24);wav.writeUInt32LE(rate*4,28);wav.writeUInt16LE(4,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(n*4,40);
for(let i=0;i<n;i++){const t=i/rate,fade=Math.max(0,Math.min(1,t/.15,(duration-t)/.65));wav.writeInt16LE(Math.round(Math.max(-1,Math.min(1,l[i]*fade))*32767),44+i*4);wav.writeInt16LE(Math.round(Math.max(-1,Math.min(1,r[i]*fade))*32767),46+i*4)}
writeFileSync(new URL('./assets/score.wav',import.meta.url),wav);
writeFileSync(new URL('./assets/SOUND_EVENTS.json',import.meta.url),JSON.stringify({original:true,duration,events,review:'No listening review claimed; narration mixed at unity gain before a +5dB master, limiter is a peak guard.'},null,2)+'\n');
await ffmpeg(['-i','story-projects/shadow-went-first/assets/narration.wav','-i','story-projects/shadow-went-first/assets/score.wav','-filter_complex','[0:a][1:a]amix=inputs=2:duration=first:normalize=0,volume=5dB,alimiter=limit=0.96:level=0:latency=1[a]','-map','[a]','-c:a','pcm_s16le','-ar','48000','-ac','2','story-projects/shadow-went-first/assets/mix.wav']);
