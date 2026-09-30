// Split-screen editorial system: one focal visual above an always-visible speaker.
(() => {
  const Q=new URLSearchParams(location.search),F=window.RECAP,P=F.palette;
  const c=document.getElementById('c'),W=c.width=+(Q.get('w')||1080),H=c.height=+(Q.get('h')||1920),g=c.getContext('2d');
  const clamp=Motion.clamp;
  const spring=t=>Motion.spring(t,230,28),settle=t=>Motion.spring(t,160,27);
  const images={};
  window.ASSETS_READY=Promise.all(window.RECAP_SOURCES.map(s=>new Promise((resolve,reject)=>{
    const img=new Image();img.onload=()=>{images[s.id]=img;resolve();};img.onerror=()=>reject(new Error(`Missing screenshot ${s.file}`));img.src=s.file;
  })));
  window.FONTS=['500 100px Inter','600 100px Inter','700 100px Inter','900 100px Inter'];
  window.DURATION=F.duration;
  function rect(x,y,w,h,color,r=0){g.fillStyle=color;g.beginPath();g.roundRect(x,y,w,h,r);g.fill();}
  function txt(s,x,y,n=48,color=P.ink,weight=700,align='left'){
    g.font=`${weight} ${n}px Inter`;g.textAlign=align;g.textBaseline='alphabetic';g.fillStyle=color;g.fillText(s,x,y);
  }
  function ln(x1,y1,x2,y2,color=P.red,width=5){g.strokeStyle=color;g.lineWidth=width;g.lineCap='round';g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();}
  function dot(x,y,r,color){g.fillStyle=color;g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill();}
  function enter(t,delay,draw){const p=settle(t-delay);if(p<=0)return;g.save();g.translate(0,42*(1-p));draw(p);g.restore();}
  function surface(x,y,w,h,r=28,color=P.white){
    g.save();g.shadowColor='rgba(0,0,0,.34)';g.shadowBlur=38;g.shadowOffsetY=19;rect(x,y,w,h,color,r);g.restore();
  }
  function marker(x,y,w,h,t,delay=.2){const p=clamp(spring(t-delay));if(p<=0)return;
    g.save();g.translate(x,y);g.rotate(-.012);rect(-3,-h+5,(w+7)*p,h,P.yellow,5);g.restore();
  }
  function focus(x,y,w,h,t,delay=.35,r=14){
    const p=clamp(spring(t-delay));if(p<=0)return;
    g.save();g.strokeStyle=P.red;g.lineWidth=5;g.lineJoin='round';g.setLineDash([2*(w+h)*p,2*(w+h)]);
    g.beginPath();g.roundRect(x,y,w,h,r);g.stroke();g.restore();
  }
  function cursor(x,y,t){
    const p=settle(t-.5);if(p<=0)return;g.save();g.translate(x+95*(1-p),y+100*(1-p));g.rotate(-.1);
    g.beginPath();g.moveTo(0,0);g.lineTo(0,47);g.lineTo(13,34);g.lineTo(26,60);g.lineTo(39,54);g.lineTo(26,29);g.lineTo(47,29);g.closePath();
    g.fillStyle=P.red;g.fill();g.strokeStyle=P.white;g.lineWidth=3;g.stroke();g.restore();
  }
  function arrow(x,y,w,t,color=P.red){const p=clamp(spring(t));ln(x,y,x+w*p,y,color,7);if(p>.8){ln(x+w-18,y-18,x+w,y,color,7);ln(x+w-18,y+18,x+w,y,color,7);}}
  function quote(lines,t,{label='FROM THIS VIDEO',footer='',small=false}={}){
    enter(t,0,()=>{
      surface(64,292,952,554);
      txt(label,106,353,26,'#687182',600);
      const size=small?64:77,spacing=small?86:101;
      const first=lines.length===2?490:lines.length===3?455:428;
      lines.forEach((row,i)=>{
        const value=typeof row==='string'?{text:row}:row;
        const y=first+i*spacing;g.font=`900 ${size}px Inter`;
        const width=g.measureText(value.text).width;
        if(value.mark)marker(105,y,width,size*.74,t,.17+i*.12);
        txt(value.text,106,y,size,P.ink,900);
        if(value.strike)ln(105,y-size*.32,105+width*clamp(spring(t-.35)),y-size*.32,P.red,8);
      });
      if(footer)txt(footer,107,800,31,'#697182',500);
    });
  }
  function site(id,t,{y=292,h=554,zoom=1,outline=true}={}){
    const img=images[id],source=window.RECAP_SOURCES.find(s=>s.id===id);if(!img||!source)return;
    enter(t,0,()=>{
      surface(64,y,952,h);
      const host=new URL(source.url).hostname.replace('www.','');
      const names={typescript:'TypeScript',next:'Next.js',react:'React',tailwind:'Tailwind CSS',router:'React Router',tanstack:'TanStack Router',css:'Modern CSS'};
      txt(names[id],103,y+47,33,P.ink,700);
      txt(host,975,y+47,24,'#536074',500,'right');
      rect(84,y+69,912,h-89,'#FFFFFF',14);
      g.save();g.beginPath();g.roundRect(84,y+69,912,h-89,14);g.clip();
      // Crop the page to its useful upper content, excluding cookie banners and stats.
      const sy=id==='tailwind'?75:id==='react'?105:75,sw=1280/zoom,sh=(h-89)*sw/912;
      const sx=id==='tanstack'?Math.min(150,1280-sw):(1280-sw)/2;
      g.drawImage(img,sx,sy,sw,sh,84,y+69,912,h-89);
      if(outline&&source.focus){
        const b=source.focus,k=912/sw;
        const fx=84+(b.x-sx)*k-7,fy=y+69+(b.y-sy)*k-5;
        focus(fx,fy,b.width*k+14,b.height*k+10,t,.2,10);
        if(t>.6)cursor(Math.min(927,fx+b.width*k-15),Math.min(y+h-90,fy+b.height*k+13),t);
      }
      g.restore();
    });
  }
  function symbol(name,x,y,size=54){
    if(name==='TypeScript'){rect(x-size/2,y-size/2,size,size,'#3178C6',10);txt('TS',x,y+size*.2,size*.45,P.white,900,'center');}
    if(name==='Next.js'){dot(x,y,size/2,P.ink);txt('N',x,y+size*.22,size*.57,P.white,600,'center');}
    if(name==='Tailwind'){g.strokeStyle='#06B6D4';g.lineWidth=6;for(let i=0;i<2;i++){g.beginPath();g.moveTo(x-size*.45,y-6+i*18);g.bezierCurveTo(x-5,y-29+i*18,x+4,y+12+i*18,x+size*.45,y-8+i*18);g.stroke();}}
    if(name==='React'){g.save();g.translate(x,y);g.strokeStyle='#149ECA';g.lineWidth=3;for(let i=0;i<3;i++){g.save();g.rotate(i*Math.PI/3);g.beginPath();g.ellipse(0,0,size*.52,size*.18,0,0,Math.PI*2);g.stroke();g.restore();}dot(0,0,4,'#149ECA');g.restore();}
  }
  function stack(t){
    enter(t,0,()=>{
      surface(64,292,952,554);
      txt('A practical starting point.',106,359,37,'#687182',600);
      const names=['TypeScript','Next.js','Tailwind','React'];
      names.forEach((s,i)=>enter(t,i*.08,()=>{
        const x=103+(i%2)*452,y=403+Math.floor(i/2)*164;
        rect(x,y,423,139,'#F0F2F6',18);symbol(s,x+58,y+70,57);txt(s,x+111,y+85,s==='TypeScript'?42:48,P.ink,700);
        const active=Math.min(3,Math.floor(t/.75));if(i===active)focus(x,y,423,139,t-i*.75,0,18);
      }));
      txt('Learn it. Then build with it.',107,799,37,P.ink,600);
    });
  }
  function options(t){
    enter(t,0,()=>{
      surface(64,292,952,554);txt('MORE THAN ONE WAY',106,353,27,'#687182',600);
      ['Next.js','React Router','TanStack'].forEach((name,i)=>{
        const y=391+i*129;rect(103,y,873,106,'#F0F2F6',16);
        txt(name,140,y+70,53,P.ink,700);txt('→',921,y+70,45,P.red,600,'center');
        if(i===Math.min(2,Math.floor(t/.7)))focus(103,y,873,106,t-i*.7,0,16);
      });
    });
  }
  function evolve(t){
    enter(t,0,()=>{
      surface(64,292,952,554);txt('THE PLATFORM HAS EVOLVED',107,353,27,'#687182',600);
      txt('Modern CSS',107,434,70,P.ink,900);marker(106,517,663,52,t,.2);txt('+ browser APIs',107,520,65,P.ink,900);
      const p=clamp(settle(t-.4));
      const columns=t<1?2:3,a=clamp(settle(t-1));
      for(let i=0;i<6;i++){
        const x=106+(i%2)*425+((i%3)*285-(i%2)*425)*a;
        const y=576+Math.floor(i/2)*61+(Math.floor(i/3)*89-Math.floor(i/2)*61)*a;
        const w=394+(252-394)*a,h=44+(70-44)*a;
        rect(x,y,w,h*p,i===4?P.yellow:'#E9EDF4',12);
      }
      txt('Use what the browser gives you.',107,799,36,'#687182',500);
    });
  }
  function hood(t){
    enter(t,0,()=>{
      surface(64,292,952,554);txt('UNDER THE HOOD',106,353,27,'#687182',600);
      const p=clamp(settle(t-.25));
      rect(107,519,864,161,'#E9EDF4',19);txt('MODERN CSS',539,622,61,P.ink,900,'center');
      marker(291,626,502,44,t,.8);
      txt('MODERN CSS',539,622,61,P.ink,900,'center');
      rect(107,519-120*p,864,111,P.ink,19);symbol('Tailwind',277,577-120*p,68);txt('Tailwind',373,595-120*p,65,P.white,700);
      focus(107,519,864,161,t,.9,19);
      txt('Different layer. Same platform.',107,799,37,'#687182',500);
    });
  }
  function raw(t){
    enter(t,0,()=>{
      surface(64,292,952,554);txt('RAW CSS / SIMPLE EXAMPLE',106,353,27,'#687182',600);
      rect(104,390,872,307,P.ink,18);txt('style.css',137,435,25,'#ACB5C8',600);
      const code=['.layout {','  display: grid;','  gap: 1rem;','}'];
      code.forEach((s,i)=>{const n=Math.floor(clamp((t-i*.12)/.25)*s.length);txt(s.slice(0,n),137,492+i*53,39,i===0||i===3?P.yellow:P.white,600);});
      focus(118,513,527,111,t,.45,13);
      marker(106,787,811,42,t,.3);txt('So much easier now.',107,790,64,P.ink,900);
    });
  }
  function drawScene(name,t,absolute){
    if(['typescript','next','tailwind','react','router','tanstack','css'].includes(name)){
      site(name,t,{zoom:name==='tanstack'?1.18:1});return;
    }
    switch(name){
      case 'intro':
        enter(t,0,()=>{surface(64,292,952,554);txt('WEB DEVELOPER?',106,367,35,'#687182',600);txt('Your next',105,497,91,P.ink,900);marker(104,624,520,80,t,.15);txt('stack?',105,630,111,P.ink,900);txt('Make the right choice.',106,788,43,'#687182',500);});break;
      case 'choose':quote([{text:'Choose right.',mark:true},'Build smarter.'],t,{label:'THE TAKEAWAY'});break;
      case 'time':quote([{text:'Wasted time.',strike:true},{text:'Better decisions.',mark:true}],t,{label:'THE TAKEAWAY',small:true});break;
      case 'year':enter(t,0,()=>{surface(64,292,952,554);txt('WEB DEVELOPMENT',107,365,39,'#687182',600);marker(103,657,720,104,t,.1);txt('2026',94,669,247,P.ink,900);txt('What should you learn?',106,796,43,P.ink,600);});break;
      case 'stack':stack(t);break;
      case 'winning':quote(['The winning',{text:'default stack.',mark:true}],t,{label:'FROM THIS VIDEO'});break;
      case 'hire':quote(['Want to get hired?',{text:'Learn this stack.',mark:true}],t,{small:true});break;
      case 'beyond':quote([{text:'The only option.',strike:true},'A starting point.'],t,{label:'DEFAULT ≠ LIMIT',small:true});break;
      case 'great':quote([{text:'A great baseline.',mark:true},'Not the finish line.'],t,{label:'THE TAKEAWAY',small:true});break;
      case 'next-alt':site('next',t,{outline:true});break;
      case 'options':options(t);break;
      case 'fit':quote(['Different tools.',{text:'Different trade-offs.',mark:true}],t,{label:'THE TAKEAWAY',small:true});break;
      case 'nothing-wrong':quote(['Nothing wrong',{text:'with using it.',mark:true}],t);break;
      case 'evolved':evolve(t);break;
      case 'use':quote(['It’s there.',{text:'Use it.',mark:true}],t,{label:'THE TAKEAWAY'});break;
      case 'clarify':quote(['Tailwind isn’t',{text:'the problem.',mark:true}],t,{label:'THE TAKEAWAY'});break;
      case 'hood':hood(t);break;
      case 'raw':raw(t);break;
      case 'closing':quote([{text:'Default = limit.',strike:true},{text:'Default = start.',mark:true}],t,{label:'THE TAKEAWAY',small:true});break;
      case 'cta':enter(t,0,()=>{surface(64,292,952,554);txt('FOUND THIS USEFUL?',106,366,35,'#687182',600);txt('Pass it on.',105,499,91,P.ink,900);['Like','Comment','Share'].forEach((s,i)=>enter(t,i*.1,()=>{const x=105+i*296;rect(x,587,276,123,i===2?P.red:'#EFF1F5',18);txt(s,x+138,666,s==='Comment'?39:47,i===2?P.white:P.ink,700,'center');}));txt('To a developer who needs it.',106,796,36,'#687182',500);});break;
    }
  }
  function captions(t){
    const row=window.DEVELOPER_FILM.captions.find(([a,b])=>t>=a&&t<b);if(!row)return;
    const [a,b,s,mark]=row;g.font='600 48px Inter';const lines=[[]];
    for(const w of s.split(' ')){const last=lines.at(-1);if(last.length&&g.measureText([...last,w].join(' ')).width>880)lines.push([w]);else last.push(w);}
    const base=lines.length===1?987:955;
    lines.forEach((line,i)=>{
      g.font='600 48px Inter';const full=line.join(' '),width=g.measureText(full).width;
      let x=540-width/2;
      for(const word of line){
        const clean=word.replace(/[.,:!?]/g,'').toLowerCase();
        txt(word,x,base+i*60,48,mark.toLowerCase().includes(clean)?P.yellow:P.white,600);
        x+=g.measureText(word+' ').width;
      }
    });
  }
  function header(t){
    const chapter=F.chapters.findLast(([start])=>t>=start),[a,n,title]=chapter;
    const p=clamp(spring(t-a));
    g.save();g.shadowColor='rgba(255,69,59,.24)';g.shadowBlur=22;rect(64,179,81,70,P.red,23);g.restore();
    txt(n,104,231,44,P.white,900,'center');txt(title,171,225,35,P.white,700);
    // Only three compact chapter indicators, attached to this content header.
    if(n==='1'||n==='2'||n==='3')for(let i=0;i<3;i++)rect(866+i*50,210,34,5,i<Number(n)?P.red:'#465064',3);
  }
  window.seek=t=>{
    g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,W,H);g.save();g.scale(W/1080,H/1920);
    rect(0,0,1080,1920,P.bg);
    for(let x=0;x<=1080;x+=64)ln(x,0,x,1920,P.grid,x%256===0?1.5:.75);
    for(let y=0;y<=1920;y+=64)ln(0,y,1080,y,P.grid,y%256===0?1.5:.75);
    const sc=F.scenes.find(([a,b])=>t>=a&&t<b);header(t);
    if(sc)drawScene(sc[2],t-sc[0],t);
    captions(t);
    // True alpha aperture: the footage is composited behind this rounded card.
    const r=F.panel;g.save();g.globalCompositeOperation='destination-out';rect(r.x,r.y,r.w,r.h,'#000',r.r);g.restore();
    g.strokeStyle='#303746';g.lineWidth=2;g.beginPath();g.roundRect(r.x,r.y,r.w,r.h,r.r);g.stroke();
    g.restore();return true;
  };
  if(!Q.has('render')){
    document.body.style.background=P.bg;
    const v=document.createElement('video');v.src=F.source;v.playsInline=true;v.preload='auto';
    document.body.insertBefore(v,c);c.style.pointerEvents='none';
    const ui=document.createElement('div');ui.id='controls';ui.innerHTML='<button>Play / pause</button> <input type="range" min="0" max="65.04" step=".01" value="0">';document.body.appendChild(ui);
    const range=ui.querySelector('input');ui.querySelector('button').onclick=()=>v.paused?v.play():v.pause();range.oninput=()=>{v.currentTime=+range.value;};
    const fit=()=>{
      const s=Math.min(innerWidth/1080,innerHeight/1920),left=(innerWidth-1080*s)/2;
      c.style.width=1080*s+'px';c.style.height=1920*s+'px';c.style.marginLeft=left+'px';
      v.style.left=left+F.panel.x*s+'px';v.style.top=F.panel.y*s+'px';
      v.style.width=F.panel.w*s+'px';v.style.height=F.panel.h*s+'px';
      const scaledH=854*F.panel.w/480;v.style.objectPosition=`center ${100*F.panel.cropY/(scaledH-F.panel.h)}%`;
    };fit();addEventListener('resize',fit);
    window.ASSETS_READY.then(()=>{function loop(){window.seek(v.currentTime);if(!v.paused)range.value=v.currentTime;requestAnimationFrame(loop);}loop();});
  }
})();
