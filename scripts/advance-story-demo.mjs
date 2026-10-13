import {readFileSync,writeFileSync,copyFileSync,mkdirSync,existsSync} from 'node:fs';
import {join} from 'node:path';
import {ROOT} from '../lib/project.mjs';
const folder=join(ROOT,'story-projects/pip-last-light'),config=JSON.parse(readFileSync(join(folder,'story.json'),'utf8'));
if(existsSync(join(folder,'SCRIPT.workflow-demo.md')))throw Error('Sample revision already applied; preserve the current story edits.');
copyFileSync(join(folder,'SCRIPT.md'),join(folder,'SCRIPT.workflow-demo.md'));
const narration=[
 'One light capsule. One damaged bridge. And a whole valley waiting for sunrise. Pip found the capsule cooling in an empty workshop. If it went dark, every route home would disappear.',
 'He clipped it into his teal satchel and ran. The bridge looked safe. Then a plank rolled under his foot. Pip stopped inches from the gap. Confidence had almost become a very expensive mistake.',
 'Ada arrived as Pip backed away. He wanted a shortcut. She wanted an answer. What, exactly, had failed? They looked past the painted rails and found the missing connection in the middle.',
 'Pip traced the route: entrance, span, exit. Two parts were sound. One was not. Suddenly the problem was smaller than his fear. They did not need a new bridge. They needed the right repair.',
 'They brought three beams from the workshop. Ada fixed the anchors. Pip placed the beams, one after another. The path was connected again. But looking repaired was still different from being ready.',
 'First came a small test weight. Then a heavier one. The repaired span held both. Pip watched the joints instead of the finish line, and finally stepped onto a path he could explain.',
 'Across the river, the lighthouse waited. Pip raised the capsule. Nothing. One long second. Then amber light reached across the water, and the dark valley began finding its way home.',
 'Pip looked back at Ada. The bridge was still the same bridge. He was the part that had changed. Tomorrow, someone else would need that crossing. This time, the light would stay on.'
];
config.scenes.forEach((s,i)=>s.narration=narration[i]);config.styles=['educational-3d','illustrated-story','cinematic-story','sketch-story'];config.rate='+12%';config.audience='13–17; curious adventure, earned problem-solving, no preschool tone';
config.assets={environment:'assets/story-library/studio_small_09.hdr',wood:'assets/story-library/wood.jpg'};
writeFileSync(join(folder,'story.json'),JSON.stringify(config,null,2)+'\n');writeFileSync(join(folder,'SCRIPT.md'),'# Pip and the Last Light\n\nOriginal fictional teen-oriented studio sample.\n\n'+narration.join('\n\n')+'\n');
mkdirSync(join(ROOT,'remotion/public/world'),{recursive:true});
for(const file of ['studio_small_09.hdr','wood.jpg'])copyFileSync(join(ROOT,'assets/story-library',file),join(ROOT,'remotion/public/world',file));
console.log('Upgraded story treatment, acting, lighting, sketch option and free assets. Generate revised voice next.');
