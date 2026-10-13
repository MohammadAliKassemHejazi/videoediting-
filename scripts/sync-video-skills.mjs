// Codex discovers .agents/skills; Claude discovers .claude/skills.
// Copies preserve relative references and helpers. No symlink privileges needed.
import {existsSync,readdirSync,readFileSync,mkdirSync,copyFileSync,writeFileSync} from 'node:fs';
import {join,relative} from 'node:path';
import {createHash} from 'node:crypto';
import {ROOT,filesIn} from '../lib/project.mjs';
const canonical=join(ROOT,'.agents/skills'),target=join(ROOT,'.claude/skills'),check=process.argv.includes('--check');
const manifest=join(ROOT,'.claude/skills-sync.json'),previous=existsSync(manifest)?JSON.parse(readFileSync(manifest,'utf8')):{};
const hash=file=>createHash('sha256').update(readFileSync(file)).digest('hex');
let failures=0,count=0;const managed={};
for(const entry of readdirSync(canonical,{withFileTypes:true}).filter(e=>e.isDirectory())){
 const skill=join(canonical,entry.name);if(!existsSync(join(skill,'SKILL.md')))continue;
 for(const source of filesIn(skill).filter(f=>!relative(skill,f).split(/[\\/]/).includes('.git'))){
   const rel=relative(canonical,source).replaceAll('\\','/'),destination=join(target,rel),digest=hash(source);managed[rel]=digest;
   if(existsSync(destination)&&hash(destination)===digest)continue;
   if(check){console.error('Missing or different Claude skill file: '+rel);failures++;continue;}
   if(existsSync(destination)&&previous[rel]!==hash(destination))throw Error('Claude skill has independent edits; refusing overwrite: '+rel);
   mkdirSync(join(destination,'..'),{recursive:true});copyFileSync(source,destination);
 }
 count++;
}
if(check){if(failures)process.exitCode=1;else console.log(`${count} skill packages match for Codex and Claude.`);}
else{writeFileSync(manifest,JSON.stringify(managed,null,2)+'\n');console.log(`Synced ${count} skills to Claude. They are available on the next agent turn; restart the client if its skill list is cached.`);}
