// Shared by Remotion preview and render. Every frame is a pure function of time.
export const STYLES = [
 {id:'tech-ui',name:'Product UI',family:'HyperFrames',bestFor:'Product demos and tech explainers',accent:'#cbff5e',bg:'#111619',motion:'Cursor triggers a focused interface reveal',assetNeeds:'Code-drawn UI; optional official product captures'},
 {id:'continuous-world',name:'One continuous world',family:'onetake',bestFor:'Connected systems and feature journeys',accent:'#6ce2dc',bg:'#101f25',motion:'One camera travels through a persistent world',assetNeeds:'Code-drawn world; optional product screenshots'},
 {id:'paper-collage',name:'Editorial paper collage',family:'Collage B-roll',bestFor:'History, comparisons and evidence-led stories',accent:'#d9462c',bg:'#e9dfcc',motion:'Torn cutouts assemble into a causal editorial composition',assetNeeds:'Local paper geometry now; optional licensed photos and cutouts'},
 {id:'brush-story',name:'Brush character story',family:'Clawd Animation',bestFor:'Concepts with a character and emotional payoff',accent:'#cc604b',bg:'#f0e8d9',motion:'An original character acts out the problem and builds the solution',assetNeeds:'Code-drawn character now; optional custom painted model sheet'},
 {id:'cinematic-blueprint',name:'Cinematic blueprint',family:'Lemo Opuscar',bestFor:'Systems, architecture and dramatic reveals',accent:'#e9bd70',bg:'#07191f',motion:'Mapped camera push, layered depth and traced architecture',assetNeeds:'Code geometry; optional licensed environment textures'},
 {id:'terminal-forensics',name:'Terminal forensics',family:'Original studio',bestFor:'Debugging, security and code reviews',accent:'#67f09d',bg:'#0b1110',motion:'Typed command leads to evidence rows and a resolved result',assetNeeds:'Original illustrative code; optional real terminal capture'},
 {id:'swiss-type',name:'Swiss kinetic type',family:'Original studio',bestFor:'Short sharp ideas and memorable contrasts',accent:'#e53c27',bg:'#eee9dd',motion:'Oversized typographic blocks and precise mechanical reveals',assetNeeds:'Local typography only'},
 {id:'isometric-system',name:'Isometric request factory',family:'Original studio',bestFor:'Infrastructure, pipelines and causal flows',accent:'#8d86ff',bg:'#15162b',motion:'A request passes through a machine with visible handoffs',assetNeeds:'Code-drawn blocks; optional supplied 3D objects'},
 {id:'editorial-split',name:'Editorial evidence desk',family:'Original studio',bestFor:'Talking-head analysis with credible proof',accent:'#fb713f',bg:'#242320',motion:'Evidence clips dock beside the speaker with readable annotations',assetNeeds:'Local diagrams; optional attributed excerpts'},
 {id:'hologram',name:'Holographic system scan',family:'Lemo Opuscar',bestFor:'Sci-fi tech showcases and system inspection',accent:'#51e5ff',bg:'#07131d',motion:'Scanning reveals wireframes and activates a system path',assetNeeds:'Code-drawn scan; optional licensed product model'},
];
export function styleById(id){const style=STYLES.find(s=>s.id===id);if(!style)throw Error('Unknown style: '+id);return style;}
const clamp=x=>Math.max(0,Math.min(1,x));
const ease=x=>{x=clamp(x);return 1-(1-x)**3;};
const spring=x=>x<=0?0:1-Math.exp(-9*x)*(Math.cos(12*x)+.75*Math.sin(12*x));
export function paintAudition(ctx,t,spec,styleId){
 const S=styleById(styleId),W=1080,H=1100;
 ctx.save();ctx.clearRect(0,0,W,H);ctx.fillStyle=S.bg;ctx.fillRect(0,0,W,H);
 const light=['paper-collage','brush-story','swiss-type'].includes(styleId),ink=light?'#242725':'#f3f1e9';
 const text=(value,x,y,size=44,color=ink,weight=600,font='Inter')=>{ctx.fillStyle=color;ctx.font=`${weight} ${size}px ${font.includes(' ')?'"'+font+'"':font}`;ctx.textAlign='left';ctx.fillText(value,x,y);};
 const line=(x,y,a,b,color=S.accent,width=4)=>{ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(a,b);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();};
 const box=(x,y,w,h,color=light?'#faf5e9':'#243239',r=18)=>{ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();};
 const source=spec.beats.filter(b=>b.at<=t).at(-1)||spec.beats[0],phase=source.phase||0;
 const current=phase===2?{...source,items:source.items.map((v,i)=>t<(source.itemTimes?.[i]??source.at)?['User → ?','Input → ?','Response → ?','Errors → ?'][i]:v),itemTimes:source.items.map((_,i)=>source.at+i*.24)}:source;
 const age=t-current.at,entry=spring(age),labels=current.items||[];
 const tag=(x,y)=>{text(current.eyebrow||'ILLUSTRATIVE WORKFLOW',x,y,25,S.accent,700);};
 const rows=(x,y,w=850)=>labels.forEach((value,i)=>{
   const onset=current.itemTimes?.[i]??current.at+i*.24,p=ease((t-onset)*3);
   if(p===0)return;box(x+28*(1-p),y+i*100,w*p,76);text(value,x+24+28*(1-p),y+i*100+51,38,ink);
 });
 const nodes=(y)=>['Requirements','Boundaries','Review'].forEach((v,i)=>{const p=ease((age-i*.22)*3);if(!p)return;box(70+i*330,y+70*(1-p),300,220);text(String(i+1).padStart(2,'0'),94+i*330,y+70*(1-p)+84,66,S.accent,800);text(v,94+i*330,y+70*(1-p)+158,32);});
 if(styleId==='tech-ui'){
   box(60,85,960,900,'#192226',32);tag(102,146);text(current.title,102,240,60);line(102,270,978,270,'#43504c',2);
   if(phase===1){nodes(350);text('Can every request cross safely?',104,770,40);line(104,813,960,813,S.accent,3);}else if(phase===2){
     text('POST /orders',104,338,42,S.accent,700,'monospace');text('{',104,403,38,ink,600,'monospace');
     const values=['user: "member",','input: { item, quantity },','response: { receipt },','errors: [400, 403]'].map((v,i)=>t<(source.itemTimes?.[i]??source.at)?['user: ?,','input: ?,','response: ?,','errors: ?'][i]:v);
     values.forEach((v,i)=>{const p=ease((t-(current.itemTimes?.[i]??current.at+i*.3))*3);if(p>0){box(135,426+i*102,800*p,74,'#2b3c3c',10);text(v,159,476+i*102,35,ink,600,'monospace');}});text('}',104,898,38,ink,600,'monospace');
   }else rows(104,340,850);
   const destination=phase===1?[880,520]:[890,360+Math.min(2,Math.floor(Math.max(0,age)/1.3))*100];
   const travel=ease(age/1.1),x=1020+(destination[0]-1020)*travel,y=880+(destination[1]-880)*travel;
   ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+15,y+55);ctx.lineTo(x+27,y+34);ctx.lineTo(x+49,y+28);ctx.closePath();ctx.fillStyle=S.accent;ctx.fill();
 }else if(styleId==='continuous-world'){
   // All stations persist. Camera positions, not scene replacement, reveal beats.
   const stops=spec.beats,active=stops.indexOf(source),previous=Math.max(0,active-1);
   const camera=active===0?0:previous*1050+(active-previous)*1050*ease(age/1.1);
   ctx.save();ctx.translate(-camera,0);
   line(0,870,stops.length*1050,870,'#47767c',6);
   stops.forEach((original,j)=>{const b=original===source?current:original;
     const x=j*1050;box(x+90,140,850,600,'#1c333c',50);text(b.title,x+140,250,57);text(b.eyebrow,x+140,190,25,S.accent);
     (b.items||[]).forEach((v,i)=>{box(x+140,310+i*95,740,74,'#264750');text(v,x+170,359+i*95,36);});
     line(x+520,740,x+520,870);ctx.beginPath();ctx.arc(x+520,870,18,0,Math.PI*2);ctx.fillStyle=S.accent;ctx.fill();
   });ctx.restore();
   box(455,825,170,90,S.accent,22);text('request',473,885,35,'#102126');
 }else if(styleId==='paper-collage'){
   // Seedless fixed dot pattern: paper texture, no remote image dependency.
   for(let y=0;y<H;y+=20)for(let x=0;x<W;x+=20){ctx.fillStyle='#b3a58d44';ctx.fillRect(x,y,2,2);}
   ctx.save();ctx.translate(72,120);ctx.rotate(-.035);box(0,0,920,180,'#252923',0);text(current.title,30,118,59,'#f8efdd',800);ctx.restore();
   labels.forEach((v,i)=>{const p=spring((t-(current.itemTimes?.[i]??current.at+i*.25)));if(p<=0)return;
     ctx.save();ctx.translate(88+i*17,390+i*135+180*(1-p));ctx.rotate(i%2?.025:-.026);
     ctx.beginPath();ctx.moveTo(0,0);for(let x=0;x<=870;x+=29)ctx.lineTo(x,x%58===0?-8:5);ctx.lineTo(870,98);ctx.lineTo(0,104);ctx.closePath();ctx.fillStyle=i===0?S.accent:'#faf3e5';ctx.fill();
     text(v,28,65,39,i===0?'#fff8ea':ink,700);ctx.restore();
   });
   // Editorial evidence: a tangible stamped inspection sheet, not a second caption.
   ctx.save();ctx.translate(805,935);ctx.rotate(-.12);ctx.strokeStyle=S.accent;ctx.lineWidth=6;ctx.strokeRect(-200,-64,230,88);text('INSPECT',-179,-4,39,S.accent,800);ctx.restore();tag(90,1010);
 }else if(styleId==='brush-story'){
   tag(70,100);text(current.title,70,193,60,ink,750,'Source Serif 4');
   // Character anticipates, reaches for the block, then settles with the reveal.
   const reach=ease((age-.3)/.6),cx=210+70*reach,cy=750-50*Math.sin(Math.PI*ease(age/1.2));
   ctx.save();ctx.translate(cx,cy);ctx.rotate(-.06*(1-reach));
   ctx.fillStyle='#ce6950';ctx.beginPath();ctx.roundRect(-105,-170,210,160,38);ctx.fill();
   for(let i=0;i<4;i++)line(-100+i*64,-20,-115+i*73,45,'#96503e',14);
   line(90,-110,180*reach+100,-180,'#96503e',15);line(-90,-110,-155,-70,'#96503e',15);
   box(-53,-125,22,28,'#252923',5);box(27,-125,22,28,'#252923',5);line(-25,-60,25,-60,'#252923',5);ctx.restore();
   labels.forEach((v,i)=>{const p=ease((t-(current.itemTimes?.[i]??current.at+i*.3))*3);if(!p)return;
     box(390+120*(1-p),340+i*135,620,102,'#e1d2b8',12);text(v,417+120*(1-p),405+i*135,37);line(405,425+i*135,970*p,425+i*135,S.accent,5);
   });line(80,830,980,830,'#baaa8c',5);text('Observe → ask → inspect',84,944,36,'#665b4f');
 }else if(styleId==='cinematic-blueprint'||styleId==='hologram'){
   const scale=1+.07*ease(age/3);ctx.save();ctx.translate(540,550);ctx.scale(scale,scale);ctx.translate(-540,-550);
   for(let x=0;x<W;x+=54)line(x,0,x,H,styleId==='hologram'?'#164050':'#163138',1);
   for(let y=0;y<H;y+=54)line(0,y,W,y,'#163138',1);
   tag(70,105);text(current.title,70,195,59);
   const scan=ease(age/1.8);line(70,260+680*scan,1010,260+680*scan,S.accent,3);
   labels.forEach((v,i)=>{const p=ease((t-(current.itemTimes?.[i]??current.at+i*.3))*2.5);if(!p)return;
     ctx.strokeStyle=S.accent;ctx.lineWidth=3;ctx.strokeRect(95,310+i*145,890*p,106);text(v,135,380+i*145,41);line(115,395+i*145,300,395+i*145,S.accent,2);
   });ctx.restore();
 }else if(styleId==='terminal-forensics'){
   tag(75,110);text('~/backend / inspection',75,200,42,S.accent,600,'monospace');line(75,240,1000,240,'#3e6050',2);
   const command='$ inspect '+current.title.toLowerCase().replaceAll(' ','-');text(command.slice(0,Math.floor(Math.max(0,age)*35)),75,327,38,ink,500,'monospace');
   labels.forEach((v,i)=>{const p=ease((t-(current.itemTimes?.[i]??current.at+.7+i*.3))*3);if(p>0){text('›',75,445+i*115,45,S.accent);text(v,120,445+i*115,37,ink,500,'monospace');line(120,472+i*115,120+820*p,472+i*115,'#2d4a3a',2);}});
 }else if(styleId==='swiss-type'){
   box(0,0,210*entry,H,S.accent,0);text(String(phase+1).padStart(2,'0'),34,165,101,'#fff2dd',800);text(current.title,250+70*(1-entry),165,57,ink,800);
   labels.forEach((v,i)=>{const p=ease((t-(current.itemTimes?.[i]??current.at+i*.24))*3);if(p>0){line(250,310+i*148,1000,310+i*148,'#252923',3);text(v,250+60*(1-p),400+i*148,49,ink,800);}});
 }else if(styleId==='isometric-system'){
   tag(70,115);text(current.title,70,213,58);
   labels.forEach((v,i)=>{const p=ease((t-(current.itemTimes?.[i]??current.at+i*.3))*2.5);if(!p)return;
     const x=100+i*45,y=340+i*158+60*(1-p);
     ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+760,y);ctx.lineTo(x+825,y+60);ctx.lineTo(x+65,y+60);ctx.closePath();ctx.fillStyle='#605bad';ctx.fill();box(x+65,y+60,760,80,'#302d5a',0);text(v,x+95,y+114,37);line(x+790,y+65,x+790,y+130,S.accent,5);
   });
 }else if(styleId==='editorial-split'){
   text('FIELD NOTES',75,120,29,S.accent);text(current.title,75,226,57,ink,700,'Source Serif 4');
   line(75,268,1005,268,'#89877e',2);rows(75,340,930);
   text('Inspect the contract before shipping.',75,970,33,'#c4c0b5',500,'Source Serif 4');
 }
 ctx.restore();
}
