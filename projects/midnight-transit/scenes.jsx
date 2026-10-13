import React,{useRef,useLayoutEffect,useEffect,useState} from 'react';
import {AbsoluteFill,Audio,staticFile,useCurrentFrame,delayRender,continueRender,cancelRender} from 'remotion';
import * as THREE from 'three';
import {HDRLoader} from 'three/examples/jsm/loaders/HDRLoader.js';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/examples/jsm/postprocessing/OutputPass.js';

const clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x)},mix=(a,b,p)=>a+(b-a)*p;
function makeWorld(canvas){
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false});renderer.setSize(1440,2560,false);renderer.setPixelRatio(1);
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;
 const scene=new THREE.Scene();scene.background=new THREE.Color('#070b12');scene.fog=new THREE.FogExp2('#080d16',.019);
 const camera=new THREE.PerspectiveCamera(43,1440/2560,.1,240);
 const composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,camera));const bloom=new UnrealBloomPass(new THREE.Vector2(1440,2560),.3,.5,1.3);composer.addPass(bloom);composer.addPass(new OutputPass());
 const steel=new THREE.MeshStandardMaterial({color:'#303640',metalness:.86,roughness:.24});
 const silver=new THREE.MeshStandardMaterial({color:'#b6c0ca',metalness:.96,roughness:.19});
 const red=new THREE.MeshStandardMaterial({color:'#cc1428',emissive:'#a50819',emissiveIntensity:2.3,roughness:.3});
 const amber=new THREE.MeshStandardMaterial({color:'#ffd57b',emissive:'#ff972a',emissiveIntensity:1.55,metalness:.15,roughness:.24});
 const architecture=new THREE.MeshStandardMaterial({color:'#11151d',metalness:.68,roughness:.31});
 const add=(geo,mat,pos,parent=scene)=>{const o=new THREE.Mesh(geo,mat);o.position.set(...pos);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;};
 const box=(size,pos,mat=steel,parent)=>add(new THREE.BoxGeometry(...size),mat,pos,parent);
 scene.add(new THREE.HemisphereLight('#a7b8e4','#27131a',1.3));const key=new THREE.DirectionalLight('#c5d2ff',4.2);key.position.set(-12,25,10);key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-30,right:30,top:30,bottom:-30,far:120});scene.add(key);
 const coreLight=new THREE.PointLight('#ffae48',0,85,1.5);coreLight.position.set(0,8,-35);scene.add(coreLight);
 const rim=new THREE.PointLight('#ff173e',100,70,1.6);rim.position.set(-10,12,-17);scene.add(rim);
 const fill=new THREE.PointLight('#8eb9ff',90,40,1.7);fill.position.set(7,13,0);scene.add(fill);
 const ground=new THREE.ShaderMaterial({uniforms:{time:{value:0},release:{value:0}},vertexShader:'varying vec3 p;void main(){p=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec3 p;uniform float time;uniform float release;void main(){float wet=pow(.5+.5*sin(p.x*1.8+sin(p.y*.36)*2.),9.);float rail=exp(-abs(abs(p.x)-2.3)*1.5);float ripple=.5+.5*sin(p.y*.35-time*2.);vec3 c=vec3(.012,.017,.026)+vec3(.5,.006,.025)*rail*(.35+wet*.3)+vec3(.5,.19,.025)*release*wet*ripple;gl_FragColor=vec4(c,1.);}'});
 const floor=add(new THREE.PlaneGeometry(110,220),ground,[0,-.2,-40]);floor.rotation.x=-Math.PI/2;
 for(const x of [-2.3,2.3])box([.12,.12,135],[x,.05,-43],silver);
 for(let z=10;z>-100;z-=2.7){box([6,.09,.18],[0,-.04,z]);for(const x of [-7.5,7.5]){box([.08,13,.08],[x,6.5,z],architecture);box([.10,.1,2],[x,5.5,z],red);}}
 let seed=317;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const windows=new THREE.InstancedMesh(new THREE.PlaneGeometry(.35,.55),new THREE.MeshBasicMaterial({color:'#cbaa83',toneMapped:false}),1800);const dummy=new THREE.Object3D();let wi=0;
 for(let i=0;i<72;i++){const side=i%2?-1:1,x=side*(10+rand()*21),z=15-rand()*125,h=8+rand()*35,w=3+rand()*4;
  box([w,h,4],[x,h/2,z],architecture);
  for(let y=2;y<h-1;y+=1.8)for(let col=0;col<3;col++)if(wi<1800&&rand()>.18){dummy.position.set(x-w*.32+col*w*.32,y,z+2.015);dummy.updateMatrix();windows.setMatrixAt(wi++,dummy.matrix);}
  if(i%5===0)box([.2,h*.7,.15],[x+w/2,h*.52,z+2.12],red);
 }
 windows.count=wi;scene.add(windows);
 const clock=new THREE.Group();clock.position.set(0,8,-35);scene.add(clock);
 const rings=[];for(let i=0;i<5;i++){const g=new THREE.Group();clock.add(g);rings.push(g);add(new THREE.TorusGeometry(4.5+i*.75,.10+i*.018,8,120),i%2?silver:steel,[0,0,-i*.25],g);
  for(let k=0;k<32;k++){const a=k*Math.PI/16,r=4.5+i*.75,o=box([.14,.55,.2],[Math.cos(a)*r,Math.sin(a)*r,-i*.25],k%4===0?amber:steel,g);o.rotation.z=a-Math.PI/2;}
 }
 const bladeGroup=new THREE.Group();clock.add(bladeGroup);const blades=[];for(let i=0;i<12;i++){const pivot=new THREE.Group();pivot.rotation.z=i*Math.PI/6;bladeGroup.add(pivot);const o=box([1.35,5.1,.14],[0,2.9,-.8],steel,pivot);blades.push(o);}
 const hand1=box([.13,4.5,.1],[0,1.9,.1],amber,clock),hand2=box([.16,2.8,.1],[1.3,0,.15],red,clock);hand2.rotation.z=-Math.PI/2;
 const moth=new THREE.Group();scene.add(moth);add(new THREE.CapsuleGeometry(.17,.75,5,12),silver,[0,0,0],moth).rotation.x=Math.PI/2;
 add(new THREE.SphereGeometry(.24,16,12),steel,[0,.05,-.62],moth);for(const x of [-.12,.12])add(new THREE.SphereGeometry(.055,8,8),amber,[x,.11,-.81],moth);
 const wings=[];for(const side of [-1,1]){const pivot=new THREE.Group();moth.add(pivot);wings.push(pivot);
  const geom=new THREE.BufferGeometry();geom.setAttribute('position',new THREE.Float32BufferAttribute([0,0,.1,side*2.1,.18,.35,side*.7,0,-.7, 0,0,.1,side*1.65,-.05,1.1,side*2.1,.18,.35],3));geom.computeVertexNormals();const mat=new THREE.MeshStandardMaterial({color:side===-1?'#9ba8b8':'#d3d9de',metalness:.95,roughness:.2,side:THREE.DoubleSide});add(geom,mat,[0,0,0],pivot);
  for(let i=0;i<5;i++){const vein=box([1.5,.022,.022],[side*.85,.035,-.35+i*.27],steel,pivot);vein.rotation.y=side*(.15+i*.13);}
 }
 const capsule=new THREE.Group();scene.add(capsule);add(new THREE.SphereGeometry(.3,24,16),amber,[0,-.42,.12],capsule);
 add(new THREE.TorusGeometry(.34,.035,8,36),silver,[0,-.42,.12],capsule).rotation.x=Math.PI/2;
 const rainGeo=new THREE.BufferGeometry(),rain=new Float32Array(4200*3);for(let i=0;i<4200;i++){rain[i*3]=(rand()-.5)*60;rain[i*3+1]=rand()*35;rain[i*3+2]=10-rand()*100;}rainGeo.setAttribute('position',new THREE.BufferAttribute(rain,3));
 const rainMat=new THREE.ShaderMaterial({uniforms:{time:{value:0}},transparent:true,depthWrite:false,vertexShader:'uniform float time;void main(){vec3 p=position;p.y=mod(p.y-time*14.,35.);vec4 mv=modelViewMatrix*vec4(p,1.);gl_PointSize=clamp(14./(-mv.z),1.,3.);gl_Position=projectionMatrix*mv;}',fragmentShader:'void main(){gl_FragColor=vec4(.7,.78,.9,.25);}'});scene.add(new THREE.Points(rainGeo,rainMat));
 const shards=[];for(let i=0;i<52;i++){const o=add(new THREE.OctahedronGeometry(.09+rand()*.18),i%3?silver:amber,[0,8,-35]);shards.push({o,a:rand()*Math.PI*2,r:5+rand()*15,z:(rand()-.5)*18});}
 let envTexture;const ready=new Promise((resolve,reject)=>new HDRLoader().load(staticFile('world/studio_small_09.hdr'),texture=>{texture.mapping=THREE.EquirectangularReflectionMapping;scene.environment=texture;scene.environmentIntensity=.55;envTexture=texture;resolve()},undefined,reject));
 return {ready,draw(t){
  const release=smooth((t-9.15)/2.3);ground.uniforms.time.value=t;ground.uniforms.release.value=release;rainMat.uniforms.time.value=t;
  const z=t<3?-9:t<9?mix(-9,-39,smooth((t-3)/6)):mix(-39,-69,smooth((t-9)/6));const y=t<6?7.6:t<9?8.2-.3*Math.sin((t-6)*Math.PI/3):mix(8.2,24,smooth((t-9)/6));
  moth.position.set(t<9?Math.sin(t*.9)*.4:mix(0,7,smooth((t-9)/6)),y,z);moth.rotation.set(.12*Math.sin(t*1.3),t>11?-.45:0,-.12*Math.sin(t*1.8));
  const folding=smooth((t-6.7)/.4)*(1-smooth((t-8.7)/.5));wings.forEach((o,i)=>o.rotation.z=(i?1:-1)*((.25+Math.sin(t*12)*.42)*(1-folding)+folding*1.3));capsule.visible=t<9.2;
  capsule.position.copy(moth.position).lerp(new THREE.Vector3(0,8.42,-35.12),smooth((t-8.55)/.58));
  rings.forEach((o,i)=>{o.rotation.z=t*(i%2?-1:1)*(.06+i*.025);o.scale.setScalar(1+release*(i*.1));});blades.forEach((o,i)=>{o.position.y=4.4-smooth((t-6)/.9)*.8+release*3.5;o.rotation.z=release*.7;});hand1.rotation.z=-t*.28;coreLight.intensity=release*150;
  const retract=smooth((t-6.2)/.45)*(1-smooth((t-9.1)/.45));hand1.scale.y=1-retract*.95;hand2.scale.y=1-retract*.95;
  shards.forEach(({o,a,r,z},i)=>{o.visible=t>=9.2;o.position.set(Math.cos(a)*r*release,8+Math.sin(a)*r*release,-35+z*release);o.rotation.set(t*.7+i,t*.6,t);o.scale.setScalar(1-release*.6);});
  let cp,look;if(t<3){const p=smooth(t/3);cp=[mix(3.1,2,p),8.5,-5.3];look=[0,7.4,-9];}
  else if(t<6){cp=[3.5,9.1,z+7.5];look=[0,y,-27];}
  else if(t<9){const p=smooth((t-6)/3);cp=[mix(3.2,.2,p),y+.7,z+6.2];look=[moth.position.x,y,z-.65];}
  else if(t<12){const p=smooth((t-9)/3);cp=[mix(3,14,p),mix(10,17,p),mix(-24,-12,p)];look=[0,9,-35];}
  else{const p=smooth((t-12)/3);cp=[mix(14,1,p),mix(17,27,p),mix(-12,3,p)];look=[0,12,-40];}
  camera.position.set(...cp);camera.lookAt(...look);renderer.toneMappingExposure=1.2+release*.2;bloom.strength=.3+release*.2;composer.render();
 },dispose(){scene.traverse(o=>{o.geometry?.dispose();if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose()});envTexture?.dispose();composer.dispose();renderer.dispose();}};
}
export function MidnightTransit(){
 const frame=useCurrentFrame(),t=frame/60,ref=useRef(null),world=useRef(null),[handle]=useState(()=>delayRender('Midnight reflection environment')),[ready,setReady]=useState(false);
 useLayoutEffect(()=>{world.current=makeWorld(ref.current);Promise.all([world.current.ready,document.fonts.load('600 108px Inter')]).then(()=>setReady(true)).catch(cancelRender);return()=>world.current?.dispose()},[]);
 useLayoutEffect(()=>{if(ready){world.current.draw(t);continueRender(handle)}},[ready,t,handle]);
 return <AbsoluteFill style={{background:'#070b12'}}><Audio src={staticFile('showcase/midnight-transit/score.wav')}/><canvas ref={ref} width={1440} height={2560} style={{width:1440,height:2560}}/>
 {t>12.1&&<div style={{position:'absolute',bottom:260,left:90,right:90,color:'#ffe7be',fontFamily:'Inter',fontSize:108,fontWeight:600,lineHeight:.94,letterSpacing:-5,opacity:smooth((t-12.1)/.6)}}>MIDNIGHT<br/>TRANSIT<div style={{fontSize:27,letterSpacing:8,marginTop:30}}>LET TIME FLY.</div></div>}
 </AbsoluteFill>;
}
