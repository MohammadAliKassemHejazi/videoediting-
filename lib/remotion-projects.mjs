import {existsSync,readFileSync,writeFileSync} from 'node:fs';import {join} from 'node:path';
import {PRO_CLIP_STYLES} from './pro-clip-spec.mjs';import {VARIETY_STYLES} from './variety-clip-spec.mjs';import {REFERENCE_STYLES} from './reference-clip-spec.mjs';import {MEMORY_STYLES} from './memory-story-spec.mjs';
// Keep prepared project families visible when an older command activates.
export function writeStudioRoot(root,source){
 const filmFolder='<Folder name="NEW-ANIMATED-STORIES">',filmBlocks=[];
 if([...source.matchAll(/<Folder name="NEW-ANIMATED-STORIES">/g)].length>1){
  source=source.replace(/<Folder name="NEW-ANIMATED-STORIES">([\s\S]*?)<\/Folder>/g,(_,content)=>{filmBlocks.push(content);return ''});
  source=source.replace(/registerRoot\s*\(\s*\(\s*\)\s*=>\s*<>/,opening=>opening+'\n'+filmFolder+filmBlocks.join('')+'</Folder>');
 }
 const groups=[
  {json:'shadow-work.json',component:'ShadowStory',module:'ShadowStory.jsx',folder:'NEW-STORY-PRODUCTION',items:[{id:'shadow-went-first',style:'shadow-nocturne'}]},
  {json:'pro-clips.json',component:'ProClip',module:'ProClip.jsx',folder:'SPEAKER-DEPTH-STYLES',items:PRO_CLIP_STYLES.map(s=>({id:s.id,style:s.id,duration:900}))},
  {json:'variety-clips.json',component:'VarietyClip',module:'VarietyClip.jsx',folder:'NEW-EDIT-IDEAS',items:VARIETY_STYLES.map(s=>({id:s.id,style:s.id,duration:900}))},
  {json:'reference-clips.json',component:'ReferenceClip',module:'ReferenceClip.jsx',folder:'REFERENCE-AND-HAND-MOTION',items:REFERENCE_STYLES.map(s=>({id:s.id,style:s.id,duration:900}))},
  {json:'memory-story.json',component:'MemoryFilm',module:'MemoryFilm.jsx',folder:'ARABIC-STORY-THREE-MATERIALS',items:MEMORY_STYLES.map(s=>({id:s.project,style:s.id}))},
  {json:'texas-preview.json',component:'TexasShotPreview',module:'TexasShotPreview.jsx',folder:'TEXAS-CASEFILES',items:[{id:'texas-cinema-myth-workbench',style:'texas-casefiles',duration:240}]},
  {json:'texas-film.json',component:'TexasEpisode',module:'TexasEpisode.jsx',folder:'TEXAS-FULL-EPISODE',items:[{id:'texas-cinema-myth',style:'texas-casefiles',duration:5400}]}
 ];let imports='',folders='';
 for(const [i,g]of groups.entries()){const file=join(root,'remotion',g.json);if(!existsSync(file))continue;const missing=g.items.filter(s=>!source.includes('id="'+s.id+'"'));if(!missing.length)continue;const spec=JSON.parse(readFileSync(file,'utf8')),alias='studioPreservedSpec'+i;if(!source.includes('import {'+g.component+'}'))imports+=`import {${g.component}} from './${g.module}';\n`;imports+=`import ${alias} from './${g.json}';\n`;folders+=`<Folder name="${g.folder}">`+missing.map(s=>`<Composition id="${s.id}" component={${g.component}} width={1440} height={2560} fps={60} durationInFrames={${s.duration||Math.ceil(spec.duration*60)}} defaultProps={{spec:${alias},styleId:'${s.style}'${g.component==='MemoryFilm'?",captionLanguage:'en'":''}}}/>`).join('')+'</Folder>\n'}
 if(existsSync(join(root,'projects/warm-creature-story/assets/keyframe.png'))&&!source.includes('id="warm-creature-keyframe"')){imports+="import {WarmCreatureKeyframe} from './WarmCreatureKeyframe.jsx';\n";folders+='<Folder name="CREATURE-PRODUCTION-KEYFRAME"><Composition id="warm-creature-keyframe" component={WarmCreatureKeyframe} width={1440} height={2560} fps={60} durationInFrames={900}/></Folder>\n'}
 const originals=[['midnight-transit','MidnightTransit'],['paper-riot','PaperRiot'],['signal-noise','SignalNoise']].filter(([id])=>existsSync(join(root,'projects',id,'scenes.jsx'))&&!source.includes('id="'+id+'"'));if(originals.length){for(const [id,component]of originals)imports+=`import {${component}} from '../projects/${id}/scenes.jsx';\n`;folders+='<Folder name="Original-style-films">'+originals.map(([id,component])=>`<Composition id="${id}" component={${component}} width={1440} height={2560} fps={60} durationInFrames={900}/>`).join('')+'</Folder>\n'}
 const filmsFile=join(root,'remotion/generated-films.json');
 if(existsSync(filmsFile)){
  const missing=JSON.parse(readFileSync(filmsFile,'utf8')).filter(f=>!source.includes('id="'+f.id+'"'));
  if(missing.length){if(!source.includes("import {FilmPlayer}"))imports+="import {FilmPlayer} from './FilmPlayer.jsx';\n";
   const compositions=missing.map(f=>`<Composition id="${f.id}" component={FilmPlayer} width={1440} height={2560} fps={60} durationInFrames={${Math.ceil(f.duration*60)}} defaultProps={{file:${JSON.stringify(f.file)},muted:${Boolean(f.muted)}}}/>`).join('');
   if(source.includes(filmFolder))source=source.replace(filmFolder,filmFolder+compositions);else folders+=filmFolder+compositions+'</Folder>\n';
  }
 }
 const opening=/registerRoot\s*\(\s*\(\s*\)\s*=>\s*<>/;
 if(folders&&!opening.test(source))throw Error('Unknown Remotion root shape; retain projects manually.');
 writeFileSync(join(root,'remotion/index.jsx'),imports+(folders?source.replace(opening,match=>match+'\n'+folders):source));
}
