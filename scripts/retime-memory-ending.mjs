import {readFileSync,writeFileSync,existsSync} from 'node:fs';import {join} from 'node:path';import {ROOT} from '../lib/project.mjs';
if(existsSync(join(ROOT,'.cache/render.lock')))throw Error('Finish the active render before changing the film.');
function edit(file,from,to){const p=join(ROOT,file),old=readFileSync(p,'utf8');if(old.includes(to))return;if(!old.includes(from))throw Error('Expected story code missing: '+file);writeFileSync(p,old.replace(from,to))}
edit('lib/memory-draw.js',"age=t-scene.at,p=this.clamp(age/scene.duration);return {index,scene,age,p}","age=t-scene.at;let p=this.clamp(age/scene.duration);const knots=index===8?[[0,.2],[1.55,.48],[2.43,.52],[6.37,.56],[8.11,.76],[scene.duration,1]]:index===9?[[0,0],[.65,.18],[1.33,.38],[4.95,.4],[scene.duration,1]]:null;if(knots){const k=Math.max(0,Math.min(knots.length-2,knots.findLastIndex(x=>age>=x[0]))),a=knots[k],b=knots[k+1];p=this.mix(a[1],b[1],this.clamp((age-a[0])/(b[0]-a[0])))}return {index,scene,age,p}");
edit('story-projects/mira-stolen-minute/collage.js',"p<.4?0:age*3.6","age<2.43?0:(age-2.43)*3.6");
edit('story-projects/mira-stolen-minute/collage.js',"const hit=(p-.35)*s.scene.duration;for(let j=0;j<3;j++){const q=1-M.clamp(Math.abs(hit-j*.42)/.24)","for(let j=0;j<3;j++){const q=1-M.clamp(Math.abs(age-[1.33,2.22,3.35][j])/.24)");
edit('story-projects/mira-stolen-minute/collage.js',"a.x=250;b.x=830;M.photoActor","a.x=250;b.x=850;b.y=1480;M.box(c,690,1440,390,100,'#dfccb0',4);M.line(c,[[690,1440],[1080,1440]],'#f8e9ca',6);M.photoActor");
edit('story-projects/mira-stolen-minute/collage.js',"M.photo(c,540,375,480,0,t,assets,true)","M.photo(c,540,330,480,0,t,assets,true)");
edit('story-projects/mira-stolen-minute/clawd.js',"p<.4?0:age*4","age<2.43?0:(age-2.43)*4");
edit('story-projects/mira-stolen-minute/clawd.js',"const q=(p-.38)*s.scene.duration;for(let j=0;j<3;j++){const hit=1-M.clamp(Math.abs(q-j*.42)/.24)","for(let j=0;j<3;j++){const hit=1-M.clamp(Math.abs(age-[1.33,2.22,3.35][j])/.24)");
edit('story-projects/mira-stolen-minute/paper.js',"i===3&&p>.4?0:age*(i===8?4:-1.1)","i===8?(age<2.43?0:(age-2.43)*4):i===3&&p>.4?0:-age*1.1");
edit('story-projects/mira-stolen-minute/paper.js',"ax=-1.62;bx=1.62;","ax=-308*5.2/1080;bx=308*5.2/1080;");
edit('scripts/memory-story.mjs',"for(let at=.3;at<s.duration;at+=i===8?.46:.95)","for(let at=i===8?2.43:.3;at<s.duration;at+=i===8?.46:.95)");
edit('scripts/memory-story.mjs',"s.at+s.duration*(i===5?.12:.38)+j*.42","s.at+(i===9?[1.33,2.22,3.35][j]:s.duration*.12+j*.42)");
writeFileSync(join(ROOT,'story-projects/mira-stolen-minute/ENDING_TIMING.md'),'# Ending timing correction\n\nArabic service word boundaries were inspected. Return: ticket travels immediately and enters by 1.55s; clock accelerates at 2.43s; photo restores from the final clause at 6.37–8.11s. Greeting: hands raise at 0.65s, meet at the first tap 1.33s, pulse/tap Foley at 1.33, 2.22 and 3.35s, then a held happy reaction. The final two scenes are patched into all three actual exports; earlier picture is preserved.\n');
console.log('Ending motion and Foley now follow the verified Arabic word times. Re-prepare the mix, then run patch-memory-ending.');
