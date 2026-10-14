import {join} from 'node:path';import {writeFileSync,unlinkSync} from 'node:fs';
import {ffmpeg} from './ffmpeg.mjs';import {shotZoomExpression} from './reference-clip-spec.mjs';
// Stage shots separately: a split/trim graph can buffer several seconds of 2K
// mask frames while waiting for a later shot. Serial finite segments bound memory.
export async function referenceFootage(root,style,source,cache){
 const boundaries=[0,...style.shots.flatMap(s=>[s.a,s.b]),15].filter((x,i,a)=>a.indexOf(x)===i).sort((a,b)=>a-b),segments=[];
 for(let j=0;j<boundaries.length-1;j++){const boundary=boundaries[j],b=boundaries[j+1],a=Math.ceil(boundary*60-1e-8)/60,count=Math.ceil(b*60-1e-8)-Math.ceil(boundary*60-1e-8),duration=count/60,s=style.shots.find(s=>boundary>=s.a&&boundary<s.b),file=join(cache,style.id+'-foot-'+j+'.mov');segments.push(file);
  if(!s){await ffmpeg(['-f','lavfi','-i',`color=black@0:s=1440x2560:r=60:d=${duration},format=rgba`,'-frames:v',String(count),'-an','-c:v','qtrle','-threads','2',file]);continue}
  const [x,y,w,h]=s.rect.map(v=>Math.round(v*4/3/2)*2),z=shotZoomExpression(s,`on/60+${a}`),camera=`fps=60,scale=${w}:${h}:force_original_aspect_ratio=increase,crop=${w}:${h}:(iw-ow)*.5:(ih-oh)*.28,zoompan=z='${z}':x='iw*.5-iw/zoom*.5':y='ih*.3-ih/zoom*.3':d=1:s=${w}x${h}:fps=60`;
  const inputs=['-ss',String(a),'-t',String(duration+.08),'-i',source];let f=`[0:v]${camera},format=rgba[rgb];`;
  if(s.masked){inputs.push('-ss',String(a),'-t',String(duration+.08),'-i',join(root,'.cache/backend-checklist/person-mask.mkv'),'-loop','1','-framerate','60','-t',String(duration+.08),'-i',join(cache,'card-mask.png'));f+=`[1:v]erosion,erosion,erosion,dilation,dilation,gblur=sigma=.6,${camera},format=gray[seg];[2:v]format=gray[card];[seg][card]blend=all_mode=lighten:shortest=1[alpha];[rgb][alpha]alphamerge[shot];`}else f+='[rgb]null[shot];';
  f+=`[shot]pad=1440:2560:${x}:${y}:color=black@0,format=argb[v]`;
  await ffmpeg(['-filter_complex_threads','1',...inputs,'-filter_complex',f,'-map','[v]','-frames:v',String(count),'-an','-c:v','qtrle','-threads','2',file]);
 }
 const list=join(cache,style.id+'-footage.txt'),out=join(cache,style.id+'-footage.mov');writeFileSync(list,segments.map(p=>"file '"+p.replaceAll('\\','/')+"'").join('\n'));await ffmpeg(['-f','concat','-safe','0','-i',list,'-c','copy',out]);for(const file of segments)unlinkSync(file);return out;
}
