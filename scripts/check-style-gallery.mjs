import {chromium} from 'playwright';

const browser=await chromium.launch({headless:true,channel:'msedge'});
try{
  const page=await browser.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto('http://localhost:3001',{waitUntil:'domcontentloaded'});
  const items=await page.evaluate(async()=>await(await fetch('/api/styles')).json());
  if(items.some(item=>item.group==='Your clip / new edit ideas')){
    await page.waitForFunction(()=>document.querySelectorAll('article').length===5);
    const titles=await page.locator('article h2').allTextContents();
    if(!['SPLIT LAB','WHIP ZOOM','CURSOR RUN','REQUEST RUNNER','SKETCH INTERRUPT'].every(t=>titles.includes(t)))throw Error('Five new editing structures must lead the gallery.');
    console.log('Five new editing ideas:',titles.join(', '));
    if(process.argv.includes('--require-new')&&items.filter(s=>s.group==='Your clip / new edit ideas'&&s.ready).length!==5)throw Error('All five new exports must be current and playable.');
  }else if(items.some(item=>item.group==='Your clip / five edits')){
    await page.waitForFunction(()=>document.querySelectorAll('article').length===5);
    const titles=await page.locator('article h2').allTextContents();
    if(!titles.some(t=>t.includes('MONUMENT'))||!titles.some(t=>t.includes('REDLINE'))||!titles.some(t=>t.includes('CHROME')))throw Error('Five clip styles must lead the gallery.');
    console.log('Five clip project cards:',titles.join(', '));
  }else if(items.some(item=>item.group==='Original style films')){
    await page.waitForFunction(()=>document.querySelectorAll('article').length===3);
    const titles=await page.locator('article h2').allTextContents();
    if(titles.join('|')!=='MIDNIGHT TRANSIT|PAPER RIOT|SIGNAL / NOISE')throw Error('New projects must lead the gallery.');
    console.log('Three distinct project cards:',titles.join(', '));
  }
  console.log(`${items.filter(item=>item.ready).length}/${items.length} drafts available.`);
  for(const item of items.filter(item=>item.ready)){
    const result=await page.evaluate(async(id)=>{
      const video=document.createElement('video');video.muted=true;video.src='/media/'+id;
      document.body.append(video);
      try{
        await new Promise((resolve,reject)=>{
          const timer=setTimeout(()=>reject(Error('Video metadata timed out')),20000);
          video.onloadeddata=()=>{clearTimeout(timer);resolve()};
          video.onerror=()=>{clearTimeout(timer);reject(Error(video.error?.message||'Video failed'))};
        });
        await video.play();video.pause();
        return {width:video.videoWidth,height:video.videoHeight,duration:video.duration,error:video.error?.code||null};
      }finally{video.remove()}
    },item.id);
    if(result.width!==1440||result.height!==2560||result.error)throw Error('Invalid browser playback: '+item.id);
    console.log(item.id,JSON.stringify(result));
  }
  if(errors.length)throw Error(errors.join('\n'));
}finally{await browser.close()}
