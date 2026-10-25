import React from 'react';
import {registerRoot,Composition} from 'remotion';
import {TexasEpisode} from './TexasEpisode.jsx';
import spec from './texas-film.json';
registerRoot(()=> <Composition id="texas-cinema-myth" component={TexasEpisode} width={1440} height={2560} fps={60} durationInFrames={5400} defaultProps={{spec}}/>);
