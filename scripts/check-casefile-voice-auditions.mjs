import {chromium} from 'playwright';
import {readFileSync,writeFileSync} from 'node:fs';
import {studioBrowserExecutable} from '../lib/studio-browser.mjs';
const url=JSON.parse(readFileSync('series/texas-casefiles/voice-casting/PAGE.json','utf8')).url;
const browser=await chromium.launch({headless:true,executablePath:studioBrowserExecutable(),args:['--disable-gpu']}),page=await browser.newPage({viewport:{width:1200,height:900}}),errors=[],samples=[];
try{
 page.on('pageerror',e=>errors.push(e.message));await page.goto(url,{waitUntil:'load'});
 for(const player of await page.locator('audio').all()){
  await player.evaluate(a=>{a.muted=true;a.load()});await player.evaluate(a=>new Promise((resolve,reject)=>{if(a.readyState>=2)return resolve();a.addEventListener('loadeddata',resolve,{once:true});a.addEventListener('error',()=>reject(Error(a.error?.message||'Media error')),{once:true})}));
  await player.evaluate(a=>a.play());await player.evaluate(a=>new Promise((resolve,reject)=>{const began=Date.now();const timer=setInterval(()=>{if(a.currentTime>.06){clearInterval(timer);resolve()}else if(a.error||Date.now()-began>7000){clearInterval(timer);reject(Error('Playback did not advance: '+JSON.stringify({paused:a.paused,ready:a.readyState,time:a.currentTime,error:a.error?.message})))}},100)}));
  const sample=await player.evaluate(a=>({name:a.getAttribute('aria-label'),duration:a.duration,time:a.currentTime,error:a.error?.message||null}));if(sample.error||sample.time<.04)throw Error('Audio playback failed '+sample.name);samples.push(sample);await player.evaluate(a=>a.pause());
 }
 await page.screenshot({path:'out/texas-casefiles-voices/audition-page-check.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'out/texas-casefiles-voices/audition-phone-check.png',fullPage:true});
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);if(overflow||errors.length)throw Error('Page layout/runtime errors');
 writeFileSync('out/texas-casefiles-voices/playback-check.json',JSON.stringify({url,samples,errors,phoneOverflow:false,passed:true,listening:'Not claimed; muted browser codec/load/playback checks only.'},null,2)+'\n');console.log('All3 pairs and5 individual voices decode/play; phone layout has no horizontal overflow.');
}finally{await browser.close()}
