import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {writeFileSync,readFileSync} from 'node:fs';
import {FFMPEG,probe} from '../lib/ffmpeg.mjs';
import vm from 'node:vm';
const file=process.argv[2]||'out/developer_reference_edit.mp4',p=probe(file);
assert.ok(p.audio);assert.ok(Math.abs(p.duration-65.04)<.08);assert.equal(p.width,1080);assert.equal(p.height,1920);assert.equal(p.fps,60);
const decoded=spawnSync(FFMPEG,['-hide_banner','-loglevel','error','-i',file,'-map','0:v:0','-f','null','-','-progress','pipe:1','-nostats'],{encoding:'utf8'});assert.equal(decoded.status,0,decoded.stderr);
// The original video ends at 65.0s; its audio/container ends at 65.04s.
// Permit one frame of endpoint rounding when the unchanged audio sets duration.
const frames=Number([...decoded.stdout.matchAll(/^frame=(\d+)$/gm)].at(-1)?.[1]);assert.ok(Math.abs(frames-Math.round(p.duration*p.fps))<=1,'Unexpected video length');
const pcm=file=>{const r=spawnSync(FFMPEG,['-hide_banner','-loglevel','error','-i',file,'-map','0:a:0','-ac','1','-ar','12000','-f','f32le','pipe:1'],{maxBuffer:20*1024*1024});assert.equal(r.status,0);return new Float32Array(r.stdout.buffer.slice(r.stdout.byteOffset,r.stdout.byteOffset+r.stdout.byteLength));};
const source=pcm('clips/0928(5).mp4'),edited=pcm(file);let best={correlation:-1};
for(let lag=-60;lag<=60;lag++){let ss=0,ee=0,se=0;for(let i=600;i<Math.min(source.length,edited.length)-600;i+=4){const s=source[i],e=edited[i+lag];ss+=s*s;ee+=e*e;se+=s*e;}const correlation=se/Math.sqrt(ss*ee);if(correlation>best.correlation)best={lag,correlation,gain:se/ss};}
assert.ok(Math.abs(best.lag)<=24);assert.ok(best.correlation>.98);assert.ok(Math.abs(best.gain-1)<.03);
const b={window:{}};vm.createContext(b);vm.runInContext(readFileSync('overlays/reference-edit.js','utf8'),b);const r=JSON.parse(readFileSync('docs/audio-alignment/recognized-words.json','utf8'));
for(const [term,start] of [['TypeScript',16],['Next',17],['Tailwind',18],['React',20],['React',30],['TenStack',32]]){const word=r.chunks.find(c=>c.text.includes(term)&&c.timestamp[0]>=start);assert.ok(word);assert.ok(b.window.REFERENCE_EDIT.cues.some(t=>Math.abs(t-word.timestamp[0])<.03));}
writeFileSync('out/reference-edit/export-check.json',JSON.stringify({file,...p,frames,voice:{offsetMs:best.lag/12,correlation:best.correlation,gain:best.gain},technicalNameCues:'match recognized speech onsets',listeningReview:false},null,2));
console.log(`PASS ${frames} frames; ${p.width}×${p.height} ${p.fps}fps; voice offset ${best.lag/12}ms, correlation ${best.correlation.toFixed(5)}; tool reveals match speech onsets.`);
