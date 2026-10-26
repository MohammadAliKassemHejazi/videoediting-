import {readFileSync,existsSync} from 'node:fs';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
export function texasSources(root){
 const spec=JSON.parse(readFileSync(join(root,'remotion/texas-film.json'),'utf8'));
 return [...new Set([
  'remotion/TexasEpisode.jsx','projects/texas-cinema-myth/scenes.jsx','remotion/TexasExport.jsx','remotion/texas-film.json','remotion/texas-tracks.json',
  'scripts/make-texas-audio.mjs','scripts/render-texas-episode.mjs','scripts/prepare-texas-editorial.mjs',
  'projects/texas-cinema-myth/editorial.json','projects/texas-cinema-myth/H3_MODELS.json','projects/texas-cinema-myth/FINISHING_TOOLS.json',
  'projects/texas-cinema-myth/VOICEOVER_DRAFT.md',
  'story-projects/texas-cinema-myth/assets/SOUND_EVENTS.json',
  ...spec.shots.map(s=>'projects/texas-cinema-myth/assets/shots/'+s.id+'-h3.mp4'),
  ...spec.shots.map(s=>'remotion/public/'+s.source),
  'remotion/public/'+spec.font,'remotion/public/'+spec.audio
 ])].filter(file=>existsSync(join(root,file))).sort();
}
export function texasDigest(root){
 const hash=createHash('sha256');for(const file of texasSources(root)){hash.update(file);hash.update('\0');hash.update(readFileSync(join(root,file)));hash.update('\0')}return hash.digest('hex');
}
