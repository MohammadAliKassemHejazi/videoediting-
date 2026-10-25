import {chromium} from 'playwright';
import {mkdirSync,writeFileSync} from 'node:fs';
import {studioBrowserExecutable} from '../lib/studio-browser.mjs';
const browser=await chromium.launch({headless:true,executablePath:studioBrowserExecutable(),args:['--disable-gpu']}),page=await browser.newPage({viewport:{width:1450,height:1000}}),errors=[];
mkdirSync('out/texas-cinema-myth',{recursive:true});
try{
 page.on('pageerror',error=>errors.push(error.message));
 await page.goto('http://localhost:3002/texas-cinema-myth-workbench',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>[...document.querySelectorAll('video')].some(v=>v.readyState>=2),{},{timeout:45000});
 const media=await page.locator('video').first().evaluate(async video=>{video.muted=true;await video.play();await new Promise(resolve=>setTimeout(resolve,450));return {width:video.videoWidth,height:video.videoHeight,duration:video.duration,time:video.currentTime,ready:video.readyState,error:video.error?.message||null,source:video.currentSrc}});
 await page.screenshot({path:'out/texas-cinema-myth/live-preview.png'});
 const result={at:new Date().toISOString(),errors,media,status:'Actual H3 source in Remotion workbench, not completed episode'};
 writeFileSync('out/texas-cinema-myth/preview-check.json',JSON.stringify(result,null,2)+'\n');
 if(errors.length||media.error||media.width!==352||media.height!==640||media.time<=0)throw Error('Preview or source playback failed; inspect report');
 console.log('Actual H3 source loaded and played in installed Chrome; no page/media errors.');
}catch(error){
 await page.screenshot({path:'out/texas-cinema-myth/live-preview-error.png'}).catch(()=>{});
 writeFileSync('out/texas-cinema-myth/preview-error.json',JSON.stringify({error:error.message,errors,body:(await page.locator('body').innerText()).slice(0,10000),videos:await page.locator('video').evaluateAll(items=>items.map(v=>({src:v.currentSrc||v.src,ready:v.readyState,error:v.error?.message})))},null,2)+'\n');throw error;
}finally{await browser.close()}
