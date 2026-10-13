// Original deterministic character rigs and story environment. Series identity is data.
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {HDRLoader} from 'three/addons/loaders/HDRLoader.js';
export const STORY_STYLES=[{id:'educational-3d',name:'Educational 3D'},{id:'illustrated-story',name:'Illustrated character storytelling'},{id:'cinematic-story',name:'Cinematic story animation'},{id:'sketch-story',name:'Sketch adventure'}];
export const clamp=x=>Math.max(0,Math.min(1,x));
const ease=x=>{x=clamp(x);return x*x*(3-2*x);};
export function storyState(t,spec){
 const index=Math.max(0,spec.scenes.findLastIndex(s=>s.at<=t)),scene=spec.scenes[index];
 const p=clamp((t-scene.at)/scene.duration),move=ease(p),action=scene.action;
 let pip=-4,ada=-7,bridge=0,light=0,weight=-4;
 if(action==='approach')pip=-4+2.2*move;
 if(action==='fail'){pip=-1.8-.6*ease(p/.4);ada=-7+3.5*ease(p/.35);}
 if(['inspect','build','test'].includes(action)){pip=-2.4;ada=-3.5;}
 if(action==='build')bridge=clamp(p*1.5);
 if(action==='test'){bridge=1;weight=-2+4*ease((p<.35?p:p-.35)/.35);pip=-2.4+.6*ease((p-.8)/.2);}
 if(action==='cross'){bridge=1;pip=-1.8+5.8*ease(p/.65);ada=-3.5;light=ease((p-.9)/.08);}
 if(action==='resolve'){bridge=1;pip=4;ada=-3.5;light=1;}
 return {index,scene,p,action,pip,ada,bridge,light,weight,t};
}

export function createStoryWorld(canvas,bible,style,assets={}){
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,preserveDrawingBuffer:true});
 renderer.setPixelRatio(4/3);renderer.setSize(1080,1920,false);
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;
 renderer.toneMappingExposure=style==='cinematic-story'?1.35:1.2;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;
 const world=new THREE.Scene();world.background=new THREE.Color(style==='cinematic-story'?'#142a37':'#eee3cb');
 world.fog=new THREE.Fog(world.background,28,60);
 const camera=new THREE.PerspectiveCamera(38,1080/1920,.1,100);
 const hemi=new THREE.HemisphereLight('#fff1d5','#253e4b',style==='cinematic-story'?.9:1.8);world.add(hemi);
 const sun=new THREE.DirectionalLight('#ffdca2',style==='cinematic-story'?4:3);sun.position.set(-5,12,8);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-12;sun.shadow.camera.right=12;sun.shadow.camera.top=12;sun.shadow.camera.bottom=-12;sun.shadow.normalBias=.035;sun.shadow.bias=-.0001;world.add(sun);
 const material=color=>new THREE.MeshStandardMaterial({color,roughness:.8,metalness:.12});
 function mesh(geometry,color,parent,x=0,y=0,z=0){const m=new THREE.Mesh(geometry,material(color));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 function box(w,h,d,color,parent,x,y,z){return mesh(new RoundedBoxGeometry(w,h,d,2,Math.min(.045,w/6,h/6,d/6)),color,parent,x,y,z);}
 function ball(r,color,parent,x,y,z){return mesh(new THREE.SphereGeometry(r,16,12),color,parent,x,y,z);}
 function cylinder(r,h,color,parent,x,y,z){return mesh(new THREE.CylinderGeometry(r,r,h,16),color,parent,x,y,z);}
 const stage=new THREE.Group();world.add(stage);
 box(15,.65,8,'#264d58',stage,0,-.5,0); // river, between two banks
 const water=new THREE.Mesh(new THREE.PlaneGeometry(15,8),new THREE.ShaderMaterial({uniforms:{time:{value:0}},vertexShader:'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 vUv;uniform float time;void main(){float wave=sin(vUv.y*80.+vUv.x*19.-time*1.1)*.5+.5;float glint=pow(wave,18.)*.18;vec3 col=mix(vec3(.075,.24,.27),vec3(.18,.38,.40),vUv.x)+glint;gl_FragColor=vec4(col,1.);}' }));water.rotation.x=-Math.PI/2;water.position.y=-.12;stage.add(water);
 box(5,.9,8,'#718d76',stage,-5,-.1,0);box(5,.9,8,'#718d76',stage,5,-.1,0);
 box(1.65,.14,.95,'#a9956e',stage,-1.7,.65,0);box(1.65,.14,.95,'#a9956e',stage,1.7,.65,0);
 const planks=[];for(let i=0;i<15;i++){const x=-2.4+i*.34;planks.push(box(.3,.17,1.28,'#bcb292',stage,x,.78,0));}
 const repair=[];for(let i=0;i<3;i++)repair.push(box(.62,.2,1.3,'#e7ba78',stage,-.65+i*.65,.84,0));
 for(const z of [-.75,.75]){box(5.1,.05,.05,'#556d64',stage,0,1.25,z);for(const x of [-2.4,2.4])cylinder(.06,.8,'#796e54',stage,x,.94,z);}
 // Lighthouse, workshop, and village have distinct silhouettes.
 cylinder(.64,2.7,'#d8d5ba',stage,5,1.8,-1.8);cylinder(.88,.18,'#415c62',stage,5,3.13,-1.8);
 const lamp=ball(.38,'#f4bd5b',stage,5,3.55,-1.8);mesh(new THREE.ConeGeometry(.87,.55,12),'#a27059',stage,5,4,-1.8);
 box(2,1.5,1.7,'#c5af85',stage,-5,1.1,-2.3);mesh(new THREE.ConeGeometry(1.7,.9,4),'#81544a',stage,-5,2.3,-2.3).rotation.y=Math.PI/4;
 const windows=[];
 for(let i=0;i<5;i++){const x=3+i*.62,z=1.6+(i%2)*.8;box(.65,.7,.55,'#c3b595',stage,x,.72,z);mesh(new THREE.ConeGeometry(.62,.55,4),'#886153',stage,x,1.35,z).rotation.y=Math.PI/4;windows.push(box(.18,.2,.03,'#f2be65',stage,x,.8,z+.29));}
 for(let i=0;i<9;i++){const x=i<5?-7+(i*.75):3+(i-5)*1.2,z=i%2?3:-3;cylinder(.09,.7,'#706654',stage,x,.75,z);mesh(new THREE.ConeGeometry(.65,1.7,7),'#3d7066',stage,x,1.65,z);}
 const rigs=bible.characters.map(character=>{
   const root=new THREE.Group();stage.add(root);root.scale.setScalar(character.height);
   const body=box(.6,.62,.48,character.body,root,0,.8,0),head=box(.72,.52,.58,character.body,root,0,1.4,0);
   box(.57,.3,.035,character.face,root,0,1.4,.305);
   const eyes=[-.15,.15].map(x=>ball(.06,character.eyes,root,x,1.43,.345));
   cylinder(.018,.23,character.body,root,0,1.76,0);ball(.055,character.eyes,root,0,1.9,0);
   if(character.id==='ada'){cylinder(.018,.2,character.body,root,.21,1.75,0);ball(.045,character.eyes,root,.21,1.87,0);}
   const limbs=[];
   for(const side of [-1,1]){
     const leg=new THREE.Group();leg.position.set(side*.19,.53,0);root.add(leg);box(.18,.44,.2,'#314d59',leg,0,-.2,0);box(.24,.12,.36,'#40596a',leg,0,-.44,.07);limbs.push(leg);
     const arm=new THREE.Group();arm.position.set(side*.4,1.04,0);root.add(arm);box(.14,.45,.17,character.body,arm,0,-.2,0);ball(.105,'#e5dfc7',arm,0,-.46,0);limbs.push(arm);
   }
   const satchel=box(.26,.28,.2,character.id==='pip'?'#397e7d':'#ab784f',root,.36,.76,.17);
   return {root,head,body,eyes,limbs,satchel};
 });
 const capsule=ball(.12,'#ffd263',stage,-4,1.18,.5),testWeight=box(.4,.4,.4,'#cf7453',stage,-2,1.1,0);
 const inspectionRing=mesh(new THREE.TorusGeometry(.85,.035,8,32),'#df8460',stage,0,.97,0);inspectionRing.rotation.x=Math.PI/2;
 const amber=new THREE.PointLight('#ffbe57',0,10);amber.position.set(5,3.5,-1.8);world.add(amber);
 const envLoader=new HDRLoader(),pmrem=new THREE.PMREMGenerator(renderer);let environmentTexture,woodTexture;
 const ready=Promise.all([
   assets.environment?envLoader.loadAsync(assets.environment).then(tex=>{environmentTexture=pmrem.fromEquirectangular(tex).texture;world.environment=environmentTexture;world.environmentIntensity=style==='cinematic-story'?.45:.65;tex.dispose();}):Promise.resolve(),
   assets.wood?new THREE.TextureLoader().loadAsync(assets.wood).then(tex=>{woodTexture=tex;tex.colorSpace=THREE.SRGBColorSpace;tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.repeat.set(1,1);for(const m of [...planks,...repair]){m.material.map=tex;m.material.needsUpdate=true;}}):Promise.resolve()
 ]);
 return {
   ready,
   draw(t,spec){
     const s=storyState(t,spec),walking=['approach','cross'].includes(s.action)||(s.action==='fail'&&s.p<.4);
     water.material.uniforms.time.value=t;
     rigs[0].root.position.set(s.pip,.35,0);rigs[1].root.position.set(s.ada,.35,-.3);
     rigs[1].root.visible=!['discover','approach'].includes(s.action);
     rigs.forEach((rig,i)=>{
       const walkPhase=s.action==='cross'?clamp(s.p/.65):s.action==='fail'?clamp(s.p/.4):s.p;
       const stride=walking&&i===0?Math.sin(walkPhase*Math.PI*(s.action==='cross'?16:8))*.55*Math.sin(walkPhase*Math.PI):0;
       rig.limbs[0].rotation.x=stride;rig.limbs[2].rotation.x=-stride;
       rig.limbs[1].rotation.z=(i===1&&['inspect','build','test'].includes(s.action))?-.7*ease(s.p/.15):-.1;
       rig.limbs[3].rotation.z=i===0&&s.action==='cross'?2.5*ease((s.p-.72)/.1):i===0&&['discover','resolve'].includes(s.action)?1*ease(s.p/.2):.1;
       rig.head.rotation.z=s.action==='fail'&&i===0?.15:0;
       rig.root.rotation.z=i===0&&s.action==='fail'?Math.sin(Math.PI*ease(s.p/.25))*.12:0;
       rig.eyes.forEach(eye=>{eye.scale.y=s.action==='fail'&&i===0?1.35:s.action==='resolve'?.65:1;});
       rig.root.rotation.y=i===0?(s.action==='resolve'?-.45:.25):- .25;
       rig.root.position.y=.35+(walking&&i===0?Math.abs(stride)*.08:0);
     });
     planks.forEach((plank,i)=>{plank.visible=!(i>=6&&i<=9);plank.rotation.z=(i===5&&['approach','fail'].includes(s.action))?-.55*ease(s.p/.8):0;});
     repair.forEach((beam,i)=>{beam.visible=s.bridge>(i/3);beam.position.y=.84+(1-ease((s.bridge-i/3)*3))*2;});
     testWeight.visible=s.action==='test'&&s.p<.72;testWeight.position.x=s.weight;testWeight.scale.setScalar(s.p<.35?.65:1.25);
     inspectionRing.visible=s.action==='inspect'&&s.p>.25;
     capsule.position.set(s.pip+.32,1.45,.45);
     if(s.action==='cross'){const lift=ease((s.p-.72)/.1),dock=ease((s.p-.83)/.07);capsule.position.set(s.pip+.32+(5-s.pip-.32)*dock,1.45+.8*lift+1.3*dock,.45-2.25*dock);}
     capsule.visible=s.action!=='resolve'&&!(s.action==='cross'&&s.p>.92);
     lamp.material.emissive.set(s.light>0?'#e99e31':'#000000');lamp.material.emissiveIntensity=s.light*3;amber.intensity=s.light*12;
     windows.forEach((w,i)=>{w.material.emissive.set('#eebd5b');w.material.emissiveIntensity=s.action==='resolve'?ease((s.p-i*.12)*3)*2:0;});
     if(style==='educational-3d'){
       const focused=['inspect','build','test'].includes(s.action);
       camera.position.set((focused?6:9)-1.4*ease(s.p),focused?12:15,(focused?22:25)-1.5*ease(s.p));camera.lookAt(focused?-.8:.2,.9,0);
       camera.fov=focused?42:45;
     }else{
       const wide=s.action==='resolve',inspection=['inspect','build','test'].includes(s.action);
       const targetX=wide?.4:inspection?-1.5:s.action==='fail'?(s.pip+s.ada)/2:s.pip;
       camera.position.set(targetX+(wide?9:inspection?6:3.5),wide?13:inspection?8:5.5,wide?25:inspection?19:13-.7*ease(s.p));
       camera.lookAt(targetX,wide?1:1.5,0);camera.fov=wide?45:inspection?42:36;
       // Within-beat coverage: establish cause, inspect detail, then show reaction.
       const aim=new THREE.Vector3(targetX,wide?1:1.5,0);
       function coverage(x,y,z,tx,ty,tz,blend,fov){camera.position.lerp(new THREE.Vector3(x,y,z),blend);aim.lerp(new THREE.Vector3(tx,ty,tz),blend);camera.fov+=(fov-camera.fov)*blend;}
       if(s.action==='discover')coverage(s.pip+1.6,2.4,5.5,s.pip+.2,1.35,.2,1-ease((s.p-.2)/.1),38);
       if(s.action==='approach')coverage(s.pip+2.8,2.4,8.5,-.8,.9,0,ease((s.p-.57)/.08),37);
       if(inspection)coverage(2.8,4.8,9,s.action==='inspect'?0:-.2,.85,0,ease((s.p-.26)/.08)*(1-ease((s.p-.62)/.08)),38);
       if(s.action==='cross')coverage(8,5,8.5,5,2.4,-1.6,ease((s.p-.72)/.08),40);
       camera.lookAt(aim);
     }
     camera.updateProjectionMatrix();renderer.render(world,camera);
   },
   dispose(){world.traverse(o=>{o.geometry?.dispose();if(o.material)o.material.dispose();});environmentTexture?.dispose();woodTexture?.dispose();pmrem.dispose();renderer.dispose();}
 };
}

export function paintIllustrated(ctx,t,spec,options={}){
 const s=storyState(t,spec),W=1080,H=1920;ctx.save();ctx.clearRect(0,0,W,H);
 const bg=options.sketch?'#f8f3e8':s.light>0?'#ead4a5':'#e4ded0';ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
 const focus=['discover','approach','fail','cross'].includes(s.action);
 // Camera follows intention, then returns wide for the earned resolution.
 const scale=focus?1.25+.1*ease(s.p):1+.07*ease(s.p),anchorX=focus?Math.max(300,Math.min(780,140+(s.pip+4)*96)):540;
 ctx.translate(540,1010);ctx.scale(scale,scale);ctx.translate(-anchorX,-1010);
 const mono=color=>{if(!options.sketch||!/^#[0-9a-f]{6}$/i.test(color))return color;const n=parseInt(color.slice(1),16),v=Math.round(((n>>16)&255)*.299+((n>>8)&255)*.587+(n&255)*.114);return `rgb(${v},${v},${v})`;};
 const line=(x,y,a,b,c='#514d46',w=5)=>{ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(a,b);ctx.strokeStyle=c;ctx.lineWidth=w;ctx.stroke();};
 const rect=(x,y,w,h,c,r=0)=>{ctx.fillStyle=options.sketch?(['#1c333b','#243047','#425b61'].includes(c)?c:'#f3eee4'):c;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();if(options.sketch){ctx.strokeStyle='#414540';ctx.lineWidth=3;ctx.stroke();}};
 const circle=(x,y,r,c)=>{ctx.fillStyle=mono(c);ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();if(options.sketch){ctx.strokeStyle='#414540';ctx.lineWidth=2;ctx.stroke();}};
 // Fixed paper flecks and overlapping hills keep this an illustrated world.
 for(let i=0;i<2000;i++){const x=(i*137)%W,y=(i*257)%H;ctx.fillStyle='#91806b15';ctx.fillRect(x,y,1.5,1.5);}
 for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(0,750+i*100);ctx.bezierCurveTo(300,450+i*160,750,500+i*160,W,760+i*80);ctx.lineTo(W,1300);ctx.lineTo(0,1300);ctx.closePath();ctx.fillStyle=mono(['#c8cab3','#b0c0ab','#8ca89d'][i]);ctx.fill();}
 rect(0,1200,W,720,'#aec5c1');rect(0,1260,360,660,'#8fa883');rect(800,1240,280,680,'#8fa883');
 // Persistent bridge silhouette, with a visible gap until the repair.
 const y=1230;line(290,y,895,y,'#8b7d60',22);rect(450,y-20,200,50,'#aec5c1');
 for(let i=0;i<3;i++)if(s.bridge>i/3)rect(452+i*63,y-17-(1-ease((s.bridge-i/3)*3))*130,61,29,'#cba769');
 for(const x of [305,865]){line(x,y-100,x,y+110,'#685f4e',9);}line(305,y-80,865,y-80,'#7c715a',7);
 // Workshop on the left, tall lighthouse on the far bank.
 rect(20,987,190,225,'#b89e79',8);ctx.beginPath();ctx.moveTo(0,996);ctx.lineTo(119,882);ctx.lineTo(230,996);ctx.fillStyle='#8c6855';ctx.fill();
 rect(885,850,128,386,'#e6d6b4',18);rect(870,818,158,88,'#766d5c',12);circle(951,860,27,s.light>0?'#f4bd59':'#555c58');
 if(s.light>0){ctx.globalAlpha=s.light*.23;ctx.beginPath();ctx.moveTo(951,860);ctx.lineTo(0,420);ctx.lineTo(0,1070);ctx.closePath();ctx.fillStyle='#ffc777';ctx.fill();ctx.globalAlpha=1;}
 const position=x=>140+(x+4)*96;
 spec.bible.characters.forEach((c,i)=>{
   const worldX=i===0?s.pip:s.ada;if(worldX<-6||(i===1&&['discover','approach'].includes(s.action)))return;
   const x=position(worldX),cy=1160,scale=c.height/1.3;
   ctx.save();ctx.translate(x,cy);ctx.scale(scale,scale);
   const walking=i===0&&['approach','cross'].includes(s.action),stride=walking?Math.sin(s.p*Math.PI*12)*18:0;
   line(-20,-8,-25-stride,60,'#425b61',20);line(20,-8,25+stride,60,'#425b61',20);
   rect(-48,-125,96,121,c.body,20);rect(-58,-210,116,85,c.body,22);rect(-46,-188,92,47,c.face,10);
   circle(-22,-164,7,c.eyes);circle(22,-164,7,c.eyes);line(0,-210,0,-238,c.body,5);circle(0,-243,8,c.eyes);
   if(i===1){line(25,-210,25,-232,c.body,5);circle(25,-237,7,c.eyes);}
   const arm=i===1&&['inspect','build','test'].includes(s.action)?-100:i===0&&s.action==='cross'&&s.p>.75?-220:-45;
   line(-49,-100,-74,-43,c.body,16);line(49,-100,88,arm,c.body,16);rect(30,-80,38,42,i===0?'#397e7d':'#ab784f',8);
   if(i===0&&s.action!=='resolve')circle(67,arm,12,'#f4c468');
   if(s.action==='resolve'){ctx.beginPath();ctx.arc(0,-153,17,0,Math.PI);ctx.strokeStyle='#e9ddbc';ctx.lineWidth=3;ctx.stroke();}ctx.restore();
 });
 if(s.action==='test')rect(position(s.weight),1190,40,40,'#bd7553',4);
 if(s.action==='inspect'){
   const p=ease(s.p/.3);line(190,1490,890*p,1490,'#4d766e',7);rect(458,1458,180,66,'#db9b6d');
   // The route drawing supplies the explanation; captions occupy the lower region.
 }
 if(s.action==='resolve')for(let i=0;i<6;i++){const x=830+(i%3)*80,y=1430+Math.floor(i/3)*140;rect(x,y,55,80,'#c3a984');circle(x+28,y+28,10,ease((s.p-i*.08)*3)>0?'#f1c05f':'#5b675f');}
 if(options.sketch){ctx.filter='none';for(let i=0;i<55;i++){const x=60+i*18,y=1370+(i%6)*30;line(x,y,x+15,y-20,'#757b713d',2);}}
 ctx.restore();
}
