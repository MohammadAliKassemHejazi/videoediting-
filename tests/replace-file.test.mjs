import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync,readFileSync,existsSync,unlinkSync} from 'node:fs';
import {join} from 'node:path';
import {randomUUID} from 'node:crypto';
import {ROOT} from '../lib/project.mjs';
import {replaceWorkspaceFile} from '../lib/replace-file.mjs';

test('re-export replaces an existing draft without losing the completed file',()=>{
  const folder=join(ROOT,'.cache');mkdirSync(folder,{recursive:true});
  const id=randomUUID(),pending=join(folder,id+'.pending'),draft=join(folder,id+'.draft');
  try{
    writeFileSync(draft,'previous draft');writeFileSync(pending,'verified replacement');
    replaceWorkspaceFile(pending,draft);
    assert.equal(readFileSync(draft,'utf8'),'verified replacement');
    assert.equal(existsSync(pending),false);
  }finally{for(const file of [pending,draft])if(existsSync(file))unlinkSync(file)}
});

test('replacement rejects targets outside the workspace before moving any file',()=>{
  assert.throws(()=>replaceWorkspaceFile(join(ROOT,'.cache/no-file'),join(ROOT,'../outside-draft')),/workspace/);
});
