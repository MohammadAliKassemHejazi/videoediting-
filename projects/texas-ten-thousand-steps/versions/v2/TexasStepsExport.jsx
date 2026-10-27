import React from 'react';
import {registerRoot,Composition} from 'remotion';
import {TexasStepsEpisode} from './TexasStepsEpisode.jsx';
import spec from './texas-steps-film.json';
registerRoot(()=> <Composition id="texas-ten-thousand-steps" component={TexasStepsEpisode} width={1440} height={2560} fps={60} durationInFrames={6600} defaultProps={{spec}}/>);
