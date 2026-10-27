import {chromium} from 'playwright';
import {readFileSync,writeFileSync} from 'node:fs';
import {casefileDigest} from '../lib/casefile-film.mjs';
import {ROOT} from '../lib/project.mjs';
import {studioBrowserExecutable} from '../lib/studio-browser.mjs';
const project=process.argv[2];if(project!=='texas-ten-thousand-steps')throw Error('Select Episode2');
const out='out/'+project,manifest=JSON.parse(readFileSync(out+'/render-manifest.json','utf8'));if(manifest.sourceDigest!==casefileDigest(ROOT,project))throw Error('Movie is stale');
const catalog=await(await fetch('http://localhost:3001/api/styles')).json(),entry=catalog.find(e=>e.project===project&&e.ready);if(!entry)throw Error('Gallery does not expose current completed movie');
const browser=await chromium.launch({headless:true,executablePath:studioBrowserExecutable(),args:['--disable-gpu']}),page=await browser.newPage(),errors=[],samples=[];
try{
 page.on('pageerror',e=>errors.push(e.message));await page.goto('http://localhost:3001');
 await page.setContent('<video id="film" muted playsinline preload="auto" style="height:90vh" src="http://localhost:3001/media/'+encodeURIComponent(entry.id)+'"></video>');
 await page.waitForFunction(()=>document.querySelector('video')?.readyState>=2,{},{timeout:60000});
 for(const time of [.3,16,28.3,55,81,96,106.6]){
  await page.evaluate(t=>{const v=document.querySelector('video');v.pause();v.currentTime=t},time);
  await page.waitForFunction(t=>{const v=document.querySelector('video');return !v.seeking&&v.readyState>=2&&Math.abs(v.currentTime-t)<.2},time,{timeout:30000});
  await page.evaluate(()=>document.querySelector('video').play());await page.waitForTimeout(450);
  const sample=await page.evaluate(()=>{const v=document.querySelector('video');return{time:v.currentTime,width:v.videoWidth,height:v.videoHeight,ready:v.readyState,error:v.error?.message||null}});
  if(sample.error||sample.time<=time+.08)throw Error('Playback did not advance near '+time);samples.push({requested:time,...sample});
 }
 const result={sourceDigest:manifest.sourceDigest,at:new Date().toISOString(),browser:studioBrowserExecutable(),errors,samples,passed:errors.length===0,listening:'Not claimed; muted codec/playback validation only'};
 writeFileSync(out+'/browser-playback-check.json',JSON.stringify(result,null,2)+'\n');if(errors.length)throw Error('Browser errors');console.log('Actual completed movie played seven sampled sections without media errors.');
}finally{await browser.close()}
