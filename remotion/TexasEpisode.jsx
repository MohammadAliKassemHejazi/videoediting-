import React,{useEffect,useState} from 'react';
import {AbsoluteFill,Audio,Img,OffthreadVideo,Sequence,staticFile,useCurrentFrame,useVideoConfig,delayRender,continueRender,cancelRender} from 'remotion';
import propTracks from './texas-tracks.json';

const clamp=x=>Math.max(0,Math.min(1,x));
const file=(path,version)=>staticFile(path)+(version?'?v='+version:'');

function InkEdge({amount,incoming=false}){
 const x=1640-amount*1840;
 const edge=Array.from({length:25},(_,i)=>[x+Math.sin(i*1.71)*42+Math.sin(i*.47)*24,i*120-150]);
 const side=incoming?-200:1640;
 const points=[[side,-200],...edge,[side,2800]].map(p=>p.join(',')).join(' ');
 return <svg viewBox="0 0 1440 2560" preserveAspectRatio="none" style={{position:'absolute',inset:0,width:'100%',height:'100%'}}><defs><filter id="texas-ink-feather"><feGaussianBlur stdDeviation="9"/></filter></defs><polygon points={points} fill="#07090d" filter="url(#texas-ink-feather)"/></svg>;
}

function ShotPicture({shot}){
 const frame=useCurrentFrame();
 return <AbsoluteFill style={{background:'#10131b'}}>
  {shot.available?<OffthreadVideo name={shot.id+' H3 animation'} src={file(shot.source,shot.version)} muted trimBefore={Math.round(shot.sourceStart*60)} playbackRate={shot.playbackRate} style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<Img src={file(shot.keyframe,shot.imageVersion)} style={{width:'100%',height:'100%',objectFit:'cover'}}/>}
  {shot.available&&propTracks[shot.id]?.kind==='hub'?<TrackedHub shot={shot} frame={frame} track={propTracks[shot.id]}/>:null}
  {shot.transitionIn==='ink-reveal'&&frame<20?<InkEdge amount={clamp(frame/17)} incoming/>:null}
  {['03','14'].includes(shot.id)&&frame>shot.durationFrames-18?<InkEdge amount={clamp((frame-shot.durationFrames+18)/15)}/>:null}
 </AbsoluteFill>;
}

function TrackedHub({shot,frame,track}){
 const index=Math.max(0,Math.min(track.frames.length-1,(Math.round(shot.sourceStart*60)/60+frame/60*shot.playbackRate)*24));
 const lo=track.frames[Math.floor(index)],hi=track.frames[Math.min(track.frames.length-1,Math.ceil(index))],mix=index-Math.floor(index);
 const matrix=lo.matrix.map((v,i)=>v+(hi.matrix[i]-v)*mix),opacity=lo.visibility+(hi.visibility-lo.visibility)*mix;
 const {center:[x,y],axes:[rx,ry],angle}=track.configuration;
 const gradient='hub-gold-'+shot.id;
 return <svg viewBox="0 0 352 640" preserveAspectRatio="xMidYMid slice" style={{position:'absolute',inset:0,width:'100%',height:'100%',opacity}}><defs><radialGradient id={gradient}><stop offset="0" stopColor="#ffdc80"/><stop offset="1" stopColor="#f9c763"/></radialGradient><filter id={gradient+'-edge'}><feGaussianBlur stdDeviation=".65"/></filter></defs><g transform={`matrix(${matrix.join(' ')})`}><g transform={`translate(${x} ${y}) rotate(${angle}) scale(1 ${ry/rx})`}><ellipse rx={rx*.88} ry={rx*.3} fill={`url(#${gradient})`} filter={`url(#${gradient+'-edge'})`}/><text x="0" y="1.85" fontFamily="Georgia,serif" fontWeight="bold" fontSize={rx*.24} textAnchor="middle" fill="#56351d" textLength={rx*1.58} lengthAdjust="spacingAndGlyphs">CONTROL</text></g></g></svg>;
}

function StoryShot({spec,index}){
 const shot=spec.shots[index];
 return <Sequence from={shot.startFrame} durationInFrames={shot.durationFrames} premountFor={60} name={shot.id+' / '+shot.world+' / '+shot.voiceover}><ShotPicture shot={shot}/></Sequence>;
}

function Captions({spec,time}){
 const phrase=spec.captionPhrases.find((p,i)=>time>=p[0].start-.025&&time<Math.min(spec.captionPhrases[i+1]?.[0].start-.025||90,p.at(-1).end+.18));
 if(!phrase)return null;
 const active=phrase.findLast(w=>time>=w.start-.025);
 if(active?.text==='MYTH.')return null;
 const visible=phrase.filter(w=>w.text!=='MYTH.');
 return <div style={{position:'absolute',left:105,right:105,bottom:195,textAlign:'center',fontFamily:'TexasSerif,Georgia,serif',fontWeight:600,fontSize:76,lineHeight:1.18,color:'#fff9ef',textShadow:'0 3px 12px #090b10,0 1px 4px #090b10',WebkitTextStroke:'.65px #191717'}}>{visible.map((w,i)=><React.Fragment key={w.start}><span style={{color:w===active?'#ffd183':'#fff9ef'}}>{w.text}</span>{i<visible.length-1?' ':null}</React.Fragment>)}</div>;
}

function CaseStamp({spec,time}){
 const shot=spec.shots.find(s=>s.id==='21');
 if(time<spec.stampTime||time>=(shot.startFrame+shot.durationFrames)/60)return null;
 // Coordinates are in the native image plane. Replace with measured per-frame
 // paper tracking before final delivery; the preview keeps this cue editable.
 const age=time-spec.stampTime,scale=1+.08*Math.exp(-age*30),opacity=clamp(age*35);
 return <svg viewBox="0 0 352 640" preserveAspectRatio="xMidYMid slice" style={{position:'absolute',inset:0,width:'100%',height:'100%',opacity}}><g transform={`translate(202 502) rotate(-9) scale(${scale})`} fill="none" stroke="#9c3025"><rect x="-67" y="-22" width="134" height="44" rx="2" strokeWidth="2.4"/><rect x="-63" y="-18" width="126" height="36" strokeWidth=".6"/><text x="0" y="12" textAnchor="middle" fill="#9c3025" stroke="none" fontFamily="TexasSerif,Georgia,serif" fontSize="35" fontWeight="600" letterSpacing="2">MYTH</text></g></svg>;
}

export function TexasEpisode({spec}){
 const frame=useCurrentFrame(),{fps}=useVideoConfig(),time=frame/fps;
 const [fontHandle]=useState(()=>delayRender('Texas serif captions'));
 useEffect(()=>{document.fonts.load('600 76px TexasSerif').then(()=>continueRender(fontHandle)).catch(cancelRender)},[fontHandle]);
 return <AbsoluteFill style={{background:'#07090d'}}>
  <style>{`@font-face{font-family:TexasSerif;src:url('${staticFile(spec.font)}');font-weight:600;font-style:normal}`}</style>
  <StoryShot spec={spec} index={0}/><StoryShot spec={spec} index={1}/><StoryShot spec={spec} index={2}/><StoryShot spec={spec} index={3}/><StoryShot spec={spec} index={4}/><StoryShot spec={spec} index={5}/><StoryShot spec={spec} index={6}/><StoryShot spec={spec} index={7}/><StoryShot spec={spec} index={8}/><StoryShot spec={spec} index={9}/><StoryShot spec={spec} index={10}/><StoryShot spec={spec} index={11}/><StoryShot spec={spec} index={12}/><StoryShot spec={spec} index={13}/><StoryShot spec={spec} index={14}/><StoryShot spec={spec} index={15}/><StoryShot spec={spec} index={16}/><StoryShot spec={spec} index={17}/><StoryShot spec={spec} index={18}/><StoryShot spec={spec} index={19}/><StoryShot spec={spec} index={20}/><StoryShot spec={spec} index={21}/><StoryShot spec={spec} index={22}/>
  <AbsoluteFill style={{background:'radial-gradient(ellipse at 50% 46%,transparent 48%,rgba(5,8,16,.17) 100%)',pointerEvents:'none'}}/>
  {spec.audio?<Audio name="Continuous narration and original score" src={file(spec.audio,spec.audioVersion)} playbackRate={spec.audioPlaybackRate||1} volume={1}/>:null}
  <CaseStamp spec={spec} time={time}/>
  <Captions spec={spec} time={time}/>
  {!spec.complete?<div style={{position:'absolute',top:38,left:45,right:45,padding:'15px 22px',background:'#0b1521dd',borderRadius:10,color:'#fff3dc',font:'500 30px Arial'}}>Production preview · {spec.readyCount}/23 animated shots · unanimated scenes use keyframes</div>:null}
  <AbsoluteFill style={{background:'#07090d',opacity:clamp((time-89.64)/.36),pointerEvents:'none'}}/>
 </AbsoluteFill>;
}
