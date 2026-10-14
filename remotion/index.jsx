import {WarmCreatureKeyframe} from './WarmCreatureKeyframe.jsx';
import {MemoryFilm} from './MemoryFilm.jsx';
import memorySpec from './memory-story.json';
import {ReferenceClip} from './ReferenceClip.jsx';
import referenceSpec from './reference-clips.json';
import {VarietyClip} from './VarietyClip.jsx';
import varietySpec from './variety-clips.json';
import React from 'react';
import {registerRoot,Composition,Folder} from 'remotion';
import {ProClip} from './ProClip.jsx';
import spec from './pro-clips.json';
import {MidnightTransit} from '../projects/midnight-transit/scenes.jsx';
import {PaperRiot} from '../projects/paper-riot/scenes.jsx';
import {SignalNoise} from '../projects/signal-noise/scenes.jsx';
registerRoot(()=> <>
<Folder name="CREATURE-PRODUCTION-KEYFRAME"><Composition id="warm-creature-keyframe" component={WarmCreatureKeyframe} width={1440} height={2560} fps={60} durationInFrames={900}/></Folder>
<Folder name="ARABIC-STORY-THREE-MATERIALS"><Composition id="story-collage-memory" component={MemoryFilm} width={1440} height={2560} fps={60} durationInFrames={5974} defaultProps={{spec:memorySpec,styleId:'collage-memory',captionLanguage:'en'}}/><Composition id="story-clawd-memory" component={MemoryFilm} width={1440} height={2560} fps={60} durationInFrames={5974} defaultProps={{spec:memorySpec,styleId:'clawd-memory',captionLanguage:'en'}}/><Composition id="story-paper-theatre" component={MemoryFilm} width={1440} height={2560} fps={60} durationInFrames={5974} defaultProps={{spec:memorySpec,styleId:'paper-theatre',captionLanguage:'en'}}/></Folder>
<Folder name="REFERENCE-AND-HAND-MOTION"><Composition id="clip-reference-editorial" component={ReferenceClip} width={1440} height={2560} fps={60} durationInFrames={900} defaultProps={{spec:referenceSpec,styleId:'clip-reference-editorial'}}/><Composition id="clip-hand-orchestra" component={ReferenceClip} width={1440} height={2560} fps={60} durationInFrames={900} defaultProps={{spec:referenceSpec,styleId:'clip-hand-orchestra'}}/></Folder>
<Folder name="NEW-EDIT-IDEAS"><Composition id="clip-split-lab" component={VarietyClip} width={1440} height={2560} fps={60} durationInFrames={900} defaultProps={{spec:varietySpec,styleId:'clip-split-lab'}}/><Composition id="clip-whip-zoom" component={VarietyClip} width={1440} height={2560} fps={60} durationInFrames={900} defaultProps={{spec:varietySpec,styleId:'clip-whip-zoom'}}/><Composition id="clip-cursor-run" component={VarietyClip} width={1440} height={2560} fps={60} durationInFrames={900} defaultProps={{spec:varietySpec,styleId:'clip-cursor-run'}}/><Composition id="clip-request-runner" component={VarietyClip} width={1440} height={2560} fps={60} durationInFrames={900} defaultProps={{spec:varietySpec,styleId:'clip-request-runner'}}/><Composition id="clip-sketch-interrupt" component={VarietyClip} width={1440} height={2560} fps={60} durationInFrames={900} defaultProps={{spec:varietySpec,styleId:'clip-sketch-interrupt'}}/></Folder>
<Folder name="MONUMENT"><Composition id="clip-monument" component={ProClip} width={1440} height={2560} fps={60} durationInFrames={900} defaultProps={{spec,styleId:'clip-monument'}}/></Folder>
<Folder name="REDLINE"><Composition id="clip-redline" component={ProClip} width={1440} height={2560} fps={60} durationInFrames={900} defaultProps={{spec,styleId:'clip-redline'}}/></Folder>
<Folder name="PAPER-EVIDENCE"><Composition id="clip-paper-evidence" component={ProClip} width={1440} height={2560} fps={60} durationInFrames={900} defaultProps={{spec,styleId:'clip-paper-evidence'}}/></Folder>
<Folder name="ACID-PRINT"><Composition id="clip-acid-print" component={ProClip} width={1440} height={2560} fps={60} durationInFrames={900} defaultProps={{spec,styleId:'clip-acid-print'}}/></Folder>
<Folder name="CHROME-DEPTH"><Composition id="clip-chrome-depth" component={ProClip} width={1440} height={2560} fps={60} durationInFrames={900} defaultProps={{spec,styleId:'clip-chrome-depth'}}/></Folder>
<Folder name="Original-style-films"><Composition id="midnight-transit" component={MidnightTransit} width={1440} height={2560} fps={60} durationInFrames={900}/><Composition id="paper-riot" component={PaperRiot} width={1440} height={2560} fps={60} durationInFrames={900}/><Composition id="signal-noise" component={SignalNoise} width={1440} height={2560} fps={60} durationInFrames={900}/></Folder>
</>);
