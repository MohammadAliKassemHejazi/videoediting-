/* A new editorial treatment based on the user's supplied reference film. */
(()=>{
const F=window.REFERENCE_EDIT,c=document.getElementById('c'),g=c.getContext('2d'),q=new URLSearchParams(location.search),W=+(q.get('w')||1080),H=+(q.get('h')||1920);c.width=W;c.height=H;
const C={red:'#F3445E',yellow:'#FDE665',white:'#F6F6F6',muted:'#999B9F',black:'#0B0B0C',panel:'#171719'};
const sp=t=>Motion.spring(t,240,20),cl=v=>Math.max(0,Math.min(1,v)),mix=(a,b,u)=>a+(b-a)*u;
const images={};window.ASSETS_READY=Promise.all(['typescript','next','react','tailwind','router'].map(async k=>{const i=new Image();i.src=`assets/reference-edit/${k}.svg`;await i.decode();images[k]=i;}));
window.FONTS=['500 30px Inter','700 60px Inter','900 96px Inter'];window.DURATION=F.duration;
function box(x,y,w,h,r,fill,stroke){g.beginPath();g.roundRect(x,y,w,h,r);if(fill){g.fillStyle=fill;g.fill();}if(stroke){g.strokeStyle=stroke;g.lineWidth=2;g.stroke();}}
function txt(s,x,y,size=50,color=C.white,weight=700,align='left'){g.font=`${weight} ${size}px Inter`;g.textAlign=align;g.textBaseline='alphabetic';g.fillStyle=color;g.fillText(s,x,y);}
function mono(s,x,y,size=42,color=C.white){g.font=`${size}px Consolas,monospace`;g.fillStyle=color;g.textAlign='left';g.fillText(s,x,y);}
function line(x,y,x2,y2,color=C.muted,w=2){g.beginPath();g.moveTo(x,y);g.lineTo(x2,y2);g.strokeStyle=color;g.lineWidth=w;g.stroke();}
function mark(x,y,w,h,t,a){if(t<a)return;box(x,y,w*cl(sp(t-a)),h,3,C.yellow);}
function ring(x,y,w,h,t,a){if(t<a)return;g.save();g.globalAlpha=cl((t-a)*12);g.strokeStyle=C.red;g.lineWidth=4;g.shadowColor=C.red;g.shadowBlur=12;g.beginPath();g.roundRect(x-8*(1-sp(t-a)),y-8*(1-sp(t-a)),w+16*(1-sp(t-a)),h+16*(1-sp(t-a)),14);g.stroke();g.restore();}
function cursor(x,y,t,a){if(t<a||t>a+.85)return;const p=sp(t-a),xx=x+80*(1-p),yy=y+70*(1-p);g.save();g.translate(xx,yy);g.beginPath();g.moveTo(0,0);g.lineTo(0,34);g.lineTo(9,26);g.lineTo(17,43);g.lineTo(24,39);g.lineTo(16,23);g.lineTo(29,23);g.closePath();g.fillStyle='white';g.strokeStyle='#171719';g.lineWidth=3;g.fill();g.stroke();g.restore();if(t>a+.14){g.globalAlpha=cl(1-(t-a-.14)/.45);g.beginPath();g.arc(x,y,8+35*cl((t-a-.14)/.45),0,Math.PI*2);g.lineWidth=3;g.strokeStyle=C.red;g.stroke();g.globalAlpha=1;}}
function entry(t,a,draw,x=540,y=410){const p=sp(t-a);g.save();g.translate(x,y+45*(1-p));g.scale(.95+.05*p,.95+.05*p);g.translate(-x,-y);g.globalAlpha=cl((t-a)*15);draw();g.restore();}
function logo(key,x,y,size){if(images[key])g.drawImage(images[key],x,y,size,size);}
function browser(x,y,w,h,url){box(x,y,w,h,26,'#F7F7F5');box(x,y,w,65,[26,26,0,0],'#E4E4E2');for(let j=0;j<3;j++){g.beginPath();g.arc(x+26+j*21,y+31,5,0,7);g.fillStyle=['#EE6A61','#EDC255','#70C276'][j];g.fill();}box(x+135,y+15,w-235,34,8,'#F4F4F2');txt(url,x+w/2,y+39,22,'#68686B',500,'center');}
function chapter(n,name,t,a){const p=sp(t-a);g.save();g.translate(540,732);g.scale(.85+.15*p,.85+.15*p);const tw=(g.font='700 43px Inter',g.measureText(name).width),left=-(tw+108)/2;g.shadowColor=C.red;g.shadowBlur=20;box(left,-48,70,70,19,C.red);g.shadowBlur=0;txt(String(n),left+35,6,49,'white',900,'center');txt(name,left+95,3,43);g.restore();}
function terminal(t){
 entry(t,9.68,()=>{box(48,155,984,496,28,C.panel,'#333336');for(let i=0;i<3;i++){g.beginPath();g.arc(82+i*24,190,6,0,7);g.fillStyle=['#F26A66','#F4C05B','#62CB89'][i];g.fill();}txt('Terminal',540,199,24,C.muted,500,'center');line(48,228,1032,228,'#333336');
 mono('❯',88,299,44,C.red);mono('npx create-next-app',136,299,51);const rows=[['TypeScript',12.2],['Tailwind CSS',13.02],['App Router',14.44]];
 rows.forEach(([s,a],i)=>{if(t>=a){const yy=377+i*83;txt('✓',92,yy,38,'#83DEAE');mono(s,147,yy,43);txt('Yes',939,yy,33,C.muted,700,'right');if(i===2)ring(130,yy-43,833,63,t,14.44);}});
 });chapter(1,'The default stack',t,9.68);
}
function stack(t){
 const defs=[['typescript','TypeScript','"typescript"',16.46],['next','Next.js','"next"',17.52],['tailwind','Tailwind','"tailwindcss"',18.88],['react','React','"react"',20.1]];
 defs.forEach(([key,name,pkg,a],i)=>{if(t<a)return;const x=48+i%2*502,y=130+Math.floor(i/2)*280;entry(t,a,()=>{box(x,y,482,255,28,'#171719','#343437');logo(key,x+36,y+40,88);txt(name,x+150,y+91,45);mono(pkg,x+38,y+203,34,'#A6A6AC');line(x+36,y+149,x+447,y+149,'#363639');},x+241,y+127);});
 chapter(1,'The default stack',t,16.46);
}
function route(t){
 const stage=t>=32.48?2:t>=30.86?1:0,a=[28.56,30.86,32.48][stage],name=['Next.js','React Router','TanStack Router'][stage];
 entry(t,a,()=>{browser(48,132,984,530,['nextjs.org · App Router','reactrouter.com · routes','tanstack.com/router'][stage]);
 if(stage<2)logo(stage?'router':'next',90,241,76);else{g.save();g.translate(124,279);g.beginPath();g.arc(0,0,43,0,7);g.fillStyle='#FEDB64';g.fill();g.fillStyle='#213F32';g.beginPath();g.moveTo(-34,26);g.lineTo(-7,-24);g.lineTo(13,10);g.lineTo(25,-9);g.lineTo(42,26);g.fill();g.restore();}
 // The Next logo needs a dark backing on this light browser page.
 if(stage===0){box(87,237,85,85,18,'#111');logo('next',94,244,71);}
 txt(name,191,290,52,'#121214',900);
 txt(['app/page.tsx','app/routes.ts','routes/dashboard.tsx'][stage],91,365,28,'#737378',500);
 box(80,389,920,228,18,'#141419');
 const code=stage===0?['export default function Page() {','  return <Dashboard />','}']:stage===1?['route("dashboard",','  "./routes/dashboard.tsx"',')']:['createFileRoute("/dashboard")({','  component: Dashboard','})'];
 code.forEach((s,i)=>mono(s,104,446+i*59,stage===0?42:43,i===1?'#EAC276':'#D6D6DF'));
 ring(93,402,894,65,t,stage===0?29.9:a+.03);cursor(913,437,t,stage===0?29.9:a+.03);
 });chapter(2,'More than one route',t,28.56);
}
function utility(t){
 entry(t,33.68,()=>{browser(48,128,984,529,'tailwindcss.com · utility classes');logo('tailwind',86,237,74);txt('Tailwind CSS',189,290,50,'#151518',900);
 box(90,336,900,112,19,'#ECECEE');box(139,360,255,64,32,'#222227');txt('Get started',266,403,27,'#FFF',700,'center');txt('rounded-full',439,404,34,'#6A6972',500);
 box(80,477,920,132,17,'#18181D');mono('className="rounded-full',109,525,43,'#DCD8E8');mono('  px-6 py-3 bg-zinc-900"',109,577,43,'#C9B7F5');ring(96,487,861,105,t,35.08);cursor(850,541,t,35.08);
 });chapter(3,'The modern web',t,33.68);
}
function checkMark(x,y,t,a){const on=t>=a;box(x,y,48,48,12,on?C.red:'#FFF',on?C.red:'#CCC');if(on){g.strokeStyle='white';g.lineWidth=5;g.beginPath();g.moveTo(x+12,y+24);g.lineTo(x+21,y+33);g.lineTo(x+37,y+14);g.stroke();}}
function css(t){
 const feature=t>=40.66?2:t>=39.48?1:0,a=[37.54,39.48,40.66][feature];
 entry(t,a,()=>{browser(48,125,984,553,'CSS · live component preview');
 const labels=[':has()','@container','subgrid'];labels.forEach((s,i)=>{box(81+i*307,214,289,63,16,i===feature?'#19191D':'#EAEAE8');txt(s,225+i*307,257,32,i===feature?'#FFF':'#77777B',700,'center');});
 if(feature===0){const on=t>=38.32;box(93,314,894,174,24,on?'#FFF3F4':'#EFEFEE',on?C.red:'#E0E0DE');checkMark(128,374,t,38.32);txt('Native selection',212,385,44,'#171719',900);txt('A parent responds to its checkbox.',212,433,29,'#6C6C70',500);cursor(153,398,t,38.32);}
 if(feature===1){const u=cl(sp(t-39.75)),w=mix(887,527,u),x=540-w/2;box(x,305,w,203,18,'#EAEAEA','#C6C6C8');for(let i=0;i<3;i++){const xx=u>.6?x+22:x+20+i*(w-30)/3,yy=u>.6?320+i*58:330;box(xx,yy,u>.6?w-44:(w-75)/3,u>.6?44:152,12,['#F6C6CE','#D8D5EF','#D9EBD8'][i]);txt(['01','02','03'][i],xx+20,yy+(u>.6?32:82),29,'#38363F',700);}cursor(x+w,415,t,39.75);}
 if(feature===2){for(let i=0;i<3;i++){const x=92+i*302;box(x,311,282,190,18,['#F5CED4','#E2DCF3','#D7EADD'][i]);txt(['Build','Explore','Ship'][i],x+23,365,36,'#24242A',900);const on=t>=43.92;line(x+22,399,x+255,399,'#FFFFFF',4);box(x+21,427,240,47,11,on?C.red:'#FFFFFF');txt(on?'Selected':'Aligned',x+141,459,25,on?'#FFF':'#55535B',700,'center');}if(t>=41.05){g.setLineDash([9,8]);line(92,400,978,400,C.red,3);g.setLineDash([]);}cursor(828,451,t,43.92);}
 box(80,533,920,105,16,'#18181D');mono(['.card:has(input:checked)','@container (width < 600px)','grid-template-rows: subgrid;'][feature],111,599,feature===2?43:46,'#E8D17F');ring(91,544,895,78,t,[38.06,39.48,40.66][feature]);
 });chapter(3,'The modern web',t,37.54);
}
function hood(t){
 entry(t,46.26,()=>{box(48,164,984,485,26,'#FAFAF7');logo('tailwind',85,196,62);txt('Tailwind → CSS',174,241,46,'#171719',900);txt('One utility. Native CSS output.',88,298,29,'#77767A',500);
 box(81,332,918,97,14,'#17171B');mono('class="grid grid-cols-3"',114,395,47,'#E7C57C');
 const p=cl(sp(t-48.8));g.save();g.globalAlpha=p;g.translate(0,25*(1-p));mark(105,456,676,57,t,48.8);mono('grid-template-columns:',111,501,45,'#19191C');mono('repeat(3, minmax(0, 1fr));',111,569,45,'#19191C');g.restore();ring(89,443,894,146,t,50.44);cursor(907,481,t,50.44);
 });chapter(3,'Under the hood',t,46.26);
}
function raw(t){
 entry(t,52.28,()=>{browser(48,143,984,508,'style.css · native CSS');
 box(83,237,914,164,20,'#EBEBE8');const gap=14+28*cl(sp(t-54.24)),cw=(866-gap*2)/3;for(let i=0;i<3;i++){const xx=107+i*(cw+gap);box(xx,259,cw,120,16,['#E7C8D0','#D8D0E7','#D0E2D2'][i]);txt(['Build','Preview','Ship'][i],xx+22,307,35,'#302C35',900);line(xx+23,340,xx+cw-25,340,'#FFFFFF',7);}cursor(949,354,t,54.24);
 box(80,432,920,171,17,'#16161C');mono('.cards { display: grid;',111,478,42,'#D5C0E9');mono('grid-template-columns: repeat(3,1fr);',111,529,38,'#E8D17F');mono('gap: clamp(1rem, 3vw, 2rem); }',111,580,42,'#E8D17F');ring(98,490,881,105,t,52.78);
 });chapter(3,'CSS, directly',t,52.28);
}
function caption(t,split){const cap=F.captions.find(([a,b])=>t>=a&&t<b);if(!cap)return;const[a,b,s]=cap,p=sp(t-a);g.save();g.translate(540,(split?852:1485)+9*(1-p));g.scale(.98+.02*p,.98+.02*p);const size=split?57:72;g.font=`900 ${size}px Inter`;const max=930,sc=Math.min(1,max/g.measureText(s).width);g.scale(sc,sc);g.textAlign='center';g.textBaseline='alphabetic';g.lineJoin='round';g.strokeStyle='rgba(0,0,0,.65)';g.lineWidth=9;g.shadowColor='rgba(0,0,0,.8)';g.shadowBlur=18;g.strokeText(s,0,0);g.shadowBlur=0;g.fillStyle=t>=62.54?C.red:'white';g.fillText(s,0,0);g.restore();}
function fullAccents(t){if(t>=8.82&&t<9.68){const p=sp(t-8.82);g.save();g.translate(540,307);g.scale(.7+.3*p,.7+.3*p);g.shadowColor='rgba(0,0,0,.4)';g.shadowBlur=30;txt('2026',0,0,148,'#FFF',900,'center');g.restore();}if(t>=62.54){const i=t>=63.9?2:t>=63.32?1:0,at=[62.54,63.32,63.9][i],p=sp(t-at),x=540,y=1300;g.save();g.translate(x,y);g.scale(.8+.2*p,.8+.2*p);box(-53,-53,106,106,30,C.red);g.lineWidth=7;g.strokeStyle='#FFF';g.lineCap='round';g.lineJoin='round';if(i===0){g.beginPath();g.moveTo(0,26);g.bezierCurveTo(-65,-12,-18,-46,0,-20);g.bezierCurveTo(18,-46,65,-12,0,26);g.stroke();}else if(i===1){box(-29,-24,58,42,11,null,'white');g.beginPath();g.moveTo(-14,18);g.lineTo(-23,32);g.lineTo(10,18);g.stroke();}else{g.beginPath();g.moveTo(-28,21);g.quadraticCurveTo(-26,-10,13,-10);g.lineTo(13,-28);g.lineTo(35,-3);g.lineTo(13,21);g.lineTo(13,5);g.quadraticCurveTo(-12,2,-28,21);g.stroke();}g.restore();}}
window.seek=t=>{g.setTransform(W/1080,0,0,H/1920,0,0);g.clearRect(0,0,1080,1920);const split=F.split.some(([a,b])=>t>=a&&t<b);if(split){if(t<16.46)terminal(t);else if(t<21)stack(t);else if(t<33.68)route(t);else if(t<36.04)utility(t);else if(t<44.72)css(t);else if(t<52.28)hood(t);else raw(t);}else fullAccents(t);caption(t,split);};
window.seek(0);
})();
