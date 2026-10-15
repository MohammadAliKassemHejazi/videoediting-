import {readFileSync,statSync} from 'node:fs';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
const cached=new Map();
export function generatedStorySources(root){
 const spec=JSON.parse(readFileSync(join(root,'remotion/shadow-work.json'),'utf8'));
 return ['remotion/ShadowStory.jsx','remotion/ShadowTreatment.jsx','remotion/InvitationBeat.jsx','remotion/ShadowExport.jsx','remotion/shadow-work.json',...spec.shots.map(s=>'story-projects/shadow-went-first/'+s.file),...['01','02','10'].map(id=>'story-projects/shadow-went-first/assets/'+id+'-clean.png'),'story-projects/shadow-went-first/assets/mix.wav'];
}
export function generatedStoryDigest(root){
 const sources=generatedStorySources(root),signature=sources.map(f=>{const s=statSync(join(root,f));return f+':'+s.size+':'+s.mtimeMs}).join('|'),previous=cached.get(root);
 if(previous?.signature===signature)return previous.digest;
 const hash=createHash('sha256');for(const f of sources)hash.update(f).update(readFileSync(join(root,f)));const digest=hash.digest('hex');cached.set(root,{signature,digest});return digest;
}
