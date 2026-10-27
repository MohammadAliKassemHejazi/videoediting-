import {chromium} from 'playwright';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {studioBrowserExecutable} from '../lib/studio-browser.mjs';
const review=JSON.parse(readFileSync('series/texas-casefiles/voice-casting/SOUND_REVIEW.json','utf8'));
const browser=await chromium.launch({headless:true,executablePath:studioBrowserExecutable(),args:['--disable-gpu']}),page=await browser.newPage({viewport:{width:1200,height:900}}),errors=[],checks=[];
const out='out/texas-ten-thousand-steps';mkdirSync(out,{recursive:true});
try{
 page.on('pageerror',e=>errors.push(e.message));await page.goto(review.url);
 for(const audio of await page.locator('audio').all()){
  await audio.evaluate(a=>{a.muted=true;a.load()});
  await audio.evaluate(a=>new Promise((resolve,reject)=>{if(a.readyState>=2)return resolve();a.addEventListener('loadeddata',resolve,{once:true});a.addEventListener('error',()=>reject(Error(a.error?.message)),{once:true})}));
  await audio.evaluate(a=>a.play());await page.waitForTimeout(400);
  const result=await audio.evaluate(a=>({name:a.getAttribute('aria-label'),duration:a.duration,time:a.currentTime,error:a.error?.message||null}));
  if(result.error||result.time<.05||Math.abs(result.duration-review.duration)>.03)throw Error('Audio playback failed '+JSON.stringify(result));checks.push(result);await audio.evaluate(a=>a.pause());
 }
 await page.getByRole('button',{name:'Final question',exact:true}).click();await page.waitForTimeout(450);
 const jump=await page.locator('#mix').evaluate(a=>({time:a.currentTime,error:a.error?.message||null}));if(jump.error||jump.time<review.duration-8)throw Error('Final scene jump failed');
 await page.locator('#mix').evaluate(a=>a.pause());await page.setViewportSize({width:390,height:844});
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);if(overflow||errors.length)throw Error('Review layout/runtime error');
 await page.screenshot({path:out+'/sound-review-phone.png',fullPage:true});
 writeFileSync(out+'/sound-review-playback.json',JSON.stringify({review,checks,jump,errors,phoneOverflow:false,passed:true,listeningReview:'Not claimed: muted browser codec/playback checks only.'},null,2)+'\n');console.log('All three sound-review tracks decode/play and final scene seek works.');
}finally{await browser.close()}
