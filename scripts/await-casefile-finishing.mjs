import {spawn} from 'node:child_process';
import {existsSync,readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {join} from 'node:path';
import {ROOT} from '../lib/project.mjs';
const project=process.argv[2];if(project!=='texas-ten-thousand-steps')throw Error('Prepared Episode2 required');
if(!process.argv.includes('--approved-export'))throw Error('Preview-first policy: automatic finishing requires approval of the current preview and an explicit export request.');
const folder=join(ROOT,'projects',project),cache=join(ROOT,'.cache',project),stateFile=join(cache,'finishing-state.json');mkdirSync(cache,{recursive:true});
const state=status=>{writeFileSync(stateFile,JSON.stringify({pid:process.pid,project,status,at:new Date().toISOString()},null,2)+'\n');console.log(status)};
async function run(script,args=[]){state('Running '+script);await new Promise((resolve,reject)=>{const c=spawn(process.execPath,[join(ROOT,script),project,...args,...(script==='scripts/render-casefile-episode.mjs'?['--approved-export']:[])],{cwd:ROOT,stdio:'inherit',windowsHide:true});c.on('error',reject);c.on('exit',code=>code===0?resolve():reject(Error(script+' failed ('+code+')')))})}
try{
 let last=-1;
 for(;;){const plan=JSON.parse(readFileSync(join(folder,'production-scenes.json'),'utf8')),count=plan.scenes.filter(s=>existsSync(join(folder,'assets/shots',s.id+'-h3.mp4'))&&existsSync(join(folder,'assets/shots',s.id+'-generation.json'))).length;
  if(count!==last){last=count;state('Waiting: '+count+'/'+plan.scenes.length+' completed H3 sources')}
  if(count===plan.scenes.length&&!existsSync(join(ROOT,'.cache/render.lock'))){const q=await(await fetch('http://127.0.0.1:8189/queue')).json();if(!q.queue_running.length&&!q.queue_pending.length)break}
  await new Promise(r=>setTimeout(r,15000));
 }
 await run('scripts/prepare-casefile-units.mjs');
 if(!existsSync(join(ROOT,'story-projects',project,'assets/mix.wav')))await run('scripts/make-casefile-audio.mjs');
 await run('scripts/enhance-casefile-shots.mjs');
 await run('scripts/sync-casefile-episode.mjs');
 await run('scripts/render-casefile-episode.mjs',['--reverse-check']);
 await run('scripts/render-casefile-episode.mjs');
 state('Actual110s2K60 draft rendered and decode-checked. Final visual, mouth and listening review statuses remain separate.');
}catch(e){state('Failed: '+e.message);process.exitCode=1}
