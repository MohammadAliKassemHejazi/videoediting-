import {chromium} from 'playwright';
import {studioBrowserExecutable} from '../lib/studio-browser.mjs';
import {writeFileSync} from 'node:fs';
const browser=await chromium.launch({headless:true,executablePath:studioBrowserExecutable()}),page=await browser.newPage({viewport:{width:1500,height:950}}),errors=[];
try{
 page.on('pageerror',e=>errors.push(e.message));await page.goto('http://localhost:3000/shadow-went-first',{waitUntil:'domcontentloaded'});await page.waitForSelector('video',{timeout:30000});await page.waitForFunction(()=>[...document.querySelectorAll('video')].some(v=>v.readyState>=2),{},{timeout:30000});
 const source=await page.locator('video').first().evaluate(v=>v.currentSrc||v.src),base=source.slice(0,source.indexOf('/shadow-went-first/'));
 if(!base.includes('/static-'))throw Error('Expected real Remotion static media URL.');
 await page.screenshot({path:'out/shadow-went-first/live-studio.png'});
 const media=await page.evaluate(async({base})=>{
  const results=[],video=document.createElement('video');video.muted=true;document.body.append(video);
  for(let i=0;i<13;i++){
   const id=String(i).padStart(2,'0');
   const result=await new Promise(resolve=>{const timeout=setTimeout(()=>resolve({id,error:'timeout'}),15000);video.onloadeddata=()=>{clearTimeout(timeout);resolve({id,ready:video.readyState,width:video.videoWidth,height:video.videoHeight,duration:video.duration})};video.onerror=()=>{clearTimeout(timeout);resolve({id,error:video.error?.message,code:video.error?.code})};video.src=base+'/shadow-went-first/shots/'+id+'.mp4?check='+Date.now();video.load()});results.push(result);
  }video.remove();return results;
 },{base});
 const gallery=await(await fetch('http://localhost:3001/api/styles')).json(),report={at:new Date().toISOString(),browser:studioBrowserExecutable(),errors,media,gallery:gallery.filter(s=>['warm-creature-story','shadow-went-first'].includes(s.project))};
 writeFileSync('out/shadow-went-first/playback-check.json',JSON.stringify(report,null,2)+'\n');
 if(errors.length||media.some(m=>m.error||m.width!==448||m.height!==800))throw Error('Playback inspection failed; see report.');
 console.log('Live composition and all 13 H.264 shots loaded in installed Chrome without page/media errors.');
}finally{await browser.close()}
