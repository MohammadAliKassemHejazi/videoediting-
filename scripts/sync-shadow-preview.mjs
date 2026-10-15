import {readFileSync,writeFileSync,copyFileSync,existsSync,mkdirSync,statSync} from 'node:fs';
import {join} from 'node:path';
import {ROOT} from '../lib/project.mjs';
import {writeStudioRoot} from '../lib/remotion-projects.mjs';
const folder=join(ROOT,'story-projects/shadow-went-first'),spec=JSON.parse(readFileSync(join(folder,'director.json'),'utf8')),story=JSON.parse(readFileSync(join(folder,'story.json'),'utf8')),pub=join(ROOT,'remotion/public/shadow-went-first');
mkdirSync(join(pub,'shots'),{recursive:true});mkdirSync(join(pub,'images'),{recursive:true});mkdirSync(join(ROOT,'remotion/public/fonts'),{recursive:true});
for(const shot of spec.shots){const video=join(folder,shot.file),image=join(folder,shot.image);shot.available=existsSync(video);if(shot.available){shot.version=Math.round(statSync(video).mtimeMs);shot.publicVideo='shadow-went-first/shots/'+shot.id+'.mp4';copyFileSync(video,join(pub,'shots',shot.id+'.mp4'))}if(existsSync(image)){shot.publicImage='shadow-went-first/images/'+shot.id+'.png';copyFileSync(image,join(pub,'images',shot.id+'.png'))}}
for(const id of ['01','02','10']){const file=join(folder,'assets',id+'-clean.png');if(existsSync(file))copyFileSync(file,join(pub,'images',id+'-clean.png'))}
spec.sceneNames=story.scenes.map(s=>s.title);copyFileSync(join(folder,existsSync(join(folder,'assets/mix.wav'))?'assets/mix.wav':'assets/narration.wav'),join(pub,'voice.wav'));
copyFileSync(join(ROOT,'node_modules/@fontsource/inter/files/inter-latin-700-normal.woff2'),join(ROOT,'remotion/public/fonts/inter-latin-700-normal.woff2'));
copyFileSync(join(ROOT,'node_modules/@fontsource/noto-sans-arabic/files/noto-sans-arabic-arabic-600-normal.woff2'),join(ROOT,'remotion/public/fonts/noto-sans-arabic-arabic-600-normal.woff2'));
writeFileSync(join(ROOT,'remotion/shadow-work.json'),JSON.stringify(spec,null,2)+'\n');writeStudioRoot(ROOT,readFileSync(join(ROOT,'remotion/index.jsx'),'utf8'));
console.log('Live story: '+spec.shots.filter(s=>s.available).length+'/'+spec.shots.length+' animated shots; remaining frames labeled storyboard.');
