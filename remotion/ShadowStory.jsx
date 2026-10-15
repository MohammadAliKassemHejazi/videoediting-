import React from 'react';
import {AbsoluteFill,Audio,Img,OffthreadVideo,Sequence,staticFile,useCurrentFrame,useVideoConfig} from 'remotion';
import {InvitationBeat} from './InvitationBeat.jsx';
import {ShadowTreatment} from './ShadowTreatment.jsx';

function StoryShot({spec,index}){
 const shot=spec.shots[index],start=Math.ceil(shot.at*60),end=index+1<spec.shots.length?Math.ceil(spec.shots[index+1].at*60):Math.ceil(spec.duration*60);
 return <Sequence from={start} durationInFrames={end-start} premountFor={60} name={shot.id+' / '+spec.sceneNames[shot.sceneIndex]}>
  {shot.available?<ShadowTreatment shot={shot}/>:<AbsoluteFill style={{background:'#132032'}}>
   {shot.publicImage?<Img src={staticFile(shot.publicImage)} style={{width:'100%',height:'100%',objectFit:'cover'}}/>:null}
   <div style={{position:'absolute',left:70,top:70,background:'#101c2dec',color:'#fff2df',padding:'22px 32px',font:'600 38px Arial'}}>Storyboard · animation in progress</div>
  </AbsoluteFill>}
 </Sequence>;
}

export function ShadowStory({spec,captionLanguage='en'}){
 const frame=useCurrentFrame(),{fps}=useVideoConfig(),time=frame/fps,captions=captionLanguage==='ar'?spec.captionsAr:spec.captionsEn,caption=captions.find(c=>time>=c.start&&time<c.end);
 return <AbsoluteFill style={{background:'#101c2d'}}>
  <style>{`@font-face{font-family:InterStory;src:url('${staticFile('fonts/inter-latin-700-normal.woff2')}')}@font-face{font-family:ArabicStory;src:url('${staticFile('fonts/noto-sans-arabic-arabic-600-normal.woff2')}')}`}</style>
  <StoryShot spec={spec} index={0}/><StoryShot spec={spec} index={1}/><StoryShot spec={spec} index={2}/><StoryShot spec={spec} index={3}/><StoryShot spec={spec} index={4}/><StoryShot spec={spec} index={5}/><StoryShot spec={spec} index={6}/><StoryShot spec={spec} index={7}/><StoryShot spec={spec} index={8}/><StoryShot spec={spec} index={9}/><StoryShot spec={spec} index={10}/><StoryShot spec={spec} index={11}/><StoryShot spec={spec} index={12}/>
  <Sequence from={Math.ceil(spec.shots[5].at*60)} durationInFrames={192} premountFor={60} name="The missed invitation"><InvitationBeat/></Sequence>
  <Audio src={staticFile('shadow-went-first/voice.wav')} volume={1}/>
  {caption?<div dir={captionLanguage==='ar'?'rtl':'ltr'} style={{position:'absolute',bottom:160,left:110,right:110,textAlign:'center',fontFamily:captionLanguage==='ar'?'ArabicStory':'InterStory',fontWeight:700,fontSize:64,lineHeight:1.3,color:'#fff8ed',textShadow:'0 3px 8px #000, 0 0 4px #000',WebkitTextStroke:'1px #101720'}}>{caption.text}</div>:null}
 </AbsoluteFill>;
}
