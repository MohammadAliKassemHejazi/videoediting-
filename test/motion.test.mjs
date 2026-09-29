import test from 'node:test';
import assert from 'node:assert/strict';
await import('../lib/motion.js');
const { spring, track, rng, indicator, beatIndex } = globalThis.Motion;

test('spring starts at 0 and settles at 1 for all damping regimes', () => {
  for (const [k, d] of [[170, 26], [240, 14], [100, 20], [100, 40]]) {
    assert.equal(spring(0, k, d), 0);
    assert.ok(Math.abs(spring(5, k, d) - 1) < 1e-3, `k=${k} d=${d}`);
  }
});

test('track superposes springs toward the last key', () => {
  const keys = [[0, 10], [1, 50], [2, -20]];
  assert.equal(track(0, keys), 10);
  assert.ok(Math.abs(track(10, keys) - -20) < 1e-6);
});

test('rng is deterministic per seed', () => {
  const a = rng(42), b = rng(42);
  for (let i = 0; i < 100; i++) assert.equal(a(), b());
});

test('indicator edges stay ordered', () => {
  const { left, right } = indicator(0.5, [[0, 0], [0.3, 400]]);
  assert.ok(right > left);
});

test('beatIndex finds the last beat at or before t', () => {
  assert.equal(beatIndex(1.2, [0, 0.5, 1, 1.5]), 2);
  assert.equal(beatIndex(-1, [0, 0.5]), -1);
});
