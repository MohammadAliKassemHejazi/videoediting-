// Reusable deterministic UI components. Project-specific events are declarative.
(() => {
 const F=window.ARTIFACT_FILM,A=window.ALIGNED,P=F.theme,Q=new URLSearchParams(location.search),c=document.getElementById('c');
 const W=c.width=+(Q.get('w')||1080),H=c.height=+(Q.get('h')||1920),g=c.getContext('2d');
 const clamp=Motion.clamp,sp=t=>Motion.spring(t,F.spring.k,F.spring.d),mono='Consolas, "Courier New", monospace';
 const images={},events=Object.fromEntries(F.events.map(e=>[e.id,e.t]));let evidence;
 window.DURATION=F.duration;window.FONTS=['500 100px Inter','600 100px Inter','700 100px Inter','900 100px Inter'];
 window.ASSETS_READY=Promise.all(F.demos.map(id=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>{images[id]=img;resolve();};img.onerror=()=>reject(Error(id));img.src=`assets/demos/native/${id}.png`;})));
 const at=id=>events[id],on=(t,id)=>t>=at(id);
 function rect(x,y,w,h,color,r=0){g.fillStyle=color;g.beginPath();g.roundRect(x,y,w,h,r);g.fill();}
 function text(s,x,y,n=32,color=P.ink,weight=600,code=false,align='left'){g.font=`${weight} ${n}px ${code?mono:'Inter'}`;g.textAlign=align;g.textBaseline='alphabetic';g.fillStyle=color;g.fillText(s,x,y);}
 function line(x1,y1,x2,y2,color=P.red,w=3){g.strokeStyle=color;g.lineWidth=w;g.lineCap='round';g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();}
 function focus(x,y,w,h,t,id){if(!on(t,id))return;const s=1+.15*(1-clamp(sp(t-at(id)))) ;g.save();g.translate(x+w/2,y+h/2);g.scale(s,s);g.shadowColor=P.red;g.shadowBlur=12;g.strokeStyle=P.red;g.lineWidth=3;g.beginPath();g.roundRect(-w/2,-h/2,w,h,12);g.stroke();g.restore();}
 function marker(x,y,w,h,t,id){if(!on(t,id))return;g.save();g.globalAlpha=.24;rect(x,y,w*clamp(sp(t-at(id))),h,P.yellow,5);g.restore();}
 function cursor(x,y,t,id){if(!on(t,id))return;const u=sp(t-at(id));g.save();g.translate(x+55*(1-u),y+70*(1-u));g.fillStyle='#fff';g.strokeStyle='#0b0f17';g.lineWidth=2;g.beginPath();g.moveTo(0,0);g.lineTo(0,38);g.lineTo(11,28);g.lineTo(21,47);g.lineTo(29,43);g.lineTo(20,24);g.lineTo(35,24);g.closePath();g.fill();g.stroke();g.restore();const age=t-at(id);if(age<.32){g.save();g.globalAlpha=.55*(1-age/.32);g.strokeStyle=P.red;g.lineWidth=3;g.beginPath();g.arc(x,y,10+age*75,0,Math.PI*2);g.stroke();g.restore();}}
 function code(s,x,y,n=36){
  evidence.codeRows++;
  const parts=s.split(/("[^"\n]*"|'[^'\n]*'|\b(?:import|from|export|default|function|return|const|true|false)\b|\b\d+(?:\.\d+)?\b|@[a-z]+|:[a-z-]+|#[0-9a-fA-F]{3,6})/g);
  let px=x;for(const part of parts){let color=P.ink;if(/^['"]/.test(part))color=P.green;else if(/^(import|from|export|default|function|return|const|true|false|@)/.test(part))color=P.purple;else if(/^[:#\d]/.test(part))color=P.blue;text(part,px,y,n,color,500,true);px+=g.measureText(part).width;}
 }
 function editor(x,y,w,h,file,rows,t,{size=36,lineH=51,selected=-1,event=null,entry=null}={}){
  const u=entry?sp(t-at(entry)):1;g.save();g.translate(0,22*(1-u));rect(x,y,w,h,P.editor,18);
  rect(x,y,w,54,'#202A3A',18);rect(x,y+29,w,25,'#202A3A');text('◆',x+17,y+36,23,P.blue);text(file,x+52,y+36,27,P.ink,500);text('×',x+w-26,y+36,24,P.muted);
  g.save();g.beginPath();g.rect(x+10,y+55,w-20,h-65);g.clip();
  rows.forEach((row,i)=>{const r=typeof row==='string'?{text:row}:row,yy=y+105+i*lineH;
   if(r.at!=null&&t<r.at)return;const p=r.at!=null?sp(t-r.at):1;g.save();g.translate(24*(1-p),0);g.globalAlpha=clamp(p);
   if(i===selected&&event){marker(x+51,yy-size+3,w-72,size+14,t,event);focus(x+48,yy-size-2,w-66,size+21,t,event);}
   const fitted=Math.min(size,(w-83)/Math.max(1,r.text.length*.61));
   text(String(i+1),x+33,yy,size*.58,'#586579',500,true,'right');code(r.text,x+58,yy,fitted);g.restore();
  });g.restore();g.restore();
 }
 function terminal(x,y,w,h,rows,t,event){
  rect(x,y,w,h,'#080E16',18);rect(x,y,w,51,'#202A3A',18);rect(x,y+28,w,23,'#202A3A');text('TERMINAL  /  powershell',x+20,y+35,24,P.muted,500);
  rows.forEach((r,i)=>{const row=typeof r==='string'?{text:r}:r,yy=y+103+i*52;if(row.at!=null&&t<row.at)return;let s=row.text;if(row.typeAt!=null)s=s.slice(0,Math.floor(s.length*clamp((t-row.typeAt)/.45)));if(s.trim())evidence.terminalRows++;text(s,x+24,yy,row.size||34,row.color||P.green,500,true);});
  if(event){focus(x+14,y+63,w-28,60,t,event);cursor(x+w-52,y+99,t,event);}
 }
 function browser(x,y,w,h,t,id='has-off',{address='localhost:3000',checked=false,narrow=false}={}){
  rect(x,y,w,h,'#F1F5F9',20);rect(x,y,w,55,'#DCE3EC',20);rect(x,y+30,w,25,'#DCE3EC');
  ['#EF4444','#FBBF24','#22C55E'].forEach((color,i)=>rect(x+16+i*18,y+20,10,10,color,5));rect(x+85,y+12,w-144,31,'#fff',8);text(address,x+104,y+35,20,'#64748B',500);
  const img=images[id];if(img){evidence.browserStates++;g.save();g.beginPath();g.roundRect(x+10,y+64,w-20,h-73,10);g.clip();
   if(id==='container-narrow'){const k=(h-73)/img.height,iw=img.width*k;g.drawImage(img,x+(w-iw)/2,y+64,iw,h-73);}else g.drawImage(img,x+10,y+64,w-20,h-73);g.restore();}
 }
 function chrome(t,s){
  const chapter=s.a<23.26?'1':s.a<33.68?'2':'3';rect(69,170,48,48,P.red,24);text(chapter,93,204,30,'#fff',900,false,'center');
  const names={terminal:'developer-workspace',stack:'package.json',deploy:'build / preview',routes:'routes / comparison',utilities:'component.tsx',native:'native-css / playground',docs:'documentation / CSS',compiler:'generated / styles.css',raw:'style.css',explore:'git / experiment'};
  text(names[s.kind],137,203,30,P.ink,600);text('●',984,201,22,P.green);line(65,231,1015,231,'#293346',1);
 }
 function terminalScene(t){
  terminal(73,268,934,474,[{text:'PS C:\\dev> mkdir web-app',typeAt:7.4,color:P.ink},'','  project: web-app',{text:'  target: 2026',at:8.82,color:P.yellow},'  runtime: browser'],t,'terminal.type');
  marker(105,499,330,44,t,'terminal.year');focus(93,493,452,67,t,'terminal.year');
  editor(73,768,934,173,'workspace.code-workspace',['{ "folders": [{ "path": "." }] }'],t,{size:37});
 }
 function stack(t){
  rect(73,268,185,668,'#111827',16);text('EXPLORER',89,305,23,P.muted);['⌄ web-app','  app/','  components/','  public/','  package.json'].forEach((s,i)=>{if(i===4&&on(t,'stack.manifest'))rect(81,327+i*57,167,45,'#293346',6);text(s,89,358+i*57,21,i===4?P.ink:P.muted,500,true);});
  if(!on(t,'stack.manifest')){
   terminal(275,268,732,480,[{text:'> npx create-next-app@latest',typeAt:9.68,size:32,color:P.ink},'',{text:'✓ Installing dependencies',at:12.2,size:31}, {text:'✓ Writing package.json',at:12.2,size:31}, {text:'Ready for development.',at:12.2,size:31}],t,'stack.install');
   rect(275,775,732,162,'#202A3A',16);text('web-app / package.json',297,824,30,P.muted);code('{}',297,891,48);
   return;
  }
  const tools=[['typescript','  "typescript": "latest",',16.46],['next','  "next": "latest",',17.52],['tailwind','  "tailwindcss": "latest",',18.88],['react','  "react": "latest"',20.1]],i=tools.findLastIndex(r=>t>=r[2]);
  const rows=['{',' "dependencies": {',...tools.map(([,s,a])=>({text:s,at:a})),' }','}'];
  editor(275,268,732,492,'package.json',rows,t,{size:37,lineH:51,selected:i<0?-1:i+2,event:i<0?null:'stack.'+tools[i][0]});
  if(i>=0)cursor(953,383+(i+2)*51,t,'stack.'+tools[i][0]);
  terminal(275,785,732,152,[{text:i<0?'Waiting for tool selection…':`${i+1}/4 dependencies added`,color:i===3?P.green:P.muted,size:33}],t);
 }
 function deploy(t){
  terminal(73,268,934,292,[{text:'> npm run build',typeAt:21,color:P.ink},{text:'✓ Compiled successfully',at:22.22},{text:'✓ Ready on localhost:3000',at:22.22}],t,'deploy.build');
  browser(73,593,934,342,t,on(t,'deploy.build')?'has-on':'has-off');cursor(241,877,t,'deploy.build');
 }
 function routes(t){
  const active=on(t,'routes.tanstack')?2:on(t,'routes.reactRouter')?1:0;
  ['Next.js','React Router','TanStack'].forEach((s,i)=>{const x=73+i*316;rect(x,264,301,64,i===active?'#293C58':'#202A3A',12);text(s,x+150,307,30,i===active?P.ink:P.muted,700,false,'center');});
  if(on(t,'routes.reactRouter')&&!on(t,'routes.tanstack')){focus(382,258,313,76,t,'routes.reactRouter');cursor(604,308,t,'routes.reactRouter');}
  const left=['export default','function Page() {','  return <Dashboard />','}'];
  const right=['export const Route =','  createFileRoute(','    "/dashboard"','  )({','    component: Dashboard','  })'];
  editor(73,358,453,406,'app/page.tsx',left,t,{size:27,lineH:49,selected:0,event:'routes.file'});
  if(active===1){editor(547,358,460,406,'routes.ts', ['export default [','  route(','    "dashboard",','    "./dashboard.tsx"','  )',']'],t,{size:27,lineH:49,selected:1,event:'routes.reactRouter'});}
  else editor(547,358,460,406,'routes/dashboard.tsx',right,t,{size:27,lineH:49,selected:1,event:'routes.tanstack'});
  if(on(t,'routes.tanstack'))cursor(925,500,t,'routes.tanstack');
  rect(73,796,934,144,'#F1F5F9',18);text('localhost:3000/dashboard',101,834,25,'#64748B',500);rect(97,856,289,61,'#EF4444',12);text('Dashboard',122,897,29,'#fff',700);for(let i=0;i<3;i++)rect(412+i*183,855,164,63,'#CBD5E1',10);
  focus(66,350,467,423,t,'routes.next');
 }
 function cssComparison(t,kind){
  const phase=kind==='utilities'?0:on(t,'native.subgrid')?2:on(t,'native.container')?1:0;
  const features=[':has()','@container','subgrid'];
  features.forEach((s,i)=>{const x=73+i*316;rect(x,263,301,58,i===phase?'#293C58':'#202A3A',12);text(s,x+150,302,28,i===phase?P.ink:P.muted,600,true,'center');});
  let img=phase===0?(on(t,'utilities.check')||on(t,'native.has')?'has-on':'has-off'):phase===1?'container-wide':'subgrid';
  if(on(t,'native.resize'))img='container-narrow';if(on(t,'native.toggle'))img='has-on';
  browser(73,343,934,233,t,img,{address:'localhost:3000/component'});
  const utility=[['<article className={`','  has-checked:border-red-500','  has-checked:bg-red-50','`}>','  <input type="checkbox" />','</article>'],['<section className="@container">',' <div className={`grid','   grid-cols-1','   @min-[600px]:grid-cols-3',' `}>…</div>','</section>'],['<article className={`grid','  row-span-3','  grid-rows-subgrid','`}>','  …','</article>']][phase];
  const css=[['.card:has(',' input:checked',') {',' border-color: #ef4444;',' background: #fff1f2;','}'],['.panel {',' container-type: inline-size;','}','@container (min-width:600px) {',' .cards {','  grid-template-columns:','   repeat(3, 1fr);',' }','}'],['.card {',' display: grid;',' grid-row: span 3;',' grid-template-rows:','   subgrid;','}']][phase];
  // Full utility strings remain in the source; wrap visually at token boundaries.
  const wrapped=utility;
  const id=kind==='utilities'?'utilities.tailwind':['native.has','native.container','native.subgrid'][phase];
  editor(73,600,453,336,'Tailwind / component.tsx',wrapped,t,{size:24,lineH:28,selected:1,event:kind==='utilities'?id:null});
  editor(547,600,460,336,'Native / style.css',css,t,{size:24,lineH:26,selected:phase===0?0:phase===1?3:4,event:kind==='native'?id:null});
  if(kind==='native'){cursor(912,phase===1?789:phase===2?817:716,t,id);focus(73+phase*316,257,301,70,t,id);}
  else cursor(246,532,t,'utilities.check');
  if(on(t,'native.resize')){focus(67,337,946,245,t,'native.resize');cursor(964,452,t,'native.resize');}
  if(on(t,'native.toggle'))cursor(239,531,t,'native.toggle');
  if(kind==='native'&&on(t,'native.has')){
   // A code inspection lens makes the active rule readable at phone size.
   const snippet=['.card:has(input:checked)','@container (min-width: 600px)','grid-template-rows: subgrid;'][phase];
   editor(89,780,902,156,'INSPECT / style.css',[snippet],t,{size:46,lineH:52,selected:0,event:id,entry:id});
  }
 }
 function docs(t){
  evidence.documentation=true;
  rect(73,268,934,668,'#F8FAFC',20);text('developer.mozilla.org',99,314,25,'#64748B',500);line(97,337,978,337,'#CBD5E1',1);
  text('CSS selector / reference',99,384,28,'#64748B',600);code(':has()',99,468,79);
  // Paraphrase, not a fabricated quotation or screenshot.
  text('Select an element based',99,566,46,'#0F172A',700);text('on its matching descendants.',99,629,46,'#0F172A',700);marker(96,589,868,53,t,'docs.marker');
  editor(97,689,886,214,'selector.css',['.card:has(input:checked) {','  border-color: #ef4444;','}'],t,{size:38,lineH:48,selected:0,event:'docs.marker'});cursor(913,788,t,'docs.marker');
 }
 function compiler(t){
  editor(73,268,934,238,'component.tsx',['<article className="has-checked:bg-red-50">','  <input type="checkbox" />','</article>'],t,{size:33,lineH:48});
  terminal(73,535,934,147,[{text:'> Tailwind → generated CSS',size:36,color:P.ink}],t,'compiler.css');
  const css=['.has-checked\\:bg-red-50 {','  &:has(:checked) {','    background-color: var(--color-red-50);','  }','}'];
  editor(73,711,934,227,'styles.css / compiler illustration',css,t,{size:31,lineH:28,selected:1,event:on(t,'compiler.native')?'compiler.native':'compiler.css'});
  if(on(t,'compiler.inspect'))cursor(698,820,t,'compiler.inspect');focus(73,708,934,227,t,'compiler.native');
 }
 function raw(t){
  if(!on(t,'raw.preview')){
   editor(73,268,934,667,'style.css',['.cards {','  display: grid;','  grid-template-columns:','    repeat(3, 1fr);','  gap: 1rem;','}','','.card {','  grid-template-rows: subgrid;','}'],t,{size:42,lineH:49,selected:8,event:'raw.select'});cursor(883,805,t,'raw.select');
  }else{
   const u=sp(t-at('raw.preview'));g.save();g.translate(0,42*(1-u));browser(73,268,934,345,t,'subgrid');g.restore();
   editor(73,643,934,294,'style.css',['.card {','  display: grid;','  grid-template-rows: subgrid;','}'],t,{size:43,lineH:55,selected:2,event:'raw.preview'});cursor(914,833,t,'raw.preview');
  }
 }
 function explore(t){
  terminal(73,268,934,286,[{text:'> git switch -c explore-native-css',typeAt:55.26,size:35,color:P.ink},{text:'Switched to a new branch',at:56.6,size:34},{text:'> git diff -- style.css',at:58.16,size:34,color:P.ink}],t,'explore.branch');
  editor(73,584,934,352,'style.css / working tree',[' .card {','-  display: block;','+  display: grid;','+  grid-template-rows: subgrid;',' }'],t,{size:40,lineH:50,selected:3,event:'explore.diff'});
  if(on(t,'explore.diff'))cursor(887,838,t,'explore.diff');
 }
 function caption(t){const cue=A.captions.find(([a,b])=>t>=a&&t<b);if(!cue)return;const [a,b,s]=cue,n=F.breakouts.some(([a,b])=>t>=a&&t<b)?92:78;g.font=`900 ${n}px Inter`;const w=g.measureText(s).width,x=540-w/2-24,y=1560-n-10;rect(x,y,w+48,n+34,'rgba(11,15,23,.88)',18);const u=sp(t-a);text(s,540,1560+8*(1-u),n,'#fff',900,false,'center');line(x+18,y+n+27,x+18+(w+12)*clamp((t-a)/Math.max(.12,b-a)),y+n+27,P.yellow,3);}
 const draws={terminal:terminalScene,stack,deploy,routes,utilities:t=>cssComparison(t,'utilities'),native:t=>cssComparison(t,'native'),docs,compiler,raw,explore};
 window.ArtifactStudio={editor,terminal,browser,focus,marker,cursor,register:(name,draw)=>{draws[name]=draw;}};
 window.seek=t=>{evidence={codeRows:0,browserStates:0,terminalRows:0,documentation:false,headlineCards:0};g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,W,H);g.save();g.scale(W/1080,H/1920);const s=F.sections.find(s=>t>=s.a&&t<s.b),breakout=F.breakouts.some(([a,b])=>t>=a&&t<b);
  if(!breakout){rect(0,0,1080,1920,P.background);g.save();g.globalAlpha=.06;for(let x=-1200;x<2300;x+=40){line(x,0,x+1108,1920,P.muted,1);line(x,0,x-1108,1920,P.muted,1);}for(let y=0;y<=1920;y+=40)line(0,y,1080,y,P.muted,1);g.restore();
   const d=F.deck,offset=s?24*(1-sp(t-s.a)):0;g.save();g.translate(0,offset);g.shadowColor='rgba(0,0,0,.5)';g.shadowBlur=50;g.shadowOffsetY=20;rect(d.x,d.y,d.w,d.h,P.surface,d.r);g.shadowColor='transparent';g.shadowBlur=0;g.shadowOffsetY=0;g.beginPath();g.roundRect(d.x,d.y,d.w,d.h,d.r);g.clip();if(s){chrome(t,s);draws[s.kind]?.(t);}g.restore();
   const p=F.panel;g.save();g.globalCompositeOperation='destination-out';rect(p.x,p.y,p.w,p.h,'#000',p.r);g.restore();g.strokeStyle='rgba(255,255,255,.08)';g.lineWidth=1;g.beginPath();g.roundRect(p.x,p.y,p.w,p.h,p.r);g.stroke();
  }caption(t);g.restore();window.FRAME_ARTIFACT={time:t,kind:s?.kind,artifact:breakout?false:!!s?.artifact,breakout,...evidence};return true;
 };
 if(!Q.has('render'))window.ASSETS_READY.then(()=>window.seek(19.4));
})();
