import {mkdirSync,writeFileSync,existsSync} from 'node:fs';
import {join} from 'node:path';
import {ROOT} from '../lib/project.mjs';
const series='lantern-valley',id='pip-last-light',folder=join(ROOT,'story-projects',id),bibleDir=join(ROOT,'series',series);
mkdirSync(folder,{recursive:true});mkdirSync(bibleDir,{recursive:true});
const bible={id:series,version:1,title:'Lantern Valley',world:'A miniature valley where a lighthouse keeps a footbridge visible at night.',characters:[
 {id:'pip',name:'Pip',role:'A curious courier who learns to test before rushing',body:'#e8aa52',face:'#1c333b',eyes:'#9fffe2',height:1.3,headShape:'rounded square',signature:'One short antenna and teal messenger satchel'},
 {id:'ada',name:'Ada',role:'Patient engineer and mentor',body:'#6eaaa1',face:'#243047',eyes:'#fff4d8',height:1.65,headShape:'rounded square',signature:'Two antenna tips and copper tool belt'}
],continuity:['Pip and Ada live in Lantern Valley.','The lighthouse is powered by a small amber light capsule.'],voice:{en:'en-US-AriaNeural',ar:'ar-SA-ZariyahNeural'}};
if(!existsSync(join(bibleDir,'bible.json')))writeFileSync(join(bibleDir,'bible.json'),JSON.stringify(bible,null,2)+'\n');
const scenes=[
 {action:'discover',title:'The last light',narration:'At dusk, every lantern in the valley went dark. Pip, the smallest courier robot, found one warm light capsule in the workshop. If he reached the lighthouse, the village could see again.'},
 {action:'approach',title:'A bridge in the dark',narration:'Pip tucked the capsule into his teal satchel and hurried to the river. The old bridge looked solid from a distance. He stepped forward, but one loose plank tipped beneath his foot.'},
 {action:'fail',title:'The warning',narration:'Pip pulled back just in time. The capsule was safe, but the river seemed wider now. Ada, the valley engineer, arrived with a toolbox. Speed, she said, would not repair a missing connection.'},
 {action:'inspect',title:'Look before you leap',narration:'Together they inspected the bridge. Its entrance was firm. Its middle had a gap. Its far end still held. Ada drew the route on the ground, and Pip finally understood where the trouble lived.'},
 {action:'build',title:'One piece at a time',narration:'They carried three spare beams from the workshop. Ada anchored the first. Pip fitted the next two across the gap. He wanted to celebrate, but Ada placed a tiny test weight on the repaired span.'},
 {action:'test',title:'A small test first',narration:'The bridge held the little weight. Then a larger one. Only after both tests did Pip begin crossing. He walked carefully, watching each connection, while Ada stayed beside the rope and steadied the path.'},
 {action:'cross',title:'Carry the light',narration:'On the far bank, Pip climbed to the lighthouse and lifted the capsule from his satchel. For a moment, nothing happened. Then one amber window glowed, followed by a ribbon of light across the river.'},
 {action:'resolve',title:'A path worth trusting',narration:'The village lanterns woke one by one. Pip smiled at Ada across the bridge. He had delivered more than a light: he had learned to inspect the path, repair the weak point, and test before trusting.'}
];
if(existsSync(join(folder,'story.json')))throw Error('Demo exists; preserve its edits.');
writeFileSync(join(folder,'story.json'),JSON.stringify({id,series,title:'Pip and the Last Light',language:'en',voice:'en-US-AriaNeural',rate:'+0%',minimumDuration:60,export:{width:1440,height:2560,fps:60},styles:['educational-3d','illustrated-story','cinematic-story'],scriptProvenance:'Original fictional sample authored for the studio demonstration, not supplied by the user.',scenes},null,2)+'\n');
writeFileSync(join(folder,'SCRIPT.md'),'# Pip and the Last Light\n\nOriginal fictional studio demo.\n\n'+scenes.map(s=>s.narration).join('\n\n')+'\n');
writeFileSync(join(folder,'STORYBOARD.md'),'# Treatment: a courier learns to test the path\n\nGoal: restore the village light. Obstacle: a damaged bridge. Attempt: rush, then stop and inspect. Change: work with Ada, repair the gap and test. Payoff: the lighthouse brings the village back to life. Characters use the locked Lantern Valley bible.\n\n'+scenes.map((s,i)=>`${i+1}. ${s.title}: ${s.action}; focus on the visible cause, character reaction and consequence.`).join('\n')+'\n');
writeFileSync(join(folder,'ASSET_SOURCES.md'),'# Asset provenance\n\nPip, Ada, bridge, valley and lighthouse: original procedural geometry and vector artwork authored in this repository. No stock characters, paid generation, or third-party likenesses. Three.js runtime: MIT. Local fonts: SIL Open Font License. Narration: free Edge neural speech service, voice recorded in story.json.\n');
console.log('Created original demo and persistent series bible.');
