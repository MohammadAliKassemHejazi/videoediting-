import {join} from 'node:path';
import {readFileSync,writeFileSync} from 'node:fs';
import {ROOT} from '../lib/project.mjs';
import {ffmpeg,probe} from '../lib/ffmpeg.mjs';
for(const film of JSON.parse(readFileSync(join(ROOT,'remotion/showcase.json'),'utf8')).filter(f=>!process.argv[2]||f.id===process.argv[2])){
 const folder=join(ROOT,'out',film.id),file=join(folder,'draft.mp4');
 for(const time of [1,4,8,13])await ffmpeg(['-ss',String(time),'-i',file,'-vf','scale=360:640','-frames:v','1',join(folder,`mux-${time}.png`)]);
 const inputs=[1,4,8,13].flatMap(t=>['-i',join(folder,`mux-${t}.png`)]);
 await ffmpeg([...inputs,'-filter_complex','[0:v][1:v][2:v][3:v]hstack=inputs=4','-frames:v','1',join(folder,'mux-contact.png')]);
 const score=join(ROOT,'projects',film.id,'assets/score.wav');
 // Technical loudness/peak report only; this does not constitute listening review.
 const {FFMPEG}=await import('../lib/ffmpeg.mjs'),{spawnSync}=await import('node:child_process');
 const report=spawnSync(FFMPEG,['-hide_banner','-i',score,'-af','ebur128=peak=true','-f','null','-'],{encoding:'utf8'});
 if(report.status!==0)throw Error('Audio measurement failed');writeFileSync(join(folder,'sound-meters.txt'),report.stderr.slice(report.stderr.lastIndexOf('Summary:')));
 console.log(film.id,probe(file));
}
