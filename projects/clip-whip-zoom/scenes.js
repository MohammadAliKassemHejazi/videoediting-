import {V,VFIELDS} from '../../lib/variety-draw.js';
const whipBeats=[.3,1.68,3.14,4.64,5.75,7,9.18,10.24,11,11.9,13.18];
export function whipBack(c,t){c.fillStyle='#111';c.fillRect(0,0,1080,1920)}
export function whipFront(c,t){
 // Brief velocity streaks accompany actual changes in the footage's crop.
 const d=Math.min(...whipBeats.map(a=>Math.abs(t-a))),strength=Math.max(0,1-d/.14);if(strength){c.save();c.globalAlpha=strength*.6;for(let i=0;i<12;i++){const a=i*Math.PI/6,x=540+Math.cos(a)*610,y=830+Math.sin(a)*810;V.line(c,[[x,y],[x+Math.cos(a)*280,y+Math.sin(a)*280]],i%3?'#fff':'#ff672d',4)}c.restore()}
 V.label(c,'PUNCH / PULL / PROOF',55,180,'#fff');V.line(c,[[55,205],[310,205]],'#ff672d',6);
 if(t<.58){c.save();c.translate(540,1300);c.rotate(-.07);V.text(c,'STOP',0,0,210,'#ff672d','Anton','center');c.restore()}
 else if(t<3.14){V.box(c,45,1300,990,125,'#111b',2);V.text(c,'BACKEND ≠ CHECKED',80,1387,76,'#fff','Anton')}
 else if(t<4.64){const p=V.ease((t-3.14)/.3);V.text(c,'3',860,510,220,'#ff672d','Anton','center');V.arrow(c,850,555,735,735,'#ff672d',7,p);V.text(c,'ASK FIRST',65,1430,75,'#fff','Anton')}
 else if(t<7){V.box(c,40,1350,1000,125,'#ff672d',0);V.text(c,'DON’T SHIP BLIND.',540,1440,84,'#101010','Anton','center')}
 else if(t<9.18){V.text(c,'DEFINE THE CONTRACT',55,1420,79,'#fff','Anton');V.line(c,[[55,1450],[1025,1450]],'#ff672d',7,V.ease((t-7)/.4))}
 else if(t<13.18){const k=V.field(t);V.text(c,VFIELDS[k][0],60,1330,88,'#ff672d','Anton');V.text(c,VFIELDS[k][1],60,1410,58,'#fff');V.arrow(c,450,1305,840,1190,'#ff672d',6,V.ease((t-[9.18,10.24,11,11.9][k])/.3))}
 else{V.box(c,50,1285,980,190,'#131313e9',0);V.text(c,'WHO GETS ACCESS?',85,1410,101,'#ff672d','Anton')}
}
