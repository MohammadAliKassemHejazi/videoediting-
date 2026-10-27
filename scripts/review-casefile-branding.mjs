import {chromium} from 'playwright';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {studioBrowserExecutable} from '../lib/studio-browser.mjs';
const folder='projects/texas-ten-thousand-steps',cover=readFileSync(folder+'/assets/covers/youtube.png'),profile=readFileSync('series/texas-casefiles/branding/profile-v1.png');
const hash=b=>createHash('sha256').update(b).digest('hex');
for(const platform of ['youtube','tiktok','instagram'])if(hash(readFileSync('out/texas-casefiles-branding/'+platform+'-profile.png'))!==hash(profile))throw Error('Platform copy differs: '+platform);
const browser=await chromium.launch({headless:true,executablePath:studioBrowserExecutable(),args:['--disable-gpu']});
try{
 const page=await browser.newPage({viewport:{width:700,height:350}});
 await page.setContent('<body><p>Phone cover: 336px and 168px wide</p><main></main></body>');
 await page.evaluate(src=>{Object.assign(document.body.style,{background:'#111',color:'white',font:'18px Arial',padding:'20px'});for(const width of [336,168]){const img=document.createElement('img');img.src=src;Object.assign(img.style,{width:width+'px',verticalAlign:'top',marginRight:'12px'});document.querySelector('main').append(img)}},'data:image/png;base64,'+cover.toString('base64'));
 await page.locator('img').evaluateAll(items=>Promise.all(items.map(i=>i.decode())));
 await page.screenshot({path:'out/texas-ten-thousand-steps/cover-phone-review.png'});
 writeFileSync(folder+'/assets/covers/COVER.json',JSON.stringify({file:'youtube.png',width:cover.readUInt32BE(16),height:cover.readUInt32BE(20),sha256:hash(cover),generatedSource:'exec-ceb8977b-bed6-403f-84af-ab2095e7071f.png',prompt:'prompts/COVER.txt',phoneReview:'336px/168px diagnostic captured; visual inspection separate',profileCopiesMatch:true},null,2)+'\n');
 console.log('All platform profile copies match the master. Cover phone diagnostic captured.');
}finally{await browser.close()}
