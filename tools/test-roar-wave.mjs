// Run: node tools/test-roar-wave.mjs
import assert from "node:assert/strict";
import * as fx from "../src/fx/blood/roar-wave.js";
import { createFrame, painterFor, resolveOptions } from "../src/core/index.js";
function frame({ time = 0.4, fps = 120, flip = false, ...options } = {}) {
  const sim = fx.create(resolveOptions(fx.meta, options));
  for (let i = 0; i < Math.round(time * fps); i++) sim.update(1 / fps);
  const f = createFrame(220, 110), p = painterFor(f).place(110, 82, flip);
  sim.drawBack(p); sim.draw(p); return f;
}
assert.deepEqual(frame(), frame());
assert.notDeepEqual(frame(), frame({ seed: 42 }));
assert.notDeepEqual(frame(), frame({ palette: ["#123", "#48a", "#cff"] }));
assert.deepEqual(frame({ fps: 30 }), frame({ fps: 120 }));
for (const time of [0.9, 1]) {
  const f = frame({ time });
  assert(f.color.every(c => c === 0) && f.light.every(c => c === 0));
}
const centroid = f => {
  let sum = 0, n = 0;
  f.color.forEach((c, i) => { if (c >>> 24) { sum += i % f.w; n++; } });
  assert(n); return sum / n;
};
assert(Math.abs(centroid(frame()) + centroid(frame({ flip: true })) - 219) < 2);
const signals = [];
frame({ onShake: e => signals.push(e) });
assert.deepEqual(signals, [{ duration: 0.18, amplitude: 2 }]);
frame({ shake: 0, onShake: e => signals.push(e) });
assert.equal(signals.length, 1);
const actor = { head: [0, -48], h: 48 };
const f = frame({ actor });
assert(f.color.some(c => c >>> 24));
// Bounds remain clear even for the full-sized hero and outer ring.
for (const time of [0.3, 0.5, 0.7]) {
  const f = frame({ actor, time });
  for (let x = 0; x < f.w; x++) assert.equal(f.color[x], 0);
  for (let y = 0; y < f.h; y++) {
    assert.equal(f.color[y * f.w], 0);
    assert.equal(f.color[y * f.w + f.w - 1], 0);
  }
}
console.log("Roar wave: seed, palette, mirror, rate independence, empty endpoint, 48px bounds and optional shake pass.");
