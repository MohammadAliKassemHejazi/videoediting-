import {proStyle} from './pro-clip-spec.mjs';
const C=x=>Math.max(0,Math.min(1,x)),out=x=>1-(1-C(x))**4,sm=x=>{x=C(x);return x*x*(3-2*x)},lerp=(a,b,p)=>a+(b-a)*p;
const hash=n=>{const k=Math.sin(n*127.1+91.7)*43571.7;return k-Math.floor(k)};
function text(c,word,x,y,size,color,font='Anton',align='left',maxWidth){c.fillStyle=color;c.font=`${font==='Anton'?'400':'600'} ${size}px "${font}"`;c.textAlign=align;c.textBaseline='alphabetic';c.fillText(word,x,y,maxWidth)}
function line(c,points,color,width=3){c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke()}
function grain(c,color,amount=370){c.fillStyle=color;for(let i=0;i<amount;i++)c.fillRect(hash(i*8)*1080,hash(i*8+3)*1920,1+hash(i)*2,1+hash(i+4)*2)}
function hero(c,word,y,size,color,t,start,x=540,rotation=0){const p=out((t-start+(start===0?.12:0))/.38);c.save();c.translate(x+(1-p)*130,y);c.rotate(rotation*(1-p));c.globalAlpha=p;text(c,word,0,0,size,color,'Anton','center',1040);c.restore()}
function stamp(c,word,x,y,t,start,color='#e44e2c'){const p=out((t-start)/.19);c.save();c.translate(x,y);c.rotate(-.09);c.scale(1.18-.18*p,1.18-.18*p);c.globalAlpha=p;c.strokeStyle=color;c.lineWidth=5;c.strokeRect(-190,-62,380,85);text(c,word,0,0,52,color,'Anton','center');c.restore()}
function star(c,x,y,r,color,t){c.save();c.translate(x,y);c.rotate(t*.3);c.beginPath();for(let i=0;i<32;i++){const a=i*Math.PI/16,rr=r*(i%2?.67:1);i?c.lineTo(Math.cos(a)*rr,Math.sin(a)*rr):c.moveTo(Math.cos(a)*rr,Math.sin(a)*rr)}c.closePath();c.fillStyle=color;c.fill();c.restore()}
const termAt=t=>t>=11.9?3:t>=11?2:t>=10.24?1:t>=9.18?0:-1;
const fields=[['USER','member'],['INPUT','item + quantity'],['RESPONSE','receipt'],['ERRORS','400 / 403']];
export function cutaway(id,t){return id==='clip-redline'&&t>=7.12&&t<8.85||id==='clip-acid-print'&&t>=7&&t<7.88||id==='clip-chrome-depth'&&t>=7.88&&t<8.6}

function monument(c,t){
 c.fillStyle='#080b1330';c.fillRect(0,0,1080,1920);
 if(t<.58)hero(c,'STOP',495,490,'#f4ebd5',t,0,540,.08);
 else if(t<3.14){hero(c,t<1.68?'AI':'BACKEND',t<1.68?475:455,t<1.68?490:250,'#f4ebd5',t,t<1.68?.58:1.68);}
 else if(t<4.64){hero(c,'03',690,810,'#f4ebd5',t,3.14,760);}
 else if(t<7){hero(c,'HACKERS',460,245,'#f5ba72',t,4.64);}
 else if(t<13.18){hero(c,'CONTRACT',395,224,'#f4ebd5',t,7);}
 else hero(c,'BOUNDARIES',438,202,'#f4ebd5',t,13.18);
}
function redline(c,t){
 c.fillStyle='#0c1015';c.fillRect(0,0,1080,1920);c.strokeStyle='#32323c';c.lineWidth=1;for(let y=30;y<1920;y+=46){c.beginPath();c.moveTo(0,y);c.lineTo(1080,y);c.stroke()}
 grain(c,'#dad5c814',230);const scan=140+((t*260)%1600);c.fillStyle='#ec24312c';c.fillRect(0,scan,1080,5);
 if(t<.58)hero(c,'STOP',490,480,'#f6404a',t,0);
 else if(t<3.14){hero(c,'BACKEND',438,275,'#ebedef',t,.58);line(c,[[35,480],[1045,480]],'#ed343e',8);}
 else if(t<4.64){hero(c,'3 GATES',425,253,'#f43c48',t,3.14);}
 else if(t<7){hero(c,'ATTACK',455,345,'#f43c48',t,4.64);for(let i=0;i<5;i++)line(c,[[i*240-40,1000],[i*240+300,700]],'#ab172d',4);}
 else if(t<8.85){text(c,'DEFINE THE',65,490,110,'#a3a6af');text(c,'CONTRACT.',65,700,170,'#f5f0e5');text(c,'// illustrative API specification',65,790,30,'#8a8e97','Inter');
  const p=out((t-7.3)/.7);text(c,'POST /orders',65,970,89,'#f43c48','Anton');line(c,[[65,1020],[65+950*p,1020]],'#f43c48',8);text(c,'user → input → response → errors',65,1205,43,'#efece3','Inter',undefined,950);}
 else if(t<13.18)hero(c,'CONTRACT',380,230,'#f0eee6',t,8.85);
 else hero(c,'SECURITY',435,285,'#f43c48',t,13.18);
 for(const x of [40,1040]){line(c,[[x,200],[x,240]],'#f6404a',6);line(c,[[x,1450],[x,1490]],'#f6404a',6);}
}
function paper(c,t){
 c.fillStyle='#f3e9d0';c.fillRect(0,0,1080,1920);grain(c,'#78674627',700);
 // Distinct collage material: torn print fields, typeset marginalia and pinholes.
 c.save();c.translate(990,650);c.rotate(.12);c.fillStyle='#e6d6b3';c.fillRect(-130,-700,250,1400);c.fillStyle='#64594730';for(let y=-650;y<650;y+=28)c.fillRect(-90,y,170*(.7+hash(y)*.3),3);c.restore();
 c.fillStyle='#ea552d';c.beginPath();c.moveTo(0,1460);for(let i=0;i<37;i++)c.lineTo(i*30,1440+(hash(i)-.5)*42);c.lineTo(1080,1920);c.lineTo(0,1920);c.fill();
 if(t<.58){c.save();c.translate(540,440);c.rotate(-.055);text(c,'STOP.',0,0,345,'#242630','Source Serif 4','center',1060);c.restore();}
 else if(t<3.14){hero(c,'AI / CODE',420,230,'#242630',t,.58);stamp(c,'INSPECT',835,880,t,1.8);}
 else if(t<4.64){text(c,'THREE',65,310,172,'#242630','Source Serif 4');text(c,'QUESTIONS.',60,480,152,'#242630','Source Serif 4',undefined,980);}
 else if(t<7){stamp(c,'DO NOT SHIP BLIND',520,415,t,4.64);text(c,'?',830,690,350,'#ea552d','Source Serif 4','center');}
 else if(t<13.18){text(c,'THE CONTRACT',65,250,118,'#242630','Source Serif 4',undefined,980);line(c,[[65,285],[1000,285]],'#252833',4);}
 else{hero(c,'TRUST?',375,300,'#242630',t,13.18);stamp(c,'CHECK BOUNDARIES',510,770,t,13.18);}
}
function acid(c,t){
 c.fillStyle='#d9ff43';c.fillRect(0,0,1080,1920);grain(c,'#26310d28',440);
 if(t<7||t>13.18)for(let i=0;i<9;i++){const r=140+i*165;c.save();c.translate(540,1020);c.rotate(-.35+t*.055);c.strokeStyle=i%3?'#20231f':'#7643ed';c.lineWidth=i%3?4:17;c.strokeRect(-r,-r,r*2,r*2);c.restore();}
 if(t<.58)hero(c,'STOP',515,490,'#17191a',t,0,540,.16);
 else if(t<3.14){hero(c,'BACKEND',430,282,'#17191a',t,.58);text(c,'AI',70,1530,290,'#7643ed');}
 else if(t<4.64){hero(c,'03',680,820,'#7643ed',t,3.14,790);text(c,'ASK FIRST.',55,220,110,'#17191a');}
 else if(t<7){hero(c,'HACKERS',440,270,'#17191a',t,4.64);star(c,880,1290,170,'#7643ed',t);}
 else if(t<7.88){text(c,'DEFINE.',55,770,292,'#17191a');text(c,'BEFORE',55,1070,226,'#7643ed');text(c,'DEPLOY.',55,1360,253,'#17191a');}
 else if(t<13.18){hero(c,'CONTRACT',385,232,'#17191a',t,7.88);star(c,1020,1700,160,'#7643ed',t);}
 else hero(c,'BOUNDARIES',450,203,'#7643ed',t,13.18);
}
function chromeText(c,word,t,start,y,size){const p=out((t-start)/.65),depth=18*p;c.save();c.translate(540+(1-p)*220,y);c.scale(.96+.04*p,1);for(let i=6;i>=1;i--)text(c,word,-i*depth*.3,i*depth*.3,size,['#252831','#343944','#4e5560','#69717b','#8e98a3','#c2cad1'][6-i],'Anton','center',1020);
 const g=c.createLinearGradient(0,-size,0,10);g.addColorStop(0,'#f6f1df');g.addColorStop(.35,'#aeb7c4');g.addColorStop(.5,'#f7f4eb');g.addColorStop(.62,'#6f7886');g.addColorStop(1,'#d7dde3');text(c,word,0,0,size,g,'Anton','center',1020);c.restore();}
function chrome(c,t){
 c.fillStyle='#131820';c.fillRect(0,0,1080,1920);const g=c.createRadialGradient(530,750,0,530,750,1100);g.addColorStop(0,'#2d3440');g.addColorStop(1,'#10151b');c.fillStyle=g;c.fillRect(0,0,1080,1920);
 for(let i=0;i<8;i++){const z=(i+t*.3)%8,p=z/8,y=220+1250*p*p;line(c,[[70-230*p,y],[1010+230*p,y]],i%2?'#85939f40':'#f8c16d55',1+3*p)}
 for(const side of [-1,1])line(c,[[540+side*130,300],[540+side*1100,1900]],'#c0c5ce55',3);
 if(t<.58)chromeText(c,'STOP',t,0,475,440);
 else if(t<3.14)chromeText(c,'BACKEND',t,.58,430,270);
 else if(t<4.64)chromeText(c,'03',t,3.14,590,635);
 else if(t<7)chromeText(c,'INSPECT',t,4.64,425,275);
 else if(t<8.6){text(c,'DEFINE THE',90,690,135,'#e6e3db');chromeText(c,'CONTRACT',t,7.88,1010,225);line(c,[[85,1080],[995,1080]],'#f5c778',6);text(c,'USER · INPUT · RESPONSE · ERRORS',90,1220,32,'#c1c8cf','Inter',undefined,950);}
 else if(t<13.18)chromeText(c,'CONTRACT',t,8.6,375,228);
 else chromeText(c,'BOUNDARIES',t,13.18,420,202);
}
export function paintClipBack(c,t,id){c.clearRect(0,0,1080,1920);c.save();({ 'clip-monument':monument,'clip-redline':redline,'clip-paper-evidence':paper,'clip-acid-print':acid,'clip-chrome-depth':chrome})[id](c,t);c.restore()}

function foregroundDetails(c,t,id){
 const field=termAt(t);
 if(t>=9.18&&t<13.18&&field>=0){const [label,value]=fields[field],start=[9.18,10.24,11,11.9][field],p=out((t-start)/.24);
  if(id==='clip-monument'){c.save();c.translate((1-p)*90,0);text(c,label,65,1270,60,'#f2ebd6','Anton');text(c,value,65,1340,42,'#f2ebd6','Inter');line(c,[[65,1370],[65+300*p,1370]],'#e8cb7e',5);c.restore();}
  else if(id==='clip-redline'){c.fillStyle='#111820e8';c.fillRect(45,1190,990,240);text(c,'ILLUSTRATIVE CONTRACT / '+String(field+1).padStart(2,'0'),75,1240,23,'#afb6bf','Inter');text(c,label.toLowerCase()+':',75,1340,79,'#ff424b');text(c,value,340,1340,49,'#ebe9df','Inter',undefined,650);line(c,[[75,1390],[75+900*p,1390]],'#f6404a',6);}
  else if(id==='clip-paper-evidence'){c.save();c.translate(30*(1-p),0);c.rotate(-.013);c.fillStyle='#f4ead3';c.beginPath();c.moveTo(40,1120);c.lineTo(770,1120);c.lineTo(775,1350);for(let i=0;i<25;i++)c.lineTo(770-i*30,1350+(hash(i)-.5)*18);c.closePath();c.fill();text(c,label.toLowerCase()+':',65,1220,73,'#242630','Source Serif 4');text(c,value,65,1305,60,'#242630','Source Serif 4');line(c,[[60,1330],[560*p,1340],[580*p,1320]],'#ea552d',8);c.restore();}
  else if(id==='clip-acid-print'){c.fillStyle='#17191a';c.fillRect(30,1200,1020*p,210);text(c,label,65,1300,92,'#d9ff43');text(c,value,405,1292,49,'#eeeae1','Inter',undefined,570);}
  else{c.save();c.translate((1-p)*60,0);line(c,[[65,1170],[1000,1170]],'#f5c77888',2);text(c,label,65,1250,60,'#f5c778');text(c,value,65,1320,49,'#e6e3db','Inter');c.restore();}
 }
 if(id==='clip-redline'&&t>=4.64&&t<7){c.save();c.globalAlpha=.55;line(c,[[65,940],[245,940],[270,910]],'#ff3444',5);line(c,[[810,650],[1030,650]],'#ff3444',5);c.restore();}
 if(id==='clip-paper-evidence'&&t>3.14&&t<4.64){for(let i=0;i<3;i++){const p=out((t-3.14-i*.16)/.22);text(c,String(i+1),65+i*130,1270,112*p,'#f3e9d0','Source Serif 4');}}
}
function captions(c,t,id,spec){
 const cue=spec.captions.find(([a,b])=>t>=a&&t<b);if(!cue||t<.58)return;
 const [start,end,caption]=cue,style=proStyle(id),accent=style.accent,p=out((t-start)/.14),size=id==='clip-paper-evidence'?47:49;
 c.save();c.translate(0,(1-p)*18);c.font=`600 ${size}px "${id==='clip-paper-evidence'?'Source Serif 4':'Inter'}"`;c.textAlign='center';c.textBaseline='middle';
 const width=Math.min(1000,c.measureText(caption).width+48),x=(1080-width)/2,y=1660;
 if(id==='clip-paper-evidence'){c.fillStyle='#f5ecd9';c.save();c.translate(540,y);c.rotate(-.02);c.fillRect(-width/2,-45,width,90);c.fillStyle='#242630';c.fillText(caption,0,0);c.restore();}
 else{c.fillStyle=id==='clip-acid-print'?'#17191a':'#10151be8';c.beginPath();c.roundRect(x,y-48,width,96,id==='clip-acid-print'?0:8);c.fill();c.fillStyle='#f5f0e4';c.fillText(caption,540,y,980);
  if(/hackers|requirements|inputs|response|error|boundaries/i.test(caption)){c.fillStyle=accent;c.fillRect(x+18,y+39,(width-36)*p,4);}}
 c.restore();
}
export function paintClipFront(c,t,id,spec){c.clearRect(0,0,1080,1920);c.save();foregroundDetails(c,t,id);captions(c,t,id,spec);c.restore()}
