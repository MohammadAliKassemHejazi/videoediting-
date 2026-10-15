import React from 'react';
import {AbsoluteFill,interpolate,useCurrentFrame} from 'remotion';

export function InvitationBeat(){
 const frame=useCurrentFrame(),arrival=interpolate(frame,[0,18],[70,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
 return <AbsoluteFill style={{background:'#101c2d',color:'#fff2df',fontFamily:'InterStory,Arial,sans-serif',padding:140,boxSizing:'border-box'}}>
  <div style={{height:'100%',border:'16px solid #34445b',borderRadius:110,padding:'130px 75px',background:'#162439',boxShadow:'0 35px 90px #0009',boxSizing:'border-box'}}>
   <div style={{display:'flex',alignItems:'center',gap:30,borderBottom:'2px solid #40506b',paddingBottom:65}}>
    <div style={{width:118,height:118,borderRadius:59,background:'#ba9ed0',display:'grid',placeItems:'center',fontSize:68,fontWeight:700,color:'#17263b'}}>R</div>
    <div><div style={{fontSize:72,fontWeight:700}}>RAMI</div><div style={{fontSize:35,color:'#b1bfd1',marginTop:14}}>Earlier today · 4:12 PM</div></div>
   </div>
   <div style={{marginTop:160,padding:65,borderRadius:'12px 65px 65px 65px',background:'#38415d',translate:`0 ${arrival}px`,opacity:interpolate(frame,[0,12],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'})}}>
    <svg width="270" height="230" viewBox="0 0 270 230"><ellipse cx="126" cy="111" rx="68" ry="68" fill="#76a5be"/><ellipse cx="126" cy="111" rx="111" ry="29" stroke="#e4ba69" strokeWidth="12" fill="none" transform="rotate(-22 126 111)"/></svg>
    <div style={{fontSize:72,lineHeight:1.35,fontWeight:600}}>Birthday in the<br/>art room.</div>
    <div style={{fontSize:64,lineHeight:1.4,marginTop:48}}>I saved you a seat.</div>
    <div style={{fontSize:40,color:'#bfbed4',marginTop:60}}>Today · 6:00 PM</div>
   </div>
   <div style={{marginTop:120,border:'2px solid #697084',borderRadius:55,padding:'35px 45px',color:'#bec9d5',fontSize:46}}>Reply later</div>
   <div style={{marginTop:45,fontSize:36,color:'#92a3b9'}}>Read · No reply</div>
  </div>
 </AbsoluteFill>;
}
