// Run: node tools/test-pull-vortex.mjs
import assert from "node:assert/strict";
import * as fx from "../src/fx/nature/pull-vortex.js";
import { createFrame, painterFor, resolveOptions } from "../src/core/index.js";
function frame(t, options = {}, flip = false) {
  const f = createFrame(260, 100), p = painterFor(f).place(130, 65, flip);
  const o = resolveOptions(fx.meta, options);
  fx.drawBack(p, t, o); fx.draw(p, t, o); return f;
}
assert.deepEqual(frame(0.25), frame(0.25));
assert.notDeepEqual(frame(0.25), frame(0.25, { seed: 42 }));
assert.notDeepEqual(frame(0.25), frame(0.25, { palette: ["#123", "#48a", "#cff"] }));
assert.deepEqual(frame(0), frame(2));
assert.deepEqual(frame(0.25), frame(2.25));
const centroid = f => {
  let sum = 0, n = 0;
  f.color.forEach((c, i) => { if (c >>> 24) { sum += i % f.w; n++; } });
  assert(n); return sum / n;
};
assert(Math.abs(centroid(frame(0.25)) + centroid(frame(0.25, {}, true)) - 259) < 2);
// Ensure the soft dust volumes are present alongside the solid leaf and grit shapes.
const centres = t => {
  const discs = [], p = new Proxy({}, { get: (_, k) => k === "disc" ? (x, y, r, c, a) => { if ((typeof a === "function" ? a(0,0) : a) > 0.001) discs.push([x, y]); } : () => {} });
  const o = resolveOptions(fx.meta);
  fx.drawBack(p, t, o); fx.draw(p, t, o); return discs;
};
assert(centres(0.25).length > 20);
for (let i = 0; i < 60; i++) {
  const [w,h]=fx.meta.size, [ox,oy]=fx.meta.origin;
  const f = createFrame(w,h), p = painterFor(f).place(ox,oy), o = resolveOptions(fx.meta);
  fx.drawBack(p, i / 30, o); fx.draw(p, i / 30, o);
  for (let x = 0; x < w; x++) { assert.equal(f.color[x], 0); assert.equal(f.color[(h-1)*w+x], 0); }
  for (let y = 0; y < h; y++) { assert.equal(f.color[y*w], 0); assert.equal(f.color[y*w+w-1], 0); }
}
console.log("Pull vortex: deterministic seed, palette, mirrored fan, loop endpoints and canvas bounds pass.");
