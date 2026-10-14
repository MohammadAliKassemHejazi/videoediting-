import React,{useRef,useEffect,useLayoutEffect,useState} from 'react';
import {AbsoluteFill,Audio,OffthreadVideo,staticFile,useCurrentFrame,delayRender,continueRender,cancelRender} from 'remotion';
import {varietyStyle,shotZoom,shotFitY} from '../lib/variety-clip-spec.mjs';
import {paintVarietyBack,paintVarietyFront} from '../lib/variety-clip-graphics.js';
import './fonts.css';
export function VarietyClip({spec,styleId}){
 const t=useCurrentFrame()/60,back=useRef(null),front=useRef(null),[handle]=useState(()=>delayRender('Variety assets')),[assets,setAssets]=useState(null),style=varietyStyle(styleId);
 useEffect(()=>{const freeze=new Image();Promise.all([document.fonts.load('400 350px Anton'),document.fonts.load('600 52px Inter'),new Promise((resolve,reject)=>{freeze.onload=resolve;freeze.onerror=reject;freeze.src=staticFile('variety-clips/freeze.png')})]).then(()=>setAssets({freeze})).catch(cancelRender)},[]);
 useLayoutEffect(()=>{if(assets){for(const [ref,paint]of [[back,paintVarietyBack],[front,paintVarietyFront]]){const c=ref.current.getContext('2d');c.save();c.scale(4/3,4/3);paint(c,t,styleId,ref===back?assets:spec);c.restore()}continueRender(handle)}},[assets,t,styleId,spec,handle]);
 return <AbsoluteFill style={{background:'#111',overflow:'hidden'}}><Audio src={staticFile('pro-clips/voice.wav')} volume={1}/><Audio src={staticFile('variety-clips/'+styleId+'-sfx.wav')}/><canvas ref={back} width={1440} height={2560} style={{position:'absolute'}}/>{style.shots.filter(s=>t>=s.a&&t<s.b).map((s,i)=>{const [x,y,w,h]=s.rect;return <div key={s.a} style={{position:'absolute',left:x*4/3,top:y*4/3,width:w*4/3,height:h*4/3,overflow:'hidden'}}><OffthreadVideo muted src={staticFile('pro-clips/base.mp4')} style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:`50% ${shotFitY(s)*100}%`,transform:`scale(${shotZoom(s,t)})`,transformOrigin:'50% 30%',filter:styleId==='clip-sketch-interrupt'?'grayscale(1) contrast(1.04)':undefined}}/></div>})}<canvas ref={front} width={1440} height={2560} style={{position:'absolute'}}/></AbsoluteFill>
}
