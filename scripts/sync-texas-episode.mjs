import {existsSync,readFileSync,writeFileSync,mkdirSync,copyFileSync} from 'node:fs';
import {join,dirname} from 'node:path';
import {createHash} from 'node:crypto';
import {ROOT} from '../lib/project.mjs';
import {writeStudioRoot} from '../lib/remotion-projects.mjs';
const folder=join(ROOT,'projects/texas-cinema-myth'),pub=join(ROOT,'remotion/public'),manifest=join(ROOT,'remotion/texas-film.json');
const hash=file=>createHash('sha256').update(readFileSync(file)).digest('hex');
const copy=(source,target)=>{const version=hash(source);if(!existsSync(target)||hash(target)!==version){mkdirSync(dirname(target),{recursive:true});copyFileSync(source,target)}return version.slice(0,16)};
function sync(){
 const spec=JSON.parse(readFileSync(join(folder,'editorial.json'),'utf8')),plan=JSON.parse(readFileSync(join(folder,'production-scenes.json'),'utf8')),tracks={};
 for(const shot of spec.shots){
  const scene=plan.scenes.find(s=>s.id===shot.id),image=join(folder,scene.keyframe),video=join(folder,'assets/shots/'+shot.id+'-h3.mp4');
  if(existsSync(image))shot.imageVersion=copy(image,join(pub,shot.keyframe));
  shot.available=existsSync(video)&&(shot.id==='01'||existsSync(join(folder,'assets/shots/'+shot.id+'-generation.json')));
  if(shot.available)shot.version=copy(video,join(pub,shot.source));
  shot.sourceWidth=352;shot.sourceHeight=640;shot.enhanced=false;
  const enhancement=join(ROOT,'.cache/texas-cinema-myth/enhancement',shot.id+'-enhancement.json');
  const enhanced=join(ROOT,'.cache/texas-cinema-myth/enhancement',shot.id+'-x4.mp4');
  if(shot.available&&existsSync(enhancement)&&existsSync(enhanced)){
   const info=JSON.parse(readFileSync(enhancement,'utf8'));
   if(info.input.sourceHash!==hash(video)||info.outputHash!==hash(enhanced))throw Error('Stale or incomplete enhanced source '+shot.id);
   shot.source='texas-cinema-myth/shots/'+shot.id+'-x4.mp4';shot.version=copy(enhanced,join(pub,shot.source));shot.enhanced=true;
   shot.sourceWidth=info.metadata.width;shot.sourceHeight=info.metadata.height;
  }
  const trackFile=join(folder,'assets/tracking/'+shot.id+'.json');
  if(shot.available&&existsSync(trackFile)){
   const track=JSON.parse(readFileSync(trackFile,'utf8'));
   if(track.sourceHash!==hash(video))throw Error('Stale prop tracking for '+shot.id);
   tracks[shot.id]=track;
  }
 }
 const font=join(ROOT,'node_modules/@fontsource/source-serif-4/files/source-serif-4-latin-600-normal.woff2');copy(font,join(pub,spec.font));
 const mix=join(ROOT,'story-projects/texas-cinema-myth/assets/mix.wav'),raw=join(ROOT,'story-projects/texas-cinema-myth/assets/narration.raw.wav');
 if(existsSync(mix)){spec.audio='texas-cinema-myth/audio/mix.wav';spec.audioPlaybackRate=1;spec.audioVersion=copy(mix,join(pub,spec.audio));}
 else if(existsSync(raw)){spec.audio='texas-cinema-myth/audio/narration.raw.wav';spec.audioPlaybackRate=spec.voiceSpeed;spec.audioVersion=copy(raw,join(pub,spec.audio));}
 spec.readyCount=spec.shots.filter(s=>s.available).length;spec.complete=spec.readyCount===23;
 spec.audioMasterReady=existsSync(mix);
 const next=JSON.stringify(spec,null,2)+'\n';if(!existsSync(manifest)||readFileSync(manifest,'utf8')!==next){writeFileSync(manifest,next);console.log('Remotion full episode updated: '+spec.readyCount+'/23 real H3 shots.');}
 const tracksPath=join(ROOT,'remotion/texas-tracks.json'),serializedTracks=JSON.stringify(tracks,null,2)+'\n';
 if(!existsSync(tracksPath)||readFileSync(tracksPath,'utf8')!==serializedTracks)writeFileSync(tracksPath,serializedTracks);
 const rootSource=readFileSync(join(ROOT,'remotion/index.jsx'),'utf8');
 if(!rootSource.includes('id="texas-cinema-myth"'))writeStudioRoot(ROOT,rootSource);
}
sync();
if(process.argv.includes('--watch'))setInterval(()=>{try{sync()}catch(e){console.error(e.message)}},15000);
