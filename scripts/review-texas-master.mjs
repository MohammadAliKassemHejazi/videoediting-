import {readFileSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {ffmpeg,FFMPEG,probe} from '../lib/ffmpeg.mjs';
import {texasDigest} from '../lib/texas-film.mjs';
import {ROOT} from '../lib/project.mjs';
const video='out/texas-cinema-myth/draft.mp4',out='out/texas-cinema-myth',spec=JSON.parse(readFileSync('remotion/texas-film.json','utf8')),manifest=JSON.parse(readFileSync(out+'/render-manifest.json','utf8'));
if(manifest.sourceDigest!==texasDigest(ROOT))throw Error('Rendered source hash differs from current film');
for(let page=0;page<3;page++){
 const shots=spec.shots.slice(page*8,page*8+8),frames=shots.map(s=>Math.round(s.startFrame+s.durationFrames*.55));
 await ffmpeg(['-threads','2','-i',video,'-vf',`select=${frames.map(f=>`eq(n\\,${f})`).join('+')},scale=240:426,tile=4x2`,'-frames:v','1',out+'/master-contact-'+page+'.png']);
}
for(const time of [.5,16.3,54.8,55.3,74.9,77.1,82.15,83.9,85.4,88.4])await ffmpeg(['-threads','2','-i',video,'-ss',String(time),'-vf','scale=360:640','-frames:v','1',out+'/master-phone-'+time+'.png']);
const result=spawnSync(FFMPEG,['-hide_banner','-threads','2','-i',video,'-af','ebur128=peak=true','-vn','-f','null','-'],{encoding:'utf8',maxBuffer:4*1024*1024});if(result.status)throw Error('Audio decode/measurement failed');
const summary=result.stderr.slice(result.stderr.lastIndexOf('Summary:'));writeFileSync(out+'/audio-measurement.txt',summary+'\n');
const metadata=probe(video);writeFileSync(out+'/media-check.json',JSON.stringify({...metadata,audioPresent:Boolean(metadata.audio),sourceDigest:manifest.sourceDigest,sourceHashMatches:true,fullDecodePassed:true,audioMeasurement:summary,review:'Actual muxed-film contacts and phone frames prepared; visual inspection and listening statuses remain separate'},null,2)+'\n');
console.log('Actual muxed-film review images prepared. '+summary.replace(/\s+/g,' '));
