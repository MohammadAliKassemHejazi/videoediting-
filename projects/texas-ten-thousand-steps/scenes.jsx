import React,{useEffect,useState} from 'react';
import {AbsoluteFill,Audio,Img,OffthreadVideo,Sequence,staticFile,useCurrentFrame,useVideoConfig,delayRender,continueRender,cancelRender} from 'remotion';
import propTracks from '../../remotion/texas-steps-tracks.json';
const clamp=x=>Math.max(0,Math.min(1,x));
const file=(path,version)=>staticFile(path)+(version?'?v='+version:'');
const mediaStyle={width:'100%',height:'100%',objectFit:'cover'};
function WatchPatch({shot,frame}){
 const track=propTracks[shot.id];if(!track)return null;
 const t=(Math.round(shot.sourceStart*60)/60+frame/60*shot.playbackRate)*24,index=Math.max(0,Math.min(track.frames.length-1,t));
 const lo=track.frames[Math.floor(index)],hi=track.frames[Math.min(track.frames.length-1,Math.ceil(index))],mix=index-Math.floor(index);
 const matrix=lo.matrix.map((v,i)=>v+(hi.matrix[i]-v)*mix),opacity=lo.visibility+(hi.visibility-lo.visibility)*mix;
 const c=track.configuration,[x,y]=c.center,width=c.patchWidth||38,height=c.patchHeight||17,id='counter-'+shot.id;
 return <svg viewBox="0 0 352 640" preserveAspectRatio="xMidYMid slice" style={{position:'absolute',inset:0,width:'100%',height:'100%',opacity}}><defs><radialGradient id={id}><stop offset="0" stopColor="#ffdb83"/><stop offset="1" stopColor="#ecad47"/></radialGradient><filter id={id+'-edge'}><feGaussianBlur stdDeviation=".4"/></filter></defs><g transform={`matrix(${matrix.join(' ')})`}><g transform={`translate(${x} ${y}) rotate(${c.angle||0})`}><rect x={-width/2} y={-height/2} width={width} height={height} rx="1.8" fill={`url(#${id})`} stroke="#80460d" strokeWidth=".6" filter={`url(#${id+'-edge'})`}/><text x="0" y={c.fontSize*.34} textAnchor="middle" fontFamily="Arial,sans-serif" fontWeight="700" fontSize={c.fontSize||13} fill="#643009" textLength={c.textWidth||31} lengthAdjust="spacingAndGlyphs">{c.text||'8400'}</text></g></g></svg>;
}
function Ink({amount,incoming=false}){
 const x=1640-amount*1840,edge=Array.from({length:25},(_,i)=>[x+Math.sin(i*1.71)*42+Math.sin(i*.47)*24,i*120-150]),side=incoming?-200:1640;
 return <svg viewBox="0 0 1440 2560" preserveAspectRatio="none" style={{position:'absolute',inset:0,width:'100%',height:'100%'}}><defs><filter id="steps-ink-feather"><feGaussianBlur stdDeviation="9"/></filter></defs><polygon points={[[side,-200],...edge,[side,2800]].map(p=>p.join(',')).join(' ')} fill="#07090d" filter="url(#steps-ink-feather)"/></svg>;
}
function Picture({shot}){
 const frame=useCurrentFrame();
 let camera={};if(shot.id==='01'){const p=clamp((frame/60-.25)/1.45),e=1-(1-p)**3,scale=2.7-1.7*e,x=167/352*1440*(1-e)+720*e,y=425/640*2560*(1-e)+1280*e;camera={transformOrigin:'0 0',transform:`translate(${720-x*scale}px,${1280-y*scale}px) scale(${scale})`}}
 if(shot.id==='28'){const p=clamp((frame/60-.25)/2.75),e=p*p*(3-2*p),scale=1+1.7*e,x=720*(1-e)+190/352*1440*e,y=1280*(1-e)+165/640*2560*e;camera={transformOrigin:'0 0',transform:`translate(${720-x*scale}px,${1280-y*scale}px) scale(${scale})`}}
 return <AbsoluteFill style={{background:'#07090d'}}>
  <AbsoluteFill style={camera}><AbsoluteFill style={{filter:shot.world==='PRESENT'?'saturate(.72) brightness(.9) contrast(1.05)':shot.id==='14'?'saturate(.65) brightness(.94) contrast(1.04)':'grayscale(1) sepia(.22) brightness(.95) contrast(1.04)'}}>{shot.available?<OffthreadVideo name={shot.id+' actual H3 animation'} src={file(shot.source,shot.version)} muted trimBefore={Math.round(shot.sourceStart*60)} playbackRate={shot.playbackRate} style={mediaStyle}/>:shot.imageAvailable?<Img src={file(shot.keyframe,shot.imageVersion)} style={mediaStyle}/>:<AbsoluteFill style={{justifyContent:'center',alignItems:'center',padding:100,color:'#e6d3b4',font:'500 48px Arial',textAlign:'center'}}>Scene{shot.id} · {shot.world}<br/>Artwork in production</AbsoluteFill>}{shot.available?<WatchPatch shot={shot} frame={frame}/>:null}</AbsoluteFill></AbsoluteFill>
  {shot.transitionIn==='ink-reveal'&&frame<18?<Ink amount={clamp(frame/16)} incoming/>:null}
  {shot.transitionOut==='ink-cover'&&frame>shot.durationFrames-20?<Ink amount={clamp((frame-shot.durationFrames+20)/17)}/>:null}
 </AbsoluteFill>;
}
function Shot({spec,index}){const shot=spec.shots[index];return <Sequence from={shot.startFrame} durationInFrames={shot.durationFrames} premountFor={60} name={shot.id+' / '+shot.world+' / '+shot.voiceover}><Picture shot={shot}/></Sequence>}
function Word({spec,time}){
 const word=(spec.captionWords||spec.words).findLast(w=>time>=w.start-.025);
 if(!word||time>word.end+.18)return null;
 return <div style={{position:'absolute',left:90,right:90,bottom:195,textAlign:'center',textTransform:'uppercase',fontFamily:'CasefileSerif,Georgia,serif',fontWeight:600,fontSize:92,lineHeight:1.15,color:'#fff9ef',textShadow:'0 3px 12px #090b10,0 1px 4px #090b10',WebkitTextStroke:'.65px #191717'}}>{word.text}</div>;
}
export function TexasStepsEpisode({spec}){
 const frame=useCurrentFrame(),{fps}=useVideoConfig(),time=frame/fps;
 const [fontHandle]=useState(()=>delayRender('Casefile serif'));
 useEffect(()=>{document.fonts.load('600 92px CasefileSerif').then(()=>continueRender(fontHandle)).catch(cancelRender)},[fontHandle]);
 return <AbsoluteFill style={{background:'#07090d'}}>
  <style>{`@font-face{font-family:CasefileSerif;src:url('${staticFile(spec.font)}');font-weight:600;font-style:normal}`}</style>
  <Shot spec={spec} index={0}/><Shot spec={spec} index={1}/><Shot spec={spec} index={2}/><Shot spec={spec} index={3}/><Shot spec={spec} index={4}/><Shot spec={spec} index={5}/><Shot spec={spec} index={6}/><Shot spec={spec} index={7}/><Shot spec={spec} index={8}/><Shot spec={spec} index={9}/><Shot spec={spec} index={10}/><Shot spec={spec} index={11}/><Shot spec={spec} index={12}/><Shot spec={spec} index={13}/><Shot spec={spec} index={14}/><Shot spec={spec} index={15}/><Shot spec={spec} index={16}/><Shot spec={spec} index={17}/><Shot spec={spec} index={18}/><Shot spec={spec} index={19}/><Shot spec={spec} index={20}/><Shot spec={spec} index={21}/><Shot spec={spec} index={22}/><Shot spec={spec} index={23}/><Shot spec={spec} index={24}/><Shot spec={spec} index={25}/><Shot spec={spec} index={26}/><Shot spec={spec} index={27}/>
  <AbsoluteFill style={{background:'radial-gradient(ellipse at 50% 46%,transparent 48%,rgba(5,8,16,.15) 100%)',pointerEvents:'none'}}/>
  {spec.audio?<Audio name="Continuous original performances and score" src={file(spec.audio,spec.audioVersion)} playbackRate={spec.audioPlaybackRate||1}/>:null}
  <Word spec={spec} time={time}/>
  {!spec.complete?<div style={{position:'absolute',top:38,left:45,right:45,padding:'15px 22px',background:'#0b1521dd',borderRadius:10,color:'#fff3dc',font:'500 30px Arial'}}>Episode2 production · {spec.readyCount}/28 animated · other scenes are labeled artwork</div>:null}
  <AbsoluteFill style={{background:'#07090d',opacity:clamp((time-spec.duration+.36)/.36),pointerEvents:'none'}}/>
 </AbsoluteFill>;
}
