// Read-only captures of public official pages for the split-screen edit.
import { chromium } from 'playwright';
import { mkdirSync,writeFileSync } from 'node:fs';

const destination='assets/brand/developer-recap';mkdirSync(destination,{recursive:true});
const sites=[
  ['typescript','https://www.typescriptlang.org/'],
  ['next','https://nextjs.org/'],
  ['react','https://react.dev/'],
  ['tailwind','https://tailwindcss.com/'],
  ['router','https://reactrouter.com/'],
  ['tanstack','https://tanstack.com/router/latest'],
  ['css','https://developer.mozilla.org/en-US/docs/Web/CSS']
];
const browser=await chromium.launch();
const results=[];
try {
  // Limit to three simultaneous pages to keep captures reliable on a laptop.
  for(let i=0;i<sites.length;i+=3) {
    const batch=await Promise.allSettled(sites.slice(i,i+3).map(async([id,url])=>{
      const page=await browser.newPage({viewport:{width:1280,height:900},deviceScaleFactor:1,colorScheme:'light'});
      try {
        await page.goto(url,{waitUntil:'domcontentloaded',timeout:45000});
        await page.evaluate(async()=>{await Promise.race([document.fonts.ready,new Promise(r=>setTimeout(r,3000))]);});
        await page.waitForTimeout(1800);
        const heading=page.locator('h1').first();
        if(await heading.count())await heading.scrollIntoViewIfNeeded();
        const focus=await heading.boundingBox();
        const title=await page.title();
        await page.screenshot({path:`${destination}/${id}.png`,animations:'disabled'});
        return {id,url,title,focus,file:`${destination}/${id}.png`,capturedAt:new Date().toISOString()};
      } finally {await page.close();}
    }));
    for(let j=0;j<batch.length;j++) {
      const r=batch[j];if(r.status==='fulfilled'){results.push(r.value);console.log(`Captured ${r.value.id}: ${r.value.title}`);}
      else {console.error(`Capture failed for ${sites[i+j][0]}: ${r.reason.message}`);process.exitCode=1;}
    }
  }
} finally {await browser.close();}
writeFileSync(`${destination}/sources.json`,JSON.stringify(results,null,2));
