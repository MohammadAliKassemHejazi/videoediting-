import React,{useRef,useState,useEffect,useLayoutEffect} from 'react';
import {AbsoluteFill,Audio,OffthreadVideo,staticFile,useCurrentFrame,delayRender,continueRender,cancelRender} from 'remotion';
import {referenceStyle,shotZoom} from '../lib/reference-clip-spec.mjs';
import {paintReferenceBack,paintReferenceFront} from '../lib/reference-clip-graphics.js';
import './fonts.css';
export function ReferenceClip({spec,styleId}){
 const t=useCurrentFrame()/60,back=useRef(),front=useRef(),style=referenceStyle(styleId),[handle]=useState(()=>delayRender('Reference clip fonts')),[ready,setReady]=useState(false);
 useEffect(()=>{Promise.all([document.fonts.load('400 265px Anton'),document.fonts.load('600 52px Inter')]).then(()=>setReady(true)).catch(cancelRender)},[]);
 useLayoutEffect(()=>{if(ready){for(const [ref,paint]of [[back,paintReferenceBack],[front,paintReferenceFront]]){const c=ref.current.getContext('2d');c.save();c.scale(4/3,4/3);paint(c,t,styleId,spec);c.restore()}continueRender(handle)}},[ready,t,styleId,spec,handle]);
 return <AbsoluteFill style={{background:'#0b0b0d',overflow:'hidden'}}><Audio src={staticFile('pro-clips/voice.wav')} volume={1}/><Audio src={staticFile('reference-clips/'+styleId+'-sfx.wav')}/><canvas ref={back} width={1440} height={2560} style={{position:'absolute'}}/>{style.shots.filter(s=>t>=s.a&&t<s.b).map(s=>{const [x,y,w,h]=s.rect,z=shotZoom(s,t),videoStyle={width:'100%',height:'100%',objectFit:'cover',objectPosition:'50% 28%',transform:`scale(${z})`,transformOrigin:'50% 30%'};return <div key={s.a} style={{position:'absolute',left:x*4/3,top:y*4/3,width:w*4/3,height:h*4/3,overflow:'hidden'}}><div style={{position:'absolute',inset:0,...(s.masked?{clipPath:`inset(${(1120-y)*4/3}px 0 0 0 round 133px 133px 0 0)`}:{})}}><OffthreadVideo muted src={staticFile('pro-clips/base.mp4')} style={videoStyle}/></div>{s.masked&&<OffthreadVideo muted transparent src={staticFile('pro-clips/person.webm')} style={{...videoStyle,position:'absolute',inset:0}}/>}</div>})}<canvas ref={front} width={1440} height={2560} style={{position:'absolute'}}/></AbsoluteFill>
}
