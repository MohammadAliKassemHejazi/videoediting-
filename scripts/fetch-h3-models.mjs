import {createReadStream,createWriteStream,existsSync,mkdirSync,readFileSync,renameSync,statSync,statfsSync,writeFileSync} from 'node:fs';
import {join,resolve,relative,dirname} from 'node:path';
import {createHash} from 'node:crypto';
import {Readable,Transform} from 'node:stream';
import {pipeline} from 'node:stream/promises';
import {ROOT} from '../lib/project.mjs';

const manifest=JSON.parse(readFileSync(join(ROOT,'projects/texas-cinema-myth/H3_MODELS.json'),'utf8'));
const models=[...manifest.models,...(process.argv.includes('--turbo')?manifest.accelerators||[]:[])];
const base=join(ROOT,'.cache/h3-engine');
mkdirSync(base,{recursive:true});
const digest=async file=>{const hash=createHash('sha256');for await(const chunk of createReadStream(file))hash.update(chunk);return hash.digest('hex')};
const safe=file=>{const result=resolve(base,file),rel=relative(base,result);if(rel.startsWith('..')||!rel)throw Error('Invalid model destination');return result};
const needed=models.reduce((sum,m)=>sum+(existsSync(safe(m.destination))?0:Math.max(0,m.size-(existsSync(safe(m.destination)+'.partial')?statSync(safe(m.destination)+'.partial').size:0))),0);
const space=statfsSync(base),free=space.bavail*space.bsize;
if(free<needed+8*1024**3)throw Error('Need model bytes plus 8 GiB spare; no user assets will be deleted.');
const verified=[];
for(const model of models){
 const target=safe(model.destination),pending=target+'.partial';mkdirSync(dirname(target),{recursive:true});
 if(existsSync(target)){
  if(statSync(target).size!==model.size||await digest(target)!==model.sha256)throw Error('Existing model differs from source manifest: '+model.file);
  console.log('Already verified '+model.file);verified.push(model);continue;
 }
 const url='https://huggingface.co/'+model.repo+'/resolve/'+model.revision+'/'+model.file.split('/').map(encodeURIComponent).join('/');
 for(let attempt=1;attempt<=3;attempt++){
  try{
   let offset=existsSync(pending)?statSync(pending).size:0;
   if(offset>model.size)throw Error('Partial file is larger than source: '+model.file);
   if(offset<model.size){
    const response=await fetch(url,{headers:offset?{Range:'bytes='+offset+'-'}:{},signal:AbortSignal.timeout(1800000)});
    if(!response.ok||!response.body)throw Error('Public download returned HTTP '+response.status);
    if(response.status===206){if(!response.headers.get('content-range')?.startsWith('bytes '+offset+'-'))throw Error('Unexpected range response');}
    else offset=0;
    let total=offset,last=0;console.log('Downloading '+model.file+' from '+(offset/1024**3).toFixed(2)+' GiB');
    const progress=new Transform({transform(chunk,encoding,callback){total+=chunk.length;if(total>model.size){callback(Error('Download exceeds expected size'));return;}if(Date.now()-last>15000){console.log(model.file+': '+(total/1024**3).toFixed(2)+' / '+(model.size/1024**3).toFixed(2)+' GiB');last=Date.now();}callback(null,chunk)}});
    await pipeline(Readable.fromWeb(response.body),progress,createWriteStream(pending,{flags:offset?'a':'w'}));
   }
   if(statSync(pending).size!==model.size)throw Error('Incomplete public download');
   if(await digest(pending)!==model.sha256)throw Error('SHA-256 mismatch; partial preserved for inspection');
   renameSync(pending,target);console.log('SHA-256 verified '+model.file);verified.push(model);break;
  }catch(error){if(attempt===3||/SHA-256|larger than|exceeds|Unexpected range/.test(error.message))throw error;console.log('Interrupted download; resuming '+model.file+' ('+attempt+'/3): '+error.message);}
 }
 writeFileSync(join(base,'verified-models.json'),JSON.stringify({verifiedAt:new Date().toISOString(),models:verified},null,2)+'\n');
}
console.log('All H3 model components downloaded and verified. Inference still requires a separate test.');
