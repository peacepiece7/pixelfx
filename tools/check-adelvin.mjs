// Run: node tools/check-adelvin.mjs. VFX state checks, independent of combat rules.
import assert from "node:assert/strict";
import { createFx, createFrame } from "../src/core/index.js";
import * as shields from "../src/fx/holy/adelvin-orbiting-shields.js";
import * as orbs from "../src/fx/holy/adelvin-orb-array.js";
import * as meteor from "../src/fx/holy/adelvin-meteor.js";

function render(mod, options, age = 0.37) {
  const frame = createFrame(480, 320);
  const fx = createFx(mod, { x: 240, y: 210, seed: 7, ...options });
  fx.update(age);
  fx.draw(frame);
  return [...frame.color, ...frame.light];
}

for (const mod of [shields, orbs]) {
  assert(render(mod, { count: 0 }).every(v => v === 0), "zero remaining count must draw nothing");
  const few = render(mod, { count: 3 });
  const many = render(mod, { count: 23 });
  assert(many.some(v => v !== 0));
  assert.notDeepEqual(many, few, "count above default must not be clamped to three/five");
  assert.deepEqual(many, render(mod, { count: 23 }), "same seed/time must repeat");
}

const old = createFx(meteor, { seed: 7 });
const young = createFx(meteor, { seed: 8 });
old.update(0.7);
young.update(0.1);
assert.equal(old.t, 0.7);
assert.equal(young.t, 0.1, "one summon effect must not advance another instance");
assert.notDeepEqual(render(meteor, {}, 0.1), render(meteor, {}, meteor.IMPACT));
assert(render(meteor, {}, meteor.meta.duration).every(v => v === 0), "meteor must end empty");
console.log("Adelvin VFX: zero/dynamic counts, determinism, independent clocks and clean meteor ending pass");
