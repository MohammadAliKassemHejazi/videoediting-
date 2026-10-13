import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {storyState} from '../lib/story-painters.js';
import {STYLES,styleById} from '../lib/style-auditions.js';
const spec=JSON.parse(readFileSync(new URL('../story-projects/pip-last-light/timed.json',import.meta.url)));
test('story state survives reverse seeking without carrying bridge or light state',()=>{
 const initial=storyState(5,spec);storyState(spec.duration-1,spec);assert.deepEqual(storyState(5,spec),initial);
 const resolve=storyState(spec.scenes.at(-1).at+1,spec);assert.equal(resolve.bridge,1);assert.equal(resolve.light,1);
 assert.equal(storyState(5,spec).bridge,0);assert.equal(storyState(5,spec).light,0);
});
test('related characters retain stable IDs and identity in the timed story',()=>{
 const bible=JSON.parse(readFileSync(new URL('../series/lantern-valley/bible.json',import.meta.url)));
 assert.deepEqual(spec.bible.characters,bible.characters);assert.equal(new Set(bible.characters.map(c=>c.id)).size,bible.characters.length);
});
test('audition candidates have unique selectable IDs and unknown choices fail',()=>{
 assert.equal(new Set(STYLES.map(s=>s.id)).size,STYLES.length);assert.throws(()=>styleById('../bad'));
});
