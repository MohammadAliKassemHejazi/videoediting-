import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
import {readFileSync,existsSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {FFMPEG,probe} from '../lib/ffmpeg.mjs';
import vm from 'node:vm';
const box={window:{}};vm.createContext(box);vm.runInContext(readFileSync('overlays/developer-aligned.js','utf8'),box);const F=box.window.ALIGNED;
const recognized=JSON.parse(readFileSync('docs/audio-alignment/recognized-words.json','utf8'));
for(const [key,term,start] of [['typescript','TypeScript',16],['next','Next',17],['tailwind','Tailwind',18],['react','React',20],['router','React',30],['tanstack','TenStack',32]]){
  const word=recognized.chunks.find(c=>c.text.includes(term)&&c.timestamp[0]>=start);assert.ok(word,term);assert.ok(Math.abs(word.timestamp[0]-F.anchors[key])<.03,`${term} onset differs from measured audio`);
}
assert.equal(F.anchors.tailwindDiscussion,35.08);assert.equal(F.anchors.css,38.06);
assert.ok(!F.fullCaptions.some(c=>c[2].includes('frameworks fix')),'Absent transcript line must not shift later graphics');
for(let i=0;i<F.scenes.length;i++){const s=F.scenes[i];assert.equal(s.a,i?F.scenes[i-1].b:0);assert.ok(s.b>s.a);for(const key of ['mark','focus','reveal','strike'])if(s[key]!=null)assert.ok(s[key]>=s.a&&s[key]<s.b);}
assert.equal(F.scenes.at(-1).b,F.duration);for(const cue of F.captions)assert.ok(cue[2].split(/\s+/).length<=2);
if(!process.argv.includes('--export-only')){
 const browser=await chromium.launch();try{
  const page=await browser.newPage({viewport:{width:1080,height:1920}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  const url=pathToFileURL(resolve('developer-split-deck.html'));url.search='?render=1&w=1080&h=1920';await page.goto(url.href);
  await page.evaluate(async()=>{await window.ASSETS_READY;await Promise.all(window.FONTS.map(f=>document.fonts.load(f)));await document.fonts.ready;});
  const times=F.scenes.map(s=>Math.min(s.a+.35,s.b-.03));
  const shot=async t=>{await page.evaluate(t=>window.seek(t),t);return (await page.screenshot({omitBackground:true})).toString('base64');};
  const frames=new Map();for(const t of times)frames.set(t,await shot(t));for(const t of [...times].reverse())assert.equal(await shot(t),frames.get(t),`Non-deterministic seek ${t}`);
  const alpha=async(x,y)=>{const png=await page.screenshot({clip:{x,y,width:1,height:1},omitBackground:true});const r=spawnSync(FFMPEG,['-hide_banner','-loglevel','error','-f','image2pipe','-i','pipe:0','-f','rawvideo','-pix_fmt','rgba','pipe:1'],{input:png});assert.equal(r.status,0);return r.stdout[3];};
  await page.evaluate(()=>window.seek(38.5));assert.equal(await alpha(540,1200),0);assert.equal(await alpha(25,1200),255);
  await page.evaluate(()=>window.seek(24));assert.equal(await alpha(540,500),0,'Breakout must clear top deck');
  const widths=await page.evaluate(()=>{const g=document.getElementById('c').getContext('2d');g.font='900 92px Inter';return window.ALIGNED.captions.map(c=>g.measureText(c[2]).width+50);});assert.ok(Math.max(...widths)<984);assert.deepEqual(errors,[]);
  console.log(`PASS: ${times.length} scenes deterministic, rounded speaker aperture and full-screen breakouts valid; captions fit safe width.`);
 }finally{await browser.close();}
}
const draft=process.argv.includes('--draft'),file=`out/developer_split_deck_v3${draft?'_draft':''}.mp4`;
if(existsSync(file)){
 const p=probe(file);assert.equal(p.width,draft?540:1080);assert.equal(p.height,draft?960:1920);assert.equal(p.fps,draft?30:60);assert.ok(Math.abs(p.duration-F.duration)<.08);assert.ok(p.audio);
 const r=spawnSync(FFMPEG,['-hide_banner','-loglevel','error','-i',file,'-map','0:v:0','-f','null','-','-progress','pipe:1','-nostats'],{encoding:'utf8'});assert.equal(r.status,0,r.stderr);const frames=Number([...r.stdout.matchAll(/^frame=(\d+)$/gm)].at(-1)?.[1]);assert.equal(frames,Math.round(F.duration*p.fps));
 console.log(`PASS: ${file}: ${p.width}x${p.height}, ${p.fps} fps, ${frames} frames fully decoded, audio present.`);
 const pcm=file=>{const r=spawnSync(FFMPEG,['-hide_banner','-loglevel','error','-i',file,'-map','0:a:0','-ac','1','-ar','12000','-f','f32le','pipe:1'],{maxBuffer:20*1024*1024});assert.equal(r.status,0);return new Float32Array(r.stdout.buffer.slice(r.stdout.byteOffset,r.stdout.byteOffset+r.stdout.byteLength));};
 const voice=pcm(F.source),mix=pcm(file);let best={correlation:-1};
 for(let lag=-60;lag<=60;lag++){let vv=0,mm=0,vm=0;for(let i=600;i<Math.min(voice.length,mix.length)-600;i+=4){const v=voice[i],m=mix[i+lag];vv+=v*v;mm+=m*m;vm+=v*m;}const correlation=vm/Math.sqrt(vv*mm);if(correlation>best.correlation)best={lag,correlation,gain:vm/vv};}
 assert.ok(Math.abs(best.lag)<=24,'Export voice drift exceeds 2ms');assert.ok(best.correlation>.98,'Voice unexpectedly changed');assert.ok(Math.abs(best.gain-1)<.03,'Voice gain changed');
 console.log(`PASS: decoded voice alignment ${best.lag/12}ms, correlation ${best.correlation.toFixed(5)}, gain ${best.gain.toFixed(4)} (quiet SFX mixed without normalization).`);
}
console.log('PASS: technical-name actions match measured word onsets; scene coverage and translated short captions valid.');
