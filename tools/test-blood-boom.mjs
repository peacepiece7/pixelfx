// Run: node tools/test-blood-boom.mjs
import assert from "node:assert/strict";
import * as fx from "../src/fx/blood/blood-boom.js";
import { createFrame, painterFor, resolveOptions } from "../src/core/index.js";

function frame({ seed = 8, palette, flip = false, fps = 120, time = 0.6 } = {}) {
  const sim = fx.create(resolveOptions(fx.meta, { seed, ...(palette ? { palette } : {}) }));
  for (let i = 0; i < Math.round(time * fps); i++) sim.update(1 / fps);
  const f = createFrame(120, 140), p = painterFor(f).place(60, 116, flip);
  sim.drawBack(p); sim.draw(p);
  return f;
}
const a = frame();
assert.deepEqual(a, frame(), "same seed reproduces color and light");
assert.notDeepEqual(a.color, frame({ seed: 2 }).color, "seed changes the droplet scatter");
assert.notDeepEqual(a.color, frame({ palette: ["#112244", "#3377bb", "#99ddff", "#ffffff"] }).color, "short palettes recolor the effect");
const centroid = (f) => {
  let sum = 0, n = 0;
  f.color.forEach((c, i) => { if (c >>> 24) { sum += i % f.w; n++; } });
  assert(n > 0);
  return sum / n;
};
assert(Math.abs(centroid(a) + centroid(frame({ flip: true })) - 119) < 2, "droplet scatter mirrors about the feet");
for (const time of [1.4, 1.5]) {
  const end = frame({ time });
  assert(end.color.every((c) => c === 0) && end.light.every((c) => c === 0), "direct simulation ends empty in both layers");
}
console.log("Blood boom: deterministic scatter, recolor, mirror and empty endpoint pass.");
