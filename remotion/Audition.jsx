import React, {useEffect,useLayoutEffect,useRef,useState} from 'react';
import {AbsoluteFill,OffthreadVideo,Sequence,staticFile,useCurrentFrame,useVideoConfig,delayRender,continueRender,cancelRender} from 'remotion';
import {paintAudition,styleById} from '../lib/style-auditions.js';
import './fonts.css';

export const Audition=({spec,styleId,graphicsOnly=false})=>{
 const frame=useCurrentFrame(),{fps}=useVideoConfig(),canvas=useRef(null),t=frame/fps+spec.start;
 const [fontHandle]=useState(()=>delayRender('Load local audition fonts')),[fontsReady,setFontsReady]=useState(false);
 useEffect(()=>{Promise.all([document.fonts.load('600 44px Inter'),document.fonts.load('600 44px "Source Serif 4"')]).then(()=>setFontsReady(true)).catch(cancelRender);},[]);
 const style=styleById(styleId),caption=spec.captions.find(([a,b])=>t>=a&&t<b)?.[2]||'';
 useLayoutEffect(()=>{if(fontsReady){const ctx=canvas.current.getContext('2d');ctx.save();ctx.scale(4/3,4/3);paintAudition(ctx,t,spec,styleId);ctx.restore();continueRender(fontHandle);}},[t,spec,styleId,fontsReady,fontHandle]);
 const speakerVisible=t<3.14||t>=13.18;
 return <AbsoluteFill style={{background:graphicsOnly&&speakerVisible?'transparent':style.bg,fontFamily:'Inter'}}>
   {!graphicsOnly&&<Sequence name="Original speaker and voice" from={0} durationInFrames={Math.round(spec.duration*fps)} premountFor={fps}>
     <OffthreadVideo src={staticFile(spec.media)} trimBefore={Math.round(spec.start*fps)} volume={1} style={{position:'absolute',top:0,width:1080,height:1920,objectFit:'cover',objectPosition:'50% 43%',opacity:speakerVisible?1:0}}/>
   </Sequence>}
   <canvas ref={canvas} width={1440} height={1467} style={{position:'absolute',top:330,width:1080,height:1100,opacity:speakerVisible?0:1}}/>
   {caption&&<div style={{position:'absolute',bottom:125,left:60,right:60,display:'flex',justifyContent:'center'}}><span style={{fontSize:53,fontWeight:750,textAlign:'center',lineHeight:1.2,background:'#101215ec',color:'#fff',padding:'15px 25px',borderRadius:15}}>{caption}</span></div>}
 </AbsoluteFill>;
};
