import {createServer} from 'node:http';
import {readFileSync,writeFileSync,existsSync,createReadStream,statSync} from 'node:fs';
import {join} from 'node:path';
import {randomBytes,createHash} from 'node:crypto';
import {ROOT} from '../lib/project.mjs';
import {STYLES} from '../lib/style-auditions.js';
import {STORY_STYLES} from '../lib/story-painters.js';
import {galleryCatalog} from '../lib/style-catalog.mjs';
import {storyDigest} from '../lib/story-digest.mjs';
const token=randomBytes(24).toString('hex'),port=3001;
const auditionFile=join(ROOT,'projects/backend-checklist/style-lab/audition.json'),storyFile=join(ROOT,'story-projects/pip-last-light/timed.json');
const catalog=()=>galleryCatalog(ROOT);
function ready(item){
 if(!existsSync(item.file))return false;
 if(item.group==='Full character stories'){
   if(!existsSync(item.manifest))return false;
   const manifest=JSON.parse(readFileSync(item.manifest,'utf8'));return manifest.styles.includes(item.styleId)&&manifest.sourceDigest===storyDigest(ROOT,item.recordFile);
 }
 const manifest=item.manifest;if(!existsSync(manifest))return false;
 const digest=createHash('sha256').update(readFileSync(join(ROOT,'remotion/Audition.jsx'))).update(readFileSync(join(ROOT,'lib/style-auditions.js'))).digest('hex');
 return Boolean(JSON.parse(readFileSync(manifest,'utf8')).sourceDigest);
}
const send=(res,status,body,type='application/json')=>{res.writeHead(status,{'Content-Type':type,'Cache-Control':'no-store'});res.end(typeof body==='string'?body:JSON.stringify(body));};
const server=createServer(async(req,res)=>{
 try{
   const url=new URL(req.url,'http://localhost:'+port);
   if(req.method==='GET'&&url.pathname==='/')return send(res,200,html(),'text/html; charset=utf-8');
   if(req.method==='GET'&&url.pathname==='/api/styles')return send(res,200,catalog().map(item=>{const {file,choice,recordFile,manifest,...s}=item;return {...s,ready:ready(item),selected:existsSync(choice)&&JSON.parse(readFileSync(choice,'utf8')).style===s.styleId};}));
   if(req.method==='POST'&&url.pathname==='/api/choice'){
     if(!['http://localhost:3001','http://127.0.0.1:3001'].includes(req.headers.origin)||req.headers['x-studio-token']!==token)return send(res,403,{error:'Open this local studio page to choose a style.'});
     let body='';for await(const chunk of req){body+=chunk;if(body.length>2048)return send(res,413,{error:'Request too large'});}
     const {id}=JSON.parse(body),style=catalog().find(s=>s.id===id);if(!style)return send(res,400,{error:'Unknown style'});
     const source=style.recordFile;
     writeFileSync(style.choice,JSON.stringify({style:style.styleId,project:style.project,chosenAt:new Date().toISOString(),sourceHash:createHash('sha256').update(readFileSync(source)).digest('hex'),chosenThrough:'local comparison page'},null,2)+'\n');
     return send(res,200,{saved:true,style:style.name});
   }
   if(req.method==='GET'&&url.pathname.startsWith('/media/')){
     const item=catalog().find(s=>s.id===decodeURIComponent(url.pathname.slice(7)));if(!item||!ready(item))return send(res,404,{error:'Updated draft is still rendering'});
     const size=statSync(item.file).size,range=req.headers.range;
     res.setHeader('Cache-Control','no-store');
     if(range){const match=/^bytes=(\d+)-(\d*)$/.exec(range);if(!match)return send(res,416,'Invalid range','text/plain');const start=Number(match[1]),end=match[2]?Math.min(size-1,Number(match[2])):size-1;if(start>end||start>=size)return send(res,416,'Invalid range','text/plain');res.writeHead(206,{'Content-Type':'video/mp4','Accept-Ranges':'bytes','Content-Range':`bytes ${start}-${end}/${size}`,'Content-Length':end-start+1});createReadStream(item.file,{start,end}).pipe(res);}
     else{res.writeHead(200,{'Content-Type':'video/mp4','Cache-Control':'no-store','Accept-Ranges':'bytes','Content-Length':size});createReadStream(item.file).pipe(res);}return;
   }
   send(res,404,{error:'Not found'});
 }catch(error){send(res,500,{error:error.message});}
});
server.listen(port,'127.0.0.1',()=>console.log('Style comparison: http://localhost:3001 — playback and saved choices.'));
function html(){return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Choose your film direction</title><style>
*{box-sizing:border-box}body{margin:0;background:#101619;color:#efe9da;font:16px system-ui}main{max-width:1550px;margin:auto;padding:45px 30px}h1{font-size:44px;margin:0 0 12px}p{color:#bac6c6;line-height:1.5}header{margin-bottom:38px}a{color:#cbff5e}#cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(245px,1fr));gap:24px}article{background:#1c262b;border:1px solid #34434a;border-radius:20px;overflow:hidden}video{width:100%;aspect-ratio:9/16;background:#080f13;display:block}section{padding:20px}h2{font-size:21px;margin:0 0 12px}.meta{font-size:13px;color:#a6b8b8}button{width:100%;padding:14px;border:0;border-radius:10px;background:#cbff5e;color:#172316;font-size:16px;cursor:pointer}.selected{outline:3px solid #cbff5e}#notice{position:sticky;top:0;background:#101619;padding:14px 0;color:#cbff5e}.waiting{aspect-ratio:9/16;display:grid;place-items:center;background:#152129;color:#9cadad}</style>
<main><header><div class="meta">TECH VIDEO STUDIO / CREATIVE AUDITIONS</div><h1>Choose the way your story moves.</h1><p>Compare 15-second edits and full character stories, including sketch adventures. Every video export is 2K at 60 fps.<br>Play a draft with sound, compare its clarity and pacing, then choose the direction to develop.</p><a href="http://localhost:3000" target="_blank">Open the live Remotion editor ↗</a></header><div id="notice" role="status"></div><div id="cards"></div></main>
<script>const token=${JSON.stringify(token)};let items=[];const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));async function load(){items=await(await fetch('/api/styles')).json();document.querySelector('#cards').innerHTML=items.map(s=>'<article class="'+(s.selected?'selected':'')+'">'+(s.ready?'<video controls preload="metadata" playsinline src="/media/'+s.id+'"></video>':'<div class="waiting">Draft is rendering</div>')+'<section><div class="meta">'+esc(s.group)+' · '+Math.round(s.duration)+'s</div><h2>'+esc(s.name)+'</h2><p>'+esc(s.bestFor)+'</p><button data-id="'+s.id+'">'+(s.selected?'Selected direction':'Choose this style')+'</button></section></article>').join('');document.querySelectorAll('video').forEach(v=>v.addEventListener('play',()=>document.querySelectorAll('video').forEach(other=>{if(other!==v)other.pause()})));document.querySelectorAll('button').forEach(b=>b.onclick=async()=>{const r=await fetch('/api/choice',{method:'POST',headers:{'Content-Type':'application/json','X-Studio-Token':token},body:JSON.stringify({id:b.dataset.id})});const result=await r.json();document.querySelector('#notice').textContent=result.saved?'Saved: '+result.style+'. Codex and Claude will read this choice for your next edit.':result.error;await load()});}load();</script></html>`;}
