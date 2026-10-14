import {chromium} from 'playwright';
import {mkdirSync} from 'node:fs';
const browser=await chromium.launch({headless:true,channel:'msedge'});
try{
 for(const id of process.argv.length>2?process.argv.slice(2):['midnight-transit','paper-riot','signal-noise']){
  const page=await browser.newPage({viewport:{width:1500,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://localhost:3000/'+id,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForSelector(id==='signal-noise'?'svg':'canvas',{timeout:30000});
  if(id.startsWith('clip-'))await page.waitForFunction(()=>{const videos=Array.from(document.querySelectorAll('video'));return videos.length>=2&&videos.every(v=>v.readyState>=2&&!v.error)},null,{timeout:30000});
  await page.waitForTimeout(1500);mkdirSync('out/'+id,{recursive:true});await page.screenshot({path:'out/'+id+'/live-editor.png'});
  if(errors.length)throw Error(id+': '+errors.join('\n'));
  console.log('Live project loaded: '+id);await page.close();
 }
}finally{await browser.close()}
