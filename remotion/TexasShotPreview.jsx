import React from 'react';
import {AbsoluteFill,Img,OffthreadVideo,staticFile} from 'remotion';

export const TexasShotPreview=({spec})=><AbsoluteFill style={{backgroundColor:'#101725'}}>
  {spec.video?<OffthreadVideo src={staticFile(spec.video)+(spec.version?'?v='+spec.version:'')} muted trimBefore={8} style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<Img src={staticFile(spec.image)} style={{width:'100%',height:'100%',objectFit:'cover'}}/>}
  <div style={{position:'absolute',left:50,right:50,top:45,padding:'18px 24px',borderRadius:12,backgroundColor:'rgba(10,16,27,.82)',color:'#fff3d4',fontFamily:'sans-serif',fontSize:30,lineHeight:1.3}}>{spec.video?'H3 source shot • review in progress':'Character keyframe • H3 animation test in progress'}</div>
</AbsoluteFill>;
