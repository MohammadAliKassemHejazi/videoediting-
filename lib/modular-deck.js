// Every entrance, marker and reticle uses an absolute speech anchor.
// The only changing context is assigned anew by seek(t), never accumulated.
(() => {
  const F=window.ALIGNED,P=F.palette,Q=new URLSearchParams(location.search);
  const c=document.getElementById('c'),W=c.width=+(Q.get('w')||1080),H=c.height=+(Q.get('h')||1920),g=c.getContext('2d');
  const clamp=Motion.clamp,sp=t=>Motion.spring(t,260,29),pop=t=>Motion.spring(t,400,24);
  const images={};
  window.ASSETS_READY=Promise.all(window.RECAP_SOURCES.map(s=>new Promise((resolve,reject)=>{
    const img=new Image();img.onload=()=>{images[s.id]=img;resolve();};img.onerror=()=>reject(Error(`Missing ${s.file}`));img.src=s.file;
  })));
  window.FONTS=['500 100px Inter','600 100px Inter','700 100px Inter','900 100px Inter'];window.DURATION=F.duration;
  function rect(x,y,w,h,color,r=0){g.fillStyle=color;g.beginPath();g.roundRect(x,y,w,h,r);g.fill();}
  function txt(s,x,y,n=60,color=P.ink,w=700,align='left'){
    g.font=`${w} ${n}px Inter`;g.textAlign=align;g.textBaseline='alphabetic';g.fillStyle=color;g.fillText(s,x,y);
  }
  function ln(x1,y1,x2,y2,color=P.red,w=4){g.strokeStyle=color;g.lineWidth=w;g.lineCap='round';g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();}
  function dot(x,y,r,color){g.fillStyle=color;g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill();}
  function surface(x,y,w,h,r,color=P.white){g.save();g.shadowColor='rgba(0,0,0,.5)';g.shadowBlur=50;g.shadowOffsetY=20;rect(x,y,w,h,color,r);g.restore();}
  function mark(s,x,y,n,now,at){
    if(at==null||now<at)return;g.font=`900 ${n}px Inter`;const w=g.measureText(s).width,p=clamp((now-at)/.22);
    rect(x-3,y-n*.68,w*p+6,n*.72,P.yellow,5);
  }
  function reticle(x,y,w,h,now,at){
    if(at==null||now<at)return;const u=clamp((now-at)/.12),s=1+.15*(1-u)**3;
    g.save();g.translate(x+w/2,y+h/2);g.scale(s,s);g.strokeStyle=P.red;g.lineWidth=3.5;
    g.beginPath();g.roundRect(-w/2,-h/2,w,h,12);g.stroke();g.restore();
  }
  function pointer(x,y,now,at){
    if(now<at)return;const s=sp(now-at);
    g.save();g.translate(x+45*(1-s),y+60*(1-s));g.beginPath();g.moveTo(0,0);g.lineTo(0,42);g.lineTo(12,29);g.lineTo(23,51);g.lineTo(33,46);g.lineTo(23,24);g.lineTo(41,24);g.closePath();g.fillStyle=P.red;g.fill();g.strokeStyle=P.white;g.lineWidth=2;g.stroke();g.restore();
  }
  function textRows(rows,scene,t,label='THE TAKEAWAY'){
    txt(label,85,332,28,'#64748B',600);
    rows.forEach((r,i)=>{
      const row=typeof r==='string'?{text:r}:r,base=490+i*116;
      g.font='900 88px Inter';const size=Math.min(88,88*906/g.measureText(row.text).width);
      if(row.mark!=null)mark(row.text,85,base,size,t,row.mark);
      txt(row.text,85,base,size,row.color||P.ink,900);
      if(row.strike!=null&&t>=row.strike){
        g.font=`900 ${size}px Inter`;const width=g.measureText(row.text).width,u=clamp((t-row.strike)/.14);
        ln(85,base-size*.33,85+width*u,base-size*.33,P.red,7);
      }
    });
  }
  function symbol(name,x,y,size=62){
    if(name==='TypeScript'){rect(x-size/2,y-size/2,size,size,'#3178C6',10);txt('TS',x,y+size*.22,size*.43,P.white,900,'center');}
    if(name==='Next.js'){dot(x,y,size/2,P.ink);txt('N',x,y+size*.21,size*.55,P.white,600,'center');}
    if(name==='Tailwind'){g.strokeStyle='#06B6D4';g.lineWidth=6;for(let i=0;i<2;i++){g.beginPath();g.moveTo(x-size*.45,y-8+i*19);g.bezierCurveTo(x-4,y-28+i*19,x+5,y+12+i*19,x+size*.45,y-9+i*19);g.stroke();}}
    if(name==='React'){g.save();g.translate(x,y);g.strokeStyle='#149ECA';g.lineWidth=3;for(let i=0;i<3;i++){g.save();g.rotate(i*Math.PI/3);g.beginPath();g.ellipse(0,0,size*.5,size*.18,0,0,Math.PI*2);g.stroke();g.restore();}dot(0,0,4,'#149ECA');g.restore();}
  }
  function screenshot(id,scene,t){
    const img=images[id],src=window.RECAP_SOURCES.find(s=>s.id===id);if(!img||!src)return;
    const names={typescript:'TypeScript',next:'Next.js',tailwind:'Tailwind CSS',react:'React',router:'React Router',tanstack:'TanStack Router',css:'Modern CSS'};
    const host=new URL(src.url).hostname.replace('www.','');
    txt(names[id],83,340,56,P.ink,900);txt(host,998,387,25,'#64748B',500,'right');
    g.save();g.beginPath();g.roundRect(65,405,950,534,24);g.clip();
    const sw=id==='tanstack'?1100:1280,sy=id==='react'?90:25,sx=id==='tanstack'?160:0,sh=534*sw/950;
    g.drawImage(img,sx,sy,sw,sh,65,405,950,534);
    if(src.focus){
      const b=src.focus,k=950/sw,x=65+(b.x-sx)*k-7,y=405+(b.y-sy)*k-6;
      reticle(x,y,b.width*k+14,b.height*k+12,t,scene.focus);
      pointer(Math.min(969,x+b.width*k-5),Math.min(870,y+b.height*k+22),t,scene.focus+.1);
    }g.restore();
  }
  function stack(scene,t){
    txt('A practical starting point.',85,340,42,'#64748B',600);
    ['TypeScript','Next.js','Tailwind','React'].forEach((name,i)=>{
      const x=81+(i%2)*469,y=399+Math.floor(i/2)*194,s=sp(t-scene.a-i*.065);
      g.save();g.translate(0,35*(1-s));rect(x,y,447,163,'#F1F5F9',22);
      symbol(name,x+62,y+83);txt(name,x+115,y+102,name==='TypeScript'?44:52,P.ink,700);g.restore();
    });
    reticle(72,388,937,382,t,scene.focus);
    txt('Learn it. Build with it.',85,924,45,P.ink,600);
  }
  function evolving(scene,t){
    txt('THE PLATFORM HAS EVOLVED',85,332,28,'#64748B',600);
    txt('Modern CSS',85,452,87,P.ink,900);
    mark('+ browser APIs',85,562,76,t,scene.mark);txt('+ browser APIs',85,562,76,P.ink,900);
    const a=clamp(sp(t-scene.reveal));
    for(let i=0;i<6;i++){
      const x0=85+(i%2)*460,y0=631+Math.floor(i/2)*73,x1=85+(i%3)*309,y1=651+Math.floor(i/3)*108;
      rect(x0+(x1-x0)*a,y0+(y1-y0)*a,431+(280-431)*a,56+35*a,i===4?P.yellow:'#E2E8F0',14);
    }
    txt('The browser keeps moving.',85,937,39,'#64748B',500);
  }
  function hood(scene,t,zoom=false){
    txt('UNDER THE HOOD',85,332,28,'#64748B',600);
    if(zoom){
      rect(82,389,915,94,'#0F172A',21);symbol('Tailwind',195,436);txt('Tailwind',270,456,58,P.white,700);
      const label='Modern CSS';mark(label,107,647,104,t,scene.mark);txt(label,107,647,104,P.ink,900);
      reticle(80,521,918,174,t,scene.focus);txt('Features under the hood.',85,933,43,'#64748B',500);
      return;
    }
    const p=clamp(sp(t-scene.reveal));
    rect(82,550,915,218,'#F1F5F9',24);
    if(t>=scene.reveal){mark('MODERN CSS',206,691,75,t,scene.mark);txt('MODERN CSS',206,691,75,P.ink,900);}
    rect(82,550-140*p,915,156,P.ink,24);symbol('Tailwind',200,628-140*p,85);txt('Tailwind',311,653-140*p,88,P.white,700);
    txt('Utilities powered by the platform.',85,933,35,'#64748B',500);
  }
  function raw(scene,t){
    txt('RAW CSS / AN ILLUSTRATION',85,332,28,'#64748B',600);
    rect(78,381,924,353,P.ink,23);txt('style.css',111,431,28,P.muted,500);
    const rows=['.layout {','  display: grid;','  gap: 1rem;','}'];
    rows.forEach((s,i)=>{const p=clamp((t-scene.reveal-i*.12)/.22);txt(s.slice(0,Math.floor(s.length*p)),111,494+i*64,46,i===0||i===3?P.yellow:P.white,600);});
    reticle(97,517,620,140,t,scene.focus);
    mark('So much easier.',85,890,87,t,scene.mark);txt('So much easier.',85,890,87,P.ink,900);
  }
  function pivot(scene,t){
    txt('THE MENTAL MODEL',85,332,28,'#64748B',600);
    const old='Default = limit.',fresh='Default = start.';g.font='900 86px Inter';const width=g.measureText(old).width;
    const s=clamp((t-scene.strike)/.14);g.save();g.globalAlpha=1-.65*s;txt(old,85,490,86,P.ink,900);g.restore();
    ln(83,462,83+width*s,462,P.red,7);
    if(t>=scene.reveal){const p=pop(t-scene.reveal);g.save();g.translate(84,651);g.scale(p,p);txt(fresh,0,0,84,P.red,900);g.restore();}
    txt('Learn the tools. Keep exploring.',85,931,40,'#64748B',500);
  }
  function cta(scene,t){
    txt('FOUND THIS USEFUL?',85,332,28,'#64748B',600);txt('Pass it on.',85,478,109,P.ink,900);
    const names=['Like','Comment','Share'],starts=[F.anchors.like,F.anchors.comment,F.anchors.share];
    names.forEach((s,i)=>{
      const x=83+i*312,active=t>=starts[i];
      rect(x,595,294,146,active?P.red:'#F1F5F9',24);
      txt(s,x+147,688,s==='Comment'?43:57,active?P.white:P.ink,700,'center');
      if(active)reticle(x-5,590,304,156,t,starts[i]);
    });txt('To a developer who needs it.',85,931,42,'#64748B',500);
  }
  function sceneDraw(scene,t){
    if(['typescript','next','tailwind','react','router','tanstack','css'].includes(scene.kind)){screenshot(scene.kind,scene,t);return;}
    switch(scene.kind){
      case 'choose':textRows([{text:'Software',mark:2.38},{text:'engineer.',mark:2.82}],scene,t,'LEARN TO CHOOSE');break;
      case 'time':textRows([{text:'Choose right.',mark:scene.mark},{text:'Wasted time.',strike:scene.strike}],scene,t);break;
      case 'year':{
        txt('WEB DEVELOPMENT',85,332,28,'#64748B',600);txt('Web developer?',85,467,82,P.ink,900);
        if(t>=scene.reveal){const p=sp(t-scene.reveal);g.save();g.translate(0,80*(1-p));mark('2026',81,773,239,t,scene.reveal);txt('2026',81,773,239,P.ink,900);g.restore();
          const q=t-scene.reveal;if(q<.5){g.save();g.globalAlpha=.22*Math.exp(-q*7);g.strokeStyle=P.red;g.lineWidth=5;g.beginPath();g.arc(872,689,30+q*180,0,Math.PI*2);g.stroke();g.restore();}}
        txt('What should you learn?',85,931,43,'#64748B',500);break;
      }
      case 'stack':stack(scene,t);break;
      case 'winning':textRows([{text:'The winning',mark:F.anchors.winning},{text:'default stack.',mark:scene.mark}],scene,t,'FROM THIS VIDEO');break;
      case 'hire':textRows([{text:'Get hired.',mark:F.anchors.hired},{text:'Learn this stack.',mark:scene.mark}],scene,t,'FROM THIS VIDEO');break;
      case 'do-it':textRows([{text:'Go beyond.',mark:scene.mark},'Definitely do it.'],scene,t);break;
      case 'great':textRows([{text:'A great stack.',mark:scene.mark},'A starting point.'],scene,t);break;
      case 'alternatives':textRows(['Next.js has',{text:'alternatives.',mark:scene.mark}],scene,t);break;
      case 'nothing-wrong':textRows([{text:'Nothing wrong.',mark:scene.mark},'Keep using it.'],scene,t,'TAILWIND / FROM THIS VIDEO');break;
      case 'evolved':evolving(scene,t);break;
      case 'use':textRows(['Don’t ignore it.',{text:'Use the platform.',mark:scene.mark}],scene,t);break;
      case 'hood':hood(scene,t);break;
      case 'hood-zoom':hood(scene,t,true);break;
      case 'raw':raw(scene,t);break;
      case 'explore':textRows([{text:'Have time?',mark:scene.mark},'Explore further.'],scene,t);break;
      case 'pivot':pivot(scene,t);break;
      case 'cta':cta(scene,t);break;
    }
  }
  function header(t){
    const [a,n,title]=F.chapters.findLast(([start])=>t>=start),s=.6+.4*pop(t-a);
    g.save();g.translate(113,221);g.scale(s,s);g.shadowColor='rgba(239,68,68,.28)';g.shadowBlur=26;
    rect(-41,-35,82,70,P.red,35);g.shadowBlur=0;txt(n,0,16,46,P.white,900,'center');g.restore();
    txt(title,183,235,35,P.ink,700);
  }
  function caption(t,breakout){
    const cue=F.captions.find(([a,b])=>t>=a&&t<b);if(!cue)return;
    const [a,b,s]=cue,n=breakout?92:78;g.font=`900 ${n}px Inter`;const width=g.measureText(s).width;
    // Chest placement; slightly below 1450 to clear the presenter's chin.
    const baseline=1560,boxH=n+34,x=540-width/2-25,y=baseline-n-10;
    rect(x,y,width+50,boxH,'rgba(11,15,23,.85)',18);
    const p=clamp((t-a)/.07);g.save();g.translate(0,8*(1-p));txt(s,540,baseline,n,P.white,900,'center');g.restore();
    ln(x+20,y+boxH-7,x+20+(width+10)*clamp((t-a)/Math.max(.12,b-a)),y+boxH-7,P.yellow,3);
  }
  window.seek=t=>{
    g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,W,H);g.save();g.scale(W/1080,H/1920);
    const breakout=F.breakouts.some(([a,b])=>t>=a&&t<b);
    if(!breakout){
      rect(0,0,1080,1920,P.bg);
      g.save();g.globalAlpha=.06;
      for(let x=-1200;x<2300;x+=40){ln(x,0,x+1108,1920,P.muted,1);ln(x,0,x-1108,1920,P.muted,1);}
      for(let y=0;y<=1920;y+=40)ln(0,y,1080,y,P.muted,1);g.restore();
      const d=F.deck,scene=F.scenes.find(s=>t>=s.a&&t<s.b),offset=scene?28*(1-sp(t-scene.a)):0;
      g.save();g.translate(0,offset);surface(d.x,d.y,d.w,d.h,d.r);header(t);
      if(scene){g.save();g.beginPath();g.roundRect(d.x,d.y,d.w,d.h,d.r);g.clip();sceneDraw(scene,t);g.restore();}
      g.restore();
      const r=F.panel;surface(r.x,r.y,r.w,r.h,r.r,P.bg);
      g.save();g.globalCompositeOperation='destination-out';rect(r.x,r.y,r.w,r.h,'#000',r.r);g.restore();
      g.strokeStyle='rgba(255,255,255,.08)';g.lineWidth=1;g.beginPath();g.roundRect(r.x,r.y,r.w,r.h,r.r);g.stroke();
    }
    caption(t,breakout);g.restore();return true;
  };
  // This page is the deterministic render surface. Preview the encoded draft
  // to see the FFmpeg speaker crop and full-screen punches exactly as delivered.
  if(!Q.has('render'))window.ASSETS_READY.then(()=>window.seek(8.99));
})();
