import {readdirSync,existsSync,readFileSync} from 'node:fs';
import {join} from 'node:path';
import {STYLES} from './style-auditions.js';
import {STORY_STYLES} from './story-painters.js';
const folders=root=>existsSync(root)?readdirSync(root,{withFileTypes:true}).filter(e=>e.isDirectory()).map(e=>e.name):[];
export function galleryCatalog(root){
 const items=[];
 for(const project of folders(join(root,'projects'))){
   const configFile=join(root,'projects',project,'project.json');
   if(existsSync(configFile)){
     const config=JSON.parse(readFileSync(configFile,'utf8'));
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
 const priority=item=>item.group==='Your clip / five edits'?0:item.group==='Original style films'?1:2;
 return items.sort((a,b)=>priority(a)-priority(b));
}
