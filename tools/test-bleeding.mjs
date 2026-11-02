// Run: node tools/test-bleeding.mjs
import assert from "node:assert/strict";
import * as fx from "../src/fx/blood/bleeding.js";
import { createFrame, painterFor, resolveOptions, stockActor } from "../src/core/index.js";
function frame(t, options = {}, flip = false) {
  const f = createFrame(64, 72), p = painterFor(f).place(32, 60, flip);
  fx.draw(p, t, resolveOptions(fx.meta, options));
  return f;
}
assert.deepEqual(frame(0.3), frame(0.3));
assert.notDeepEqual(frame(0.3), frame(0.3, { seed: 13 }));
assert.notDeepEqual(frame(0.3), frame(0.3, { palette: ["#112244", "#3377bb", "#99ddff"] }));
assert(frame(0.3, { stacks: 0 }).color.every(c => c === 0));
for (const stacks of [1, 4, 8]) {
  assert.deepEqual(frame(0, { stacks }), frame(1.2, { stacks }));
  assert.deepEqual(frame(0.3, { stacks }), frame(0.3, { stacks }));
}
const coverage = stacks => Array.from({ length: 36 }, (_, i) => frame(i / 30, { stacks }).color.filter(c => c >>> 24).length).reduce((a, b) => a + b, 0);
assert(coverage(4) > coverage(1) * 2, "more stacks make more visible drips");
const normal = frame(0.3), mirrored = frame(0.3, {}, true);
const centroid = f => {
  let sum = 0, n = 0;
  f.color.forEach((c, i) => { if (c >>> 24) { sum += i % f.w; n++; } });
  assert(n); return sum / n;
};
assert(Math.abs(centroid(normal) + centroid(mirrored) - 63) < 2);
// A full-height target verifies source placement is based on occupied torso pixels.
const data = new Uint8Array(20 * 48).fill(1);
const actor = { mask: { w: 20, h: 48, data }, x: -10, y: -48, w: 20, h: 48 };
assert.notDeepEqual(frame(0.3, { actor }), frame(0.3, { actor: stockActor(2) }));
assert(frame(0.3, { actor }).color.some(c => c >>> 24));
console.log("Bleeding: seed, palette, stacks, mirror, 48px actor and exact loop endpoint pass.");
