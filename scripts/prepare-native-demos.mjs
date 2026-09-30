import {chromium} from 'playwright';
import {mkdirSync,writeFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
mkdirSync('assets/demos/native',{recursive:true});const browser=await chromium.launch();
try{const p=await browser.newPage({viewport:{width:1000,height:400}});await p.goto(pathToFileURL(resolve('assets/demos/native-css.html')).href);
const proof=[];
for(const [id,width,checked] of [['has-off',860,false],['has-on',860,true],['container-wide',860,true],['container-narrow',390,true],['subgrid',860,true]]){
await p.evaluate(({width,checked})=>{document.getElementById('demo').style.width=width+'px';document.querySelector('input').checked=checked;},{width,checked});
const state=await p.evaluate(()=>({columns:getComputedStyle(document.querySelector('.cards')).gridTemplateColumns,rows:getComputedStyle(document.querySelector('.card')).gridTemplateRows,border:getComputedStyle(document.querySelector('.card')).borderTopColor}));
assert.equal(state.border,checked?'rgb(239, 68, 68)':'rgb(203, 213, 225)');assert.ok(state.rows.startsWith('subgrid'));if(width>600)assert.equal(state.columns.split(' ').length,3);else assert.equal(state.columns.split(' ').length,1);
await p.locator('#demo').screenshot({path:`assets/demos/native/${id}.png`});proof.push({id,width,checked,...state});}
writeFileSync('assets/demos/native/verification.json',JSON.stringify(proof,null,2));console.log('5 actual browser-rendered CSS states captured; :has(), container queries and subgrid verified.');
}finally{await browser.close();}
