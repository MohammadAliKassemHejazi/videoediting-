import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {writeFileSync,readFileSync} from 'node:fs';
import {FFMPEG,probe} from '../lib/ffmpeg.mjs';
import {project,projectHash} from '../lib/project.mjs';
import {join} from 'node:path';
const P=project(process.argv[2]),file=join(P.out,'final.mp4'),p=probe(file);
assert.ok(p.audio);assert.ok(Math.abs(p.duration-P.film.duration)<.08);assert.equal(p.width,1080);assert.equal(p.height,1920);assert.equal(p.fps,60);
assert.equal(JSON.parse(readFileSync(join(P.out,'final.json'),'utf8')).sourceHash,projectHash(P),'Export is stale');
const decoded=spawnSync(FFMPEG,['-hide_banner','-loglevel','error','-i',file,'-map','0:v:0','-f','null','-','-progress','pipe:1','-nostats'],{encoding:'utf8'});assert.equal(decoded.status,0,decoded.stderr);
// Permit one frame of endpoint rounding when the audio sets container duration.
const frames=Number([...decoded.stdout.matchAll(/^frame=(\d+)$/gm)].at(-1)?.[1]);assert.ok(Math.abs(frames-Math.round(p.duration*p.fps))<=1,'Unexpected video length');
const pcm=file=>{const r=spawnSync(FFMPEG,['-hide_banner','-loglevel','error','-i',file,'-map','0:a:0','-ac','1','-ar','12000','-f','f32le','pipe:1'],{maxBuffer:20*1024*1024});assert.equal(r.status,0);return new Float32Array(r.stdout.buffer.slice(r.stdout.byteOffset,r.stdout.byteOffset+r.stdout.byteLength));};
const source=pcm(P.source),edited=pcm(file);let best={correlation:-1};
for(let lag=-60;lag<=60;lag++){let ss=0,ee=0,se=0;for(let i=600;i<Math.min(source.length,edited.length)-600;i+=4){const s=source[i],e=edited[i+lag];ss+=s*s;ee+=e*e;se+=s*e;}const correlation=se/Math.sqrt(ss*ee);if(correlation>best.correlation)best={lag,correlation,gain:se/ss};}
assert.ok(Math.abs(best.lag)<=24);assert.ok(best.correlation>.98);assert.ok(Math.abs(best.gain-1)<.03);
if(P.film.anchorChecks?.length){const r=JSON.parse(readFileSync(join(P.dir,'transcript.raw.json'),'utf8'));for(const [term,start]of P.film.anchorChecks){const word=r.chunks.find(c=>c.text.includes(term)&&c.timestamp[0]>=start);assert.ok(word);assert.ok(P.film.cues.some(t=>Math.abs(t-word.timestamp[0])<.03));}}
writeFileSync(join(P.out,'checks.json'),JSON.stringify({file,...p,frames,voice:{offsetMs:best.lag/12,correlation:best.correlation,gain:best.gain},checkedSpeechAnchors:P.film.anchorChecks?.length||0,listeningReview:false},null,2));
console.log(`PASS ${frames} frames; ${p.width}×${p.height} ${p.fps}fps; voice offset ${best.lag/12}ms, correlation ${best.correlation.toFixed(5)}.`);
