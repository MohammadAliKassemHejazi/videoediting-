import {readFileSync,existsSync} from 'node:fs';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
export function casefileSources(root,project){
 if(!/^[a-z0-9-]+$/.test(project))throw Error('Safe project ID required');
 const spec=JSON.parse(readFileSync(join(root,'remotion/texas-steps-film.json'),'utf8'));
 if(spec.project!==project)throw Error('Casefile manifest project mismatch');
 return [...new Set([
  'projects/'+project+'/scenes.jsx','projects/'+project+'/editorial.json','projects/'+project+'/NARRATION.json',
  'projects/'+project+'/H3_MODELS.json','projects/'+project+'/FINISHING_TOOLS.json',
  'remotion/TexasStepsEpisode.jsx','remotion/TexasStepsExport.jsx','remotion/texas-steps-film.json','remotion/texas-steps-tracks.json',
  'scripts/render-casefile-episode.mjs','scripts/make-casefile-audio.mjs',
  'story-projects/'+project+'/assets/SOUND_EVENTS.json',
  ...spec.shots.flatMap(s=>['projects/'+project+'/assets/shots/'+s.id+'-h3.mp4','projects/'+project+'/assets/shots/'+s.id+'-generation.json','remotion/public/'+s.source]),
  'remotion/public/'+spec.font,'remotion/public/'+spec.audio
 ])].filter(f=>existsSync(join(root,f))).sort();
}
export function casefileDigest(root,project){const hash=createHash('sha256');for(const file of casefileSources(root,project)){hash.update(file);hash.update('\0');hash.update(readFileSync(join(root,file)));hash.update('\0')}return hash.digest('hex')}
