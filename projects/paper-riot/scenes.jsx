import React,{useRef,useLayoutEffect,useState} from 'react';
import {AbsoluteFill,Audio,staticFile,useCurrentFrame,delayRender,continueRender,cancelRender} from 'remotion';
import '../../remotion/fonts.css';
const clamp=x=>Math.max(0,Math.min(1,x)),s=x=>{x=clamp(x);return x*x*(3-2*x)},lerp=(a,b,p)=>a+(b-a)*p;
const hash=n=>{const x=Math.sin(n*127.1+43.7)*43758.5453;return x-Math.floor(x)};
function stroke(ctx,points,color='#25293c',width=5,seed=0){
 ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.lineJoin='round';
 for(let pass=0;pass<2;pass++){ctx.beginPath();points.forEach(([x,y],i)=>{const dx=(hash(seed+i*9+pass*73)-.5)*4,dy=(hash(seed+i*7+pass*37)-.5)*4;i?ctx.lineTo(x+dx,y+dy):ctx.moveTo(x+dx,y+dy)});ctx.stroke();}
}
function polygon(ctx,points,color,outline=true,seed=0){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fillStyle=color;ctx.fill();if(outline)stroke(ctx,[...points,points[0]],'#25293c',4,seed);}
function paper(ctx,t){
 ctx.fillStyle=t<11.8?'#f4ecd8':'#2433a8';ctx.fillRect(0,0,1440,2560);
 ctx.fillStyle=t<11.8?'#87785c12':'#f0e8d323';for(let i=0;i<850;i++){const x=hash(i*11)*1440,y=hash(i*11+5)*2560;ctx.fillRect(x,y,1+hash(i)*2,1+hash(i+6)*2);}
 if(t<11.8){ctx.strokeStyle='#cbbf9d';ctx.lineWidth=2;for(let y=100;y<2460;y+=70){ctx.beginPath();ctx.moveTo(64,y);ctx.lineTo(1370,y);ctx.stroke()}
  ctx.strokeStyle='#e75e3c44';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(150,0);ctx.lineTo(150,2560);ctx.stroke();
  ctx.save();ctx.globalAlpha=.15;ctx.fillStyle='#29252e';ctx.font='600 20px "Source Serif 4"';for(let row=0;row<14;row++)ctx.fillText('a page is a place for something impossible to begin',900,100+row*33);ctx.restore();
 }
}
function nib(ctx,x,y,scale,t,mood,fly=false){
 const b=Math.floor(t*12),walk=mood==='run'?Math.sin(t*22):0,j=(hash(b+94)-.5)*2;
 ctx.save();ctx.translate(x,y);ctx.rotate(fly?-.18:walk*.055);ctx.scale(scale*(1+walk*.035),scale*(1-walk*.05));
 // Handmade ink silhouette: a single irregular body, not a block-character rig.
 const pts=[];for(let i=0;i<=44;i++){const a=i/44*Math.PI*2,r=130+(hash(i*3+11)-.5)*14;pts.push([Math.cos(a)*r,Math.sin(a)*(r*.9)-80])}
 polygon(ctx,pts,'#293ab0',true,b);
 ctx.fillStyle='#102275';ctx.beginPath();ctx.ellipse(0,0,105,26,0,0,Math.PI);ctx.fill();
 for(let i=0;i<40;i++){ctx.fillStyle=i%2?'#7984c133':'#12216b44';ctx.fillRect(-110+hash(i*6)*210,-170+hash(i*6+1)*175,2,6)}
 const reach=mood==='rip'?1:mood==='shock'?.5:0;
 stroke(ctx,[[-115,-83],[-177,-35-reach*95],[-207,-48-reach*130]],'#26319a',18,b);
 stroke(ctx,[[115,-83],[168,-45-reach*85],[200,-20-reach*110]],'#26319a',18,b+3);
 for(const side of [-1,1]){const kick=side*walk*36;stroke(ctx,[[side*49,13],[side*56+kick,80],[side*80+kick,83]],'#2334a4',22,b+side);}
 const eyeOpen=mood==='shock'?1.45:mood==='rip'?.65:1;
 ctx.fillStyle='#f8f0db';for(const side of [-1,1]){ctx.beginPath();ctx.ellipse(side*42,-112,29,39*eyeOpen,side*.08,0,Math.PI*2);ctx.fill();ctx.fillStyle='#29252e';ctx.beginPath();ctx.ellipse(side*42+(mood==='shock'?12:5),-105+j,10,14,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#f8f0db';}
 stroke(ctx,[[-70,-174],[-28,-182+(mood==='rip'?30:0)]],'#17172c',9,b+55);stroke(ctx,[[28,-182],[74,-170+(mood==='shock'?-22:0)]],'#17172c',9,b+58);
 ctx.strokeStyle='#f6efd9';ctx.lineWidth=8;ctx.beginPath();if(mood==='shock')ctx.ellipse(0,-51,18,25,0,0,Math.PI*2);else ctx.arc(0,-76,36,mood==='rip'?Math.PI+.1:.15,mood==='rip'?2*Math.PI-.1:Math.PI-.15);ctx.stroke();
 if(mood==='shock')for(let i=0;i<3;i++)stroke(ctx,[[120+i*20,-230-i*10],[140+i*25,-262-i*16]],'#ed542f',7,b+i);
 ctx.restore();
}
function wings(ctx,x,y,p,t){
 ctx.save();ctx.translate(x,y);const flap=Math.sin(t*11)*.12;
 for(const side of [-1,1]){ctx.save();ctx.rotate(side*(flap+.1));ctx.shadowColor='#0a16564a';ctx.shadowBlur=15;ctx.shadowOffsetY=12;
  const points=[[0,-70],[side*420*p,-260*p],[side*280*p,60*p],[side*170*p,-25],[side*80*p,15]];polygon(ctx,points,'#f5eedf',true,42);ctx.shadowBlur=0;
  stroke(ctx,[[0,-70],[side*420*p,-260*p],[side*170*p,-25]],'#ad9e81',3,5);ctx.restore();}
 ctx.restore();
}
function paint(ctx,t,hand){
 paper(ctx,t);const b=Math.floor(t*12),shake=t>6.4&&t<7.2?Math.sin(t*75)*8:0;
 const zoom=t<3?1.35:t<6?lerp(1.35,1.5,s((t-3)/.7)):t<9?lerp(1.5,1.2,s((t-6)/.65)):t<12?lerp(1.2,1.1,s((t-9)/2.5)):lerp(1.1,1,s((t-12)/.6));
 const cx=t<3?600:t<6?lerp(600,780,s((t-3)/.7)):720;
 const cy=t<3?1300:t<6?1400:t<9?1460:t<12?lerp(1460,1250,s((t-9)/2.5)):1280;
 ctx.save();ctx.translate(720+shake,1280);ctx.scale(zoom,zoom);ctx.translate(-cx,-cy);
 // A page-world assembled from torn mountain pieces and hand-drawn contours.
 const establish=1-s((t-6.9)/.6);if(establish>0){ctx.save();ctx.globalAlpha=establish;
 polygon(ctx,[[-120,1610],[220,920],[500,1610]],'#f3b453',false);polygon(ctx,[[170,1630],[600,1060],[990,1630]],'#ed5837',false);polygon(ctx,[[730,1660],[1200,1000],[1600,1660]],'#bec59c',false);
 for(let i=0;i<3;i++)stroke(ctx,[[100+i*450,1490],[280+i*450,1240],[370+i*450,1490]],'#f6ecd1',7,b+i);
 ctx.restore();}
 let x=470,y=1620,scale=1.4,mood='shock';
 if(t<3){x=470-70*Math.sin(s(t/2.8)*Math.PI);y=1620-Math.sin(s((t-.5)/1.7)*Math.PI)*220;}
 else if(t<6){x=lerp(320,720,s((t-3)/2.3));mood=t>5.05?'shock':'run';}
 else if(t<9){x=lerp(720,550,s((t-6)/.7));y=1620-100*s((t-6.4)/1.5);mood='rip';}
 else{x=720+Math.sin((t-9)*.9)*90;y=lerp(1540,970,s((t-9)/4));scale=lerp(1.4,1.7,s((t-11)/3));mood='happy';}
 // Door drawing becomes the antagonist: graphite outline, tooth reveal, bite.
 if(t>=3&&t<7){const p=s((t-3.1)/1.4),bite=s((t-4.9)/.25),cy=1300;
  ctx.save();ctx.translate(990,cy);ctx.rotate(Math.sin(t*3)*.018*bite);ctx.shadowColor='#47372844';ctx.shadowBlur=18;ctx.shadowOffsetX=14;ctx.shadowOffsetY=15;
  polygon(ctx,[[-200,320],[-200,320-700*p],[170,320-700*p],[190,320]],'#eee1be',true,b);ctx.shadowBlur=0;
  if(bite>0){polygon(ctx,[[-155,-310],[125,-320],[138,210],[-151,200]],'#202630',false);for(let i=0;i<5;i++){polygon(ctx,[[-145+i*56,-310],[-117+i*56,-190-60*bite],[-89+i*56,-310]],'#f9f1df',false);polygon(ctx,[[-145+i*56,200],[-117+i*56,85],[-89+i*56,200]],'#f9f1df',false)}
   ctx.fillStyle='#ef542f';for(const ex of [-58,65]){ctx.beginPath();ctx.arc(ex,-415,22,0,Math.PI*2);ctx.fill()}}
  ctx.restore();
 }
 if(t>=6.4){const p=s((t-6.4)/2.2);ctx.save();ctx.shadowColor='#0b123877';ctx.shadowBlur=30;ctx.shadowOffsetX=20;ctx.shadowOffsetY=15;
  const tear=[];for(let i=0;i<30;i++)tear.push([80+i*46,2100-i*40+(hash(i+2)-.5)*40]);
  polygon(ctx,[[0,2560],[0,2100],...tear,[1440,930],[1440,2560]],t<11.8?'#2737a7':'#17257e',false);ctx.shadowBlur=0;
  const exposed=tear.slice(0,Math.ceil(p*tear.length));if(exposed.length>1)stroke(ctx,exposed,'#fff6e4',13,b);ctx.restore();
 }
 if(t>=9)wings(ctx,x,y-80,s((t-9)/1.2),t);
 nib(ctx,x,y,scale,t,mood,t>=9);
 // Giant real photographic hand is a cutout layer; its tip causes each stroke.
 if(t<6.7){let tipX=t<3?lerp(830,510,s(t/2.5)):990+Math.sin(t*5)*120,tipY=t<3?lerp(800,1290,s(t/2.5)):990+Math.cos(t*5)*230;
  ctx.save();ctx.translate(tipX-105,tipY-1240);ctx.rotate(t<3?-.07:.10*Math.sin(t*5));ctx.drawImage(hand,0,0,900,1350);ctx.restore();
  const strokeP=s(t/2.7);if(t<3)stroke(ctx,[[830,805],[760,940],[700,1080],[830-320*strokeP,810+480*strokeP]],'#292832',7,b);
 }
 const burst=s((t-10.6)/1.2);if(t>10.6)for(let i=0;i<44;i++){const a=hash(i)*Math.PI*2,r=100+burst*(160+hash(i+4)*900),xx=720+Math.cos(a)*r,yy=1150+Math.sin(a)*r+(t-12)*85;ctx.save();ctx.translate(xx,yy);ctx.rotate(t*(hash(i+6)-.5)*3);polygon(ctx,[[-12,-20],[18,-15],[12,20],[-15,14]],i%3?'#ed542f':'#f3df9d',false);ctx.restore();}
 if(t>12){ctx.fillStyle='#f8eedb';ctx.textAlign='center';ctx.font='600 148px "Source Serif 4"';ctx.fillText('PAPER',720,2040);ctx.save();ctx.translate(720,2225);ctx.rotate(-.075);ctx.font='600 224px "Source Serif 4"';ctx.fillText('RIOT',0,0);ctx.restore();ctx.font='600 31px Inter';ctx.fillText('DRAW YOUR WAY OUT.',720,2350);}
 ctx.restore();
}
export function PaperRiot(){
 const frame=useCurrentFrame(),ref=useRef(null),image=useRef(null),[handle]=useState(()=>delayRender('Paper collage hand')),[ready,setReady]=useState(false);
 useLayoutEffect(()=>{const img=new Image();img.onload=()=>{image.current=img;Promise.all([document.fonts.load('600 148px "Source Serif 4"'),document.fonts.load('600 31px Inter')]).then(()=>setReady(true)).catch(cancelRender)};img.onerror=()=>cancelRender(Error('Paper hand did not load'));img.src=staticFile('showcase/paper-riot/pencil-hand.png');},[]);
 useLayoutEffect(()=>{if(ready){paint(ref.current.getContext('2d'),frame/60,image.current);continueRender(handle)}},[ready,frame,handle]);
 return <AbsoluteFill style={{background:'#f4ecd8'}}><Audio src={staticFile('showcase/paper-riot/score.wav')}/><canvas width={1440} height={2560} ref={ref}/></AbsoluteFill>;
}
