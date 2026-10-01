// Real end-to-end test: a fresh short project plus keyed image/video assets.
import {mkdirSync,readFileSync,writeFileSync,copyFileSync,existsSync} from 'node:fs';
import {execFileSync,spawnSync} from 'node:child_process';
import {join} from 'node:path';
import assert from 'node:assert/strict';
import {ROOT,project,safeRemove} from '../lib/project.mjs';
import {ffmpeg,FFMPEG} from '../lib/ffmpeg.mjs';
const id='studio-smoke-check',scratch=join(ROOT,'.cache','smoke-fixtures');if(existsSync(join(ROOT,'projects',id)))throw Error('Smoke project already exists; inspect it before rerunning.');mkdirSync(scratch,{recursive:true});
const run=(args)=>execFileSync(process.execPath,['studio.mjs',...args],{stdio:'inherit'});
await ffmpeg(['-i','clips/0928(5).mp4','-t','2','-c:v','libx264','-preset','ultrafast','-c:a','aac',join(scratch,'source.mp4')]);
run(['new',id,'--source',join(scratch,'source.mp4')]);let P=project(id);
await ffmpeg(['-f','lavfi','-i','color=c=0x00FF00:s=200x200:r=30:d=1','-vf','drawbox=x=60:y=60:w=80:h=80:color=red:t=fill','-c:v','libx264','-pix_fmt','yuv420p',join(P.dir,'assets/inbox/sticker.mp4')]);
await ffmpeg(['-i',join(P.dir,'assets/inbox/sticker.mp4'),'-frames:v','1',join(P.dir,'assets/inbox/sticker.png')]);
copyFileSync('projects/developer-stack/assets/thumbnail.png',join(P.dir,'assets/thumbnail.png'));
const cfg=P.config;cfg.assets=[{id:'video',file:'assets/inbox/sticker.mp4',type:'video',background:'green',useInTimeline:true,required:true,at:.3,duration:.8,x:80,y:200,width:200,height:200,purpose:'Test alpha video',prompt:'Fixture'},{id:'image',file:'assets/inbox/sticker.png',type:'image',background:'green',useInTimeline:true,required:true,at:1.2,duration:.6,x:80,y:200,width:200,height:200,purpose:'Test alpha image',prompt:'Fixture'}];writeFileSync(join(P.dir,'project.json'),JSON.stringify(cfg,null,2));
run(['assets',id]);
for(const f of ['0.mov','1.png']){const r=spawnSync(FFMPEG,['-hide_banner','-loglevel','error','-i',join(P.cache,'media',f),'-frames:v','1','-f','rawvideo','-pix_fmt','rgba','pipe:1'],{maxBuffer:1e6});assert.equal(r.status,0);assert.equal(r.stdout[3],0,'Green corner should be transparent');assert.equal(r.stdout[(100*200+100)*4+3],255,'Red subject should remain opaque');}
run(['draft',id]);console.log(`Inspect out/${id}/phone.png. Smoke draft completed; no final review has been fabricated.`);
