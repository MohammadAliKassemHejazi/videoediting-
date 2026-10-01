import {readFileSync,existsSync,readdirSync,statSync,realpathSync,lstatSync,rmSync} from 'node:fs';
import {resolve,relative,sep,join} from 'node:path';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
export const ROOT=resolve(import.meta.dirname,'..');
export function project(id='developer-stack') {
 if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id))throw Error('Project names use lowercase letters, numbers and hyphens.');
 const dir=join(ROOT,'projects',id),config=JSON.parse(readFileSync(join(dir,'project.json'),'utf8'));
 const box={window:{}};vm.createContext(box);vm.runInContext(readFileSync(join(dir,'timeline.js'),'utf8'),box,{timeout:1000});
 const film=JSON.parse(JSON.stringify(box.window.REFERENCE_EDIT));
 if(!film||!(film.duration>0))throw Error('Timeline needs a positive duration.');
 for(const [a,b,s]of film.captions||[])if(!(a>=0&&b>a&&b<=film.duration+.01&&typeof s==='string'))throw Error('Invalid caption interval.');
 for(const scene of [...film.scenes||[],...film.fullscreen||[]])if(!(scene.a>=0&&scene.b>scene.a&&scene.b<=film.duration))throw Error('Invalid scene interval.');
 const scenes=[...(film.scenes||[])].sort((a,b)=>a.a-b.a);for(let i=1;i<scenes.length;i++)if(scenes[i].a<scenes[i-1].b)throw Error('Scene intervals overlap.');
 for(const t of film.cues||[])if(!(t>=0&&t<film.duration))throw Error('Invalid audio cue.');
 return {id,dir,config,film,source:resolve(ROOT,config.source),cache:join(ROOT,'.cache',id),out:join(ROOT,'out',id)};
}
export function filesIn(dir){if(!existsSync(dir))return [];return readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?filesIn(join(dir,e.name)):e.isFile()?[join(dir,e.name)]:[]);}
export function digest(paths){const hash=createHash('sha256');for(const p of [...new Set(paths)].sort()){hash.update(relative(ROOT,p));hash.update(readFileSync(p));}return hash.digest('hex');}
export function sourceHash(p){return digest([p.source]);}
export function projectHash(p){return digest([p.source,join(p.dir,'project.json'),join(p.dir,'timeline.js'),join(p.dir,'scenes.js'),...filesIn(join(p.dir,'assets')),...filesIn(join(ROOT,'assets/brand/tech')).filter(x=>/\.svg$/.test(x)),...['index.html','lib/scene-kit.js','lib/motion.js','lib/project.mjs','scripts/render-project.mjs','scripts/project-assets.mjs','scripts/prepare-project.mjs','package-lock.json'].map(x=>join(ROOT,x)),...(existsSync(join(p.cache,'person-mask.mkv'))?[join(p.cache,'person-mask.mkv')]:[])]);}
export function safeRemove(target){
 const absolute=resolve(target),base=realpathSync(ROOT);if(!absolute.startsWith(base+sep)||absolute===base)throw Error(`Refusing path outside workspace: ${absolute}`);
 const rel=relative(base,absolute).split(sep);if(rel.some(s=>['.git','.codex'].includes(s)))throw Error('Protected configuration');
 if(!existsSync(absolute))return 0;if(lstatSync(absolute).isSymbolicLink())throw Error('Refusing symlink deletion');
 if(!realpathSync(absolute).startsWith(base+sep))throw Error('Resolved path outside workspace');
 const bytes=statSync(absolute).isDirectory()?filesIn(absolute).reduce((s,f)=>s+statSync(f).size,0):statSync(absolute).size;
 rmSync(absolute,{recursive:true,force:false});return bytes;
}
