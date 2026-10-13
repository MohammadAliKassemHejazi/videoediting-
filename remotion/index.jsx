import React from 'react';
import {registerRoot,Composition,Folder} from 'remotion';
import {Audition} from './Audition.jsx';
import spec from './active.json';
import {Story} from './Story.jsx';
import story from './story-active.json';
registerRoot(() => <> <Folder name="Style-auditions">
  <Composition id="tech-ui" component={Audition} width={1080} height={1920} fps={60} durationInFrames={Math.round(spec.duration*60)} defaultProps={{spec,styleId:'tech-ui'}}/>
  <Composition id="continuous-world" component={Audition} width={1080} height={1920} fps={60} durationInFrames={Math.round(spec.duration*60)} defaultProps={{spec,styleId:'continuous-world'}}/>
  <Composition id="paper-collage" component={Audition} width={1080} height={1920} fps={60} durationInFrames={Math.round(spec.duration*60)} defaultProps={{spec,styleId:'paper-collage'}}/>
  <Composition id="brush-story" component={Audition} width={1080} height={1920} fps={60} durationInFrames={Math.round(spec.duration*60)} defaultProps={{spec,styleId:'brush-story'}}/>
  <Composition id="cinematic-blueprint" component={Audition} width={1080} height={1920} fps={60} durationInFrames={Math.round(spec.duration*60)} defaultProps={{spec,styleId:'cinematic-blueprint'}}/>
</Folder><Folder name="Full-story-demos">
<Composition id="educational-3d" component={Story} width={1080} height={1920} fps={60} durationInFrames={Math.ceil(story.duration*60)} defaultProps={{spec:story,styleId:'educational-3d'}}/>
<Composition id="illustrated-story" component={Story} width={1080} height={1920} fps={60} durationInFrames={Math.ceil(story.duration*60)} defaultProps={{spec:story,styleId:'illustrated-story'}}/>
<Composition id="cinematic-story" component={Story} width={1080} height={1920} fps={60} durationInFrames={Math.ceil(story.duration*60)} defaultProps={{spec:story,styleId:'cinematic-story'}}/>
<Composition id="sketch-story" component={Story} width={1080} height={1920} fps={60} durationInFrames={Math.ceil(story.duration*60)} defaultProps={{spec:story,styleId:'sketch-story'}}/>
</Folder></>);
