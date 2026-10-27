import {spawn} from 'node:child_process';
import {writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {ROOT} from '../lib/project.mjs';
const project=process.argv[2];if(project!=='texas-ten-thousand-steps')throw Error('Select prepared Episode2');
if(!process.argv.includes('--approved-export'))throw Error('User stopped rendering. Preview approval and an explicit export request are required.');
const state=status=>{writeFileSync(join(ROOT,'.cache',project,'revision-v3-state.json'),JSON.stringify({pid:process.pid,status,at:new Date().toISOString()},null,2)+'\n');console.log(status)};
async function run(script,args=[]){state('Running '+script+' '+args.join(' '));await new Promise((resolve,reject)=>{const c=spawn(process.execPath,[join(ROOT,script),project,...args,...(script==='scripts/render-casefile-episode.mjs'?['--approved-export']:[])],{cwd:ROOT,windowsHide:true,stdio:'inherit'});c.on('error',reject);c.on('exit',code=>code===0?resolve():reject(Error(script+' failed '+code)))})}
try{await run('scripts/render-casefile-episode.mjs',['--reverse-check']);await run('scripts/render-casefile-episode.mjs');await run('scripts/review-casefile-master.mjs');await run('scripts/check-casefile-playback.mjs');state('V3 movie rendered, decoded, review images extracted and browser playback checked. Actual visual inspection and listening approval remain separate.')}catch(e){state('Failed: '+e.message);process.exitCode=1}
