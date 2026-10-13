import {createServer} from 'node:http';
import {readFileSync,writeFileSync,existsSync,createReadStream,statSync} from 'node:fs';
import {join} from 'node:path';
import {randomBytes,createHash} from 'node:crypto';
import {ROOT} from '../lib/project.mjs';
import {STYLES} from '../lib/style-auditions.js';
import {STORY_STYLES} from '../lib/story-painters.js';
import {galleryCatalog} from '../lib/style-catalog.mjs';
import {storyDigest} from '../lib/story-digest.mjs';
import {showcaseGalleryHtml} from '../lib/showcase-gallery.mjs';
const token=randomBytes(24).toString('hex'),port=3001;
const auditionFile=join(ROOT,'projects/backend-checklist/style-lab/audition.json'),storyFile=join(ROOT,'story-projects/pip-last-light/timed.json');
const catalog=()=>galleryCatalog(ROOT);
function ready(item){
 if(!existsSync(item.file))return false;
 if(item.group==='Original style films'){
   if(!existsSync(item.manifest))return false;
   const digest=createHash('sha256').update(readFileSync(join(ROOT,'projects',item.project,'scenes.jsx'))).update(readFileSync(join(ROOT,'projects',item.project,'assets/score.wav'))).digest('hex');
   return JSON.parse(readFileSync(item.manifest,'utf8')).sourceDigest===digest;
 }
 if(item.group==='Full character stories'){
   if(!existsSync(item.manifest))return false;
   const manifest=JSON.parse(readFileSync(item.manifest,'utf8'));return manifest.styles.includes(item.styleId)&&manifest.sourceDigest===storyDigest(ROOT,item.recordFile);
 }
 const manifest=item.manifest;if(!existsSync(manifest))return false;
 const digest=createHash('sha256').update(readFileSync(join(ROOT,'remotion/Audition.jsx'))).update(readFileSync(join(ROOT,'lib/style-auditions.js'))).digest('hex');
 return Boolean(JSON.parse(readFileSync(manifest,'utf8')).sourceDigest);
}
const send=(res,status,body,type='application/json')=>{res.writeHead(status,{'Content-Type':type,'Cache-Control':'no-store'});res.end(Buffer.isBuffer(body)||typeof body==='string'?body:JSON.stringify(body));};
const server=createServer(async(req,res)=>{
 try{
   const url=new URL(req.url,'http://localhost:'+port);
   if(req.method==='GET'&&url.pathname==='/')return send(res,200,showcaseGalleryHtml(token),'text/html; charset=utf-8');
   if(req.method==='GET'&&url.pathname==='/api/styles')return send(res,200,catalog().map(item=>{const {file,choice,recordFile,manifest,...s}=item;return {...s,ready:ready(item),version:existsSync(file)?statSync(file).mtimeMs:0,selected:existsSync(choice)&&JSON.parse(readFileSync(choice,'utf8')).style===s.styleId};}));
   if(req.method==='GET'&&url.pathname.startsWith('/cover/')){
     const item=catalog().find(s=>s.id===decodeURIComponent(url.pathname.slice(7)));if(!item)return send(res,404,'Unknown project','text/plain');
     const primaryCover=join(ROOT,'projects',item.project,'assets/thumbnail.png'),cover=existsSync(primaryCover)?primaryCover:join(ROOT,'story-projects',item.project,'assets/thumbnail.png');if(!existsSync(cover))return send(res,404,'Cover pending','text/plain');return send(res,200,readFileSync(cover),'image/png');
   }
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
server.listen(port,'127.0.0.1',()=>console.log('Style comparison: http://localhost:3001 â€” playback and saved choices.'));
