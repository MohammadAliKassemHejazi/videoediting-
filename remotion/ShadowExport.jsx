import React from 'react';
import {registerRoot,Composition} from 'remotion';
import {ShadowStory} from './ShadowStory.jsx';
import spec from './shadow-work.json';
registerRoot(()=> <Composition id="shadow-went-first" component={ShadowStory} width={1440} height={2560} fps={60} durationInFrames={Math.ceil(spec.duration*60)} defaultProps={{spec,captionLanguage:'en'}}/>);
