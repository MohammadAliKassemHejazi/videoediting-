# From a tech clip to a finished Reel

## 1. Understand before decorating

Probe the actual clip and inspect frames across it. Read/listen to the speech using
available tools and compare any supplied transcript. `studio transcribe <id>` runs
Whisper locally in Chromium/WASM; model files download, audio stays local. The output
is an estimate: correct product names and verify important word onsets. A supplied
SRT is not automatically the timing authority. Keep the speaker's meaning intact.

Write `BRIEF.md`: audience, one takeaway, hook, tone, caption language, CTA and
reference observations. Avoid questions whose answers are already established.

## 2. Design a story, not a template

Write `STORYBOARD.md` with time, phrase, evidence, layout, action and sound.
Choose a visual concept specific to the topic: an API request travelling through a
system, a before/after UI, an architecture diagram assembling, or a real benchmark
comparison with its source. The approved style supplies typography/framing; it does
not dictate identical cards for every video.

Use the speaker for conviction and conversational turns; split view for context;
full screen for a dense demonstration, transformation or reveal. Allow the viewer
time to read. Avoid reprinting the spoken caption on a second card. Plan where the
eye goes and how the outgoing motion leads into the next shot. Silence and stillness
can make the next event stronger. Keep effects quiet enough for the voice to lead.

## 3. Ask for the right assets

Use official captures for factual UI, quotes and logos. Use code for text, cards,
numbers, vectors and cursors. Request generated media only when it adds something
those cannot show. Put assets in the project's `assets` array, for example:

```json
{
  "id":"chip", "file":"assets/inbox/chip.mov", "type":"video",
  "purpose":"Reveal the chip as the narrator introduces on-device AI",
  "anchor":"on-device at 12.4s", "at":12.4, "duration":3,
  "aspect":"1:1", "background":"green", "required":true,
  "useInTimeline":true, "x":80, "y":180, "width":920, "height":700,
  "prompt":"A single photorealistic processor lifts from its socket, then settles. Macro studio lighting, charcoal metal, red accent reflection. Locked camera. No logos or text."
}
```

Run `studio assets <id>` to write `ASSET_REQUESTS.md`. It states filenames and copyable
prompts. Request true transparent PNG for still cutouts; alpha video if the generator
supports it. Otherwise request flat #00FF00, no green subject parts or background
shadows, full subject visible, stable framing, silent video and 0.5s handles. Use an
opaque background for full-screen B-roll. Chroma key defaults are adjustable with
`keySimilarity` and `keyBlend`; inspect hair/edges and green spill before delivery.

Supplied files stay in the project. Prepared alpha video uses qtrle MOV in cache;
ordinary H.264 cannot retain alpha. Media audio is excluded so the voice stays clean.
Use a timeline `kind: "asset"` scene when a supplied visual replaces the code deck.
Assets composite before the graphics/captions; do not cover them with an opaque
fullscreen painter. Each asset needs `useInTimeline: true` to enter the film.

## 4. Build and review

`project.json` holds footage/framing/assets. `timeline.js` holds captions, scenes,
fullscreen intervals, punch-ins and cues. `scenes.js` registers original painters:

```js
SceneKit.register('request-flow', (t, scene) => {
  const {box, txt, sp} = SceneKit;
  const progress = sp(t - scene.a);
  box(80, 200, 920, 400, 28, '#171719');
  txt('GET /v1/models', 120 + 40 * (1-progress), 330, 64);
});
```

Expose `window.PROJECT_ASSETS_READY` for asynchronous project image loading. Avoid
timers and accumulating state. `seek(t)` must produce the same pixels out of order.
Current exports target portrait; a new aspect ratio needs a deliberate reframe.

Run `studio draft <id>`. Inspect `contact.png`, `phone.png`, `strip.png`, and the
muxed draft. Check facial framing, hair masks, caption placement, reading time,
motion continuity and onsets against the audio. Fix weaknesses, then record a review
with `studio review`. Source changes invalidate it. No user approval is required for
this internal quality step; user creative approval remains distinct.

## 5. Thumbnail and delivery

Generate an original 9:16 cover with the real speaker as an identity reference.
Use a 2–5-word truthful hook, one visual idea and strong contrast. Ask for key text
and face in the central crop-safe area; inspect the actual result at phone size and
in center-crop previews. App crop behavior can vary: confirm in the upload UI.
Do not fabricate a shocked face, a claim, a benchmark or a testimonial.

Save the selected cover to `project.json → thumbnail.file`. Preserve the prompt and
generation provenance in the project. The terminal renders/validates assets; it does
not itself call Codex's image-generation tool. Codex or the user supplies that image.

`studio final <id>` requires the reviewed draft hash and thumbnail, renders the
60fps MP4, exports captions, copies the cover and checks decoding/voice alignment.
The source voice remains at original gain. Listening and visual judgment are still
needed; numerical correlation is not a subjective sound review.

Deliver `out/<id>/final.mp4`, `thumbnail.png`, and `captions.en.srt`. Keep approved
versions. `studio clean <id>` previews rebuildable files; `--apply` removes only
those files, retaining original media, masks, finals, covers and review evidence.
