// Overlay timeline for one TikTok. Copy this file per video (e.g. overlays/gym_day.js)
// and change the times (seconds) and text to match your CapCut edit.
//
// Preview over your clip:  open overlay.html?timeline=overlays/example.js&bg=clips/my_clip.mp4&safe=1
// Render + burn in:        npm run tiktok -- clips/my_clip.mp4 --timeline overlays/example.js
//
// Positions: pos 'top' | 'center' | 'bottom', or x/y as fractions of the frame (0..1).
// Every element takes: type, t (start), dur (how long it stays), optional sfx ('pop'|'click'|'whoosh'|'thump'|false).
window.OVERLAY = {
  theme: {
    font: 'Inter',
    accent: '#FFD60A',   // your brand colour
    fg: '#FFFFFF',
    ink: '#111111'
  },
  elements: [
    // Hook: first 2-3 seconds decide if people keep watching.
    { type: 'hook', t: 0.1, dur: 2.6, text: 'I tried this for 30 days and', accent: ['30', 'DAYS'], pos: 'center' },
    { type: 'flash', t: 2.75, dur: 0.18 },

    { type: 'progress', t: 0 },            // runs for the whole video

    { type: 'title', t: 3.2, dur: 3, text: 'Mohammad', sub: 'Day 1 · 6:00 AM' },
    { type: 'caption', t: 6.5, dur: 2.5, text: 'Nobody told me THIS part', style: 'box', pos: 'top' },
    { type: 'sticker', t: 7, dur: 2, text: '😳', x: 0.78, y: 0.28 },

    { type: 'circle', t: 10, dur: 2.2, x: 0.5, y: 0.5, r: 0.16 },
    { type: 'arrow', t: 10.2, dur: 2, from: [0.2, 0.3], to: [0.38, 0.44] },

    { type: 'counter', t: 14, dur: 3, from: 0, to: 12500, suffix: ' views', label: 'in 24 hours', pos: 'center' },
    { type: 'caption', t: 18, dur: 3, text: 'Wait for the ending', style: 'accent', pos: 'bottom' },
    { type: 'sticker', t: 18.3, dur: 2.5, text: '👀', x: 0.8, y: 0.58 },

    { type: 'cta', t: 26, dur: 4, text: 'Follow for part 2' }
  ]
};
