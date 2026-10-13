import React,{useEffect,useState} from 'react';
import {AbsoluteFill,Audio,staticFile,useCurrentFrame,delayRender,continueRender,cancelRender} from 'remotion';
import '../../remotion/fonts.css';
const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>1-(1-clamp(x))**4,smooth=x=>{x=clamp(x);return x*x*(3-2*x)},mix=(a,b,p)=>a+(b-a)*p;
const hash=n=>{const x=Math.sin(n*93.21+11)*49725.12;return x-Math.floor(x)};
const star=(cx,cy,r,points=18,inner=.68,angle=0)=>Array.from({length:points*2},(_,i)=>{const a=i/points*Math.PI+angle,rr=r*(i%2?inner:1);return `${cx+Math.cos(a)*rr},${cy+Math.sin(a)*rr}`}).join(' ');
const Pointer=({x,y,rotation=0,scale=1})=><g transform={`translate(${x} ${y}) rotate(${rotation}) scale(${scale})`}><path d="M0 0 L0 165 L45 121 L86 204 L119 185 L79 106 L143 107 Z" fill="#f4f0e5" stroke="#18191b" strokeWidth="10"/></g>;
function hero(word,x,y,size,fill,transform='',spacing=-15){return <text x={x} y={y} fill={fill} fontFamily="Inter" fontWeight="600" fontSize={size} letterSpacing={spacing} transform={transform}>{word}</text>}
export function SignalNoise(){
 const [fontHandle]=useState(()=>delayRender('Signal print font'));
 useEffect(()=>{document.fonts.load('600 435px Inter').then(()=>continueRender(fontHandle)).catch(cancelRender)},[fontHandle]);
 const t=useCurrentFrame()/60,p0=clamp(t/3),p1=clamp((t-3)/3),p2=clamp((t-6)/3),p3=clamp((t-9)/3),p4=clamp((t-12)/3);
 const compression=ease((t-4.05)/1.55),printed=ease((t-12.05)/.4),phase=t<3?0:t<6?1:t<9?2:t<12?3:4;
 const bg=phase===0?'#d9ff43':phase===1?'#7643ed':phase===2?'#17191a':phase===3?'#eeeae1':'#d9ff43';
 const radial=phase===3?ease((t-9)/.6):0;
 return <AbsoluteFill style={{background:bg,fontFamily:'Inter'}}><Audio src={staticFile('showcase/signal-noise/score.wav')}/>
 <svg width="1440" height="2560" viewBox="0 0 1440 2560" style={{position:'absolute'}}>
 <defs><pattern id="dot-print" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1.1" fill="#17191a" opacity=".16"/></pattern><clipPath id="poster-crop"><rect width="1440" height="2560"/></clipPath></defs>
 <rect width="1440" height="2560" fill="url(#dot-print)"/>
 {phase===0&&<g clipPath="url(#poster-crop)">
  {Array.from({length:14},(_,i)=>{const r=130+i*125,angle=-t*.45+i*.04;return <rect key={i} x={720-r} y={1280-r} width={r*2} height={r*2} fill="none" stroke={i%2?'#17191a':'#7643ed'} strokeWidth={i%3===0?34:5} transform={`rotate(${angle*180/Math.PI} 720 1280)`}/>})}
  {[0,1,2].map((line)=><g key={line} transform={`translate(${Math.sin(t*6+line)*45} ${line*520-180})`}>
   {hero('NOISE',40,940,405,line%2?'#7643ed':'#17191a','',-30)}
   {Array.from({length:5},(_,i)=><rect key={i} x={-120+((Math.floor(t*12)+i*7)%8)*30} y={695+i*45} width={180+(i%3)*110} height="10" fill={i%2?'#f2eee5':'#d9ff43'}/>)}
  </g>)}
  <g transform={`translate(${mix(-700,30,ease(t/.6))} 140)`}><rect width="700" height="75" fill="#17191a"/>{hero('TOO MUCH INPUT.',28,52,40,'#d9ff43','',1)}</g>
  <polygon points={star(1170,2220,180,16,.75,t*.7)} fill="#7643ed"/>
  {hero('01',90,2350,140,'#17191a','',-8)}
 </g>}
 {phase===1&&<g>
  {Array.from({length:55},(_,i)=>{const a=hash(i)*Math.PI*2,rr=300+hash(i+4)*1250,xx=720+Math.cos(a)*rr,yy=1260+Math.sin(a)*rr,arrival=clamp((compression-hash(i+9)*.14)/.8),r=mix(15+hash(i+6)*55,6,arrival);
   return <g key={i} transform={`translate(${mix(xx,720,arrival)} ${mix(yy,1260,arrival)}) rotate(${t*25*(i%2?1:-1)})`}><rect x={-r} y={-r} width={r*2} height={r*2} fill={i%3?'#d9ff43':'#eeeae1'}/></g>})}
  <circle cx="720" cy="1260" r={mix(15,1250,ease((t-5.15)/.85))} fill="#17191a"/>
  <circle cx="720" cy="1260" r={mix(8,130,ease((t-5.2)/.5))} fill="#d9ff43"/>
  {Array.from({length:5},(_,i)=><circle key={i} cx="720" cy="1260" r={50+i*95+Math.max(0,t-3.35)*100} fill="none" stroke="#f1eee6" strokeWidth="3" opacity={1-compression}/>) }
  <Pointer x={mix(1580,720,ease((t-3)/.43))+(t>3.43?0:40)} y={mix(150,1260,ease((t-3)/.43))} scale={1-.16*Math.exp(-Math.abs(t-3.45)*24)} rotation="-12"/>
  {hero('PICK ONE.',85,470,155,'#f1eee6','',-8)}
  {hero('02',90,2350,140,'#f1eee6','',-8)}
 </g>}
 {phase===2&&<g>
  {Array.from({length:18},(_,i)=><line key={i} x1={-400+i*135+t*60} y1="-100" x2={-1200+i*135+t*60} y2="2700" stroke={i%4===0?'#d9ff43':'#343835'} strokeWidth={i%4===0?17:3}/>)}
  <g transform={`translate(720 1200) rotate(${mix(-10,0,ease(p2*2))}) scale(${mix(.25,1.05,ease(p2*3))}) translate(-720 -1200)`}>
   {hero('IDEA',55,1390,535,'#d9ff43','',-37)}
   <rect x="85" y="1455" width={1270*ease((t-6.25)/.65)} height="42" fill="#d9ff43"/>
  </g>
  {hero('GIVE IT',85,520,115,'#eeeae1','',-5)}{hero('A DIRECTION.',85,665,115,'#eeeae1','',-5)}
  <polygon points={star(1090,2025,175,12,.52,-t)} fill="#7643ed"/>{hero('03',90,2350,140,'#eeeae1','',-8)}
 </g>}
 {phase===3&&<g>
  {Array.from({length:24},(_,i)=>{const a=i*Math.PI/12+t*.23,r=mix(80,400,radial);return <g key={i} transform={`translate(720 1450) rotate(${a*180/Math.PI}) translate(${r} 0)`}><rect x="0" y="-30" width={240} height="60" fill={i%3?'#17191a':'#7643ed'}/>{i%3===0&&hero('MOVE',5,18,52,'#d9ff43','',-3)}</g>})}
  <circle cx="720" cy="1450" r="300" fill="#17191a"/>
  <polygon points={star(720,1450,280,16,.55,-t*.8)} fill="#d9ff43"/>
  <circle cx="720" cy="1450" r="110" fill="#7643ed"/>
  <path d="M675 1398 L765 1450 L675 1502 Z" fill="#eeeae1"/>
  {hero('BUILD',75,450,280,'#17191a','',-20)}{hero('MOMENTUM.',75,725,180,'#17191a','',-12)}
  {hero('04',90,2350,140,'#17191a','',-8)}
 </g>}
 {phase===4&&<g clipPath="url(#poster-crop)">
  <polygon points={star(1270,210,350,20,.82,t*.08)} fill="#7643ed"/>
  <g transform={`translate(${mix(-1500,0,printed)} 0)`}>
   <rect x="55" y="565" width="1330" height="1080" fill="#17191a"/>
   {hero('MAKE',100,925,435,'#d9ff43','',-35)}
   {hero('IT',104,1225,400,'#eeeae1','',-26)}
   {hero('MOVE',100,1588,398,'#d9ff43','',-33)}
  </g>
  <path d={`M90 1815 H${90+1260*ease((t-12.35)/.6)}`} stroke="#17191a" strokeWidth="18"/>
  {hero('SIGNAL / NOISE',95,1960,100,'#17191a','',-6)}
  {hero('ONE IDEA. FULL FORCE.',95,2105,47,'#17191a','',0)}
  <g transform={`translate(1100 2300) rotate(${t*20})`}><path d="M-160 0 H160 M0-160 V160 M-112-112 L112 112 M-112 112 L112-112" stroke="#7643ed" strokeWidth="22"/></g>
  {hero('05',90,2410,140,'#17191a','',-8)}
 </g>}
 </svg></AbsoluteFill>;
}
