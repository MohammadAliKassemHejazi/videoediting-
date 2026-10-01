import {existsSync,mkdirSync,readFileSync,writeFileSync,copyFileSync,unlinkSync,openSync,closeSync} from 'node:fs';
import {resolve,relative,join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {project,projectHash,filesIn,safeRemove,ROOT} from './lib/project.mjs';
import {probe} from './lib/ffmpeg.mjs';
const [cmd='help',name='developer-stack',...args]=process.argv.slice(2),opt=(key,defaultValue)=>args.includes('--'+key)?args[args.indexOf('--'+key)+1]:defaultValue;
const run=(script,argv=[])=>execFileSync(process.execPath,[script,...argv],{stdio:'inherit',cwd:ROOT});
if(cmd==='help'){console.log(`Tech Video Studio\n\nnew <name> --source <clip> [--language Arabic]\ninspect <name>       footage metadata\ntranscribe <name>    local word timings\nassets <name>        prompts + prepare supplied assets\nprepare <name>       cached person mask\ndraft <name>         draft, contact, phone, strip\nreview <name> --notes "What you inspected and corrected"\nfinal <name>         reviewed MP4, captions, thumbnail + checks\ncheck <name>         validate export\nclean <name> [--apply]  preview/remove rebuildable intermediates\n\nDefault project: developer-stack. Codex designs each timeline; this CLI renders it.`);process.exit(0);}
if(cmd==='new'){
 if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name))throw Error('Use a lowercase project name with hyphens.');
 const dir=join(ROOT,'projects',name);if(existsSync(dir))throw Error('Project already exists; choose a different name.');
 const input=opt('source');if(!input)throw Error('Supply --source "path/to/clip.mp4"');const source=resolve(input),meta=probe(source);if(!meta.audio)throw Error('Provide a clip with speech audio.');
 let sourcePath=relative(ROOT,source).replaceAll('\\','/');if(sourcePath.startsWith('..')){const dest=join(ROOT,'clips',name+'.mp4');if(existsSync(dest))throw Error('Imported clip path already exists.');copyFileSync(source,dest);sourcePath='clips/'+name+'.mp4';}
 mkdirSync(join(dir,'assets/inbox'),{recursive:true});mkdirSync(join(dir,'reference'),{recursive:true});
 const config={title:name.replaceAll('-',' '),source:sourcePath,language:opt('language','Arabic'),captions:'English',style:'approved-tech-editorial',framing:{focusX:.5,focusY:.5,cardTop:1120,sourceY:400},reviewTimes:[.2,meta.duration/2,meta.duration-.2],thumbnail:{file:'assets/thumbnail.png',headline:'Choose a truthful hook from the video'},assets:[]};
 writeFileSync(join(dir,'project.json'),JSON.stringify(config,null,2));writeFileSync(join(dir,'timeline.js'),'window.REFERENCE_EDIT = '+JSON.stringify({id:name,duration:meta.duration,accents:null,split:[],punches:[],scenes:[],fullscreen:[],captions:[],cues:[]},null,2)+';\n');
 writeFileSync(join(dir,'scenes.js'),'// Register original scene painters using SceneKit.register(name, (time, scene) => {...}).\n');
 writeFileSync(join(dir,'BRIEF.md'),`# ${config.title}\n\nSource: ${sourcePath}\nSpeech: ${config.language}; captions: English.\n\nBefore designing: inspect the footage and reference, correct the transcript, identify the hook, claims and payoff. Write a shot list linking each visual to a spoken phrase and a useful proof/demo. Use the approved style as a starting point; choose a fresh visual concept for this topic.\n\nAsk only for missing preferences or assets that materially affect the edit. Request generated media through ASSET_REQUESTS.md. Thumbnail is a required deliverable.\n`);
 console.log(`Created projects/${name}. Ask Codex to transcribe, storyboard and edit this project.`);process.exit(0);
}
const P=project(name);mkdirSync(P.out,{recursive:true});mkdirSync(P.cache,{recursive:true});
if(cmd==='inspect'){console.log(JSON.stringify({project:name,...probe(P.source),captions:P.config.captions,scenes:P.film.scenes.length,thumbnailReady:existsSync(join(P.dir,P.config.thumbnail.file))},null,2));}
else if(cmd==='transcribe')run('scripts/transcribe.mjs',[`--project=${name}`]);
else if(cmd==='assets')run('scripts/project-assets.mjs',[name]);
else if(cmd==='prepare')run('scripts/prepare-project.mjs',[name]);
else if(cmd==='review'){
 const notes=opt('notes');if(!notes)throw Error('Inspect contact.png, phone.png and strip.png, then provide --notes.');
 for(const f of ['draft.mp4','draft.json','contact.png','phone.png','strip.png'])if(!existsSync(join(P.out,f)))throw Error('Render a draft first: missing '+f);
 const hash=projectHash(P);if(JSON.parse(readFileSync(join(P.out,'draft.json'),'utf8')).sourceHash!==hash)throw Error('Draft is stale. Re-render changes before review.');
 writeFileSync(join(P.out,'review.json'),JSON.stringify({sourceHash:hash,notes,reviewedAt:new Date().toISOString(),reviewer:'Codex or human; notes describe actual inspection'},null,2));console.log('Current visual review recorded.');
}else if(cmd==='draft'||cmd==='final'){
 const lock=join(ROOT,'.cache','render.lock');let fd;try{fd=openSync(lock,'wx');writeFileSync(fd,String(process.pid));}catch{throw Error('Another studio render is active. Do not run simultaneous renders; they share render.mjs chunks.');}
 try{run('scripts/project-assets.mjs',[name,'--required']);run('scripts/prepare-project.mjs',[name]);run('scripts/render-project.mjs',[`--project=${name}`,cmd==='final'?'--final':'--draft']);if(cmd==='final')run('scripts/check-project.mjs',[name]);}finally{closeSync(fd);unlinkSync(lock);}
}else if(cmd==='check')run('scripts/check-project.mjs',[name]);
else if(cmd==='clean'){
 const candidates=filesIn(P.cache).filter(f=>/(_graphics\.mov|voice\.f32|quiet-cues\.wav|encode-progress\.txt)$/.test(f));
 for(const f of ['draft.mp4','draft.json'])if(existsSync(join(P.out,f)))candidates.push(join(P.out,f));
 console.log(candidates.map(f=>relative(ROOT,f)).join('\n')||'Nothing to clean.');
 if(args.includes('--apply')){let bytes=0;for(const file of candidates)bytes+=safeRemove(file);console.log(`Removed ${(bytes/1048576).toFixed(1)} MiB. Source, mask cache, review images, final, approved cut and thumbnail retained.`);}
 else console.log('Preview only. Add --apply to remove these rebuildable files.');
}else throw Error('Unknown command. Run npm run studio -- help');
