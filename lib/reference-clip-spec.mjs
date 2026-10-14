export {shotZoom,shotZoomExpression,shotFitY} from './variety-clip-spec.mjs';
export const REFERENCE_STYLES=[
 {id:'clip-reference-editorial',name:'REFERENCE EDITORIAL',style:'Dark grid, rounded evidence, speaker head breakout, red count and yellow marker; directed from the supplied OpenAI reference',sound:'click',shots:[{a:0,b:4.64,rect:[0,840,1080,1080],masked:true,zoom:[[0,1.12],[4.64,1.12]]},{a:4.64,b:7,rect:[0,0,1080,1920],zoom:[[4.64,1.45],[7,1.45]]},{a:8.7,b:15,rect:[0,840,1080,1080],masked:true,zoom:[[8.7,1.1],[15,1.1]]}]},
 {id:'clip-hand-orchestra',name:'HAND ORCHESTRA',style:'Real hand-tracked glass orbits, gesture-launched code, counted request beads and speech-timed contract docking',sound:'swoosh',shots:[{a:0,b:15,rect:[0,0,1080,1920],zoom:[[0,1.35],[.58,1.2],[3.14,1.25],[4.64,1.42],[7,1.2],[13.18,1.3],[15,1.3]]}]}
];
export function referenceStyle(id){const s=REFERENCE_STYLES.find(s=>s.id===id);if(!s)throw Error('Unknown reference edit '+id);return s}
export function handAt(spec,t,zoom=1){const samples=spec.handTracking.samples;const i=Math.min(samples.length-2,Math.max(0,Math.floor(t*10))),p=Math.max(0,Math.min(1,(t-samples[i].time)*10));function pick(s){return [...s.hands].sort((a,b)=>{const score=h=>Math.hypot(h.points[9][0]-.5,h.points[9][1]-.28);return score(b)-score(a)})[0]}
 const a=pick(samples[i]),b=pick(samples[i+1])||a;if(!a)return null;const points=a.points.map(([x,y],j)=>{const n=b.points[j];x+=(n[0]-x)*p;y+=(n[1]-y)*p;return [540+(x*1080-540)*zoom,576+(y*1920-576)*zoom]});const palm=points[9],tip=points[8],angle=Math.atan2(tip[1]-palm[1],tip[0]-palm[0]);return {palm,tip,angle,points,side:a.side,confidence:Math.min(a.confidence,b.confidence)}
}
