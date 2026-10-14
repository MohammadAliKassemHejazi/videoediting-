import {V} from './variety-draw.js';
import {editorialBack,editorialFront} from '../projects/clip-reference-editorial/scenes.js';
import {orchestraBack,orchestraFront} from '../projects/clip-hand-orchestra/scenes.js';
export function paintReferenceBack(c,t,id){c.clearRect(0,0,1080,1920);c.save();(id==='clip-reference-editorial'?editorialBack:orchestraBack)(c,t);c.restore()}
export function paintReferenceFront(c,t,id,spec){c.clearRect(0,0,1080,1920);c.save();(id==='clip-reference-editorial'?editorialFront:orchestraFront)(c,t,spec);c.restore();V.captions(c,t,spec,id)}
