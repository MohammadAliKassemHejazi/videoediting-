import {chromium} from 'playwright';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {studioBrowserExecutable} from '../lib/studio-browser.mjs';
const spec=JSON.parse(readFileSync('remotion/texas-film.json','utf8'));
const browser=await chromium.launch({headless:true,executablePath:studioBrowserExecutable(),args:['--disable-gpu']}),page=await browser.newPage({viewport:{width:1500,height:1000}}),errors=[];
mkdirSync('out/texas-cinema-myth',{recursive:true});
try{
 page.on('pageerror',error=>errors.push(error.message));
 await page.goto('http://localhost:3002/texas-cinema-myth',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>[...document.querySelectorAll('video')].some(v=>v.readyState>=2),{},{timeout:45000});
 await page.waitForFunction(()=>document.fonts.check('600 76px TexasSerif'),{},{timeout:15000});
 const first=await page.locator('video').first().evaluate(async video=>{video.muted=true;await video.play();await new Promise(r=>setTimeout(r,300));return{width:video.videoWidth,height:video.videoHeight,time:video.currentTime,src:video.currentSrc,error:video.error?.message}});
 const base=first.src.slice(0,first.src.indexOf('/texas-cinema-myth/'));
 if(!base.includes('/static-'))throw Error('Unexpected public path');
 const media=await page.evaluate(async({base,shots})=>{
  const video=document.createElement('video');video.muted=true;document.body.append(video);const results=[];
  for(const shot of shots.filter(s=>s.available)){
   results.push(await new Promise(resolve=>{const timeout=setTimeout(()=>resolve({id:shot.id,error:'timeout'}),15000);video.onloadeddata=()=>{clearTimeout(timeout);resolve({id:shot.id,width:video.videoWidth,height:video.videoHeight,duration:video.duration})};video.onerror=()=>{clearTimeout(timeout);resolve({id:shot.id,error:video.error?.message,code:video.error?.code})};video.src=base+'/'+shot.source+'?v='+shot.version;video.load()}));
  }video.remove();return results;
 },{base,shots:spec.shots});
 const audio=await page.locator('audio').evaluateAll(videos=>videos.filter(v=>v.src).map(v=>({src:v.currentSrc||v.src,ready:v.readyState,duration:v.duration,error:v.error?.message||null})));
 await page.screenshot({path:'out/texas-cinema-myth/full-timeline-preview.png'});
 const report={at:new Date().toISOString(),errors,readyCount:spec.readyCount,complete:spec.complete,media,audio,fontLoaded:true,first,inputs:await page.locator('input').evaluateAll(items=>items.map(i=>({type:i.type,value:i.value,title:i.title,placeholder:i.placeholder,aria:i.getAttribute('aria-label')})))};
 writeFileSync('out/texas-cinema-myth/episode-preview-check.json',JSON.stringify(report,null,2)+'\n');
 if(errors.length||first.error||media.some(m=>m.error||m.width!==352||m.height!==640)||audio.some(a=>a.error))throw Error('Episode preview media failure; see report');
 console.log('Full90s composition, local font and '+media.length+' real H3 sources loaded in Chrome; incomplete scenes remain labeled keyframes.');
}finally{await browser.close()}
