import React from 'react';
import {AbsoluteFill,Img,OffthreadVideo,staticFile,useCurrentFrame,useVideoConfig} from 'remotion';

const clamp=(x)=>Math.max(0,Math.min(1,x));
const ease=x=>{x=clamp(x);return x*x*(3-2*x)};

// A single featureless design. Motion performs the narrated action; the model
// never gets to turn a magical shadow into a second, flesh-faced character.
function Silhouette({walk=0,point=0}){
 const stride=Math.sin(walk*Math.PI*2)*14;
 return <g fill="#0b1024" style={{filter:'drop-shadow(0px 0px 1px #8771aa)'}}>
  <path d="M-26-231Q-38-266-5-277Q30-280 34-245L40-218Q24-212 17-219Q0-201-18-217L-38-216Z"/>
  <path d="M-10-225H12V-202H-10Z"/>
  <path d="M-24-210Q0-219 25-209Q36-191 31-169L34-118Q4-105-33-117L-30-169Q-36-193-24-210Z"/>
  <g transform={`translate(-22 -199) rotate(${point*99-stride*.6})`}><path d="M0 0Q-17 4-17 22L-14 74Q-16 84-9 88Q0 91 3 81L5 39 9 10Z"/></g>
  <g transform={`translate(23 -199) rotate(${stride*.6})`}><path d="M0 0Q16 4 17 22L14 74Q17 83 9 88Q0 91-3 81L-5 39-9 10Z"/></g>
  <g transform={`translate(-15 -116) rotate(${stride})`}><path d="M-17 0Q-1-5 15 0L10 95Q12 101 10 108L-24 108Q-28 100-13 96Q-24 51-17 0Z"/></g>
  <g transform={`translate(16 -116) rotate(${-stride})`}><path d="M-15 0Q0-6 17 0Q22 49 14 95Q26 100 24 108H-10Q-13 102-10 95L-12 44Z"/></g>
 </g>;
}

export function ShadowTreatment({shot}){
 const frame=useCurrentFrame(),{fps}=useVideoConfig(),t=frame/fps,id=shot.id;
 const video=<OffthreadVideo src={staticFile(shot.publicVideo)+(shot.version?'?v='+shot.version:'')} trimBefore={Math.round(shot.in*fps)} muted style={{width:'100%',height:'100%',objectFit:'cover'}} onError={e=>{throw Error('Shot '+id+': '+e.message)}}/>;
 let crop=null;
 if(id==='07'&&t>=1.8)crop={scale:1.72,x:84,y:39};
 if(id==='02'&&t>=2.3)crop={scale:1.5,x:50,y:100};
 const base=crop?<AbsoluteFill style={{transform:`scale(${crop.scale})`,transformOrigin:`${crop.x}% ${crop.y}%`}}>{video}</AbsoluteFill>:video;
 if(id==='02'){
  const p=ease((t-.15)/2);
  return <AbsoluteFill style={{overflow:'hidden'}}>{base}
   {t<2.3?<svg viewBox="0 0 448 800" style={{position:'absolute',width:'100%',height:'100%',mixBlendMode:'multiply',filter:'blur(1px)'}}><g opacity={1-ease((p-.9)/.1)} transform={`translate(${390-344*p} ${750-265*p}) rotate(-43) scale(${.95-.84*p} ${1.1-.98*p})`}><Silhouette walk={t*1.7} point={.8}/></g></svg>:null}
  </AbsoluteFill>;
 }
 if(id==='10'&&t>=1.3){
  const p=ease((t-1.3)/2.9),rootX=253,rootY=493;
  return <AbsoluteFill style={{overflow:'hidden'}}><AbsoluteFill style={{transform:'scale(1.22)',transformOrigin:'50% 80%'}}>
   <Img src={staticFile('shadow-went-first/images/10-clean.png')} style={{width:'100%',height:'100%'}}/>
   <svg viewBox="0 0 448 800" style={{position:'absolute',width:'100%',height:'100%',mixBlendMode:'multiply',filter:'blur(1.2px)'}}><g opacity=".88" transform={`translate(${rootX-78*(1-p)} ${rootY+132*(1-p)}) rotate(-154) scale(.82 .94)`}><Silhouette walk={(1-p)*1.4}/></g></svg>
  </AbsoluteFill></AbsoluteFill>;
 }
 return <AbsoluteFill style={{overflow:'hidden'}}>{base}
  {id==='09'&&t>=2.9&&t<4.4?<svg viewBox="0 0 448 800" style={{position:'absolute',width:'100%',height:'100%',filter:'blur(1px)'}}><path d={`M244 498 Q${235+(t-2.9)*5} 481 244 ${472-(t-2.9)*17} Q255 ${460-(t-2.9)*17} 244 ${452-(t-2.9)*17}`} fill="none" stroke="#bbc5d1" strokeWidth="2" opacity={.38*(1-(t-2.9)/1.5)}/></svg>:null}
  {id==='01'?<Img src={staticFile('shadow-went-first/images/01-clean.png')} style={{position:'absolute',width:'100%',height:'100%',maskImage:'linear-gradient(to right, black 0%, black 49%, transparent 51%)'}}/>:null}
  {id==='00'||id==='01'?<svg viewBox="0 0 448 800" style={{position:'absolute',width:'100%',height:'100%'}}>
   {id==='00'?<g transform={`translate(${115-42*ease(t/6.5)} ${550-55*ease(t/6.5)}) scale(${.75-.16*ease(t/6.5)})`}><Silhouette walk={t*1.3}/></g>:<g opacity={1-ease((t-5.1)/.6)} transform={`translate(${145-188*ease((t-2.2)/3.4)} 557) scale(.97)`}><Silhouette point={1-ease((t-1.7)/.5)} walk={Math.max(0,t-2.2)*1.6}/></g>}
  </svg>:null}
 </AbsoluteFill>;
}
