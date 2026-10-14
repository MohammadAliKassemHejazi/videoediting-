import React,{useRef,useEffect,useLayoutEffect,useState} from 'react';
import {AbsoluteFill,Audio,OffthreadVideo,staticFile,useCurrentFrame,delayRender,continueRender,cancelRender} from 'remotion';
import {paintClipBack,paintClipFront,cutaway} from '../lib/pro-clip-graphics.js';
import {proStyle,clipCamera} from '../lib/pro-clip-spec.mjs';
import './fonts.css';
export function ProClip({spec,styleId}){
 const t=useCurrentFrame()/60,back=useRef(null),front=useRef(null),style=proStyle(styleId),zoom=clipCamera(styleId,t),[handle]=useState(()=>delayRender('Pro edit fonts')),[ready,setReady]=useState(false);
 useEffect(()=>{Promise.all([document.fonts.load('400 490px Anton'),document.fonts.load('600 49px Inter'),document.fonts.load('600 73px "Source Serif 4"')]).then(()=>setReady(true)).catch(cancelRender)},[]);
 useLayoutEffect(()=>{if(ready){for(const [ref,paint]of [[back,paintClipBack],[front,paintClipFront]]){const c=ref.current.getContext('2d');c.save();c.scale(4/3,4/3);paint(c,t,styleId,spec);c.restore()}continueRender(handle)}},[t,styleId,spec,ready,handle]);
 const camera={position:'absolute',width:1440,height:2560,transform:`scale(${zoom})`,transformOrigin:`50% ${style.anchor*100}%`};
 const grade=styleId==='clip-paper-evidence'?'saturate(.26) contrast(1.06) brightness(1.01)':styleId==='clip-redline'?'saturate(.72) contrast(1.075) brightness(.985)':styleId==='clip-acid-print'?'saturate(.82) contrast(1.05)':styleId==='clip-chrome-depth'?'saturate(.85) contrast(1.04)':'saturate(.95) contrast(1.035)';
 return <AbsoluteFill style={{background:'#11151b',overflow:'hidden'}}>
 <Audio src={staticFile('pro-clips/voice.wav')} volume={1}/><Audio src={staticFile('pro-clips/'+styleId+'-sfx.wav')}/>
 <OffthreadVideo muted src={staticFile('pro-clips/base.mp4')} style={{...camera,filter:grade}}/>
 <canvas ref={back} width={1440} height={2560} style={{position:'absolute'}}/>
 {!cutaway(styleId,t)&&<OffthreadVideo muted transparent src={staticFile('pro-clips/person.webm')} style={{...camera,filter:grade}}/>}
 <canvas ref={front} width={1440} height={2560} style={{position:'absolute'}}/>
 </AbsoluteFill>;
}
