import {readFileSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {ffmpeg,FFMPEG,probe} from '../lib/ffmpeg.mjs';
import {casefileDigest} from '../lib/casefile-film.mjs';
import {ROOT} from '../lib/project.mjs';
const project=process.argv[2];if(project!=='texas-ten-thousand-steps')throw Error('Select Episode2');
const out='out/'+project,video=out+'/draft.mp4',spec=JSON.parse(readFileSync('remotion/texas-steps-film.json','utf8')),manifest=JSON.parse(readFileSync(out+'/render-manifest.json','utf8'));
if(manifest.sourceDigest!==casefileDigest(ROOT,project))throw Error('Current sources differ from rendered movie');
for(let page=0;page<4;page++){
 const frames=spec.shots.slice(page*7,page*7+7).map(s=>Math.round(s.startFrame+s.durationFrames*.55));
 await ffmpeg(['-threads','2','-i',video,'-vf',`select=${frames.map(f=>`eq(n\\,${f})`).join('+')},scale=216:384,tile=4x2`,'-frames:v','1',out+'/master-contact-'+page+'.png']);
}
const mapOldTime=t=>{if(!spec.performanceMap)return t;const m=spec.performanceMap.find(m=>t<m.oldEnd)||spec.performanceMap.at(-1);return m.newStart+(t-m.oldStart)/m.tempo};
const phoneSamples=[['hook',.25],['pullback',1.4],['javelina',7.1],['banker',10.4],['challenge',18.1],['watch1',22],['watch2',23.8],['product',38],['adoption',61],['review',77],['marker',83],['bench',93],['lower-watch',96.2],['turn',97.4],['stand',99.3],['banker-defeat',101],['cross-line',105.5],['question',108]].map(([label,t])=>({label,time:mapOldTime(t),file:'master-phone-'+label+'.png'}));
for(const {time,file}of phoneSamples)await ffmpeg(['-threads','2','-ss',String(time),'-i',video,'-vf','scale=360:640','-frames:v','1',out+'/'+file]);
for(const id of ['07','21','24','28']){
 const shot=spec.shots.find(s=>s.id===id),frames=[-12,-2,2,12].map(f=>shot.startFrame+f);
 await ffmpeg(['-threads','2','-i',video,'-vf',`select=${frames.map(f=>`eq(n\\,${f})`).join('+')},scale=216:384,tile=4x1`,'-frames:v','1',out+'/master-seam-'+id+'.png']);
}
const result=spawnSync(FFMPEG,['-hide_banner','-threads','2','-i',video,'-af','ebur128=peak=true','-vn','-f','null','-'],{encoding:'utf8',maxBuffer:4*1024*1024});if(result.status)throw Error('Audio measurement failed');
const summary=result.stderr.slice(result.stderr.lastIndexOf('Summary:'));writeFileSync(out+'/audio-measurement.txt',summary+'\n');
writeFileSync(out+'/media-check.json',JSON.stringify({...probe(video),sourceDigest:manifest.sourceDigest,sourceHashMatches:true,fullDecodePassed:manifest.fullDecodePassed,audioMeasurement:summary,phoneSamples,review:'Actual muxed-film contacts/phone/seam frames extracted. Visual inspection and listening are separate.'},null,2)+'\n');
console.log('Movie review images extracted; inspect them. '+summary.replace(/\s+/g,' '));
