import {existsSync,readFileSync,writeFileSync,mkdirSync,copyFileSync} from 'node:fs';
import {join,dirname} from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
import {ROOT} from '../lib/project.mjs';
import {writeStudioRoot} from '../lib/remotion-projects.mjs';
import {replaceWorkspaceFile} from '../lib/replace-file.mjs';
const project=process.argv[2];if(!/^[a-z0-9-]+$/.test(project||''))throw Error('Safe project ID required');
const folder=join(ROOT,'projects',project),pub=join(ROOT,'remotion/public'),manifest=join(ROOT,'remotion/texas-steps-film.json');
const hash=file=>createHash('sha256').update(readFileSync(file)).digest('hex');
const copy=(source,target)=>{const version=hash(source);if(!existsSync(target)||hash(target)!==version){mkdirSync(dirname(target),{recursive:true});const pending=target+'.'+randomUUID()+'.pending';copyFileSync(source,pending);replaceWorkspaceFile(pending,target)}return version.slice(0,16)};
function sync(){
 const spec=JSON.parse(readFileSync(join(folder,'editorial.json'),'utf8')),tracks={};
 for(const shot of spec.shots){
  const image=join(folder,'assets/keyframes',shot.id+'.png'),video=join(folder,'assets/shots',shot.id+'-h3.mp4'),record=join(folder,'assets/shots',shot.id+'-generation.json');
  shot.imageAvailable=existsSync(image);if(shot.imageAvailable)shot.imageVersion=copy(image,join(pub,shot.keyframe));
  shot.available=existsSync(video)&&existsSync(record);shot.sourceWidth=352;shot.sourceHeight=640;shot.enhanced=false;
  if(shot.available)shot.version=copy(video,join(pub,shot.source));
  const trackFile=join(folder,'assets/tracking',shot.id+'.json');if(shot.available&&existsSync(trackFile)){const track=JSON.parse(readFileSync(trackFile,'utf8'));if(track.sourceHash!==hash(video))throw Error('Stale prop track '+shot.id);if(track.configuration.enabled!==false)tracks[shot.id]=track}
  const dir=join(ROOT,'.cache',project,'enhancement'),infoFile=join(dir,shot.id+'-enhancement.json'),enhanced=join(dir,shot.id+'-x4.mp4');
  if(shot.available&&existsSync(infoFile)&&existsSync(enhanced)){
   const info=JSON.parse(readFileSync(infoFile,'utf8'));if(info.input.sourceHash!==hash(video)||info.outputHash!==hash(enhanced))throw Error('Stale enhancement '+shot.id);
   shot.source=project+'/shots/'+shot.id+'-x4.mp4';shot.version=copy(enhanced,join(pub,shot.source));shot.enhanced=true;shot.sourceWidth=info.metadata.width;shot.sourceHeight=info.metadata.height;
  }
 }
 copy(join(ROOT,'node_modules/@fontsource/source-serif-4/files/source-serif-4-latin-600-normal.woff2'),join(pub,spec.font));
 const audio=join(ROOT,'story-projects',project,'assets'),mix=join(audio,'mix.wav'),raw=join(audio,'narration.raw.wav'),fitted=join(audio,'narration.wav');
 spec.audioMasterReady=existsSync(mix);
 if(spec.audioMasterReady){spec.audio=project+'/audio/mix.wav';spec.audioPlaybackRate=1;spec.audioVersion=copy(mix,join(pub,spec.audio))}
 else if(existsSync(fitted)){spec.audio=project+'/audio/narration.wav';spec.audioPlaybackRate=1;spec.audioVersion=copy(fitted,join(pub,spec.audio))}
 else if(existsSync(raw)){spec.audio=project+'/audio/narration.raw.wav';spec.audioPlaybackRate=spec.voiceSpeed;spec.audioVersion=copy(raw,join(pub,spec.audio))}
 spec.readyCount=spec.shots.filter(s=>s.available).length;spec.complete=spec.readyCount===spec.shots.length;
 const next=JSON.stringify(spec,null,2)+'\n';if(!existsSync(manifest)||readFileSync(manifest,'utf8')!==next){writeFileSync(manifest,next);console.log('Episode2 preview updated: '+spec.readyCount+'/'+spec.shots.length+' actual animated shots')}
 const trackPath=join(ROOT,'remotion/texas-steps-tracks.json'),serialized=JSON.stringify(tracks,null,2)+'\n';if(!existsSync(trackPath)||readFileSync(trackPath,'utf8')!==serialized)writeFileSync(trackPath,serialized);
 const rootSource=readFileSync(join(ROOT,'remotion/index.jsx'),'utf8');if(!rootSource.includes('id="texas-ten-thousand-steps"'))writeStudioRoot(ROOT,rootSource);
}
sync();if(process.argv.includes('--watch'))setInterval(()=>{try{sync()}catch(e){console.error(e.message)}},15000);
