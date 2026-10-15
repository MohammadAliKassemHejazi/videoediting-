import {readdirSync,existsSync,readFileSync} from 'node:fs';
import {join} from 'node:path';
import {STYLES} from './style-auditions.js';
import {STORY_STYLES} from './story-painters.js';
import {MEMORY_STYLES} from './memory-story-spec.mjs';
const folders=root=>existsSync(root)?readdirSync(root,{withFileTypes:true}).filter(e=>e.isDirectory()).map(e=>e.name):[];
export function galleryCatalog(root){
 const items=[];
 for(const project of folders(join(root,'projects'))){
   const configFile=join(root,'projects',project,'project.json');
   if(existsSync(configFile)){
     const config=JSON.parse(readFileSync(configFile,'utf8'));
     if(config.kind==='generated-story'){
       items.push({id:project+'--film',styleId:project,project,title:config.title,name:config.title,group:'Original narrated stories',duration:config.duration,bestFor:config.style,file:join(root,'out',project,'draft.mp4'),choice:join(root,'projects',project,'choice.json'),recordFile:configFile,manifest:join(root,'out',project,'generated-story.json'),live:'http://localhost:3000/'+config.composition,status:config.status});continue;
     }
     if(config.kind==='clip-reference'){
       items.push({id:project+'--reference',styleId:project,project,title:config.title,name:config.title,group:'Your clip / reference and hand motion',duration:config.duration,bestFor:config.style,file:join(root,'out',project,'draft.mp4'),choice:join(root,'projects',config.sourceProject,'pro-edits/choice.json'),recordFile:configFile,manifest:join(root,'out',project,'reference-clip.json'),live:'http://localhost:3000/'+config.composition});continue;
     }
     if(config.kind==='memory-story'){
       const style=MEMORY_STYLES.find(s=>s.project===project);items.push({id:project+'--story',styleId:style.id,project,title:config.title,name:config.title,group:'Arabic / three story styles',duration:config.duration,bestFor:style.feeling,file:join(root,'out',project,'draft.mp4'),choice:join(root,'story-projects',config.sourceStory,'choice.json'),recordFile:configFile,manifest:join(root,'out',project,'memory-story.json'),live:'http://localhost:3000/'+config.composition});continue;
     }
     if(config.kind==='creature-film'){
       items.push({id:project+'--film',styleId:project,project,title:config.title,name:config.title,group:'Warm creature production',duration:config.duration,bestFor:config.style,file:join(root,'out',project,'assembled-draft.mp4'),choice:join(root,'projects',project,'choice.json'),recordFile:configFile,manifest:join(root,'out',project,'creature-story.json'),live:'http://localhost:3000/'+config.composition,status:config.status,keyframe:false});continue;
     }
     if(config.kind==='creature-preset'){
       items.push({id:project+'--keyframe',styleId:project,project,title:config.title,name:config.title,group:'Warm creature production',duration:15,bestFor:config.style,file:join(root,'out',project,'assembled-draft.mp4'),choice:join(root,'projects',project,'choice.json'),recordFile:configFile,manifest:join(root,'out',project,'creature-story.json'),live:'http://localhost:3000/warm-creature-keyframe',status:config.status,keyframe:true});continue;
     }
     if(config.kind==='clip-variety'){
       items.push({id:project+'--variety',styleId:project,project,title:config.title,name:config.title,group:'Your clip / new edit ideas',duration:config.duration,bestFor:config.style,file:join(root,'out',project,'draft.mp4'),choice:join(root,'projects',config.sourceProject,'pro-edits/choice.json'),recordFile:configFile,manifest:join(root,'out',project,'variety-clip.json'),live:'http://localhost:3000/'+config.composition});continue;
     }
     if(config.kind==='clip-audition'){
       items.push({id:project+'--edit',styleId:project,project,title:config.title,name:config.title,group:'Your clip / five edits',duration:config.duration,bestFor:config.style,file:join(root,'out',project,'draft.mp4'),choice:join(root,'projects',config.sourceProject,'pro-edits/choice.json'),recordFile:configFile,manifest:join(root,'out',project,'pro-clip.json'),live:'http://localhost:3000/'+config.composition});continue;
     }
     if(config.kind==='directed-film'){
       items.push({id:project+'--original',styleId:project,project,title:config.title,name:config.title,group:'Original style films',duration:config.duration,bestFor:config.style+' · '+config.hook,file:join(root,'out',project,'draft.mp4'),choice:join(root,'projects',project,'choice.json'),recordFile:configFile,manifest:join(root,'out',project,'showcase.json'),live:'http://localhost:3000/'+config.composition});
       continue;
     }
   }
   const recordFile=join(root,'projects',project,'style-lab/audition.json');if(!existsSync(recordFile))continue;
   const spec=JSON.parse(readFileSync(recordFile,'utf8'));
   for(const styleId of spec.styles){const style=STYLES.find(s=>s.id===styleId);if(!style)continue;items.push({...style,id:project+'--'+styleId,styleId,project,title:spec.title,group:'15-second auditions',duration:spec.duration,file:join(root,'out',project,'styles',styleId+'.mp4'),choice:join(root,'projects',project,'style-lab/choice.json'),recordFile,manifest:join(root,'out',project,'styles/manifest.json')});}
 }
 for(const project of folders(join(root,'story-projects'))){
   const recordFile=join(root,'story-projects',project,'timed.json');if(!existsSync(recordFile))continue;
   const spec=JSON.parse(readFileSync(recordFile,'utf8'));
   for(const styleId of spec.styles){const style=STORY_STYLES.find(s=>s.id===styleId);if(!style)continue;items.push({...style,id:project+'--'+styleId,styleId,project,title:spec.title,group:'Full character stories',duration:spec.duration,bestFor:`${spec.language==='ar'?'Arabic':'English'} neural narration · ${spec.audience||'Character story'}`,file:join(root,'out',project,styleId+'-draft.mp4'),choice:join(root,'story-projects',project,'choice.json'),recordFile,manifest:join(root,'out',project,'story-drafts.json')});}
 }
 const priority=item=>item.group==='Original narrated stories'?-2:item.group==='Warm creature production'?-1:item.group==='Original style films'?0:item.group==='Your clip / reference and hand motion'?1:item.group==='Arabic / three story styles'?2:item.group==='Your clip / new edit ideas'?4:item.group==='Your clip / five edits'?5:6;
 return items.sort((a,b)=>priority(a)-priority(b));
}
