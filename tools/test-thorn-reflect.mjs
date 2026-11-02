// Run: node tools/test-thorn-reflect.mjs
import assert from "node:assert/strict";
import * as fx from "../src/fx/blood/thorn-reflect.js";
import { createFrame, painterFor, resolveOptions } from "../src/core/index.js";
function frame({ time = 0.15, fps = 120, flip = false, ...options } = {}) {
  const sim = fx.create(resolveOptions(fx.meta, options));
  for (let i = 0; i < Math.round(time * fps); i++) sim.update(1 / fps);
  const f = createFrame(64, 64), p = painterFor(f).place(32, 32, flip);
  sim.draw(p); return f;
}
assert.deepEqual(frame(), frame());
assert.notDeepEqual(frame(), frame({ seed: 42 }));
assert.notDeepEqual(frame(), frame({ palette: ["#123", "#48a", "#cff"] }));
assert.deepEqual(frame({ time: 0.2, fps: 30 }), frame({ time: 0.2, fps: 120 }));
for (const time of [0.4, 0.5]) {
  const f = frame({ time });
  assert(f.color.every(c => c === 0) && f.light.every(c => c === 0));
}
const centroid = f => {
  let sum = 0, n = 0;
  f.color.forEach((c, i) => { if (c >>> 24) { sum += i % f.w; n++; } });
  assert(n); return sum / n;
};
assert(centroid(frame()) > 36, "shards travel right");
assert(Math.abs(centroid(frame()) + centroid(frame({ flip: true })) - 63) < 2);
for (let seed = 1; seed <= 20; seed++) {
  // Count shard polygons after the flash: one body and one facet per shard.
  let polys = 0;
  const sim = fx.create(resolveOptions(fx.meta, { seed }));
  sim.update(0.12);
  const spy = new Proxy({}, { get: (_, key) => key === "poly" ? () => polys++ : () => {} });
  sim.draw(spy);
  assert(polys / 2 >= 5 && polys / 2 <= 7);
  for (const time of [0.1, 0.2, 0.3]) {
    const f = frame({ seed, time });
    for (let x = 0; x < 64; x++) { assert.equal(f.color[x], 0); assert.equal(f.color[63 * 64 + x], 0); }
    for (let y = 0; y < 64; y++) { assert.equal(f.color[y * 64], 0); assert.equal(f.color[y * 64 + 63], 0); }
  }
}
console.log("Thorn reflect: 5–7 shards, seed, palette, direction, mirror, rates, bounds and empty endpoint pass.");
