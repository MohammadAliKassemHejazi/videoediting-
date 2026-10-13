import {mkdirSync,writeFileSync,readFileSync,existsSync,copyFileSync,openSync,closeSync,unlinkSync} from 'node:fs';
import {join,relative,resolve} from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash,randomUUID} from 'node:crypto';
import {ROOT} from '../lib/project.mjs';
import {probe,ffmpeg,duration as mediaDuration} from '../lib/ffmpeg.mjs';
import {STORY_STYLES} from '../lib/story-painters.js';
import {writeStoryFoley} from '../lib/story-sound.mjs';
import {storyDigest} from '../lib/story-digest.mjs';
import {replaceWorkspaceFile} from '../lib/replace-file.mjs';
const [cmd='help',id='pip-last-light',...args]=process.argv.slice(2),opt=(key,fallback)=>{const i=args.indexOf('--'+key);return i<0?fallback:args[i+1];};
const valid=x=>{if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(x))throw Error('Use lowercase IDs with hyphens');return x;};
if(cmd==='help'){console.log('story new <id> --script <file> --series <id> [--language en|ar]\nstory prepare <id>   assemble generated scene speech and captions\nstory activate <id>  show full story compositions in Remotion\nstory render <id> [--style <id>]  serial 2K/60fps drafts\nGenerate neural audio first: python scripts/story-voice.py story-projects/<id>');process.exit(0);}
valid(id);const folder=join(ROOT,'story-projects',id);mkdirSync(folder,{recursive:true});
if(cmd==='new'){
 if(existsSync(join(folder,'story.json')))throw Error('Story exists; preserve its sources.');
 const series=valid(opt('series',id)),language=opt('language','en'),script=opt('script');if(!['en','ar'].includes(language)||!script)throw Error('Provide --script and --language en|ar.');
 const text=readFileSync(resolve(script),'utf8'),bibleFile=join(ROOT,'series',series,'bible.json');
 if(!existsSync(bibleFile))throw Error(`Author series/${series}/bible.json from the story first. Define stable characters and world facts.`);
 const bible=JSON.parse(readFileSync(bibleFile,'utf8'));
 const config={id,series,title:id.replaceAll('-',' '),language,voice:bible.voice?.[language]||(language==='ar'?'ar-SA-ZariyahNeural':'en-US-AriaNeural'),minimumDuration:60,export:{width:1440,height:2560,fps:60},rendererModule:`story-projects/${id}/scenes.js`,styles:STORY_STYLES.map(s=>s.id),scenes:text.trim().split(/\r?\n\s*\r?\n/).map(narration=>({narration,title:'Author a visual beat',action:'AUTHOR'}))};
 writeFileSync(join(folder,'story.json'),JSON.stringify(config,null,2)+'\n');writeFileSync(join(folder,'SCRIPT.md'),text);
 writeFileSync(join(folder,'scenes.js'),'// Author original staging for this script. Export createStoryWorld(canvas,bible,style),\n// paintIllustrated(ctx,time,spec), storyState(time,spec). No timers or accumulated state.\n');
 console.log('Script imported. Agent must author scene actions, environments and treatment before voice/render. Related story uses the existing series bible.');process.exit(0);
}
const config=JSON.parse(readFileSync(join(folder,'story.json'),'utf8'));valid(config.series);
const biblePath=join(ROOT,'series',config.series,'bible.json'),bible=JSON.parse(readFileSync(biblePath,'utf8'));
if(config.scenes.some(s=>s.action==='AUTHOR'))throw Error('Direct the story before rendering. Replace AUTHOR scenes with original action painters and a storyboard.');
const out=join(ROOT,'out',id),publicDir=join(ROOT,'remotion/public'),cache=join(ROOT,'.cache',id);mkdirSync(out,{recursive:true});mkdirSync(cache,{recursive:true});mkdirSync(join(publicDir,id),{recursive:true});
if(cmd==='prepare'){
 let at=0;const scenes=[],captions=[],segments=[];
 for(let i=0;i<config.scenes.length;i++){
   const audio=join(folder,'assets/voice',String(i).padStart(2,'0')+'.mp3'),metadata=JSON.parse(readFileSync(audio.replace('.mp3','.json'),'utf8'));
   if(metadata.input.text!==config.scenes[i].narration||metadata.input.voice!==config.voice||metadata.input.rate!==(config.rate||'+0%'))throw Error('Voice is stale. Regenerate changed narration.');
   const silence=config.scenes[i].silentAfter??.45;if(!Number.isFinite(silence)||silence<0||silence>30)throw Error('silentAfter must be 0–30 seconds of storyboarded meaningful action.');
   const duration=mediaDuration(audio)+silence,segment=join(cache,`voice-${i}.wav`);
   await ffmpeg(['-i',audio,'-af',`apad=pad_dur=${silence}`,'-ar','48000','-ac','1',segment]);segments.push(segment);
   scenes.push({...config.scenes[i],at,duration});
   const words=metadata.words,tokens=config.scenes[i].narration.match(/\S+/g)||[];
   for(let j=0;j<words.length;){let endIndex=j;while(endIndex<words.length-1&&endIndex-j<5&&!/[.!?,،؟]$/.test(tokens.length===words.length?tokens[endIndex]:words[endIndex].text))endIndex++;
     const group=words.slice(j,endIndex+1),start=at+group[0].start,end=at+group.at(-1).start+group.at(-1).duration;
     captions.push({start,end,text:tokens.length===words.length?tokens.slice(j,endIndex+1).join(' '):group.map(w=>w.text).join(' ')});j=endIndex+1;
   }
   at+=duration;
 }
 if(at<Math.max(60,config.minimumDuration||60))throw Error(`Story lasts ${at.toFixed(1)}s. Develop meaningful narration or storyboarded silent action to reach the requested duration.`);
 const list=join(cache,'concat.txt');writeFileSync(list,segments.map(f=>`file '${f.replaceAll('\\','/').replaceAll("'","'\\''")}'`).join('\n'));
 const voice=join(folder,'assets/narration.wav');await ffmpeg(['-f','concat','-safe','0','-i',list,'-c:a','pcm_s16le',voice]);
 const spec={...config,bible,duration:at,audio:`${id}/narration.wav`,scenes,captions,bibleHash:createHash('sha256').update(readFileSync(biblePath)).digest('hex')};
 const foley=join(folder,'assets/foley.wav');writeStoryFoley(foley,spec);
 await ffmpeg(['-i',voice,'-i',foley,'-filter_complex','[0:a][1:a]amix=inputs=2:normalize=0:duration=first[a]','-map','[a]','-c:a','pcm_s16le',join(publicDir,id,'narration.wav')]);
 writeFileSync(join(folder,'timed.json'),JSON.stringify(spec,null,2)+'\n');
 writeFileSync(join(folder,'captions.srt'),captions.map((c,i)=>`${i+1}\n${stamp(c.start)} --> ${stamp(c.end)}\n${c.text}\n`).join('\n'));
 console.log(`Prepared ${at.toFixed(2)} seconds of neural narration with word-timed captions.`);process.exit(0);
}
const spec=JSON.parse(readFileSync(join(folder,'timed.json'),'utf8'));
if(spec.bibleHash!==createHash('sha256').update(readFileSync(biblePath)).digest('hex'))throw Error('Character bible changed. Re-prepare and verify continuity.');
writeFileSync(join(ROOT,'remotion/story-active.json'),JSON.stringify(spec,null,2)+'\n');
const modulePath=resolve(ROOT,config.rendererModule||'lib/story-painters.js');
if(!modulePath.startsWith(ROOT+'\\')&&!modulePath.startsWith(ROOT+'/'))throw Error('Story renderer must stay within the workspace.');
if(!existsSync(modulePath))throw Error('Missing authored story renderer.');
writeFileSync(join(ROOT,'remotion/story-director.js'),`export {createStoryWorld,paintIllustrated,storyState} from ${JSON.stringify('../'+relative(ROOT,modulePath).replaceAll('\\','/'))};\n`);
// Both audition families remain accessible while viewing a story.
const active=JSON.parse(readFileSync(join(ROOT,'remotion/active.json'),'utf8'));
writeFileSync(join(ROOT,'remotion/index.jsx'),`import React from 'react';\nimport {registerRoot,Composition,Folder} from 'remotion';\nimport {Audition} from './Audition.jsx';\nimport {Story} from './Story.jsx';\nimport audition from './active.json';\nimport story from './story-active.json';\nregisterRoot(()=> <>\n<Folder name="15-second-styles">\n${active.styles.map(s=>`<Composition id="${s}" component={Audition} width={1080} height={1920} fps={60} durationInFrames={900} defaultProps={{spec:audition,styleId:'${s}'}}/>`).join('\n')}\n</Folder>\n<Folder name="Full-story-demos">\n${spec.styles.map(s=>`<Composition id="${s}" component={Story} width={1080} height={1920} fps={60} durationInFrames={Math.ceil(story.duration*60)} defaultProps={{spec:story,styleId:'${s}'}}/>`).join('\n')}\n</Folder></>);\n`);
if(cmd==='activate'){console.log('Full-length story compositions are live in Remotion.');process.exit(0);}
if(!['render','stills'].includes(cmd))throw Error('Unknown story command.');
const styles=opt('style')?[opt('style')]:spec.styles;for(const s of styles)if(!STORY_STYLES.some(v=>v.id===s))throw Error('Unknown story style.');
mkdirSync(join(ROOT,'.cache'),{recursive:true});const lock=join(ROOT,'.cache/render.lock');let fd;try{fd=openSync(lock,'wx');writeFileSync(fd,String(process.pid));}catch{throw Error('Another render is active. Wait for it to finish.');}
try{
 const {bundle}=await import('@remotion/bundler'),{selectComposition,renderMedia,renderStill}=await import('@remotion/renderer'),{chromium}=await import('playwright');
 const browserExecutable=chromium.executablePath().replace(/chromium-(\d+)/,'chromium_headless_shell-$1').replace(/chrome\.exe$/,'headless_shell.exe');
 const sourceDigest=storyDigest(ROOT,join(folder,'timed.json')),recordFile=join(out,'story-drafts.json');
 const prior=existsSync(recordFile)?JSON.parse(readFileSync(recordFile,'utf8')):null;
 const completed=prior?.sourceDigest===sourceDigest?[...prior.styles]:[];
 const serveUrl=await bundle({entryPoint:join(ROOT,'remotion/index.jsx'),publicDir});
 for(const style of styles){
   const composition=await selectComposition({serveUrl,id:style,browserExecutable}),destination=join(out,style+'-draft.mp4');let last=-1;
   console.log(`Rendering ${style}, ${spec.duration.toFixed(1)}s, 1440×2560 at 60fps.`);
   if(cmd==='render'){
     const pending=join(out,`${style}-${randomUUID()}.pending.mp4`);
     await renderMedia({serveUrl,composition,codec:'h264',outputLocation:pending,browserExecutable,concurrency:4,scale:4/3,crf:20,pixelFormat:'yuv420p',chromiumOptions:{gl:'angle'},onProgress:({progress})=>{const percent=Math.floor(progress*100/10)*10;if(percent!==last){last=percent;console.log(`${style}: ${percent}%`);}}});
     const meta=probe(pending);if(meta.width!==1440||meta.height!==2560||meta.fps!==60||!meta.audio||meta.duration<60||Math.abs(meta.duration-spec.duration)>.15)throw Error('Story export failed metadata validation.');
     await ffmpeg(['-i',pending,'-f','null','-']);replaceWorkspaceFile(pending,destination);
   }
   for(let i=0;i<spec.scenes.length;i++)await renderStill({serveUrl,composition,browserExecutable,frame:Math.floor((spec.scenes[i].at+spec.scenes[i].duration*.55)*60),scale:1/3,chromiumOptions:{gl:'angle'},output:join(out,`${style}-${i}.png`)});
   if(cmd==='render'){
     if(!completed.includes(style))completed.push(style);
     writeFileSync(join(out,'story-drafts.json'),JSON.stringify({project:id,duration:spec.duration,width:1440,height:2560,fps:60,styles:completed,voice:config.voice,sourceDigest,reviewStatus:'draft; inspect acting, phone frames, transitions and listen before approval'},null,2)+'\n');
   }
 }
}finally{closeSync(fd);unlinkSync(lock);}
function stamp(t){const ms=Math.round(t*1000),s=Math.floor(ms/1000);return `${String(Math.floor(s/3600)).padStart(2,'0')}:${String(Math.floor(s/60)%60).padStart(2,'0')}:${String(s%60).padStart(2,'0')},${String(ms%1000).padStart(3,'0')}`;}
