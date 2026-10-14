import * as THREE from 'three';
import {M} from '../../lib/memory-draw.js';

// Actual folded card geometry, hinged scenery and shadows; independently drawn assets.
export function createPaperTheatre(canvas){
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false});renderer.setSize(1440,2560,false);renderer.setPixelRatio(1);renderer.setClearColor('#293d42');renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.NeutralToneMapping;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(34,1440/2560,.1,100),target=new THREE.Vector3();
 scene.add(new THREE.HemisphereLight('#fff5d7','#52625b',2.1));const key=new THREE.DirectionalLight('#fff0cc',3.4);key.position.set(-7,12,8);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-10,right:10,top:10,bottom:-10,near:.1,far:40});key.shadow.bias=-.0004;scene.add(key);const fill=new THREE.DirectionalLight('#a2d9dd',.9);fill.position.set(7,4,2);scene.add(fill);
 const mat=color=>new THREE.MeshStandardMaterial({color,roughness:.9}),box=(w,h,d,col,x,y,z)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(col));o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;scene.add(o);return o};
 box(40,.4,40,'#60716b',0,-.75,0);box(10.6,.26,7.9,'#c36550',0,-.34,0);box(10.2,.36,7.5,'#e8d5a9',0,-.15,0);box(10.25,.06,7.5,'#fff0cf',0,.055,0);
 const spine=box(.055,.08,7.3,'#b69b74',0,.10,0);for(let i=0;i<9;i++)box(10.12,.014,7.48,'#d9c498',0,-.32+i*.04,0);
 const page=new THREE.Group();scene.add(page);const flap=new THREE.Mesh(new THREE.BoxGeometry(5.03,.035,7.35),mat('#f2e2bd'));flap.position.x=2.515;flap.receiveShadow=flap.castShadow=true;page.add(flap);page.position.y=.11;
 const cards=[];
 function card(name,w,h){const image=document.createElement('canvas');image.width=image.height=640;const g=image.getContext('2d'),texture=new THREE.CanvasTexture(image);texture.colorSpace=THREE.SRGBColorSpace;const material=new THREE.MeshStandardMaterial({map:texture,transparent:true,alphaTest:.06,side:THREE.DoubleSide,roughness:.96});const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),material),pivot=new THREE.Group();mesh.position.y=h/2;mesh.castShadow=mesh.receiveShadow=true;mesh.customDepthMaterial=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,map:texture,alphaTest:.06});pivot.add(mesh);scene.add(pivot);const item={name,image,g,texture,mesh,pivot,w,h,last:null};cards.push(item);return item}
 const mira=card('mira',5.2,5.2),sam=card('sam',5.2,5.2),machine=card('machine',3.7,5.8),door=card('door',2.1,5.3),robot=card('robot',1.4,1.4),photo=card('photo',3.0,3.0),ticket=card('ticket',1.5,1.5),clock=card('clock',1.8,1.8),trophy=card('trophy',1.4,1.4);
 function draw(o,key,paint){if(o.last===key)return;o.last=key;o.g.clearRect(0,0,640,640);o.g.save();o.g.scale(640/1080,640/1080);paint(o.g);o.g.restore();o.texture.needsUpdate=true}
 function place(o,x,y,z,fold=0){o.pivot.position.set(x,y,z);o.pivot.rotation.set(fold,0,0);o.pivot.visible=true}
 return {seek(t,spec){const s=M.state(t,spec),{index:i,p,age}=s,a=M.actorState(s,'mira'),b=M.actorState(s,'sam'),qt=Math.floor(t*12)/12;cards.forEach(o=>o.pivot.visible=false);const rise=M.ease(age/.58);page.rotation.z=i>0&&age<.65?Math.PI*(1-M.soft(age/.65)):0;page.visible=i>0&&age<.65;
  // Close camera for face reactions; wide views for travel and machinery.
  const coverage=[{x:-.3,y:5.5,z:18},{x:1,y:8.8,z:22},{x:1.2,y:7,z:20},{x:.8,y:6.4,z:18.5},{x:0,y:6.6,z:19.2},{x:.1,y:5.7,z:17.8},{x:.3,y:7,z:17.5},{x:0,y:8,z:21},{x:-.7,y:6.3,z:18.4},{x:0,y:5.5,z:17.5}][i];camera.position.set(coverage.x+(i===1?M.mix(-1.1,.5,M.soft(p)):0),coverage.y,coverage.z);target.set(0,2.4,-.25);camera.lookAt(target);
  let ax=(a.x-540)/190,bx=(b.x-540)/190,ah=a.h/990;if(i===9){ax=-308*5.2/1080;bx=308*5.2/1080;a.reach=b.reach=M.ease((p-.18)/.16);}
  draw(mira,JSON.stringify([a.mood,a.reach,a.walk,a.look,a.tilt,qt]),c=>M.toonActor(c,{...a,x:540,y:1055,h:990,visible:true,reaction:0},qt));place(mira,ax,.13,.7,-(1-rise)*1.25);
  if(b.visible){draw(sam,JSON.stringify([b.mood,b.reach,b.look,qt]),c=>M.toonActor(c,{...b,x:540,y:1055,h:990,visible:true,reaction:0},qt));place(sam,bx,.13,.5,-(1-rise)*1.1)}
  if([2,3,8].includes(i)){draw(machine,i+':'+Math.floor(qt*12),c=>M.machine(c,540,1060,1010,qt,i===8?(age<2.43?0:(age-2.43)*4):i===3&&p>.4?0:-age*1.1));place(machine,i===8?-2.05:2.05,.13,-1.3,-(1-M.ease((age-.12)/.65))*1.5)}
  if([1,4,7].includes(i)){draw(door,'door',c=>{M.box(c,300,80,480,1000,'#43636b',14);M.box(c,340,150,400,870,'#2f444e',12);M.trophy(c,540,230,110,0)});place(door,3.25,.13,-1.8,-(1-M.ease((age-.2)/.6))*1.3)}
  if([1,4,7,9].includes(i)){draw(robot,i,c=>M.robot(c,540,930,780,0,i===1));place(robot,i===1?ax-1: i===7?M.mix(-.6,-3.8,M.soft((p-.5)/.5)):0,.13,1.2);robot.pivot.rotation.z=i===1?Math.sin(a.walk)*.04:0}
  if([0,5,6,8,9].includes(i)){const empty=i===9?0:i===8?1-M.ease((p-.58)/.2):i===6?1:M.ease((p-.43)/.2);draw(photo,Math.floor(empty*100),c=>M.photo(c,540,550,1010,empty,0,{},false));place(photo,i===6?1.7:0,i===6?3.55:5.3,-1.3);photo.pivot.rotation.z=-.07;}
  if([0,3,6,7,8].includes(i)){draw(ticket,'ticket',c=>M.ticket(c,540,540,940,0,0));const hand=M.hand({...a,x:ax*190+540,h:990}),hx=(hand[0]-540)/190,hy=(1550-hand[1])/190;let x=hx,y=hy+.1,z=.85;if(i===6){x=1.15;y=3.6;ticket.mesh.scale.set(1.9,1.9,1)}else ticket.mesh.scale.set(1,1,1);if(i===3){const q=M.ease((p-.43)/.25);x=M.mix(2.05,hx,q);y=M.mix(2.55,hy,q)}if(i===8){const q=M.ease((p-.2)/.28);x=M.mix(hx,-2.05,q);y=M.mix(hy,2.55,q);z=M.mix(.85,-1.28,q);ticket.pivot.visible=p<.53}place(ticket,x,y-.65,z);if(i===8&&p>.53)ticket.pivot.visible=false;ticket.pivot.rotation.z=-.1;}
  if([0,1,6].includes(i)){draw(clock,Math.floor(qt*12),c=>M.clock(c,540,540,465,-age*1.4,qt));place(clock,i===0?2.6:2.4,4.0,-1.1)}
  if(i===7&&p<.55){draw(trophy,'trophy',c=>M.trophy(c,540,950,700,0));place(trophy,-1.1,4,-.4);trophy.pivot.scale.setScalar(Math.max(.01,1-M.ease((p-.3)/.25)))}else trophy.pivot.scale.setScalar(1);
  renderer.render(scene,camera);
 },dispose(){cards.forEach(o=>{o.texture.dispose();o.mesh.geometry.dispose();o.mesh.material.dispose();o.mesh.customDepthMaterial.dispose()});scene.traverse(o=>{if(o.isMesh&&!cards.some(c=>c.mesh===o)){o.geometry.dispose();o.material.dispose()}});renderer.dispose()}};
}
