export const V={
 clamp:x=>Math.max(0,Math.min(1,x)),
 ease:x=>1-(1-Math.max(0,Math.min(1,x)))**4,
 text(c,str,x,y,size=50,color='#f3f3f4',font='Inter',align='left',max=1000){c.fillStyle=color;c.font=`${font==='Anton'?'400':'600'} ${size}px "${font}"`;c.textAlign=align;c.textBaseline='alphabetic';c.fillText(str,x,y,max)},
 line(c,pts,color='#fff',width=4,progress=1){c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.beginPath();const n=(pts.length-1)*Math.max(0,Math.min(1,progress)),last=Math.floor(n);pts.forEach(([x,y],i)=>{if(i<=last)i?c.lineTo(x,y):c.moveTo(x,y);else if(i===last+1){const p=n-last,a=pts[last];c.lineTo(a[0]+(x-a[0])*p,a[1]+(y-a[1])*p)}});c.stroke()},
 box(c,x,y,w,h,color,r=24){c.fillStyle=color;c.beginPath();c.roundRect(x,y,w,h,r);c.fill()},
 label(c,str,x,y,color='#a4aab5'){this.text(c,str,x,y,26,color)},
 arrow(c,x,y,tx,ty,color,width=5,p=1){this.line(c,[[x,y],[tx,ty]],color,width,p);if(p>.95){const a=Math.atan2(ty-y,tx-x);this.line(c,[[tx-23*Math.cos(a-.6),ty-23*Math.sin(a-.6)],[tx,ty],[tx-23*Math.cos(a+.6),ty-23*Math.sin(a+.6)]],color,width)}},
 cursor(c,x,y,click=0,color='#fff'){c.save();c.translate(x,y);c.scale(1-.12*click,1-.12*click);c.shadowColor='#0008';c.shadowBlur=14;c.fillStyle=color;c.strokeStyle='#181627';c.lineWidth=5;c.beginPath();c.moveTo(0,0);c.lineTo(1,115);c.lineTo(29,88);c.lineTo(52,141);c.lineTo(76,130);c.lineTo(53,78);c.lineTo(93,77);c.closePath();c.fill();c.stroke();c.restore()},
 field(t){return t<9.18?-1:t<10.24?0:t<11?1:t<11.9?2:3},
 captions(c,t,spec,id){const cue=spec.captions.find(([a,b])=>t>=a&&t<b);if(!cue)return;const [a,,str]=cue,p=this.ease((t-a+.05)/.16),sketch=id==='clip-sketch-interrupt';c.save();c.translate(0,(1-p)*20);c.font='600 52px Inter';const w=Math.min(1010,c.measureText(str).width+64);this.box(c,(1080-w)/2,1640,w,100,sketch?'#245cff':'#080b12ed',sketch?2:16);this.text(c,str,540,1706,52,'#fff','Inter','center',950);c.restore()}
};
export const VFIELDS=[['USER','member'],['INPUT','item + quantity'],['RESPONSE','receipt'],['ERRORS','400 / 403']];
