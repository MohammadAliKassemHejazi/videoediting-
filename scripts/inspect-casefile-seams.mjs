import {chromium} from 'playwright';
import {writeFileSync,readFileSync} from 'node:fs';
import {studioBrowserExecutable} from '../lib/studio-browser.mjs';
const duration=JSON.parse(readFileSync('remotion/texas-steps-film.json','utf8')).duration;
const times=process.argv.slice(2).map(Number);if(!times.length||times.some(t=>!Number.isFinite(t)||t<0||t>=duration))throw Error('Supply review times within the current film');
const browser=await chromium.launch({headless:true,executablePath:studioBrowserExecutable(),args:['--disable-gpu']}),page=await browser.newPage({viewport:{width:1500,height:1000}}),errors=[],results=[];
try{
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://localhost:3002/texas-ten-thousand-steps',{waitUntil:'domcontentloaded'});
 await page.waitForSelector('button.__remotion_input_dragger[aria-label="0"]',{timeout:45000});
 for(const time of times){
  const frame=Math.round(time*60);
  const label=await page.locator('button.__remotion_input_dragger').evaluateAll(items=>items.filter(i=>{const r=i.getBoundingClientRect();return r.x<160&&r.y>window.innerHeight*.65&&/^\d+$/.test(i.getAttribute('aria-label')||'')})[0]?.getAttribute('aria-label'));
  if(label===undefined)throw Error('Cannot locate Studio frame control');
  await page.locator('button.__remotion_input_dragger[aria-label="'+label+'"]').click();
  await page.locator('input:focus').fill(String(frame));await page.locator('input:focus').press('Enter');
  await page.waitForSelector('button.__remotion_input_dragger[aria-label="'+frame+'"]');
  await page.waitForFunction(()=>[...document.querySelectorAll('video,img[src*="/texas-ten-thousand-steps/keyframes/"]')].some(el=>el.getBoundingClientRect().width>0),{},{timeout:30000});
  await page.waitForTimeout(600);
  const video=page.locator('video:visible').first(),still=page.locator('img[src*="/texas-ten-thousand-steps/keyframes/"]:visible').first();
  const element=page.locator('video:visible,img[src*="/texas-ten-thousand-steps/keyframes/"]:visible').first();await element.waitFor({state:'visible'});
  if(await video.count())await page.waitForFunction(()=>[...document.querySelectorAll('video')].filter(v=>v.getBoundingClientRect().width>0).some(v=>v.readyState>=2),{},{timeout:15000});
  const bounds=await element.evaluate(el=>{for(let p=el.parentElement;p;p=p.parentElement){const r=p.getBoundingClientRect();if(r.width>100&&Math.abs(r.width/r.height-1440/2560)<.015&&r.x>=0&&r.y>=0&&r.bottom<=window.innerHeight)return{x:r.x,y:r.y,width:r.width,height:r.height}}const r=el.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height}});
  await page.screenshot({path:'out/texas-ten-thousand-steps/preview-frame-'+frame+'.png',clip:bounds});
  results.push({time,frame,videos:await page.locator('video').evaluateAll(videos=>videos.map(v=>({src:v.currentSrc,time:v.currentTime,ready:v.readyState,error:v.error?.message||null}))),bounds});
 }
 writeFileSync('out/texas-ten-thousand-steps/seam-preview-check.json',JSON.stringify({at:new Date().toISOString(),errors,results,status:'Screenshots captured for visual review; this does not claim listening or final-film approval'},null,2)+'\n');
 if(errors.length||results.some(r=>r.videos.some(v=>v.error)))throw Error('Preview errors during seeking');
 console.log('Captured '+times.length+' actual Studio timeline frames; inspect their alignment and seams.');
}finally{await browser.close()}
