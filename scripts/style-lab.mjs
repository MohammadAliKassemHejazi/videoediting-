import {existsSync,mkdirSync,writeFileSync,readFileSync,copyFileSync,openSync,closeSync,unlinkSync,renameSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {ROOT,project} from '../lib/project.mjs';
import {ffmpeg,probe} from '../lib/ffmpeg.mjs';
import {STYLES,styleById} from '../lib/style-auditions.js';
import {replaceWorkspaceFile} from '../lib/replace-file.mjs';

const [command='list',id='backend-checklist',...args]=process.argv.slice(2);
const opt=(key,fallback)=>{const i=args.indexOf('--'+key);return i<0?fallback:args[i+1];};
const publicDir=join(ROOT,'remotion/public');
if(command==='list'){
 console.table(STYLES.map(({id,name,family,bestFor})=>({id,name,family,bestFor})));process.exit(0);
}
if(command==='preview'){
 execFileSync(process.execPath,[join(ROOT,'node_modules/@remotion/cli/remotion-cli.js'),'studio','remotion/index.jsx','--public-dir=remotion/public','--port=3000'],{cwd:ROOT,stdio:'inherit'});process.exit(0);
}
const P=project(id),folder=join(P.dir,'style-lab'),output=join(P.out,'styles');mkdirSync(folder,{recursive:true});mkdirSync(output,{recursive:true});
const contentPath=join(P.dir,'STYLE_CONTENT.json'),specPath=join(folder,'audition.json');
if(command==='select'){
 const chosen=opt('style');styleById(chosen);
 if(!existsSync(specPath))throw Error('Create auditions first.');
 const spec=JSON.parse(readFileSync(specPath,'utf8'));
 if(!spec.styles.includes(chosen))throw Error('Choose a style included in this audition set.');
 writeFileSync(join(folder,'choice.json'),JSON.stringify({style:chosen,project:id,chosenAt:new Date().toISOString(),auditionHash:createHash('sha256').update(readFileSync(specPath)).digest('hex')},null,2)+'\n');
 console.log(`Selected ${chosen}. Full-film direction is saved in projects/${id}/style-lab/choice.json. Ask the agent to extend this style using the actual full transcript and storyboard.`);process.exit(0);
}
if(command==='init'){
 const start=Number(opt('start',0)),count=Number(opt('count',5));
 if(!Number.isInteger(count)||count<5||count>10)throw Error('--count must be 5 to 10.');
 if(!Number.isFinite(start)||start<0||start+15>P.film.duration+.01)throw Error('Choose a 15-second window entirely inside the source.');
 if(!existsSync(contentPath))throw Error(`Author projects/${id}/STYLE_CONTENT.json from the corrected transcript first; see docs/STYLE_LAB.md.`);
 const content=JSON.parse(readFileSync(contentPath,'utf8'));
 if(!Array.isArray(content.beats)||!content.beats.length||content.beats[0].at!==0)throw Error('Content needs beats starting at 0.');
 content.beats.forEach((b,i)=>{if(!Number.isFinite(b.at)||b.at<0||b.at>=P.film.duration||(i&&b.at<=content.beats[i-1].at)||typeof b.title!=='string'||!Array.isArray(b.items)||b.items.some(x=>typeof x!=='string')||(b.itemTimes&&(b.itemTimes.length!==b.items.length||b.itemTimes.some(x=>!Number.isFinite(x)||x<b.at||x>=P.film.duration))))throw Error('Invalid semantic beat or item timing.');});
 const styles=opt('styles',STYLES.slice(0,count).map(s=>s.id).join(',')).split(',');
 if(styles.length<5||styles.length>10||new Set(styles).size!==styles.length)throw Error('Choose 5–10 distinct styles.');styles.forEach(styleById);
 mkdirSync(join(publicDir,id),{recursive:true});mkdirSync(join(publicDir,'fonts'),{recursive:true});
 for(const [pack,file]of [['inter','inter-latin-600-normal.woff2'],['source-serif-4','source-serif-4-latin-600-normal.woff2']])copyFileSync(join(ROOT,'node_modules/@fontsource',pack,'files',file),join(publicDir,'fonts',file));
 const media=join(publicDir,id,'speech.mp4');
 // Cache key includes source contents, not just path/mtime. A revised clip cannot reuse stale voice.
 const mediaHash=createHash('sha256').update(readFileSync(P.source)).update('style-lab-1440-v2').digest('hex');
 const key=join(publicDir,id,'speech.sha256');
 if(!existsSync(media)||!existsSync(key)||readFileSync(key,'utf8')!==mediaHash){await ffmpeg(['-i',P.source,'-vf','scale=1440:2560:force_original_aspect_ratio=increase,crop=1440:2560','-pix_fmt','yuv420p','-c:v','libx264','-preset','fast','-crf','20','-c:a','aac','-b:a','192k','-movflags','+faststart',media]);writeFileSync(key,mediaHash);}
 const spec={project:id,title:P.config.title,start,duration:15,media:`${id}/speech.mp4`,styles,beats:content.beats,captions:P.film.captions,sourceHash:mediaHash,note:'Illustrative code-drawn style auditions, original speech. Not a final reviewed film.'};
 writeFileSync(specPath,JSON.stringify(spec,null,2)+'\n');
 writeFileSync(join(ROOT,'remotion/active.json'),JSON.stringify(spec,null,2)+'\n');
 writeFileSync(join(ROOT,'remotion/index.jsx'),rootSource(styles));
 writeFileSync(join(folder,'STYLE_OPTIONS.md'),`# ${P.config.title}: style auditions\n\nSame ${start}–${start+15}s speech excerpt. Local code visuals; no paid generation. These are creative trials, not reviewed finals.\n\n`+styles.map((s,i)=>{const v=styleById(s);return `${i+1}. **${v.name}** (${s}) — ${v.motion}. Best for: ${v.bestFor}. Assets: ${v.assetNeeds}.`;}).join('\n\n')+`\n\nSelect with: npm run styles -- select ${id} --style <id>\nThen ask Codex or Claude to extend the chosen direction through the full transcript.\n`);
 console.log(`Created ${styles.length} live 15-second auditions. Run npm run preview; export with npm run styles -- render ${id}.`);process.exit(0);
}
if(command==='render'||command==='stills'){
 if(!existsSync(specPath))throw Error('Run init first.');
 const spec=JSON.parse(readFileSync(specPath,'utf8'));
 // Switching projects after init must not accidentally export the active project's voice.
 writeFileSync(join(ROOT,'remotion/active.json'),JSON.stringify(spec,null,2)+'\n');writeFileSync(join(ROOT,'remotion/index.jsx'),rootSource(spec.styles));
 mkdirSync(join(ROOT,'.cache'),{recursive:true});const lock=join(ROOT,'.cache/render.lock');let fd;
 try{fd=openSync(lock,'wx');writeFileSync(fd,String(process.pid));}catch{throw Error('Another render is active. Wait until it finishes.');}
 try{
   const {bundle}=await import('@remotion/bundler'),{selectComposition,renderMedia,renderStill}=await import('@remotion/renderer'),{chromium}=await import('playwright');
   const browserExecutable=chromium.executablePath().replace(/chromium-(\d+)/,'chromium_headless_shell-$1').replace(/chrome\.exe$/,'headless_shell.exe');
   const serveUrl=await bundle({entryPoint:join(ROOT,'remotion/index.jsx'),publicDir});
   const requested=opt('styles',spec.styles.join(',')).split(',');
   if(requested.some(s=>!spec.styles.includes(s)))throw Error('Choose styles from this audition set.');
   for(const styleId of requested){
     const composition=await selectComposition({serveUrl,id:styleId,browserExecutable});
     const destination=join(output,styleId+'.mp4'),pending=join(output,styleId+'.pending.mp4');
     if(command==='render'){
     console.log(`Rendering ${styleId} (${spec.duration}s, original voice)…`);
     const graphics=join(P.cache,styleId+'-audition-graphics.mov');let last=-1;
     await renderMedia({serveUrl,composition,inputProps:{...composition.props,graphicsOnly:true},codec:'prores',proResProfile:'4444',imageFormat:'png',outputLocation:graphics,browserExecutable,concurrency:4,scale:4/3,pixelFormat:'yuva444p10le',onProgress:({progress})=>{const p=Math.floor(progress*10)*10;if(p!==last){last=p;console.log(`${styleId}: ${p}%`);}}});
     await ffmpeg(['-ss',String(spec.start),'-i',P.source,'-i',graphics,'-filter_complex','[0:v]scale=1440:2560:force_original_aspect_ratio=increase,crop=1440:2560:(iw-ow)*0.5:(ih-oh)*0.43,fps=60[base];[base][1:v]overlay=0:0:format=auto[v]','-map','[v]','-map','0:a:0','-c:v','libx264','-preset','fast','-crf','20','-pix_fmt','yuv420p','-r','60','-c:a','aac','-b:a','192k','-t',String(spec.duration),'-movflags','+faststart',pending]);
     const meta=probe(pending);if(!meta.audio||Math.abs(meta.duration-15)>.12||meta.width!==1440||meta.height!==2560||meta.fps!==60)throw Error('Invalid style export: '+styleId);
     await ffmpeg(['-i',pending,'-f','null','-']);replaceWorkspaceFile(pending,destination);unlinkSync(graphics);
     }
     for(const time of [1,5,12,14])await renderStill({serveUrl,composition,browserExecutable,frame:time*60,scale:1/3,output:join(output,`${styleId}-${time}.png`)});
   }
   if(command==='render')writeFileSync(join(output,'manifest.json'),JSON.stringify({spec,sourceDigest:createHash('sha256').update(readFileSync(join(ROOT,'remotion/Audition.jsx'))).update(readFileSync(join(ROOT,'lib/style-auditions.js'))).digest('hex'),renderedAt:new Date().toISOString(),width:1440,height:2560,fps:60},null,2)+'\n');
   console.log(`All style drafts exported to out/${id}/styles. Review before extending one into the full film.`);
 }finally{closeSync(fd);unlinkSync(lock);}
 process.exit(0);
}
throw Error('Commands: list, init <project> [--count 5..10] [--start 0], preview, render <project>, select <project> --style <id>');
function rootSource(styles){
 const storyFile=join(ROOT,'remotion/story-active.json'),story=existsSync(storyFile)?JSON.parse(readFileSync(storyFile,'utf8')):null;
 const storyImports=story?"import {Story} from './Story.jsx';\nimport story from './story-active.json';\n":'';
 const storyComps=story?`<Folder name="Full-story-demos">\n${story.styles.map(s=>`<Composition id="${s}" component={Story} width={1080} height={1920} fps={60} durationInFrames={Math.ceil(story.duration*60)} defaultProps={{spec:story,styleId:'${s}'}}/>`).join('\n')}\n</Folder>`:'';
 return `import React from 'react';\nimport {registerRoot,Composition,Folder} from 'remotion';\nimport {Audition} from './Audition.jsx';\nimport spec from './active.json';\n${storyImports}registerRoot(() => <> <Folder name="Style-auditions">\n${styles.map(s=>`  <Composition id="${s}" component={Audition} width={1080} height={1920} fps={60} durationInFrames={Math.round(spec.duration*60)} defaultProps={{spec,styleId:'${s}'}}/>`).join('\n')}\n</Folder>${storyComps}</>);\n`;
}
