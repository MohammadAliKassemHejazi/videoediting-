import {chromium} from 'playwright';
const browser=await chromium.launch({headless:true,channel:'msedge'});
try{
 const page=await browser.newPage({viewport:{width:1400,height:1000}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://localhost:3000/tech-ui',{waitUntil:'domcontentloaded',timeout:60000});
 await page.waitForFunction(()=>document.querySelector('video')?.readyState>=2,null,{timeout:60000});
 console.log(await page.evaluate(()=>{const v=document.querySelector('video');return {src:v.currentSrc,readyState:v.readyState,duration:v.duration,width:v.videoWidth,height:v.videoHeight,error:v.error?.message};}));
 await page.screenshot({path:'out/backend-checklist/styles/live-editor.png'});
 if(errors.length)throw Error(errors.join('\n'));console.log('Live Studio composition and video metadata loaded.');
}finally{await browser.close();}
