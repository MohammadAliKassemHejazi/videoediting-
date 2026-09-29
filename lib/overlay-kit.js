// TikTok / Reels / Shorts overlay components. Pure functions of time, drawn on a
// transparent canvas that is composited over your own footage.
//
// A timeline is a plain object (see overlays/example.js):
//   { theme: {...}, elements: [ { type: 'hook', t: 0, dur: 3, text: '...' }, ... ] }
// Positions are fractions of the frame (x, y in 0..1) so any resolution works.
// Loaded as a classic script (browser) and via `vm` in Node (for SFX cue generation).
(function (root) {
  const M = root.Motion;

  const DEFAULT_THEME = {
    font: 'Inter',
    fg: '#FFFFFF',
    accent: '#FFD60A',
    ink: '#111111',      // text colour on accent boxes
    stroke: '#000000',   // outline that keeps white text readable on any footage
    box: 'rgba(17,17,17,0.82)'
  };

  // TikTok UI safe zone for 9:16 (top tabs, right-hand buttons, bottom caption/music bar).
  const SAFE = { top: 0.09, bottom: 0.24, left: 0.06, right: 0.14 };
  const POS = { top: 0.2, center: 0.44, bottom: 0.66 };

  // Seconds after an element's end during which its exit animation plays.
  const EXIT = 0.35;

  // ---------- helpers ----------
  const sp = (t, k, d) => M.spring(t, k, d);
  const snappy = (t) => sp(t, 320, 30);
  const pop = (t) => sp(t, 240, 16);   // tiny overshoot
  const heavy = (t) => sp(t, 90, 19);

  function yOf(el, H) {
    if (typeof el.y === 'number') return el.y * H;
    return (POS[el.pos || 'center'] ?? POS.center) * H;
  }

  function wrap(g, words, maxW) {
    const lines = [[]];
    for (const w of words) {
      const line = lines[lines.length - 1];
      const test = [...line.map((x) => x.text), w.text].join(' ');
      if (line.length && g.measureText(test).width > maxW) lines.push([w]);
      else line.push(w);
    }
    return lines;
  }

  function outlinedText(g, text, x, y, th, U, fill) {
    g.lineJoin = 'round';
    g.miterLimit = 2;
    g.strokeStyle = th.stroke;
    g.lineWidth = 14 * U;
    g.strokeText(text, x, y);
    g.fillStyle = fill || th.fg;
    g.fillText(text, x, y);
  }

  function roundRect(g, x, y, w, h, r) {
    g.beginPath();
    g.roundRect(x, y, w, h, Math.min(r, h / 2, w / 2));
  }

  // Enter/exit envelope: `inn` springs 0→1 at start, `out` springs 0→1 at the end.
  function env(local, dur) {
    return { inn: snappy(local), out: snappy(local - dur) };
  }

  // ---------- components ----------
  const C = {};

  // Big kinetic hook: words slam in one by one; `accent` words get a highlight box.
  C.hook = (g, el, local, ctx) => {
    const { W, H, U, th } = ctx;
    const size = (el.size || 118) * U;
    g.font = `900 ${size}px ${th.font}`;
    g.textBaseline = 'alphabetic';
    const accent = new Set((el.accent || []).map((w) => w.toUpperCase()));
    const words = String(el.text).split(/\s+/).map((text, i) => ({ text, i }));
    const maxW = W * (1 - SAFE.left - SAFE.right);
    const lines = wrap(g, words, maxW);
    const lh = size * 1.12;
    const y0 = yOf(el, H) - ((lines.length - 1) * lh) / 2;
    const stagger = el.stagger ?? 0.11;
    const { out } = env(local, el.dur);
    lines.forEach((line, li) => {
      const lineW = g.measureText(line.map((w) => w.text).join(' ')).width;
      let x = (W - lineW) / 2 + (W * (SAFE.left - SAFE.right)) / 2;
      for (const w of line) {
        const ww = g.measureText(w.text).width;
        const s = pop(local - w.i * stagger);
        if (s > 0.001) {
          const o = out;
          const cx = x + ww / 2, cy = y0 + li * lh - size * 0.35;
          const scale = (1.8 - 0.8 * s) * (1 - o);
          const rot = (1 - s) * (w.i % 2 ? 0.12 : -0.12);
          g.save();
          g.translate(cx, cy + o * 120 * U);
          g.rotate(rot);
          g.scale(scale, scale);
          g.globalAlpha = Math.min(1, s * 3) * (1 - o);
          const isAccent = accent.has(w.text.replace(/[^\p{L}\p{N}']/gu, '').toUpperCase());
          if (isAccent) {
            g.fillStyle = th.accent;
            roundRect(g, -ww / 2 - 16 * U, -size * 0.62, ww + 32 * U, size * 1.02, 18 * U);
            g.fill();
            g.fillStyle = th.ink;
            g.fillText(w.text, -ww / 2, size * 0.35);
          } else {
            outlinedText(g, w.text, -ww / 2, size * 0.35, th, U);
          }
          g.restore();
        }
        x += ww + g.measureText(' ').width;
      }
    });
  };

  // Caption / text pop. style: 'box' (dark pill) | 'outline' | 'accent'
  C.caption = (g, el, local, ctx) => {
    const { W, H, U, th } = ctx;
    const size = (el.size || 64) * U;
    g.font = `800 ${size}px ${th.font}`;
    g.textBaseline = 'middle';
    const words = String(el.text).split(/\s+/).map((text, i) => ({ text, i }));
    const lines = wrap(g, words, W * (1 - SAFE.left - SAFE.right) - 60 * U).map((l) => l.map((w) => w.text).join(' '));
    const lh = size * 1.25;
    const cx = (typeof el.x === 'number' ? el.x : 0.5 - (SAFE.right - SAFE.left) / 2) * W;
    const cy = yOf(el, H);
    const { inn, out } = env(local, el.dur);
    const s = pop(local) * (1 - out);
    if (s <= 0.001) return;
    const style = el.style || 'box';
    const bw = Math.max(...lines.map((l) => g.measureText(l).width)) + 56 * U;
    const bh = lines.length * lh + 30 * U;
    g.save();
    g.translate(cx, cy + (1 - inn) * 40 * U);
    g.scale(s, s);
    if (style !== 'outline') {
      g.fillStyle = style === 'accent' ? th.accent : th.box;
      roundRect(g, -bw / 2, -bh / 2, bw, bh, 26 * U);
      g.fill();
    }
    g.textAlign = 'center';
    lines.forEach((l, i) => {
      const y = -((lines.length - 1) * lh) / 2 + i * lh;
      if (style === 'outline') outlinedText(g, l, 0, y, th, U);
      else { g.fillStyle = style === 'accent' ? th.ink : th.fg; g.fillText(l, 0, y); }
    });
    g.restore();
  };

  // Lower-third name tag: accent bar wipes in, then the text slides out from it.
  C.title = (g, el, local, ctx) => {
    const { W, H, U, th } = ctx;
    const { out } = env(local, el.dur);
    const bar = snappy(local) * (1 - out);
    const txt = snappy(local - 0.12) * (1 - snappy(local - el.dur + 0.1));
    const x = SAFE.left * W, y = (typeof el.y === 'number' ? el.y : 0.7) * H;
    const size = (el.size || 58) * U;
    g.font = `800 ${size}px ${th.font}`;
    const subSize = size * 0.55;
    const tw = Math.max(g.measureText(el.text).width, (g.font = `600 ${subSize}px ${th.font}`, g.measureText(el.sub || '').width));
    g.save();
    g.fillStyle = th.accent;
    g.fillRect(x, y - size * 0.9, 12 * U, (size + (el.sub ? subSize * 1.3 : 0)) * bar);
    g.beginPath();
    g.rect(x + 12 * U, y - size * 1.2, (tw + 60 * U) * txt, size * 2.4 + subSize);
    g.clip();
    g.textBaseline = 'alphabetic';
    const dx = x + 36 * U - (1 - txt) * 80 * U;
    g.font = `800 ${size}px ${th.font}`;
    outlinedText(g, el.text, dx, y, th, U * 0.7);
    if (el.sub) { g.font = `600 ${subSize}px ${th.font}`; outlinedText(g, el.sub, dx, y + subSize * 1.3, th, U * 0.5, th.accent); }
    g.restore();
  };

  // Emoji / sticker pop with a playful wobble.
  C.sticker = (g, el, local, ctx) => {
    const { W, H, U } = ctx;
    const { out } = env(local, el.dur);
    const s = pop(local) * (1 - out);
    if (s <= 0.001) return;
    const size = (el.size || 160) * U;
    const wob = Math.sin(local * 6) * 0.08 * Math.exp(-local * 0.8) + (el.rotate || 0) * Math.PI / 180;
    g.save();
    g.translate((el.x ?? 0.75) * W, (el.y ?? 0.3) * H);
    g.rotate(wob + (1 - s) * -0.6);
    g.scale(s, s);
    g.font = `${size}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(el.text || '🔥', 0, 0);
    g.restore();
  };

  // Highlight circle that draws itself around something in your footage.
  C.circle = (g, el, local, ctx) => {
    const { W, H, U, th } = ctx;
    const draw = sp(local, 120, 22);
    const { out } = env(local, el.dur);
    if (draw <= 0.001 || out >= 0.999) return;
    const r = (el.r || 0.12) * W;
    const rng = M.rng(el.seed || 7);
    g.save();
    g.globalAlpha = 1 - out;
    g.translate((el.x ?? 0.5) * W, (el.y ?? 0.5) * H);
    g.rotate(-0.5);
    g.strokeStyle = el.color || th.accent;
    g.lineWidth = (el.width || 12) * U;
    g.lineCap = 'round';
    g.beginPath();
    const steps = 60, sweep = Math.PI * 2.15 * draw;
    for (let i = 0; i <= steps; i++) {
      const a = (i / steps) * sweep;
      const rr = r * (1 + (rng() - 0.5) * 0.03 + 0.04 * Math.sin(a * 1.5));
      const px = Math.cos(a) * rr * 1.12, py = Math.sin(a) * rr;
      i ? g.lineTo(px, py) : g.moveTo(px, py);
    }
    g.stroke();
    g.restore();
  };

  // Arrow that draws from → to, then the head pops.
  C.arrow = (g, el, local, ctx) => {
    const { W, H, U, th } = ctx;
    const [x1, y1] = el.from || [0.3, 0.3], [x2, y2] = el.to || [0.5, 0.5];
    const d = sp(local, 200, 26);
    const { out } = env(local, el.dur);
    if (d <= 0.001 || out >= 0.999) return;
    const ax = x1 * W, ay = y1 * H, bx = ax + (x2 * W - ax) * d, by = ay + (y2 * H - ay) * d;
    const mx = (ax + bx) / 2 - (by - ay) * 0.15, my = (ay + by) / 2 + (bx - ax) * 0.15;
    g.save();
    g.globalAlpha = 1 - out;
    g.strokeStyle = el.color || th.accent;
    g.lineWidth = (el.width || 12) * U;
    g.lineCap = 'round';
    g.beginPath(); g.moveTo(ax, ay); g.quadraticCurveTo(mx, my, bx, by); g.stroke();
    const head = pop(local - 0.25);
    const ang = Math.atan2(by - my, bx - mx), L = 46 * U * head;
    g.beginPath();
    g.moveTo(bx - Math.cos(ang - 0.5) * L, by - Math.sin(ang - 0.5) * L);
    g.lineTo(bx, by);
    g.lineTo(bx - Math.cos(ang + 0.5) * L, by - Math.sin(ang + 0.5) * L);
    g.stroke();
    g.restore();
  };

  // Rolling number, e.g. { from: 0, to: 10000, prefix: '$', suffix: '/mo' }.
  C.counter = (g, el, local, ctx) => {
    const { W, H, U, th } = ctx;
    const { out } = env(local, el.dur);
    const s = pop(local) * (1 - out);
    if (s <= 0.001) return;
    const v = (el.from || 0) + ((el.to ?? 100) - (el.from || 0)) * heavy(local - 0.1);
    const txt = (el.prefix || '') + Math.round(v).toLocaleString('en-US') + (el.suffix || '');
    const size = (el.size || 150) * U;
    g.save();
    g.translate((0.5 - (SAFE.right - SAFE.left) / 2) * W, yOf(el, H));
    g.scale(s, s);
    g.font = `900 ${size}px ${th.font}`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    outlinedText(g, txt, 0, 0, th, U, th.accent);
    if (el.label) {
      g.font = `700 ${size * 0.3}px ${th.font}`;
      outlinedText(g, el.label, 0, size * 0.72, th, U * 0.6);
    }
    g.restore();
  };

  // Call to action pill that pulses, e.g. "Follow for part 2".
  C.cta = (g, el, local, ctx) => {
    const { W, H, U, th } = ctx;
    const { out } = env(local, el.dur);
    const s = pop(local) * (1 - out);
    if (s <= 0.001) return;
    const pulse = 1 + 0.06 * Math.max(0, Math.sin(local * Math.PI * 2 * (el.bps || 2))) * Math.min(1, local);
    const size = (el.size || 60) * U;
    g.font = `800 ${size}px ${th.font}`;
    const tw = g.measureText(el.text || 'Follow for more').width;
    g.save();
    g.translate((0.5 - (SAFE.right - SAFE.left) / 2) * W, yOf({ pos: 'bottom', ...el }, H));
    g.scale(s * pulse, s * pulse);
    g.fillStyle = th.accent;
    roundRect(g, -tw / 2 - 50 * U, -size * 0.95, tw + 100 * U, size * 1.9, 999);
    g.fill();
    g.fillStyle = th.ink;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(el.text || 'Follow for more', 0, 0);
    g.restore();
  };

  // Progress bar along the top edge for the whole video (retention trick).
  C.progress = (g, el, local, ctx) => {
    const { W, H, U, th } = ctx;
    const p = Math.min(1, Math.max(0, local / el.dur));
    g.fillStyle = 'rgba(255,255,255,0.25)';
    g.fillRect(0, (el.y ?? 0.004) * H, W, (el.height || 10) * U);
    g.fillStyle = el.color || th.accent;
    g.fillRect(0, (el.y ?? 0.004) * H, W * p, (el.height || 10) * U);
  };

  // White flash for cuts / beat hits.
  C.flash = (g, el, local, ctx) => {
    const a = Math.max(0, 1 - local / (el.dur || 0.18));
    if (a <= 0) return;
    g.fillStyle = el.color || '#FFFFFF';
    g.globalAlpha = a * (el.strength ?? 0.8);
    g.fillRect(0, 0, ctx.W, ctx.H);
    g.globalAlpha = 1;
  };

  // Image from assets/ (e.g. a Gemini sticker made transparent by `npm run assets`).
  //   { type: 'image', src: 'assets/ready/gym_fire_sticker.png', x: 0.7, y: 0.3, w: 0.35,
  //     anim: 'pop' | 'slide' | 'kenburns', t, dur }
  // anim 'kenburns' + w: 1 makes a slow-zoom full-screen background.
  const IMAGES = {};
  function preload(tl) {
    const srcs = [...new Set(tl.elements.filter((e) => e.type === 'image' && e.src).map((e) => e.src))];
    return Promise.all(srcs.map((src) => new Promise((res) => {
      const img = new Image();
      img.onload = () => { IMAGES[src] = img; res(); };
      img.onerror = () => { console.error('Image not found: ' + src); res(); };
      img.src = src;
    })));
  }
  C.image = (g, el, local, ctx) => {
    const { W, H } = ctx;
    const img = IMAGES[el.src];
    if (!img) return;
    const { inn, out } = env(local, el.dur);
    const anim = el.anim || 'pop';
    const w = (el.w ?? 0.4) * W, h = w * (img.naturalHeight / img.naturalWidth);
    let x = (el.x ?? 0.5) * W, y = (el.y ?? 0.5) * H, s = 1, rot = (el.rotate || 0) * Math.PI / 180;
    g.globalAlpha = el.opacity ?? 1;
    if (anim === 'pop') {
      s = pop(local) * (1 - out);
      rot += (1 - pop(local)) * -0.4 + Math.sin(local * 5) * 0.04 * Math.exp(-local);
    } else if (anim === 'slide') {
      x += (1 - inn) * W * (el.from === 'left' ? -1 : 1) + out * W * (el.from === 'left' ? 1 : -1);
    } else if (anim === 'kenburns') {
      s = 1.0 + 0.08 * (local / el.dur);
      g.globalAlpha *= Math.min(1, local * 5) * (1 - out);
    }
    if (s <= 0.001) return;
    g.translate(x, y);
    g.rotate(rot);
    g.scale(s, s);
    g.drawImage(img, -w / 2, -h / 2, w, h);
  };

  // ---------- timeline ----------
  const KEEP = { progress: 0, flash: 0 }; // no exit tail

  function durationOf(tl) {
    if (tl.duration) return tl.duration;
    return Math.max(1, ...tl.elements.filter((e) => e.dur).map((e) => e.t + e.dur + EXIT));
  }

  function drawTimeline(g, tl, t, W, H) {
    const th = { ...DEFAULT_THEME, ...(tl.theme || {}) };
    th.font = /["',]/.test(th.font) ? th.font : `"${th.font}", Inter, Arial, sans-serif`;
    const ctx = { W, H, U: W / 1080, th };
    g.clearRect(0, 0, W, H);
    for (const el of tl.elements) {
      const f = C[el.type];
      if (!f) continue;
      const local = t - el.t;
      const tail = el.type in KEEP ? 0 : EXIT;
      const dur = el.dur ?? (el.type === 'progress' ? durationOf(tl) : 2);
      if (local < 0 || local > dur + tail) continue;
      g.save();
      f(g, { ...el, dur: el.dur ?? (el.type === 'progress' ? durationOf(tl) : 2) }, local, ctx);
      g.restore();
    }
  }

  // Sound cues derived from the timeline (override per element with sfx: 'click' | false).
  const DEFAULT_SFX = { image: 'pop', broll: 'whoosh', voice: false, hook: 'whoosh', caption: 'pop', title: 'whoosh', sticker: 'pop', circle: 'click', arrow: 'click', counter: 'thump', cta: 'pop', flash: 'thump' };
  function cuesFor(tl) {
    const cues = [];
    for (const el of tl.elements) {
      const type = el.sfx === undefined ? DEFAULT_SFX[el.type] : el.sfx;
      if (!type) continue;
      cues.push({ t: Math.max(0, el.t), type, gain: el.gain ?? 0.8 });
      if (el.type === 'hook') {
        String(el.text).split(/\s+/).forEach((w, i) => cues.push({ t: el.t + i * (el.stagger ?? 0.11), type: 'click', gain: 0.35 }));
        cues.push({ t: el.t, type: 'thump', gain: 0.7 });
      }
    }
    return cues.sort((a, b) => a.t - b.t);
  }

  root.OverlayKit = { components: C, drawTimeline, durationOf, cuesFor, preload, SAFE, DEFAULT_THEME };
})(typeof globalThis !== 'undefined' ? globalThis : this);
