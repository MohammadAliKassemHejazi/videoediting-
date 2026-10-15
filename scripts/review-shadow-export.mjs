import {mkdirSync,writeFileSync} from 'node:fs';
import {ffmpeg} from '../lib/ffmpeg.mjs';
const file='out/shadow-went-first/draft.mp4',out='out/shadow-went-first',frames=out+'/review-frames';mkdirSync(frames,{recursive:true});
async function still(t,name,width){await ffmpeg(['-ss',String(t),'-i',file,'-vf','scale='+width+':-1','-frames:v','1',frames+'/'+name+'.png']);return frames+'/'+name+'.png'}
async function grid(files,name,cols,width,height){await ffmpeg([...files.flatMap(f=>['-i',f]),'-filter_complex',files.map((_,i)=>'['+i+':v]').join('')+'xstack=inputs='+files.length+':layout='+files.map((_,i)=>(i%cols)*width+'_'+Math.floor(i/cols)*height).join('|')+':fill=black[v]','-map','[v]','-frames:v','1',out+'/'+name+'.png'])}
const times=[2,8.8,15,22.5,29.5,35.3,45.5,51.4,60.2,67.8,74.8,80.4,87.2],contact=[];for(const t of times)contact.push(await still(t,'contact-'+t,300));await grid(contact,'final-contact',4,300,533);
const phone=[];for(const t of [2,35.3,67.8,87.2])phone.push(await still(t,'phone-'+t,360));await grid(phone,'final-phone',4,360,640);
const cuts=[7.4167,16.0667,26.5333,34.4333,51.5333,66.7667,71.6167,77.9833,84],strip=[];for(const t of cuts)for(const d of [-.16,-.0167,.0167,.16])strip.push(await still(t+d,'cut-'+t+'-'+d,180));await grid(strip,'final-seams',4,180,320);
writeFileSync(out+'/review-layout.json',JSON.stringify({contactTimes:times,phoneTimes:[2,35.3,67.8,87.2],seamRows:cuts,offsets:[-.16,-.0167,.0167,.16],note:'Unused cells in the last contact row are black; they are not video frames.'},null,2)+'\n');console.log('Export review images ready.');
