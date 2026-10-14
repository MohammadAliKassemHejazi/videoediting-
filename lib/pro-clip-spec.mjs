export const PRO_CLIP_STYLES=[
 {id:'clip-monument',name:'MONUMENT / Behind the Type',style:'Oversized depth type · natural room · editorial punch-ins',zoom:1.22,anchor:.28,room:true,accent:'#f5e5b8',caption:'clean',grade:'eq=contrast=1.035:saturation=0.95',bumps:[[.58,3.14,.07],[4.64,7,.05],[13.18,15,.045]],sound:'air'},
 {id:'clip-redline',name:'REDLINE / Security Thriller',style:'Dark security dossier · red scan cuts · code evidence',zoom:1.29,anchor:.27,room:false,accent:'#ff343f',caption:'terminal',grade:'eq=contrast=1.075:saturation=0.72:brightness=-0.015',bumps:[[0,.58,.06],[4.64,7,.09]],sound:'metal'},
 {id:'clip-paper-evidence',name:'PAPER EVIDENCE / Editorial Cutout',style:'Torn paper · photo cutout · serif headlines · handwritten marks',zoom:1.17,anchor:.28,room:false,accent:'#ea542e',caption:'paper',grade:'hue=s=0.26,eq=contrast=1.06:brightness=0.01',bumps:[[3.14,4.64,.05],[7.88,9.18,.045]],sound:'paper'},
 {id:'clip-acid-print',name:'ACID PRINT / Kinetic Poster',style:'Chartreuse print · violet optical geometry · graphic impact cuts',zoom:1.23,anchor:.28,room:false,accent:'#d9ff43',caption:'acid',grade:'eq=contrast=1.05:saturation=0.82',bumps:[[0,.58,.085],[4.64,7,.08],[13.18,15,.035]],sound:'wood'},
 {id:'clip-chrome-depth',name:'CHROME DEPTH / Spatial Editorial',style:'Satin-metal typography · amber depth · glass rails · measured camera',zoom:1.24,anchor:.28,room:false,accent:'#f5c778',caption:'chrome',grade:'eq=contrast=1.04:saturation=0.85',bumps:[[1.68,3.14,.045],[7.88,9.18,.07]],sound:'glass'}
];
export function proStyle(id){const s=PRO_CLIP_STYLES.find(s=>s.id===id);if(!s)throw Error('Unknown clip style: '+id);return s}
export function clipCamera(id,t){const s=proStyle(id);return s.zoom+s.bumps.reduce((v,[a,b,z])=>v+(t>=a&&t<b?z:0),0)}
export function zoomExpression(id,variable='on/60'){const s=proStyle(id);return String(s.zoom)+s.bumps.map(([a,b,z])=>`+${z}*gte(${variable},${a})*lt(${variable},${b})`).join('')}
