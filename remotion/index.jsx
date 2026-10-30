import {TexasStepsEpisode} from './TexasStepsEpisode.jsx';
import studioPreservedSpec7 from './texas-steps-film.json';
import {TexasEpisode} from './TexasEpisode.jsx';
import studioPreservedSpec6 from './texas-film.json';
import {TexasShotPreview} from './TexasShotPreview.jsx';
import studioPreservedSpec5 from './texas-preview.json';
import {ShadowStory} from './ShadowStory.jsx';
import studioPreservedSpec0 from './shadow-work.json';
import {FilmPlayer} from './FilmPlayer.jsx';
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
<Folder name="TEXAS-EPISODE-2"><Composition id="texas-ten-thousand-steps" component={TexasStepsEpisode} width={1080} height={1920} fps={60} durationInFrames={Math.round(studioPreservedSpec7.duration*60)} defaultProps={{spec:studioPreservedSpec7,styleId:'texas-casefiles'}}/></Folder>

<Folder name="TEXAS-FULL-EPISODE"><Composition id="texas-cinema-myth" component={TexasEpisode} width={1440} height={2560} fps={60} durationInFrames={5400} defaultProps={{spec:studioPreservedSpec6,styleId:'texas-casefiles'}}/></Folder>

<Folder name="TEXAS-CASEFILES"><Composition id="texas-cinema-myth-workbench" component={TexasShotPreview} width={1440} height={2560} fps={60} durationInFrames={240} defaultProps={{spec:studioPreservedSpec5,styleId:'texas-casefiles'}}/></Folder>

<Folder name="NEW-ANIMATED-STORIES"><Composition id="warm-creature-story" component={FilmPlayer} width={1440} height={2560} fps={60} durationInFrames={900} defaultProps={{file:"warm-creature-story/film.mp4",muted:false}}/><Composition id="warm-creature-motion-preview" component={FilmPlayer} width={1440} height={2560} fps={60} durationInFrames={303} defaultProps={{file:"warm-creature-story/contact-preview.mp4",muted:true}}/></Folder>









<Folder name="NEW-STORY-PRODUCTION"><Composition id="shadow-went-first" component={ShadowStory} width={1440} height={2560} fps={60} durationInFrames={5330} defaultProps={{spec:studioPreservedSpec0,styleId:'shadow-nocturne'}}/></Folder>







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
