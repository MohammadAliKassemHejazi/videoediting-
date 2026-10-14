import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
export const MEMORY_STYLES=[
 {id:'collage-memory',project:'story-collage-memory',name:'MEMORY / PAPER COLLAGE',feeling:'Photographic magazine cutouts, torn fields, physical paper exchanges and a disappearing photograph.'},
 {id:'clawd-memory',project:'story-clawd-memory',name:'MEMORY / BRUSH CHARACTERS',feeling:'Original ink and watercolor characters with changing expressions, acted gestures and a three-tap friendship.'},
 {id:'paper-theatre',project:'story-paper-theatre',name:'MEMORY / POP-UP THEATRE',feeling:'A real 3D book, hinged paper scenery, cutout shadows, folded page turns and close camera coverage.'}
];
export function memoryDigest(root,id){const hash=createHash('sha256');for(const file of ['lib/memory-draw.js','lib/memory-story-spec.mjs','remotion/MemoryFilm.jsx','remotion/memory-story.json','story-projects/mira-stolen-minute/'+(id==='collage-memory'?'collage':id==='clawd-memory'?'clawd':'paper')+'.js','story-projects/mira-stolen-minute/assets/narration.wav','story-projects/mira-stolen-minute/assets/foley.wav','series/mira-minute/bible.json','series/mira-minute/assets/mira-atlas.png','series/mira-minute/assets/sam-atlas.png'])hash.update(readFileSync(join(root,file)));return hash.digest('hex')}
