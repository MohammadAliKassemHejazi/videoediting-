// Prepare exact source units and the sound master only after the serial H3
// generator finishes and releases its shared lock. Never overlap GPU/render jobs.
import {spawn} from 'node:child_process';
import {existsSync,writeFileSync,mkdirSync} from 'node:fs';
import {join} from 'node:path';
import {ROOT} from '../lib/project.mjs';
const cache=join(ROOT,'.cache/texas-cinema-myth'),lock=join(ROOT,'.cache/render.lock');mkdirSync(cache,{recursive:true});
const state=join(cache,'finishing-wait.json');
const record=status=>writeFileSync(state,JSON.stringify({pid:process.pid,status,at:new Date().toISOString()},null,2)+'\n');
const run=script=>new Promise((resolve,reject)=>{const child=spawn(process.execPath,[join(ROOT,script)],{cwd:ROOT,stdio:'inherit',windowsHide:true});child.on('error',reject);child.on('exit',code=>code===0?resolve():reject(Error(script+' failed with '+code)))});
record('Waiting for23 generated source records and the global lock to clear');
console.log('Finishing preparation waits for H3; it will not start a competing render.');
while(!existsSync(join(ROOT,'projects/texas-cinema-myth/assets/shots/23-generation.json'))||existsSync(lock))await new Promise(r=>setTimeout(r,15000));
try{
 record('Preparing exact4s native intermediate units');await run('scripts/prepare-texas-units.mjs');
 record('Mastering continuous local narration and original synthesized sound');await run('scripts/make-texas-audio.mjs');
 await run('scripts/sync-texas-episode.mjs');record('Source units and90s sound master prepared; visual finishing/export/listening remain');
 console.log('Finishing preparation complete. Inspect stamp alignment and enhancement before exporting.');
}catch(error){record('Failed: '+error.message);throw error}
