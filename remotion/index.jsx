import React from 'react';
import {registerRoot,Composition,Folder} from 'remotion';
import {MidnightTransit} from '../projects/midnight-transit/scenes.jsx';
import {PaperRiot} from '../projects/paper-riot/scenes.jsx';
import {SignalNoise} from '../projects/signal-noise/scenes.jsx';
import './fonts.css';
registerRoot(()=> <>
<Folder name="01-MIDNIGHT-TRANSIT"><Composition id="midnight-transit" component={MidnightTransit} width={1440} height={2560} fps={60} durationInFrames={900}/></Folder>
<Folder name="02-PAPER-RIOT"><Composition id="paper-riot" component={PaperRiot} width={1440} height={2560} fps={60} durationInFrames={900}/></Folder>
<Folder name="03-SIGNAL-NOISE"><Composition id="signal-noise" component={SignalNoise} width={1440} height={2560} fps={60} durationInFrames={900}/></Folder>
</>);
