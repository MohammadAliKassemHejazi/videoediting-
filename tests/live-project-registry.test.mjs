import test from 'node:test';import assert from 'node:assert/strict';import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,rmSync} from 'node:fs';import {join,resolve,relative} from 'node:path';import {tmpdir} from 'node:os';import {writeStudioRoot} from '../lib/remotion-projects.mjs';
import {transformSync} from 'esbuild';

test('incremental animated films retain one folder and valid JSX when adding a narrated story',()=>{
 const root=mkdtempSync(join(tmpdir(),'motion-incremental-'));
 try{
  mkdirSync(join(root,'remotion'));
  const registry=join(root,'remotion/generated-films.json'),entry=join(root,'remotion/index.jsx');
  writeFileSync(registry,JSON.stringify([{id:'first-animation',file:'first.mp4',duration:15}]));
  writeStudioRoot(root,"import React from 'react';import {registerRoot,Composition,Folder} from 'remotion';registerRoot(()=> <></>);");
  writeFileSync(registry,JSON.stringify([{id:'first-animation',file:'first.mp4',duration:15},{id:'second-animation',file:'second.mp4',duration:20}]));
  writeFileSync(join(root,'remotion/shadow-work.json'),JSON.stringify({duration:88.83}));
  writeFileSync(join(root,'remotion/texas-preview.json'),JSON.stringify({duration:4}));
  writeStudioRoot(root,readFileSync(entry,'utf8'));
  const source=readFileSync(entry,'utf8');
  assert.doesNotThrow(()=>transformSync(source,{loader:'jsx'}));
  const folders=[...source.matchAll(/<Folder name="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(folders).size,folders.length);
  for(const id of ['first-animation','second-animation','shadow-went-first','texas-cinema-myth-workbench'])assert.equal(source.split('id="'+id+'"').length-1,1);
  writeStudioRoot(root,source);assert.equal(readFileSync(entry,'utf8'),source);
 }finally{const base=resolve(tmpdir()),target=resolve(root);assert.ok(relative(base,target)&&!relative(base,target).startsWith('..'));rmSync(target,{recursive:true,force:true})}
});
test('activating one workflow preserves prepared clip, story and creature projects without duplicate IDs',()=>{
 const root=mkdtempSync(join(tmpdir(),'motion-registry-'));
 try{mkdirSync(join(root,'remotion'));for(const f of ['pro-clips.json','variety-clips.json','reference-clips.json','memory-story.json'])writeFileSync(join(root,'remotion',f),JSON.stringify({duration:99.56}));mkdirSync(join(root,'projects/warm-creature-story/assets'),{recursive:true});writeFileSync(join(root,'projects/warm-creature-story/assets/keyframe.png'),'fixture');
 const source="import React from 'react';\nimport {registerRoot,Composition,Folder} from 'remotion';\nregisterRoot(() => <><Composition id=\"custom-user-film\" component={Custom} width={1440} height={2560} fps={60} durationInFrames={900}/></>);";writeStudioRoot(root,source);const first=readFileSync(join(root,'remotion/index.jsx'),'utf8'),ids=Array.from(first.matchAll(/id="([^"]+)"/g),x=>x[1]);for(const id of ['custom-user-film','clip-monument','clip-split-lab','clip-reference-editorial','clip-hand-orchestra','story-collage-memory','story-clawd-memory','story-paper-theatre','warm-creature-keyframe'])assert.ok(ids.includes(id));assert.equal(new Set(ids).size,ids.length);writeStudioRoot(root,first);assert.equal(readFileSync(join(root,'remotion/index.jsx'),'utf8'),first);
 }finally{const target=resolve(root),base=resolve(tmpdir());assert.ok(relative(base,target)&&!relative(base,target).startsWith('..'));rmSync(target,{recursive:true,force:true})}
});
