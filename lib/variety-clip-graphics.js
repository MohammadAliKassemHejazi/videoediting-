import {V} from './variety-draw.js';
import {splitBack,splitFront} from '../projects/clip-split-lab/scenes.js';
import {whipBack,whipFront} from '../projects/clip-whip-zoom/scenes.js';
import {cursorBack,cursorFront} from '../projects/clip-cursor-run/scenes.js';
import {runnerBack,runnerFront} from '../projects/clip-request-runner/scenes.js';
import {sketchBack,sketchFront} from '../projects/clip-sketch-interrupt/scenes.js';
const varietyPainters={'clip-split-lab':[splitBack,splitFront],'clip-whip-zoom':[whipBack,whipFront],'clip-cursor-run':[cursorBack,cursorFront],'clip-request-runner':[runnerBack,runnerFront],'clip-sketch-interrupt':[sketchBack,sketchFront]};
export function paintVarietyBack(c,t,id,assets){c.clearRect(0,0,1080,1920);c.save();varietyPainters[id][0](c,t,assets);c.restore()}
export function paintVarietyFront(c,t,id,spec){c.clearRect(0,0,1080,1920);c.save();varietyPainters[id][1](c,t);V.captions(c,t,spec,id);c.restore()}
