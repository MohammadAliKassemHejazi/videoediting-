import test from 'node:test';
import assert from 'node:assert/strict';
import {project,safeRemove,ROOT} from '../lib/project.mjs';
import {join,dirname} from 'node:path';

test('project identifiers cannot escape the project directory',()=>{
 for(const id of ['../clips','/tmp','a/b','a\\b','..',''])assert.throws(()=>project(id));
});
test('cleanup refuses the workspace, its parent and repository metadata',()=>{
 for(const path of [ROOT,dirname(ROOT),join(ROOT,'.git')])assert.throws(()=>safeRemove(path));
});
test('approved project retains timed fullscreen artifacts and English captions',()=>{
 const p=project('developer-stack');assert.equal(p.config.captions,'English');
 assert.equal(p.film.fullscreen.length,2);assert.ok(p.film.fullscreen.every(s=>s.b-s.a>1));
 assert.ok(p.film.captions.every(c=>c[0]>=0&&c[1]<=p.film.duration));
});
