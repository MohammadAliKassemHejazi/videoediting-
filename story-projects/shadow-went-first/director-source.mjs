import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
const folder=new URL('./',import.meta.url),spec=JSON.parse(readFileSync(new URL('timed.json',folder),'utf8'));
const style='One continuous shot in an original painterly cinematic 3D animated teen film. Same faces, clothes, school building and blue-amber night light as the input. Stable exposure and anatomy, no cut, no new writing, no extra limbs, no sudden camera reversal. ';
const prompts=[
 "The teal-jacket teenage girl finishes a small dance step and notices her dark silhouette moving independently away toward the left doorway. Her eyebrows rise; she turns her eyes and head to follow it, then reaches out in disbelief. The silhouette keeps its plain midnight-black body and walks away without changing shape. Clear planted shoes, steady tripod phone in foreground. Keep the girl on the right and the silhouette on the left. Camera locked, only character acting.",
 "Noor holds up her open palm asking the dark silhouette to stop. The silhouette points one arm toward the warm classroom door on the left, pauses to let her see, then turns toward that door. Noor looks from its pointing hand to the door, puzzled but curious. Her copper bag and short dark bob remain stable. A medium shot with a clear cause and reaction, no dialogue lip sync required.",
 "At the closed classroom door, the midnight-black shadow slides flat along the floor and disappears underneath the door. Noor in her teal jacket and yellow-laced cream sneakers steps up, stops, bends slightly and reaches for the handle. Her shoes stay planted when she reaches. The warm line of light under the door remains stable. Low camera sees the threshold and her actual hand reaching.",
 "Close insert of Noor's two hands holding a small pointed white folded paper rocket with a handdrawn blue planet and a tiny candle illustration. She turns it gently, opens one folded paper flap with her thumb and recognizes the birthday drawing. Fingers make believable paper contact, only one rocket. Teal jacket sleeves, same warm school-corridor light. Fixed camera, crisp origami prop, no changing illustrations or new text.",
 "Rami, the curly-haired teenage boy in a lavender hoodie, sits alone at the arts classroom table. He slowly sets the little birthday cake down, glances toward the empty doorway hopefully, then lowers his eyes to the single candle. His shoulders sink a little. All the extra chairs stay empty. Paper planets remain on the table, stable warm light and blue night window. Quiet readable disappointment, no exaggerated crying, no camera movement.",
 "Close-up of Noor in her teal jacket looking at the old invitation on her phone. Her eyes finish reading; she swallows, her eyebrows soften in recognition and regret. She looks toward the classroom and lowers the phone slightly, choosing to stop recording. The phone and hands remain coherent, no new text. Fixed close shot, subtle expressive acting rather than a camera move.",
 "Noor in the teal jacket and curly-haired Rami in the lavender hoodie sit opposite each other at the arts table. Noor places her phone face down beside her copper bag. They carefully align the edges of a sheet of white paper and fold a new small rocket together, one clear fold with fingertips touching the paper. Rami looks up from the fold and starts to smile; Noor answers his gaze. Stable hands, same faces and clothes. Warm table light, no new people.",
 "At the open classroom window, Noor in her teal jacket holds one small white paper rocket with a blue planet mark. She draws her hand back slightly, then gently tosses the rocket out through the open window. Her fingers release before the rocket travels; it follows one smooth thrown arc away. She watches it leave with hopeful eyes. No powered flight, no fire or smoke, no extra rockets, locked camera, constant warm inside and blue night outside.",
 "A white paper rocket glides through the classroom doorway and lands on the table. Two original teenage friends step into the doorway carrying folded paper planets. Noor in teal and Rami in lavender turn to see them; Rami's face changes from surprise to happiness. Nobody runs, no crowded chaos. Keep the table and single birthday cake stable, readable whole-body arrivals and one clear reaction.",
 "Close-up of curly-haired Rami in his lavender hoodie and the small cake with one lit candle. He closes his eyes to make a wish, leans forward and gently blows. The single candle flame bends away from his breath and goes out, leaving a tiny wisp. Then he opens his eyes and gives a relieved warm smile toward Noor just off camera. Clear face acting, stable cake and candle, locked camera, no new people.",
 "Noor stands in the warm classroom doorway. Her plain midnight-black shadow slides along the floor until it connects naturally with her cream sneakers again. She looks down, then tucks her dark phone into the small copper shoulder bag and smiles to herself. Stable teal jacket and dark bob. Her feet stay planted, no duplicate silhouettes, no camera motion. The candle on the background cake is extinguished and stays unlit.",
 "At the classroom doorway, curly-haired Rami in lavender looks at Noor in teal with a grateful questioning expression. Noor looks back, smiles softly, then gestures down toward her shadow. He follows her eyes and smiles. Subtle natural head and hand acting, no broad lip-sync speech, no new people, same warm school light and calm camera.",
 "Close table-and-wall comic insert. The plain dark shadow of a curly-haired boy on the wall stretches one arm toward a small piece of birthday cake at the table's edge. The hand reaches, touches the slice, lifts the one piece and pulls it away. The silhouette ducks playfully. The solid cake moves only after contact. Keep everything else stable, no extra hands or faces. One clean magical visual gag, locked camera and constant warm lighting."
];
const english=[
 ['Noor was filming a dance.','Then her shadow walked away.'],
 ["'Come back!'",'It pointed down the corridor.','And ran.'],
 ['She chased it.','It slipped under the door.','Leaving her outside.'],
 ['A paper rocket landed in front of her.','A planet. And one candle.'],
 ['Rami was alone.','It was his birthday.','Every chair was empty.'],
 ['His invitation was on her phone.','She meant to reply later.','She forgot.'],
 ['She put away the camera.','And sat across from him.','They folded another rocket.'],
 ["'There is still room.'",'She sent it out the window.'],
 ['One rocket came back.','Then two.','Their friends arrived with paper planets.'],
 ['Rami blew out the candle.','Finally, a real smile.'],
 ['Her shadow returned.','But the video she wanted...','Was never filmed.'],
 ["'You remembered?'","'Someone reminded me.'",'Behind them, another shadow','stole a piece of cake.']
];
mkdirSync(new URL('prompts/',folder),{recursive:true});
const overridesFile=new URL('direction-overrides.json',folder),overrides=existsSync(overridesFile)?JSON.parse(readFileSync(overridesFile,'utf8')):{};
const shots=[];
for(let i=0;i<13;i++){
 const sceneIndex=Math.min(i,11),scene=spec.scenes[sceneIndex],at=i===12?84:scene.at,duration=i===11?84-scene.at:i===12?spec.duration-84:scene.duration,id=String(i).padStart(2,'0');
 const frames=1+4*Math.ceil(((duration+.5)*24-1)/4);
 writeFileSync(new URL('prompts/'+id+'.txt',folder),style+(overrides[id]?.prompt||prompts[i])+'\n');
 shots.push({id,sceneIndex,at,duration,frames,in:.25,image:'assets/'+id+'.png',file:'assets/shots/'+id+'.mp4',promptFile:'story-projects/shadow-went-first/prompts/'+id+'.txt',...overrides[id]});
}
const captionsEn=[];
for(let i=0;i<spec.scenes.length;i++){
 const scene=spec.scenes[i],metadata=JSON.parse(readFileSync(new URL('assets/voice/'+String(i).padStart(2,'0')+'.json',folder),'utf8')),words=metadata.words,first=words[0].start,last=words.at(-1).start+words.at(-1).duration,lines=english[i],total=lines.reduce((n,s)=>n+s.split(' ').length,0);let start=first;
 for(const text of lines){const length=(last-first)*text.split(' ').length/total;captionsEn.push({start:scene.at+start,end:scene.at+start+length,text});start+=length}
}
const director={id:spec.id,title:spec.title,duration:spec.duration,voice:spec.voice,language:'ar',width:1440,height:2560,fps:60,shots,captionsEn,captionsAr:spec.captions,captionTiming:'Arabic uses service word boundaries; English translation clauses aligned within each narrated scene.',conversion:'Generated 24fps sources upscaled to 2K and repeated to 60fps.'};
writeFileSync(new URL('director.json',folder),JSON.stringify(director,null,2)+'\n');
