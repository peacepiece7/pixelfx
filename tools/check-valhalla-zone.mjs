// node tools/check-valhalla-zone.mjs
import assert from "node:assert/strict";
import { createFrame, painterFor, resolveOptions } from "../src/core/index.js";
import * as fx from "../src/fx/holy/valhalla-zone.js";

const shot = (t, options = {}) => {
  const f = createFrame(...fx.meta.size), p = painterFor(f);
  p.place(...fx.meta.origin, !!options.flip);
  const o = resolveOptions(fx.meta, options);
  fx.drawBack(p, t, o);
  fx.draw(p, t, o);
  return f;
};
const energy = (f) => f.light.reduce((sum, c) => sum + (c & 255) + ((c >>> 8) & 255) + ((c >>> 16) & 255), 0);
for (const t of [0, 6]) {
  const f = shot(t);
  assert(!f.color.some(Boolean) && !f.light.some(Boolean), `boundary ${t} must be empty`);
}
const a = shot(2.2);
assert.deepEqual(shot(2.2), a, "both buffers must be deterministic");
assert.notDeepEqual(shot(2.2, { seed: 71 }), a, "seed must vary the motes");
assert.notDeepEqual(shot(2.2, { palette: ["#102044", "#50b0ff"] }), a, "short palettes must recolor the effect");
assert(energy(shot(2.2, { pulse: 1 })) > energy(shot(2.2, { pulse: 0 })) * 1.5, "pulse must visibly brighten the seal");
assert.deepEqual(shot(2.2, { pulse: -1 }), shot(2.2, { pulse: 0 }));
assert.deepEqual(shot(2.2, { pulse: 2 }), shot(2.2, { pulse: 1 }));
assert(energy(shot(2)) > energy(shot(2.5)) * 1.5, "default preview must pulse each second");
// Glow is continuous rather than Bayer-dithered, so its centroid mirrors exactly.
const centroid = (f) => {
  let sum = 0, xsum = 0;
  f.light.forEach((c, i) => {
    const k = (c & 255) + ((c >>> 8) & 255) + ((c >>> 16) & 255);
    sum += k; xsum += ((i % f.w) + 0.5 - fx.meta.origin[0]) * k;
  });
  return xsum / sum;
};
assert(Math.abs(centroid(a) + centroid(shot(2.2, { flip: true }))) < 0.1, "flip must mirror the effect around the caster");
console.log("Valhalla zone: boundaries, determinism, seed, palette, pulse and flip pass");
