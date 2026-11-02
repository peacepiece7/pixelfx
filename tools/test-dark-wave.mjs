// Run: node tools/test-dark-wave.mjs
import assert from "node:assert/strict";
import * as fx from "../src/fx/shadow/dark-wave.js";
import { createFrame, painterFor, resolveOptions } from "../src/core/index.js";
function frame({ time = 0.4, fps = 120, flip = false, layer, ...options } = {}) {
  const sim = fx.create(resolveOptions(fx.meta, options));
  for (let i = 0; i < Math.round(time * fps); i++) sim.update(1 / fps);
  const f = createFrame(260, 130), p = painterFor(f).place(130, 96, flip);
  if (layer !== "front") sim.drawBack(p);
  if (layer !== "back") sim.draw(p);
  return f;
}
assert.deepEqual(frame(), frame());
assert.notDeepEqual(frame(), frame({ seed: 42 }));
assert.notDeepEqual(frame(), frame({ palette: ["#321", "#a84", "#ffc"] }));
assert.deepEqual(frame({ fps: 30 }), frame({ fps: 120 }));
for (const time of [1, 1.1]) {
  const f = frame({ time });
  assert(f.color.every(c => c === 0) && f.light.every(c => c === 0));
}
const centroid = f => {
  let sum = 0, n = 0;
  f.color.forEach((c, i) => { if (c >>> 24) { sum += i % f.w; n++; } });
  assert(n); return sum / n;
};
assert(Math.abs(centroid(frame()) + centroid(frame({ flip: true })) - 259) < 2);
for (const layer of ["front", "back"]) assert(frame({ layer }).color.some(c => c >>> 24));
for (const time of [0.2, 0.4, 0.6, 0.8]) {
  const f = frame({ time });
  for (let x = 0; x < f.w; x++) { assert.equal(f.color[x], 0); assert.equal(f.color[(f.h - 1) * f.w + x], 0); }
  for (let y = 0; y < f.h; y++) { assert.equal(f.color[y * f.w], 0); assert.equal(f.color[y * f.w + f.w - 1], 0); }
  assert.equal(f.color[88 * f.w + 130], 0, "wave centre remains hollow");
}
const span = f => {
  const xs = []; f.color.forEach((c, i) => { if (c >>> 24) xs.push(i % f.w); });
  return Math.max(...xs) - Math.min(...xs);
};
assert(span(frame({ time: 0.2 })) < span(frame({ time: 0.5 })), "wave expands outward");
console.log("Dark wave: seed, palette, mirror, rates, depth, expansion, hollow centre, bounds and empty endpoint pass.");
