import React,{useRef,useLayoutEffect,useState,useEffect} from 'react';
import {AbsoluteFill,Audio,staticFile,useCurrentFrame,useVideoConfig,delayRender,continueRender,cancelRender} from 'remotion';
import {createStoryWorld,paintIllustrated,storyState} from './story-director.js';
import './fonts.css';
export const Story=({spec,styleId})=>{
 const frame=useCurrentFrame(),{fps}=useVideoConfig(),t=frame/fps,canvas=useRef(null),world=useRef(null);
 const [ready,setReady]=useState(false),[handle]=useState(()=>delayRender('Story fonts and world'));
 useEffect(()=>{Promise.all([document.fonts.load('600 48px Inter'),document.fonts.load('600 48px "Noto Sans Arabic"'),world.current?.ready]).then(()=>setReady(true)).catch(cancelRender);},[]);
 useLayoutEffect(()=>{
   if(!['illustrated-story','sketch-story'].includes(styleId))world.current=createStoryWorld(canvas.current,spec.bible,styleId,{environment:staticFile('world/studio_small_09.hdr'),wood:staticFile('world/wood.jpg')});
   return()=>{world.current?.dispose();world.current=null;};
 },[styleId,spec.bible]);
 useLayoutEffect(()=>{
   if(!ready)return;
   if(['illustrated-story','sketch-story'].includes(styleId)){const ctx=canvas.current.getContext('2d');ctx.save();ctx.scale(4/3,4/3);paintIllustrated(ctx,t,spec,{sketch:styleId==='sketch-story'});ctx.restore();}
   else world.current.draw(t,spec);
   continueRender(handle);
 },[t,spec,styleId,ready,handle]);
 const s=storyState(t,spec),caption=spec.captions.find(c=>t>=c.start&&t<c.end)?.text||'';
 const education=styleId==='educational-3d',dark=styleId==='cinematic-story';
 return <AbsoluteFill style={{background:dark?'#142a37':'#e4ded0',fontFamily:spec.language==='ar'?'Noto Sans Arabic':'Inter',color:dark?'#f1e9d8':'#293e3e'}}>
   <Audio src={staticFile(spec.audio)} volume={1}/>
   <canvas ref={canvas} width={1440} height={2560} style={{width:1080,height:1920,position:'absolute'}}/>
   {t<3&&<div style={{position:'absolute',left:70,right:70,top:125,fontSize:64,fontWeight:750,lineHeight:1.08}}>{spec.title}</div>}
   {education&&['inspect','build','test'].includes(s.action)&&<div style={{position:'absolute',left:70,right:70,bottom:430,background:'#f4ecd8eb',borderRadius:20,padding:30,fontSize:43,lineHeight:1.25}}>{s.action==='inspect'?'1 · Inspect every connection':s.action==='build'?'2 · Repair the weak point':'3 · Test with a small load first'}</div>}
   {caption&&<div dir={spec.language==='ar'?'rtl':'ltr'} style={{position:'absolute',bottom:135,left:75,right:75,display:'flex',justifyContent:'center'}}><span style={{fontSize:48,fontWeight:600,lineHeight:1.28,background:dark?'#10202cea':'#faf0daeb',color:dark?'#fff3dc':'#243d3e',padding:'18px 26px',borderRadius:16,textAlign:'center'}}>{caption}</span></div>}
   {dark&&<><div style={{position:'absolute',top:0,width:'100%',height:62,background:'#0a161d'}}/><div style={{position:'absolute',bottom:0,width:'100%',height:62,background:'#0a161d'}}/></>}
 </AbsoluteFill>;
};
