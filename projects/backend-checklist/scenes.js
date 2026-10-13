(()=>{
 const {g,box,txt,line,sp,cl,C,ring,fullBackground}=SceneKit,F=REFERENCE_EDIT;
 const mint='#8BE1B4',muted='#A3A4AC';
 function enter(t,a,draw){g.save();const p=sp(t-a);g.globalAlpha=cl((t-a)*14);g.translate(42*(1-p),0);draw();g.restore();}
 function panel(title,n,t,a){enter(t,a,()=>{box(60,132,960,548,28,'#171719','#3A3A40');txt('0'+n,102,204,42,C.red,900);txt(title,184,204,43);line(96,237,984,237,'#36363D');});}
 function progress(n){for(let i=0;i<3;i++)box(330+i*144,718,120,7,3,i<n?C.red:'#3A3A40');txt(['REQUIREMENTS','BOUNDARIES','REVIEW'][n-1],540,779,30,muted,700,'center');}
 function check(x,y,on,color=mint){box(x,y,34,34,9,on?color:null,on?color:'#64646C');if(on){line(x+8,y+17,x+15,y+24,'#101014',4);line(x+15,y+24,x+27,y+10,'#101014',4);}}
 function pill(s,x,y,w,color=C.red){box(x,y,w,58,16,'#171719','#47474D');txt(s,x+w/2,y+40,31,color,700,'center');}
 SceneKit.register('backend-chip',(t,s)=>enter(t,s.a,()=>{pill('AI  →  backend.ts',282,185,516,'#FFF');line(315,243,315+450*cl(sp(t-1.68)),243,C.red,5);}));
 SceneKit.register('three-gates',(t,s)=>enter(t,s.a,()=>{for(let i=0;i<3;i++){const on=t>=3.96+i*.16;box(354+i*128,187,112,86,18,on?C.red:'#171719','#55555D');txt('0'+(i+1),410+i*128,245,46,'#FFF',900,'center');}}));
 SceneKit.register('contract',(t,s)=>{
 panel('API contract',1,t,s.a);progress(1);
 const rows=[['USER','Member',9.18],['INPUT','POST /orders',10.24],['BODY','{ quantity: 1 }',10.4],['RESPONSE','201 · orderId',11],['ERROR','400 · invalid quantity',12.22]];
 rows.forEach(([key,value,at],i)=>{const y=292+i*70;enter(t,s.a+.12,()=>{if(t>=at)box(88,y-38,904,61,11,'#292126');txt(key,111,y,27,muted,700);txt(value,340,y,40,t>=at?C.white:'#93939D',700);});});
 const at=rows.filter(x=>t>=x[2]).at(-1);if(at)ring(329,254+rows.indexOf(at)*70,643,61,t,at[2]);
 });
 SceneKit.register('boundaries',(t,s)=>{
 panel('Request checkpoint',2,t,s.a);progress(2);
 const defs=[['VALIDATION','Is quantity valid?',16.46],['AUTHENTICATION','Who is calling?',17.3],['AUTHORIZATION','Can they access it?',18.54]];
 enter(t,s.a+.12,()=>{defs.forEach(([name,detail,at],i)=>{const y=290+i*112;box(98,y,884,95,17,t>=at?'#262129':'#202025');txt(name,165,y+35,29,t>=at?C.red:muted,900);txt(detail,165,y+77,40);check(907,y+31,t>=at);});
 const y=320+112*cl(sp(t-17.3))+112*cl(sp(t-18.54));box(112,y,25,25,6,C.red);});
 });
 SceneKit.register('working-secure',(t,s)=>{
 fullBackground(t);enter(t,s.a,()=>{txt('Response received',100,300,37,muted,500);box(80,405,920,267,30,'#192922','#3B6652');txt('200 OK',540,526,100,mint,900,'center');txt('The request ran.',540,600,43,C.white,500,'center');});
 enter(t,21.4,()=>{txt('≠',540,858,155,C.red,900,'center');box(80,952,920,311,30,'#25191E','#71434D');txt('ACCESS CHECK',130,1028,30,muted,700);txt('Can this user',130,1120,65,C.white,900);txt('access this order?',130,1201,65,C.white,900);});
 const cap=F.captions.find(([a,b])=>t>=a&&t<b);if(cap)txt(cap[2],540,1485,cap[2].length>22?56:72,'#FFF',900,'center');
 });
 SceneKit.register('tests',(t,s)=>{
 panel('backend.test.ts',3,t,s.a);progress(3);enter(t,s.a+.12,()=>{txt('ILLUSTRATIVE TEST CASES',102,285,24,muted,500);
 const defs=[['Valid request','201',26.28],['quantity: -1','400',26.92],['No session','401',27.3],['Wrong owner','403',27.65]];
 defs.forEach(([label,status,at],i)=>{const y=352+i*76;check(104,y-27,t>=at);txt(label,163,y,37);pill(status,851,y-41,113,t>=at?mint:muted);});});
 });
 SceneKit.register('human-review',(t,s)=>{
 panel('AI diff → human review',3,t,s.a);progress(3);enter(t,s.a+.12,()=>{
 txt('Example: order ownership',102,292,30,muted,500);box(96,328,888,221,19,'#101014');
 txt('if (order.ownerId',126,388,44,'#E9D68C');txt('    !== user.id) {',126,445,44,'#E9D68C');txt('  return forbidden();',126,502,42,mint);
 line(126,402,126+490*cl(sp(t-29.38)),402,C.red,5);});
 enter(t,29.38,()=>{check(113,591,true);txt('Reviewed by a person',169,621,36,C.white);});
 });
 SceneKit.register('responsibility',(t,s)=>{
 const labels=['Secure','Review','Understand'],ats=[39.94,40.64,41.9];enter(t,s.a,()=>{labels.forEach((label,i)=>{box(134+i*276,178,260,96,18,'#141418','#4C4C54');txt(label,264+i*276,235,35,t>=ats[i]?C.white:muted,700,'center');if(t>=ats[i])line(156+i*276,263,156+i*276+216*cl(sp(t-ats[i])),263,C.red,5);});});
 });
 SceneKit.register('comment-prompt',(t,s)=>{
 panel('Your next backend prompt',3,t,s.a);
 enter(t,43.22,()=>{box(103,285,874,100,24,C.red);txt('checklist',540,354,61,'#FFF',900,'center');});
 ['01  Define the contract','02  Set security boundaries','03  Test + human review'].forEach((label,i)=>enter(t,44.56+i*.13,()=>txt(label,122,456+i*75,37,C.white,700)));
 txt('COMMENT → PROMPT TEMPLATE',540,762,29,muted,700,'center');
 });
})();
