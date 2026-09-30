import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { FFMPEG,probe } from '../lib/ffmpeg.mjs';

if(!process.argv.includes('--export-only')){
const browser=await chromium.launch();
try{
  const page=await browser.newPage({viewport:{width:1080,height:1920}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  const url=pathToFileURL(resolve('developer-recap.html'));url.search='?render=1&w=1080&h=1920';
  await page.goto(url.href);await page.evaluate(async()=>{await window.ASSETS_READY;await Promise.all(window.FONTS.map(f=>document.fonts.load(f)));await document.fonts.ready;});
  const times=await page.evaluate(()=>window.RECAP.scenes.flatMap(([a,b])=>[a+.04,Math.min(a+.7,b-.02)]));
  const snapshot=async t=>{await page.evaluate(t=>window.seek(t),t);return (await page.screenshot({omitBackground:true})).toString('base64');};
  const frames=new Map();for(const t of times)frames.set(t,await snapshot(t));
  for(const t of [...times].reverse())assert.equal(await snapshot(t),frames.get(t),`Seek order changes frame at ${t}`);
  const checks=await page.evaluate(()=>{
    const c=document.getElementById('c'),g=c.getContext('2d');window.seek(20);
    g.font='600 48px Inter';
    const captions=window.DEVELOPER_FILM.captions.map(([a,b,s])=>{
      let lines=1,line='';for(const w of s.split(' ')){const next=line?line+' '+w:w;if(line&&g.measureText(next).width>880){lines++;line=w;}else line=next;}
      return {at:a,lines,bottom:(lines===1?987:955)+(lines-1)*60+12};
    });
    return {captions,assets:window.RECAP_SOURCES.length};
  });
  // CDP can capture a canvas containing local file images even when browser
  // origin rules prohibit getImageData/toDataURL. Decode only two test pixels.
  const alphaAt=async(x,y)=>{
    const png=await page.screenshot({clip:{x,y,width:1,height:1},omitBackground:true});
    const decoded=spawnSync(FFMPEG,['-hide_banner','-loglevel','error','-f','image2pipe','-i','pipe:0','-f','rawvideo','-pix_fmt','rgba','pipe:1'],{input:png});
    assert.equal(decoded.status,0,decoded.stderr.toString());return decoded.stdout[3];
  };
  assert.equal(await alphaAt(540,1400),0,'Speaker aperture must be transparent');assert.equal(await alphaAt(40,1400),255);
  assert.equal(checks.assets,7);for(const caption of checks.captions){assert.ok(caption.lines<=2);assert.ok(caption.bottom<1064,'Captions must not cover speaker card');}
  assert.deepEqual(errors,[]);
  console.log(`PASS: ${times.length} frames are deterministic; 7 screenshots loaded; all captions clear the speaker; alpha aperture is valid.`);
}finally{await browser.close();}
}

const exportFile=process.argv.includes('--draft')?'out/developer_recap_v2_draft.mp4':'out/developer_recap_v2.mp4';
if(existsSync(exportFile)){
  const p=probe(exportFile),draft=process.argv.includes('--draft');assert.equal(p.width,draft?540:1080);assert.equal(p.height,draft?960:1920);assert.equal(p.fps,30);assert.equal(p.audio,true);assert.ok(Math.abs(p.duration-65.04)<.08);
  const hash=file=>{
    const r=spawnSync(FFMPEG,['-hide_banner','-loglevel','error','-i',file,'-map','0:a:0','-c:a','copy','-f','hash','-hash','sha256','-'],{encoding:'utf8'});
    assert.equal(r.status,0,r.stderr);return r.stdout.trim();
  };
  assert.equal(hash(exportFile),hash('clips/0928(5).mp4'),'Audio must be the unchanged original stream');
  const decode=spawnSync(FFMPEG,['-hide_banner','-loglevel','error','-i',exportFile,'-map','0:v:0','-f','null','-','-progress','pipe:1','-nostats'],{encoding:'utf8'});
  assert.equal(decode.status,0,decode.stderr);
  const count=[...decode.stdout.matchAll(/^frame=(\d+)$/gm)].at(-1)?.[1];
  assert.equal(Number(count),1951,'Full export must decode through all rendered frames');
  console.log(`PASS: ${exportFile} has expected resolution/duration; original audio packets match exactly (no added sounds).`);
  console.log('PASS: all 1,951 video frames decode without errors.');
}
