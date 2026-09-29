Open out/contact.png, out/strip.png, and out/phone.png and review them carefully.
Act as a strict motion design director.

Score from 1 to 10:
1. Hook strength (first 2 seconds)
2. Readability at phone size (360px wide)
3. Motion quality (spring physics, no dead frames)
4. Visual variety (new development every 2-4 seconds)
5. Composition & layout
6. Brand accuracy
7. Audio-visual synchronization

Identify the 3 most significant visual issues with exact timestamps. Check specifically for:
- Text overlap during container morphs
- Linear movement lacking spring easing
- Corner badges or unwanted borders
- Unintended centered gradients
- Blurry scaled typography
- Static stretches of time
- Noticeable seams when looping

Adjust the source code to resolve these issues, re-render only the affected seconds
(`node render.mjs --from <s> --dur <n> --out out/patch.mp4`), and provide an updated
contact sheet with new scores.
