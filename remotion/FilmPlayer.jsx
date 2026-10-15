import React from 'react';
import {AbsoluteFill,OffthreadVideo,staticFile} from 'remotion';

// The source is an actual encoded animation/film. Remotion owns media seeking.
export function FilmPlayer({file,muted=false}){
 return <AbsoluteFill style={{background:'#101b20'}}>
  <OffthreadVideo src={staticFile(file)} muted={muted} style={{width:'100%',height:'100%',objectFit:'cover'}} onError={error=>{throw new Error('Cannot play '+file+': '+error.message)}}/>
 </AbsoluteFill>;
}
