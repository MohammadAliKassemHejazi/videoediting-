# Asset plan — The Next Tram

All art uses the original Ember/Luma bible. No outside paid assets required.
Portrait 9:16. No alpha or baked captions. Camera and physical motion handles
stay inside the generated shots; no still substitutes for missing footage.

| Filename | Purpose/time | Source size/duration | Motion |
| --- | --- | --- | --- |
| assets/keyframe.png | Departure/contact, 0–4.5s | Original portrait still; generator input | Paw hold → gaze → lower body. |
| assets/hug-keyframe.png | Contact payoff, 4.5–10s | Portrait still; generator input | Hug → kitten eye closure → fox reaction. |
| assets/bench-keyframe.png | Decision, 10–15s | Portrait still; generator input | Sit planted, affectionate lean, tram exits right. |
| assets/shots/contact-turbo.mp4 | Actual opening shot | 448×800/24fps, >=5s | One continuous shot, .25s handles. |
| assets/shots/hug-acting.mp4 | Actual hug shot | 448×800/24fps, >=5.5s | HUG_MOTION.txt, .25s handles. |
| assets/shots/bench-acting.mp4 | Actual ending shot | 448×800/24fps, >=5s | BENCH_MOTION.txt, .25s handles. |
| assets/thumbnail.png | Designed cover | Portrait raster | Separate generated composition with THE NEXT TRAM title. |
| assets/score.wav | Quiet original score and Foley | 48kHz stereo, 15s | Bell/contact/departure cues; score.mjs. |

The full positive animation prompts live in contact-motion.txt, HUG_MOTION.txt
and BENCH_MOTION.txt. Local generator records graph, seed, settings and model source.
All exported drafts target 1440×2560/60fps. Internal source resolution/fps are
recorded honestly; scaling/repeated frames do not create new detail/poses.
