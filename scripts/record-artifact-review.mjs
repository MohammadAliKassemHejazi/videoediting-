// Run only after inspecting the contact sheet and phone strips.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {artifactHash} from '../lib/artifact-review.mjs';
const audit=JSON.parse(readFileSync('out/artifact-audit.json','utf8')),render=JSON.parse(readFileSync('out/developer_artifacts_v4_draft_render.json','utf8'));
assert.equal(audit.sourceHash,artifactHash());assert.equal(render.sourceHash,artifactHash(),'Draft differs from current film');assert.deepEqual(audit.failures,[]);
const record={sourceHash:artifactHash(),approvedForRender:true,reviewedFiles:['out/contact.png','out/developer_artifacts_v4_draft_phone.png','out/developer_artifacts_v4_draft_native_phone.png','out/developer_artifacts_v4_draft_routes_phone.png'],
 scores:{hook:8,phoneReadability:8,motionDesign:8,visualVariety:9,composition:8,technicalArtifacts:9,speechTimingChecks:9},
 corrections:['Removed all generic headline cards and landing-page thumbnails.','Enlarged active CSS rules in an animated code inspection view.','Preserved utility tokens and narrow-preview aspect ratio.'],
 audioReview:'Word-onset and decoded-waveform checks; no independent listening audit.',
 scope:'Production render approval by agent after visual review; user creative/style approval remains pending.'};
writeFileSync('out/artifact-review.json',JSON.stringify(record,null,2));console.log('Current-source contact-sheet review recorded.');
