// Run: node tools/test-freeze-slam.mjs
import assert from "node:assert/strict";
import * as fx from "../src/fx/ice/freeze-slam.js";
import { createFrame, painterFor, resolveOptions } from "../src/core/index.js";
function frame({ time = 0.5, fps = 120, flip = false, ...options } = {}) {
  const sim = fx.create(resolveOptions(fx.meta, options));
  for (let i = 0; i < Math.round(time * fps); i++) sim.update(1 / fps);
  const f = createFrame(200, 120), p = painterFor(f).place(100, 91, flip);
  sim.drawBack(p); sim.draw(p); return f;
}
assert.deepEqual(frame(), frame());
assert.notDeepEqual(frame(), frame({ seed: 42 }));
assert.notDeepEqual(frame(), frame({ palette: ["#321", "#a84", "#ffc"] }));
assert.deepEqual(frame({ time: 0.4, fps: 30 }), frame({ time: 0.4, fps: 120 }));
for (const time of [1.6, 1.7]) {
  const f = frame({ time });
  assert(f.color.every(c => c === 0) && f.light.every(c => c === 0));
}
const centroid = f => {
  let sum = 0, n = 0;
  f.color.forEach((c, i) => { if (c >>> 24) { sum += i % f.w; n++; } });
  assert(n); return sum / n;
};
assert(Math.abs(centroid(frame()) + centroid(frame({ flip: true })) - 199) < 2);
for (const time of [0.2, 0.5, 0.85, 1.1, 1.4]) {
  const f = frame({ time });
  for (let x = 0; x < f.w; x++) { assert.equal(f.color[x], 0); assert.equal(f.color[(f.h - 1) * f.w + x], 0); }
  for (let y = 0; y < f.h; y++) { assert.equal(f.color[y * f.w], 0); assert.equal(f.color[y * f.w + f.w - 1], 0); }
}
assert.notDeepEqual(frame({ time: 0.5 }), frame({ time: 1.1 }), "standing crown breaks apart");
console.log("Freeze slam: seed, palette, mirror, frame rates, bounds, shatter and empty endpoint pass.");
