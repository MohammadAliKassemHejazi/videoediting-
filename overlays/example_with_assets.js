// Timeline using generated media from assets/ready/ (see assets/manifest.example.json + GUIDE.md Part 5).
// Run `npm run assets` first so the files exist.
window.OVERLAY = {
  elements: [
    { type: 'image', src: 'assets/ready/gym_bg_sunrise.png', t: 0, dur: 3, w: 1, x: 0.5, y: 0.5, anim: 'kenburns', sfx: false },
    { type: 'hook', t: 0.2, dur: 2.6, text: 'Day one at 6 AM', accent: ['6', 'AM'] },
    { type: 'voice', src: 'assets/ready/gym_intro_voice.wav', t: 0.5 },
    { type: 'broll', src: 'assets/ready/gym_broll_city.mp4', t: 3, dur: 3, mode: 'full' },
    { type: 'broll', src: 'assets/ready/gym_broll_city.mp4', t: 7, dur: 3, mode: 'pip', x: 0.5, y: 0.3, w: 0.6 },
    { type: 'image', src: 'assets/ready/gym_fire_sticker.png', t: 7.5, dur: 2.5, x: 0.72, y: 0.6, w: 0.35 },
    { type: 'progress', t: 0 }
  ]
};
