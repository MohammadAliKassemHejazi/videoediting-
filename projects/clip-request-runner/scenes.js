import {V,VFIELDS} from '../../lib/variety-draw.js';
function runnerCube(c,x,y,w,h,color){c.fillStyle=color;c.beginPath();c.moveTo(x,y);c.lineTo(x+w,y+w*.38);c.lineTo(x+w,y+w*.38+h);c.lineTo(x,y+h);c.closePath();c.fill();c.fillStyle='#101e38';c.beginPath();c.moveTo(x,y);c.lineTo(x+w*.55,y-w*.24);c.lineTo(x+w*1.55,y+w*.14);c.lineTo(x+w,y+w*.38);c.closePath();c.fill();c.fillStyle='#183258';c.beginPath();c.moveTo(x+w,y+w*.38);c.lineTo(x+w*1.55,y+w*.14);c.lineTo(x+w*1.55,y+w*.14+h);c.lineTo(x+w,y+w*.38+h);c.closePath();c.fill()}
export function runnerBack(c,t){c.fillStyle='#061426';c.fillRect(0,0,1080,1920);const g=c.createLinearGradient(0,0,0,1600);g.addColorStop(0,'#092743');g.addColorStop(1,'#061426');c.fillStyle=g;c.fillRect(0,0,1080,1920);for(let i=0;i<18;i++){const y=600+i*80;V.line(c,[[0,y],[1080,y+410]],'#17304a',1);V.line(c,[[i*120-600,1920],[i*120+400,570]],'#17304a',1)}V.box(c,25,105,440,580,'#143c58',16);}
export function runnerFront(c,t){
 V.text(c,'THE REQUEST',500,290,89,'#eefcff','Anton',undefined,540);V.text(c,'HAS TO PASS.',500,405,82,'#41defa','Anton',undefined,540);V.label(c,'ILLUSTRATIVE SYSTEM',500,550,'#8ac0d3');
 const camera=t<7?0:V.ease((t-7)/.9)*110;c.save();c.translate(-camera,0);
 const route=[[80,1310],[380,1090],[675,1270],[970,1070]];V.line(c,route,'#143f5a',105);V.line(c,route,'#41defa66',5);
 for(let i=0;i<3;i++){const x=route[i+1][0]-40,y=route[i+1][1],p=V.ease((t-3.14-i*.12)/.35);c.save();c.globalAlpha=t<3.14?.25:p;runnerCube(c,x,y-180*p,80,200*p,t>=4.64&&t<7&&i===0?'#f56c76':'#237caf');V.text(c,String(i+1),x+35,y-20,64,'#fff','Anton');c.restore()}
 const travel=t<3.14?V.ease(t/2.9)*.32:t<4.64?.32:t<7?.32-V.ease((t-4.64)/.25)*.07:Math.min(.96,.25+(t-7)*.1),seg=Math.min(2,Math.floor(travel*3)),p=travel*3-seg,a=route[seg],b=route[seg+1],x=a[0]+(b[0]-a[0])*p,y=a[1]+(b[1]-a[1])*p;
 c.save();c.shadowColor='#41defa';c.shadowBlur=24;runnerCube(c,x-45,y-55,63,54,t>=4.64&&t<7?'#f06e7a':'#7af2ff');c.restore();V.text(c,'REQUEST',x,y+105,31,'#b8edf5','Inter','center');c.restore();
 if(t<.58){V.box(c,505,640,500,125,'#ef6470',14);V.text(c,'STOP',755,733,96,'#071525','Anton','center')}
 else if(t<3.14){V.text(c,'AI GENERATED',65,805,91,'#fff','Anton');V.label(c,'CODE IS THE START, NOT THE REVIEW',65,866,'#8ac0d3')}
 else if(t<4.64){V.text(c,'THREE CHECKPOINTS',65,820,88,'#fff','Anton')}
 else if(t<7){V.text(c,'UNCHECKED?',65,820,115,'#ff8793','Anton');V.text(c,'Don’t send it straight through.',65,890,45,'#d5e8f1')}
 else if(t<13.18){const k=V.field(t);V.text(c,'01 / REQUIREMENTS',65,820,78,'#41defa','Anton');if(k>=0){V.box(c,55,1380,970,180,'#112f48',12);V.text(c,VFIELDS[k][0],90,1440,37,'#72e5fa');V.text(c,VFIELDS[k][1],90,1518,63,'#fff');V.arrow(c,860,1395,860,1260,'#41defa',6,V.ease((t-[9.18,10.24,11,11.9][k])/.4))}}
 else{V.text(c,'02 / BOUNDARIES',65,820,82,'#41defa','Anton');V.line(c,[[860,940],[860,1340]],'#ffcb75',15,V.ease((t-13.18)/.3));V.text(c,'ACCESS CHECK',65,1520,79,'#ffcb75','Anton')}
}
