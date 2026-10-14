import {M} from '../../lib/memory-draw.js';
function brushDoor(c,x,y,t){M.shape(c,[[x-105,y],[x-105,y-930],[x+105,y-930],[x+105,y]],'#7a7a86',t,700,'#4c4350',6);M.shape(c,[[x-128,y-950],[x+126,y-950],[x+90,y-816]],'#d7b557',t,703);M.trophy(c,x,y-830,72,t)}
export function paintClawdMemory(c,t,spec){const s=M.state(t,spec),{index:i,p,age}=s,a=M.actorState(s,'mira'),b=M.actorState(s,'sam');c.fillStyle=i===6||i===7?'#d8dfde':'#efe7d3';c.fillRect(0,0,1080,1920);M.oval(c,910,390,340,480,i===6?'#b8c3d0':'#e8d8ac',0,720,'#e8d8ac',0);M.shape(c,[[0,1490],[200,1460],[440,1480],[650,1462],[900,1480],[1080,1445],[1080,1920],[0,1920]],'#c8cfb6',0,725,'#c8cfb6',0);M.grain(c,'#5f51401a');const hand=M.hand(a);
 if(i===0){M.photo(c,700,395,540,M.ease((p-.43)/.2),t,{},false);M.clock(c,905,1030,130,-age*.9,t);M.toonActor(c,a,t)}
 if(i===1){brushDoor(c,970,1550,t);M.clock(c,875,355,145,age*1.6,t);M.toonActor(c,a,t);M.robot(c,a.x-190,1530,180,t,true);if(p>.5)M.line(c,[[a.x-160,1230],[a.x-230,1170],[a.x-180,1140]],'#ba5d53',7)}
 if(i===2){M.machine(c,845,1550,990,t,-age*1.1);M.toonActor(c,a,t);if(p>.35){const q=M.ease((p-.35)/.3);M.ticket(c,M.mix(845,hand[0],q),M.mix(906,hand[1],q)-Math.sin(q*Math.PI)*55,150,.16*(1-q),t)}}
 if(i===3){M.machine(c,845,1550,990,t,p<.4?-age*1.5:0);M.toonActor(c,a,t);if(p<.4){const q=M.soft(p/.4);M.oval(c,M.mix(hand[0],845,q),M.mix(hand[1],906,q)-Math.sin(q*Math.PI)*100,23,23,'#d9b35e',t,732)}else{const q=M.ease((p-.43)/.25);M.ticket(c,M.mix(845,hand[0],q),M.mix(906,hand[1],q),150,0,t)}}
 if(i===4){brushDoor(c,1000,1550,t);M.toonActor(c,b,t);M.toonActor(c,a,t);M.robot(c,460,1530,170,t);if(p>.5)M.line(c,[[742,510],[760,450],[785,510]],'#916776',7)}
 if(i===5){M.toonActor(c,b,t);M.toonActor(c,a,t);if(p<.5){const q=(p-.12)*s.scene.duration;for(let j=0;j<3;j++){const hit=1-M.clamp(Math.abs(q-j*.42)/.24);if(hit)M.oval(c,hand[0],hand[1],hit*37,hit*37,'#e0bf68',t,740+j,'#c79253',3)}}if(p>.42)M.photo(c,560,370,520,M.ease((p-.42)/.2),t,{},false)}
 if(i===6){M.toonActor(c,{...a,h:1070},t);M.ticket(c,740,690,390,-.12,t);M.photo(c,840,390,350,1,t,{},false);M.clock(c,800,1225,160,-age*1.2,t);M.line(c,[[700,710],[792,940]],'#bb6255',5)}
 if(i===7){brushDoor(c,1010,1550,t);M.toonActor(c,b,t);M.toonActor(c,a,t);M.robot(c,p<.5?440:M.mix(440,-30,M.soft((p-.5)/.5)),1530,180,t);c.save();c.globalAlpha=1-M.ease((p-.3)/.2);M.trophy(c,365,510,215,t);c.restore();if(p>.3)M.ticket(c,hand[0],hand[1],150,.12,t)}
 if(i===8){M.machine(c,300,1550,970,t,age<2.43?0:(age-2.43)*4);M.toonActor(c,a,t);const q=M.ease((p-.2)/.28);if(p<.52)M.ticket(c,M.mix(hand[0],300,q),M.mix(hand[1],919,q),150,-.1*(1-q),t);if(p>.58)M.photo(c,720,370,480,1-M.ease((p-.58)/.2),t,{},false)}
 if(i===9){a.x=232;b.x=848;const contact=M.ease((p-.18)/.16);a.reach=b.reach=contact;M.toonActor(c,a,t);M.toonActor(c,b,t);M.robot(c,540,1530,175,t);M.photo(c,540,350,470,0,t,{},false);for(let j=0;j<3;j++){const hit=1-M.clamp(Math.abs(age-[1.33,2.22,3.35][j])/.24);if(hit)M.oval(c,540,920,hit*36,hit*36,'#e0bf68',t,750+j,'#c79253',4)}}
 if(i===0&&age<2.3)M.text(c,'THE STOLEN MINUTE',65,150,65,'#493b48');
 // A story-owned broad brush stroke crosses left to carry the next chapter.
 if(i>0&&age<.3){const q=M.ease(age/.3);M.line(c,[[1200-2500*q,-80],[1550-2500*q,1990]],'#e1c182',280)}
}
