// A time-addressable editorial motion system. Coordinates are a 1080x1920 stage.
(() => {
  const Q = new URLSearchParams(location.search), c = document.getElementById('c');
  const W = c.width = +(Q.get('w') || 1080), H = c.height = +(Q.get('h') || 1920);
  const g = c.getContext('2d'), F = window.DEVELOPER_FILM;
  const {ink,paper,accent,muted} = F.palette;
  const clamp = Motion.clamp, spring = t => Motion.spring(t,240,25);
  const smooth = t => Motion.spring(t,150,25);
  const ease = t => { const u=clamp(t); return u*u*(3-2*u); };
  const font = (n,w=700) => {g.font=`${w} ${n}px Inter`;};
  function text(s,x,y,n=44,color=paper,w=700,align='left') {
    font(n,w);g.fillStyle=color;g.textAlign=align;g.textBaseline='alphabetic';g.fillText(s,x,y);
  }
  function rect(x,y,w,h,color,r=0) {
    g.fillStyle=color;g.beginPath();g.roundRect(x,y,w,h,r);g.fill();
  }
  function line(x1,y1,x2,y2,color=accent,width=5) {
    g.strokeStyle=color;g.lineWidth=width;g.lineCap='round';g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();
  }
  function dot(x,y,r,color=accent){g.fillStyle=color;g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill();}
  function arrow(x,y,len=70,color=accent) {line(x,y,x+len,y,color,6);line(x+len-18,y-18,x+len,y,color,6);line(x+len-18,y+18,x+len,y,color,6);}
  function check(x,y,s=1,color=ink){line(x-17*s,y,x-3*s,y+14*s,color,7*s);line(x-3*s,y+14*s,x+25*s,y-20*s,color,7*s);}
  function animated(local,delay,fn,dx=0,dy=60) {
    const p=spring(local-delay);if(p<=0)return;
    g.save();g.globalAlpha*=clamp(p);g.translate(dx*(1-p),dy*(1-p));fn(p);g.restore();
  }
  function label(s,x,y,color=muted){text(s,x,y,26,color,600);}
  function heading(lines,local) {
    lines.forEach((s,i)=>animated(local,i*.09,()=>text(s,82,230+i*101,96,i===lines.length-1?accent:paper,900),0,80));
  }
  function board(local,height=340) {
    const p=smooth(local);g.save();g.globalAlpha*=clamp(p);
    rect(64,1065+(1-p)*120,884,Math.min(height,340),ink,28);g.restore();
  }
  function pill(s,x,y,w,local,delay=0,selected=false) {
    animated(local,delay,()=>{rect(x,y,w,82,selected?accent:'#232B25',16);text(s,x+25,y+53,34,selected?ink:paper,700);},80,0);
  }
  function react(x,y,size,color=accent,angle=0) {
    g.save();g.translate(x,y);g.rotate(angle);g.strokeStyle=color;g.lineWidth=4;
    for(let i=0;i<3;i++){g.save();g.rotate(i*Math.PI/3);g.beginPath();g.ellipse(0,0,size,size*.37,0,0,Math.PI*2);g.stroke();g.restore();}dot(0,0,7,color);g.restore();
  }
  function icon(name,x,y,s,color=accent,t=0) {
    g.save();g.translate(x,y);
    if(name==='React')react(0,0,s*.34,color,t*.2);
    else if(name==='TypeScript'){rect(-s*.35,-s*.35,s*.7,s*.7,color,8);text('TS',0,s*.2,s*.36,color===ink?accent:ink,900,'center');}
    else if(name==='Next.js'){const fg=color===ink?accent:ink;dot(0,0,s*.36,color);text('N',0,s*.18,s*.5,fg,700,'center');line(s*.08,s*.12,s*.3,s*.36,fg,3);}
    else if(name==='Tailwind'){
      g.strokeStyle=color;g.lineWidth=s*.1;g.lineCap='round';
      for(let i=0;i<2;i++){g.beginPath();g.moveTo(-s*.37,(i-.5)*s*.22);g.bezierCurveTo(-s*.1,-s*.25+i*s*.22,0,s*.18+i*s*.1,s*.35,-s*.08+i*s*.22);g.stroke();}
    }g.restore();
  }
  const tech=['TypeScript','Next.js','Tailwind','React'];
  function stack(local,t) {
    const on=t>=18.9?4:t>=18?2:t>=17.2?1:0;
    board(local,365);
    for(let i=0;i<4;i++) {
      const x=89+i*207, y=1135;
      animated(local,i*.12,()=>{
        const active=i<on;rect(x,y,188,204,active?accent:'#252D27',18);
        icon(tech[i],x+94,y+72,100,active?ink:'#66766A',t);
        text(tech[i],x+94,y+153,tech[i]==='TypeScript'?25:30,active?ink:paper,700,'center');
        text(`0${i+1}`,x+94,y+182,19,active?ink:muted,500,'center');
        if(active){const a=spring(t-[17.2,18,18.9,19.7][i]);line(x+25,y+222,x+25+138*clamp(a),y+222,accent,5);}
      },0,140);
    }
    label(on===4?'THE DEFAULT. A SOLID START.':'BUILD YOUR FOUNDATION.',91,1391,on===4?accent:muted);
  }
  function caption(t) {
    const item=F.captions.find(([a,b])=>t>=a&&t<b);if(!item)return;
    const [a,b,s,em]=item,local=t-a;
    font(44,600);const words=s.split(' '),lines=[[]];
    for(const word of words){const row=lines.at(-1);if(row.length&&g.measureText([...row,word].join(' ')).width>810)lines.push([word]);else row.push(word);}
    const y=1320,h=lines.length*52+32;
    // All subtitles stay above the TikTok caption/music zone.
    g.save();const p=clamp(spring(local));g.globalAlpha=p;
    rect(64,y,884,h,'rgba(9,14,11,0.95)',20);
    rect(64,y,5,h,accent,2);
    lines.forEach((row,j)=>{
      font(44,600);const widths=row.map(w=>g.measureText(w+' ').width),total=widths.reduce((a,b)=>a+b,0);
      let x=506-total/2;
      row.forEach((w,k)=>{
        const idx=words.indexOf(w), reveal=clamp((local-idx*.025)/.11);
        g.globalAlpha=p*(.62+.38*reveal);
        text(w,x,y+48+j*52,44,em.toLowerCase().includes(w.replace(/[.,:!?]/g,'').toLowerCase())?accent:paper,600);
        x+=widths[k];
      });
    });g.restore();
  }
  function graphRoutes(local,t) {
    board(local,365);
    animated(local,0,()=>{rect(95,1110,235,80,'#263129',16);text('Next.js',212,1163,36,paper,700,'center');});
    const grow=clamp(smooth(local-.3));line(340,1150,410,1150,muted,4);
    line(410,1150,410,1150+170*grow,muted,4);
    if(grow>.5){arrow(410,1150,70,accent);arrow(410,1320,70,accent);}
    pill('React Router',505,1110,390,local,.45,t>=30.6);
    pill('TanStack',505,1278,390,local,.7,t>=31.7);
    label('SAME REACT. DIFFERENT ROUTES.',96,1401);
    const p=(local*.35)%1;dot(345+p*120,1150,6);
  }
  function cssDemo(local,t) {
    board(local,365);
    const titles=['LAYOUT','STYLE','BROWSER'];
    for(let i=0;i<3;i++)animated(local,.12*i,()=>{
      const x=90+i*285;rect(x,1121,260,212,'#222D25',18);
      label(titles[i],x+19,1160,accent);
      if(i===0){for(let j=0;j<6;j++){
        const u=smooth(local-.3-j*.04),col=j%3,row=Math.floor(j/3);
        const phase=.5+.5*Math.sin(t*1.5+j*.4);
        rect(x+18+col*76,1180+row*64,65,48*clamp(u),j===2?accent:`rgba(215,255,69,${.2+.15*phase})`,6);
      }}
      if(i===1){const z=.5+.5*Math.sin(local*2);rect(x+26,1185,208,94,accent,15+z*28);text('{ CSS }',x+130,1250,36,ink,900,'center');}
      if(i===2){line(x+25,1230,x+230,1230,muted,3);const p=(local*.4)%1;dot(x+30+190*p,1230,12);text('API',x+130,1300,34,paper,700,'center');}
    },0,100);
    label(t>=47.1?'THE PLATFORM KEEPS MOVING.':'MODERN CSS + BROWSER APIs',92,1400,accent);
  }
  function sceneDraw(name,l,t) {
    switch(name) {
      case 'journey':
        heading(['DEVELOPER?','CHOOSE BETTER.'],l);board(l,330);
        animated(l,.13,()=>{
          label('THE DEVELOPER JOURNEY',98,1123);line(117,1230,851,1230,'#485345',4);
          ['LEARN','BUILD','CHOOSE'].forEach((s,i)=>{const p=spring(l-i*.2);dot(140+i*340,1230,15*clamp(p),i===2?accent:paper);text(s,140+i*340,1290,28,i===2?accent:paper,700,'center');});
          const p=clamp(smooth(l-.3));arrow(140+670*p,1175,50);label('GOOD CHOICES COMPOUND.',98,1360,accent);
        });break;
      case 'choice':
        heading(['CHOOSE','WITH INTENT.'],l);board(l,330);
        pill('random tutorial',92,1140,390,l,0,false);pill('engineering mindset',92,1250,790,l,.16,true);
        animated(l,.36,()=>check(828,1292,1));break;
      case 'time':{
        heading(['LESS GUESSING.','MORE BUILDING.'],l);board(l,330);
        animated(l,.12,()=>{
          const n=Math.round(60*(1-clamp(smooth(l-.15))));text(`${String(n).padStart(2,'0')}:00`,99,1260,110,accent,900);
          label('TIME LOST TO THE WRONG PATH',102,1125);
          text('SKIP THE DETOUR',99,1360,35,paper,700);arrow(785,1347,80);
        });break;}
      case 'year':
        animated(l,0,()=>{text('WEB DEVELOPMENT',82,207,38,paper,600);text('2026',73,410,223,accent,900);});
        board(l,310);animated(l,.3,()=>{text('WHAT SHOULD',97,1192,61,paper,900);text('YOU LEARN?',97,1270,72,accent,900);label('A PRACTICAL STARTING POINT',100,1350);});break;
      case 'default':
        heading(['THE DEFAULT','STACK.'],l);board(l,330);
        tech.forEach((s,i)=>animated(l,i*.13,()=>{const x=110+i*204;icon(s,x+72,1204,105,accent,t);text(s,x+72,1298,s==='TypeScript'?26:30,paper,700,'center');}));
        animated(l,.7,()=>label('FOUR TOOLS. ONE FOUNDATION.',98,1365,accent));break;
      case 'winning':
        heading(['WINNING','BY DEFAULT.'],l);board(l,330);
        animated(l,.1,()=>{rect(101,1135,750,130,accent,22);text('A STRONG START',475,1224,65,ink,900,'center');check(880,1203,1.3,accent);});
        animated(l,.25,()=>label('LEARN THE TOOLS. UNDERSTAND THE WHY.',101,1350));break;
      case 'stack':
        heading([t<17.2?'THE STACK,':'MEET YOUR','BUILDING BLOCKS.'],l);
        // Shorter type for this longer second line.
        // Override handled by heading's dynamic font fitting below.
        stack(l,t);break;
      case 'hired':
        heading(['LEARN IT.','GET HIRED.'],l);board(l,330);
        animated(l,.1,()=>{rect(98,1120,800,170,'#222D25',20);label('YOUR APPLICATION',123,1168);text('Stack fluency',124,1233,49,paper,700);rect(714,1175,145,64,accent,32);text('✓',787,1223,40,ink,700,'center');});
        animated(l,.25,()=>{label('FOUNDATION',100,1360);arrow(395,1350,110);text('OPPORTUNITY',540,1360,30,accent,700);});break;
      case 'beyond':
        heading(['GOOD DEFAULT.','BIGGER WORLD.'],l);board(l,330);
        animated(l,.1,()=>{rect(98,1145,345,135,'#273129',18);text('DEFAULT',270,1229,43,paper,900,'center');});
        animated(l,.3,()=>{arrow(458,1214,92);rect(575,1145,323,135,accent,18);text('BEYOND',737,1229,43,ink,900,'center');});
        animated(l,.6,()=>label('KEEP YOUR OPTIONS OPEN.',102,1360,accent));break;
      case 'great':
        heading(['SOLID STACK.','REAL OPTIONS.'],l);board(l,330);
        tech.forEach((s,i)=>animated(l,i*.07,()=>{const x=140+i*215;dot(x,1200,46,accent);check(x,1200,.65);text(s,x,1310,s==='TypeScript'?26:30,paper,700,'center');}));break;
      case 'routes':
        heading([t<30.6?'NEXT.JS HAS':'CHOOSE YOUR','ALTERNATIVES.'],l);graphRoutes(l,t);break;
      case 'frameworks':
        heading([t<36.1?'DIFFERENT TOOLS.':'FIND YOUR FIT.','DIFFERENT FIT.'],l);board(l,365);
        pill('React Router',98,1120,363,l,.1,t<36.1);pill('TanStack',500,1120,390,l,.2,t>=36.1);
        animated(l,.4,()=>{text(t<36.1?'Explore the trade-offs.':'Choose what fits the job.',98,1310,49,paper,700);label('ROUTING / DATA / DEVELOPER EXPERIENCE',98,1392);});
        // A comparison cursor moves between the two framework cards.
        const x=300+320*(.5-.5*Math.cos(l*1.7));line(x,1240,x,1260,accent,6);dot(x,1233,7);break;
      case 'tailwind':
        heading([t<42?'TAILWIND?':'STILL A','SOLID CHOICE.'],l);board(l,330);
        animated(l,.1,()=>{icon('Tailwind',198,1210,170,accent,t);text('Tailwind',334,1220,72,paper,900);});
        animated(l,.3,()=>{label(t<42?'UTILITY-FIRST STYLING':'NOTHING WRONG WITH USING IT',98,1360,accent);check(855,1210,1.2,accent);});break;
      case 'css':
        heading([t<47.1?'THE WEB':'THE PLATFORM','HAS EVOLVED.'],l);cssDemo(l,t);break;
      case 'use':
        heading(['IT’S THERE.','USE IT.'],l);board(l,330);
        animated(l,0,()=>{text('{',105,1260,150,accent,500);text('THE PLATFORM',265,1225,48,paper,900);text('}',815,1260,150,accent,500);label('EXPLORE WHAT THE BROWSER CAN DO.',100,1358);});break;
      case 'clarify':
        heading(['ONE THING','TO BE CLEAR.'],l);board(l,330);
        animated(l,.1,()=>{text('Tailwind',98,1210,62,paper,900);text('+',446,1210,65,accent,500);text('modern CSS',530,1210,53,paper,900);text('They work together.',98,1340,42,accent,600);});break;
      case 'hood':
        heading(['UNDER','THE HOOD.'],l);board(l,365);
        const lift=clamp(smooth(l-.3));
        animated(l,0,()=>{
          rect(108,1230,790,123,'#273129',18);text('MODERN CSS',500,1312,52,accent,900,'center');
          rect(108,1230-110*lift,790,100,paper,18);text('TAILWIND',500,1295-110*lift,52,ink,900,'center');
          for(let i=0;i<4;i++)line(205+i*195,1220,205+i*195,1240-80*lift,muted,3);
          label('UTILITIES POWERED BY THE PLATFORM',103,1400);
        });break;
      case 'raw':
        heading(['RAW CSS.','LESS FRICTION.'],l);board(l,365);
        animated(l,.1,()=>{
          const source=['.idea {','  display: grid;','  gap: 1rem;','}'];
          source.forEach((s,i)=>{const n=Math.floor(clamp((l-.14-i*.15)/.42)*s.length);text(s.slice(0,n),108,1140+i*58,38,i===0||i===3?accent:paper,600);});
          const p=clamp(smooth(l-.65));rect(623,1140,230,180,accent,24);
          for(let i=0;i<4;i++)rect(648+(i%2)*100,1165+Math.floor(i/2)*70,80,50,ink,8);
          label('SMALL CODE. BIG POSSIBILITY.',107,1401);
        });break;
      case 'explore':
        heading(['LEARN THE DEFAULT.','THEN GO FURTHER.'],l);board(l,330);
        animated(l,.1,()=>{const p=clamp(smooth(l-.2));line(110,1230,850,1230,muted,3);dot(180,1230,15,paper);dot(500,1230,15,paper);dot(835,1230,24,accent);arrow(160+600*p,1170,55);text('LEARN',107,1320,30,paper);text('QUESTION',420,1320,30,paper);text('EXPLORE',730,1320,30,accent);});break;
      case 'cta':
        heading(['GOOD IDEAS','TRAVEL.'],l);board(l,330);
        ['LIKE','COMMENT','SHARE'].forEach((s,i)=>animated(l,i*.14,()=>{const x=93+i*282;rect(x,1150,260,140,i===2?accent:'#253027',22);text(s,x+130,1237,s==='COMMENT'?31:40,i===2?ink:paper,900,'center');}));
        animated(l,.4,()=>label('PASS THIS ON TO A DEVELOPER.',100,1360,accent));break;
    }
  }
  // Fit bold headings to the safe width, preserving the intended line breaks.
  heading = function(lines,local) {
    lines.forEach((s,i)=>animated(local,i*.085,()=>{
      font(96,900);const n=Math.min(96,96*850/Math.max(1,g.measureText(s).width));
      g.save();g.translate(0,107);
      text(s,82,230+i*104,n,i===lines.length-1?accent:paper,900);g.restore();
    },0,65));
  };
  function takeover(name,t) {
    const bounds={stack:[17.2,20.8],routes:[30.6,33.4],css:[44.3,49.4],raw:[57,60.3]};
    if(!bounds[name])return false;
    const [start,end]=bounds[name];if(t<start||t>=end)return false;
    const l=t-start;
    // A hard editorial cut into a purpose-built graphic, with a clipped entry wipe.
    g.save();g.beginPath();g.rect(0,1920*(1-clamp(spring(l))),1080,1920);g.clip();
    rect(0,0,1080,1920,ink);
    // Quiet technical grid, tied to the actual diagram rather than particle noise.
    for(let x=80;x<1000;x+=80)line(x,430,x,1260,'#1D281F',1);
    for(let y=430;y<1280;y+=80)line(80,y,958,y,'#1D281F',1);
    g.save();g.translate(0,-107);
    if(name==='stack')heading(['FOUR TOOLS.','ONE FOUNDATION.'],l);
    if(name==='routes')heading(['SAME REACT.','NEW ROUTES.'],l);
    if(name==='css')heading(['THE PLATFORM','IS THE POWER.'],l);
    if(name==='raw')heading(['LESS FRICTION.','MORE CREATION.'],l);
    g.restore();
    if(name==='stack') {
      const starts=[17.2,18,18.9,19.7],desc=['TYPED JAVASCRIPT','APP FRAMEWORK','UTILITY-FIRST CSS','UI LIBRARY'];
      for(let i=0;i<4;i++) {
        const p=spring(t-starts[i]);if(p<=0)continue;
        g.save();g.translate((1-p)*900,0);
        const x=108+i*28,y=445+i*186;
        g.save();g.translate(x+390,y+77);g.rotate((1-p)*-.1);
        rect(-391,-68+15,760,148,'#697A27',20);
        rect(-391,-68,760,148,accent,20);
        icon(tech[i],-313,0,98,ink,t);
        text(tech[i],-224,-2,62,ink,900);
        text(desc[i],-220,43,24,ink,600);
        text(`0${i+1}`,310,11,39,ink,700,'center');
        g.restore();g.restore();
      }
      label('LEARN THE STACK. BUILD SOMETHING REAL.',96,1258,accent);
    }
    if(name==='routes') {
      animated(l,0,()=>{rect(94,465,804,145,paper,24);icon('React',163,537,100,ink,t);text('Your React app',255,558,57,ink,900);});
      const p=clamp(smooth(l-.2));
      line(500,634,500,634+100*p,accent,7);
      line(287,730,287+426*p,730,accent,7);
      line(287,730,287,730+80*p,accent,7);line(713,730,713,730+80*p,accent,7);
      ['React Router','TanStack'].forEach((s,i)=>animated(l,.25+i*.18,()=>{
        const x=93+i*430;rect(x,817,378,248,accent,25);
        if(i===0){for(let j=0;j<3;j++){dot(x+100+j*85,880,14,ink);if(j<2)line(x+114+j*85,880,x+171+j*85,880,ink,5);}}
        else{line(x+125,900,x+190,858,ink,6);line(x+190,858,x+255,900,ink,6);line(x+125,900,x+255,900,ink,6);dot(x+190,858,9,ink);}
        text(s,x+189,990,s==='React Router'?42:53,ink,900,'center');
        text('EXPLORE THE FIT',x+189,1031,22,ink,600,'center');
      },0,100));
      animated(l,.65,()=>{text('A default is a starting point.',96,1187,46,paper,700);label('KEEP YOUR OPTIONS OPEN.',97,1258,accent);});
    }
    if(name==='css') {
      animated(l,0,()=>{
        rect(90,447,810,745,paper,25);rect(90,447,810,78,'#253027',25);
        for(let i=0;i<3;i++)dot(126+i*30,485,7,i===0?accent:muted);
        text('THE MODERN WEB',805,494,23,paper,600,'right');
        const change=smooth(l-1.5),columns=l<1.5?2:3;
        text('Made of possibilities.',129,600,48,ink,900);
        rect(129,625,470,10,ink,5);rect(129,648,300,8,'#89958D',4);
        for(let i=0;i<6;i++){
          const oldX=129+(i%2)*358,oldY=697+Math.floor(i/2)*139;
          const newX=129+(i%3)*239,newY=730+Math.floor(i/3)*179;
          const x=oldX+(newX-oldX)*change,y=oldY+(newY-oldY)*change;
          const w=335+(215-335)*change,h=118+(157-118)*change;
          rect(x,y,w,h,i===0?ink:i===4?accent:'#D9E1CF',17);
          text(`0${i+1}`,x+20,y+45,26,i===0?accent:ink,700);
          if(i===0)react(x+w-51,y+h-40,28,accent,t*.1);
          else if(i===4){arrow(x+35,y+h-38,Math.max(40,w-90),ink);}
          else {line(x+20,y+h-36,x+w-25,y+h-36,'#7B8D70',5);}
        }
        text(l<1.5?'LAYOUT →':'LAYOUT → STYLE → APIs',130,1144,30,ink,900);
      },0,130);
      label(t<47.1?'THE BROWSER IS YOUR CREATIVE TOOLKIT.':'NOT STANDING STILL. NEITHER SHOULD YOU.',96,1260,accent);
    }
    if(name==='raw') {
      animated(l,0,()=>{
        rect(91,455,810,315,'#253027',24);text('style.css',125,501,29,accent,600);
        const code=['.idea {','  display: grid;','  gap: 1rem;','}'];
        code.forEach((s,i)=>{const n=Math.floor(clamp((l-i*.13)/.4)*s.length);text(s.slice(0,n),136,564+i*54,39,i===0||i===3?accent:paper,600);});
      },0,90);
      animated(l,.5,()=>{
        arrow(466,816,60,accent);
        rect(91,878,810,317,paper,24);
        text('IDEA → INTERFACE',126,941,37,ink,900);
        for(let i=0;i<3;i++){const x=126+i*251;rect(x,973,224,178,i===1?accent:ink,17);text(['01','02','03'][i],x+24,1022,28,i===1?ink:accent,700);line(x+24,1107,x+174,1107,i===1?ink:paper,6);}
      },0,100);
      label('THE CODE CAN BE SIMPLE. THE RESULT CAN BE BIG.',96,1260,accent);
    }
    g.restore();return true;
  }
  window.DURATION=F.duration;
  window.FONTS=['500 100px Inter','600 100px Inter','700 100px Inter','900 100px Inter'];
  window.seek=t=>{
    g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,W,H);g.save();g.scale(W/1080,H/1920);
    // Neutral top/bottom scrims preserve the presenter while giving type contrast.
    const top=g.createLinearGradient(0,0,0,520);top.addColorStop(0,'rgba(9,14,11,.88)');top.addColorStop(.75,'rgba(9,14,11,.72)');top.addColorStop(1,'rgba(9,14,11,0)');
    rect(0,0,1080,520,top);
    const bottom=g.createLinearGradient(0,1010,0,1710);bottom.addColorStop(0,'rgba(9,14,11,0)');bottom.addColorStop(.6,'rgba(9,14,11,.6)');bottom.addColorStop(1,'rgba(9,14,11,.92)');rect(0,1010,1080,910,bottom);
    const sc=F.scenes.find(([a,b])=>t>=a&&t<b);
    let full=false;
    if(sc){const [a,b,name]=sc;full=takeover(name,t);if(!full){g.save();g.translate(0,-107);sceneDraw(name,t-a,t);g.restore();}}
    caption(t);
    // A chapter rail sits directly above the illustration, away from the face.
    const chapters=[[0,'DIRECTION'],[9.8,'THE DEFAULT'],[23.5,'ALTERNATIVES'],[39.1,'THE PLATFORM'],[60.3,'GO FURTHER']];
    const ci=chapters.findLastIndex(([a])=>t>=a);
    if(!full)for(let i=0;i<5;i++){const x=82+i*174;rect(x,943,155,4,i<=ci?accent:'rgba(244,245,233,.25)',2);}
    g.restore();return true;
  };
  if(!Q.has('render')) {
    const v=document.createElement('video');v.src='clips/0928(5).mp4';v.controls=true;v.playsInline=true;
    document.body.insertBefore(v,c);c.style.pointerEvents='none';
    v.style.objectPosition='center top';v.style.transform='translateY(-8.854vh)';
    v.style.height='100vh';document.body.style.background=ink;
    const scale=()=>{c.style.width=innerWidth+'px';c.style.height=innerHeight+'px';};scale();addEventListener('resize',scale);
    function loop(){window.seek(v.currentTime);requestAnimationFrame(loop);}loop();
  }
})();
