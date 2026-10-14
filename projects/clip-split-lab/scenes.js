import {V,VFIELDS} from '../../lib/variety-draw.js';
export function splitBack(c,t){c.fillStyle='#0c131a';c.fillRect(0,0,1080,1920);}
export function splitFront(c,t){
 if(t<3.14){V.box(c,55,1160,970,280,'#0c131aee',10);V.label(c,'BEFORE YOU SHIP',85,1220,'#69f4bb');V.text(c,t<.58?'STOP.':'AI ≠ REVIEW',85,1350,133,'#fff','Anton');return}
 if(t>=4.64&&t<5.35){V.box(c,0,0,1080,1920,'#0c131a',0);const p=V.ease((t-4.64)/.3);V.label(c,'GENERATED CODE NEEDS INSPECTION',65,260,'#ff665a');V.text(c,'DON’T SHIP',65,565,175,'#fff','Anton');V.text(c,'BLIND.',65,780,240,'#ff665a','Anton');V.line(c,[[65,950],[65+950*p,950]],'#ff665a',10);V.text(c,'request → unchecked input',65,1180,55,'#69f4bb');V.text(c,'?',950,1430,265,'#ff665a','Anton','right');return}
 const y=760;V.box(c,0,y,1080,1160,'#0c131a',0);c.fillStyle='#69f4bb';c.fillRect(0,y+(1-V.ease((t-3.14)/.3))*1100,1080,7);V.label(c,'SPEAKER ↑   /   DEMONSTRATION ↓',55,825,'#69f4bb');
 if(t<7){V.text(c,t<4.64?'THREE CHECKS':'DON’T SHIP BLIND',55,975,t<4.64?110:97,'#f7faf8','Anton');const labels=['REQUIREMENTS','BOUNDARIES','TEST + REVIEW'];for(let i=0;i<3;i++){const p=V.ease((t-3.14-i*.14)/.4);c.save();c.translate((1-p)*130,0);c.globalAlpha=p;V.text(c,String(i+1).padStart(2,'0'),55,1110+i*150,76,t>=4.64?'#ff665a':'#69f4bb','Anton');V.text(c,labels[i],190,1105+i*150,49,'#eef2f4');V.line(c,[[190,1140+i*150],[1020,1140+i*150]],'#34414a',2);c.restore()}return}
 V.text(c,t<13.18?'API CONTRACT':'TRUST BOUNDARY',55,960,100,'#fff','Anton');V.label(c,'ILLUSTRATIVE / NOT PRODUCTION CODE',55,1020,'#85959f');
 if(t<13.18){const k=V.field(t);for(let i=0;i<4;i++){const yy=1130+i*110,on=i===k;V.box(c,45,yy-72,990,95,on?'#193e31':'#151f28',10);V.text(c,VFIELDS[i][0].toLowerCase(),70,yy,42,on?'#69f4bb':'#a8b5bd');V.text(c,i<=k?VFIELDS[i][1]:'…',400,yy,46,on?'#fff':'#81939f');if(on)V.line(c,[[390,yy+16],[970,yy+16]],'#69f4bb',3,V.ease((t-[9.18,10.24,11,11.9][i])/.22))}}
 else{V.text(c,'request → check → access',70,1190,55,'#69f4bb');V.box(c,65,1300,950,170,'#17382e',18);V.text(c,'WHO MAY DO WHAT?',105,1410,71,'#e6fff1','Anton')}
}
