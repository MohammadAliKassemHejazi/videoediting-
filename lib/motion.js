// Deterministic motion primitives. Pure functions of time — safe for random-access seek(t).
// Loaded as a classic script (works over file://) and exposes `globalThis.Motion`;
// also usable from Node via `require`/`import` for tests.
(function (root) {
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const lerp = (a, b, u) => a + (b - a) * u;

  // Closed-form damped spring, 0 → 1. k = stiffness, d = damping (unit mass).
  function spring(t, k = 170, d = 26) {
    if (t <= 0) return 0;
    const w0 = Math.sqrt(k);
    const z = d / (2 * w0);
    if (z < 1) {
      const wd = w0 * Math.sqrt(1 - z * z);
      return 1 - Math.exp(-z * w0 * t) * (Math.cos(wd * t) + (z * w0 / wd) * Math.sin(wd * t));
    }
    if (z === 1) return 1 - Math.exp(-w0 * t) * (1 + w0 * t);
    // Overdamped: two real roots.
    const s = w0 * Math.sqrt(z * z - 1);
    const r1 = -z * w0 + s, r2 = -z * w0 - s;
    return 1 - (r2 * Math.exp(r1 * t) - r1 * Math.exp(r2 * t)) / (r2 - r1);
  }

  // Linear superposition of springs: keys = [[time, value], ...] sorted by time.
  function track(t, keys, k = 170, d = 26) {
    let v = keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      v += (keys[i][1] - keys[i - 1][1]) * spring(t - keys[i][0], k, d);
    }
    return v;
  }

  // Tab indicator whose edges ride different springs so it stretches in motion.
  function indicator(t, stops, width = 120) {
    const lead = track(t, stops, 320, 30);
    const trail = track(t, stops, 140, 22);
    return { left: Math.min(lead, trail), right: Math.max(lead, trail) + width };
  }

  // mulberry32 seeded PRNG.
  function rng(seed) {
    return () => {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  const PRESETS = {
    snappy:  { k: 320, d: 30 }, // buttons, toggles, leading edges
    canvas:  { k: 170, d: 26 }, // cards, containers, camera pans
    heavy:   { k: 90,  d: 19 }, // large headlines, 3D assets
    playful: { k: 240, d: 14 }  // mascots, badges, stickers
  };

  // Index of the most recent beat at or before t (beats = sorted seconds).
  function beatIndex(t, beats) {
    let lo = 0, hi = beats.length - 1, ans = -1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (beats[mid] <= t) { ans = mid; lo = mid + 1; } else hi = mid - 1;
    }
    return ans;
  }

  const Motion = { clamp, lerp, spring, track, indicator, rng, PRESETS, beatIndex };
  if (typeof module === 'object' && module.exports) module.exports = Motion;
  root.Motion = Motion;
})(typeof globalThis !== 'undefined' ? globalThis : this);
