import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { probe } from '../lib/ffmpeg.mjs';

const browser=await chromium.launch();
try {
  const page=await browser.newPage({viewport:{width:1080,height:1920}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  const url=pathToFileURL(resolve('developer-2026.html'));url.search='?render=1&w=1080&h=1920';
  await page.goto(url.href);
  await page.evaluate(async()=>{await Promise.all(window.FONTS.map(f=>document.fonts.load(f)));await document.fonts.ready;});
  const times=[0,.25,1.2,2.5,5,8,10.3,13.5,16,17.23,18.2,20.2,21.5,24.5,27,29,31,34,38,40,43,44.35,46,48.4,50.4,52,54,55,58,61.5,63.9,64.9];
  const snapshot=t=>page.evaluate(t=>{window.seek(t);return document.getElementById('c').toDataURL();},t);
  const first=new Map();for(const t of times)first.set(t,await snapshot(t));
  for(const t of [...times].reverse())assert.equal(await snapshot(t),first.get(t),`Frame depends on seek order at ${t}s`);
  const captions=await page.evaluate(()=>{
    const ctx=document.createElement('canvas').getContext('2d');ctx.font='600 44px Inter';
    return window.DEVELOPER_FILM.captions.map(([a,b,s])=>{
      let row='',lines=1;for(const w of s.split(' ')){const next=row?row+' '+w:w;if(row&&ctx.measureText(next).width>810){lines++;row=w;}else row=next;}
      return {at:a,lines,bottom:1320+lines*52+32};
    });
  });
  for(const c of captions)assert.ok(c.bottom<=1920*.76,`Caption leaves safe area at ${c.at}s`);
  assert.deepEqual(errors,[]);
  console.log(`PASS: ${times.length} frames match after reverse seeks; all 26 captions stay within the vertical safe area; no browser errors.`);
  if(existsSync('out/developer_2026.mp4')) {
    const info=probe('out/developer_2026.mp4');
    assert.equal(info.width,1080);assert.equal(info.height,1920);
    assert.equal(info.fps,30);assert.equal(info.audio,true);
    assert.ok(Math.abs(info.duration-65.04)<.08);
    console.log('PASS: final export is 1080×1920, 30 fps, with audio and the expected duration.');
  }
} finally {await browser.close();}
