// Run: node tools/test-vampire-awaken.mjs
import assert from "node:assert/strict";
import * as fx from "../src/fx/shadow/vampire-awaken.js";
import { createFrame, painterFor, resolveOptions } from "../src/core/index.js";
function frame({ time = 0.5, fps = 120, flip = false, ...options } = {}) {
  const sim = fx.create(resolveOptions(fx.meta, options));
  for (let i = 0; i < Math.round(time * fps); i++) sim.update(1 / fps);
  const f = createFrame(200, 160), p = painterFor(f).place(100, 130, flip);
  sim.drawBack(p); sim.draw(p); return f;
}
assert.deepEqual(frame(), frame());
assert.notDeepEqual(frame(), frame({ seed: 42 }));
assert.notDeepEqual(frame(), frame({ palette: ["#123", "#48a", "#cff"] }));
assert.notDeepEqual(frame({ time: 0.5, bats: 30 }), frame({ time: 0.5, bats: 90 }));
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
for (let seed = 1; seed <= 10; seed++) {
  let wings = 0;
  const sim = fx.create(resolveOptions(fx.meta, { seed })); sim.update(0.5);
  const p = new Proxy({}, { get: (_, key) => key === "poly" ? () => wings++ : () => {} });
  sim.drawBack(p); sim.draw(p);
  assert(wings / 2 >= 45 && wings / 2 <= fx.meta.options.bats, "overlapping waves of the configured 90-bat swarm");
  for (const time of [0.2, 0.5, 0.9, 1.2]) {
    const f = frame({ seed, time });
    for (let x = 0; x < 200; x++) { assert.equal(f.color[x], 0); assert.equal(f.color[159 * 200 + x], 0); }
    for (let y = 0; y < 160; y++) { assert.equal(f.color[y * 200], 0); assert.equal(f.color[y * 200 + 199], 0); }
  }
}
console.log("Vampire awaken: flock count, seed, palette, mirror, rates, bounds and empty endpoint pass.");
