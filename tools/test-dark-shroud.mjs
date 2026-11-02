// Run: node tools/test-dark-shroud.mjs
import assert from "node:assert/strict";
import * as fx from "../src/fx/shadow/dark-shroud.js";
import { createFrame, painterFor, resolveOptions } from "../src/core/index.js";
function frame(t, options = {}, flip = false, layer) {
  const f = createFrame(144, 112), p = painterFor(f).place(72, 87, flip), o = resolveOptions(fx.meta, options);
  if (layer !== "front") fx.drawBack(p, t, o);
  if (layer !== "back") fx.draw(p, t, o);
  return f;
}
assert.deepEqual(frame(0.125), frame(0.125));
assert.deepEqual(frame(0), frame(1));
assert.deepEqual(frame(0.125), frame(1.125));
assert.notDeepEqual(frame(0.125), frame(0.125, { seed: 42 }));
assert.notDeepEqual(frame(0.125), frame(0.125, { palette: ["#123", "#48a", "#cff"] }));
assert.notDeepEqual(frame(0.125, { pulse: 0 }), frame(0.125, { pulse: 1 }));
assert.deepEqual(frame(0.125, { pulse: -2 }), frame(0.125, { pulse: 0 }));
assert.deepEqual(frame(0.125, { pulse: 9 }), frame(0.125, { pulse: 1 }));
const centroid = f => {
  let sum = 0, n = 0;
  f.color.forEach((c, i) => { if (c >>> 24) { sum += i % f.w; n++; } });
  assert(n); return sum / n;
};
assert(Math.abs(centroid(frame(0.125)) + centroid(frame(0.125, {}, true)) - 143) < 2);
for (const layer of ["back", "front"]) {
  const f = frame(0.125, {}, false, layer);
  assert(f.color.some(c => c >>> 24), `${layer} layer draws`);
}
for (const pulse of [0, 1]) for (const t of [0, 0.25, 0.5, 0.75]) {
  const f = frame(t, { pulse });
  for (let x = 0; x < f.w; x++) { assert.equal(f.color[x], 0); assert.equal(f.color[(f.h - 1) * f.w + x], 0); }
  for (let y = 0; y < f.h; y++) { assert.equal(f.color[y * f.w], 0); assert.equal(f.color[y * f.w + f.w - 1], 0); }
  const front = frame(t, { pulse }, false, "front");
  assert((front.color[67 * f.w + 72] >>> 24) < 160, "near veil stays translucent over the chest");
}
console.log("Dark shroud: seed, palette, pulse/clamp, mirror, depth layers, bounds and loop seam pass.");
