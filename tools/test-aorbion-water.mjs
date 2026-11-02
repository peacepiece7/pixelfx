// Review contract: 50ms authoring, repeatable rendering, clean endings and rune variants.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createFrame, createFx } from '../src/core/index.js';
import * as charge from '../src/fx/water/aorbion-charge-emerge.js';
import * as pillars from '../src/fx/water/aorbion-tail-pillars.js';
import * as dragon from '../src/fx/water/aorbion-seadragon.js';
import * as poseidon from '../src/fx/water/aorbion-poseidon.js';
import * as wet from '../src/fx/water/drip.js';

const effects = [
  ['aorbion-charge-emerge', charge],
  ['aorbion-tail-pillars', pillars],
  ['aorbion-seadragon', dragon],
];
const lines = path => readFileSync(new URL(path, import.meta.url), 'utf8').trimEnd().split('\n').length;
const referenceLines = 285; // Original requested reference, before sharing its rendering functions.
const sharedLines = lines('../src/fx/water/_surging-water.js');
const alternate = ['#160b20', '#422249', '#714b79', '#b083af', '#edc6e6'];

function render(mod, t, options = {}, substeps = 1) {
  const frame = createFrame(1280, 768), fx = createFx(mod, { x: 320, y: 360, ...options });
  for (let i = 0; i < substeps; i++) fx.update(t / substeps);
  fx.draw(frame, 'back');
  fx.draw(frame, 'front');
  return frame;
}
const empty = f => f.color.every(v => !v) && f.light.every(v => !v);

for (const [name, mod] of effects) {
  assert(lines(`../src/fx/water/${name}.js`) + (name === 'aorbion-tail-pillars' ? sharedLines : 0) >= referenceLines, `${name}: requested source size`);
  const rows = mod.choreography;
  assert.equal(rows.length, Math.round(mod.meta.duration / .05) + 1);
  rows.forEach((r, i) => {
    assert(Math.abs(r[0] - i * .05) < 1e-8, `${name}: missing 50ms key ${i}`);
    assert(r.every(Number.isFinite));
  });
  assert(empty(render(mod, 0)), `${name}: empty before release`);
  assert(empty(render(mod, mod.meta.duration)), `${name}: empty end`);
  assert(empty(render(mod, mod.meta.duration + .1)), `${name}: no late revival`);
  for (let i = 1; i < rows.length - 1; i++) {
    const t = i * .05;
    const a = render(mod, t), b = render(mod, t), stepped = render(mod, t, {}, 24);
    assert.deepEqual(a.color, stepped.color, `${name}: partition independence at ${t}`);
    assert.deepEqual(a.light, stepped.light, `${name}: partition light at ${t}`);
    assert.deepEqual(a.color, b.color, `${name}: repeatable color at ${t}`);
    assert.deepEqual(a.light, b.light, `${name}: repeatable light at ${t}`);
  }
  const peak = .2, a = render(mod, peak), b = render(mod, peak, {}, 24);
  assert.deepEqual(a.color, b.color, `${name}: update partition independence`);
  assert.deepEqual(a.light, b.light, `${name}: update partition light independence`);
  assert(!empty(a), `${name}: visible peak`);
  assert(!empty(render(mod, peak, { flip: true, angle: .2 })), `${name}: facing transform`);
  assert.notDeepEqual(a.color, render(mod, peak, { palette: alternate }).color, `${name}: palette support`);
  console.log(`${name}: ${rows.length} keys; ${lines(`../src/fx/water/${name}.js`)} lines; timing/render checks passed`);
}
for (const count of [1, 3, 5, 12]) {
  assert(!empty(render(pillars, .2, { count })), `count ${count}: visible`);
  assert(empty(render(pillars, .8, { count })), `count ${count}: ends empty`);
}
console.log('Pillar count 1/3/5/12 passed');

for (const options of [{}, { flip: true }, { pulse: 0 }, { pulse: 1 }]) {
  const start = render(poseidon, 0, options), end = render(poseidon, 6, options);
  assert.deepEqual(start.color, end.color, 'Poseidon color loop seam');
  assert.deepEqual(start.light, end.light, 'Poseidon light loop seam');
}
for (const t of [0, .15, .8, 2.3, 5.95]) {
  assert.deepEqual(render(poseidon, t, { pulse: 0 }).color,
    render(poseidon, t, { pulse: 1 }).color, 'Pulse changes light, not geometry');
}
console.log('Poseidon loop, facing and brightness-only pulse passed');

for (const t of [0, .2, .65, 1.1, 1.59]) {
  assert(empty(render(wet, t, { stacks: 0 })), 'Wet: zero stacks must be empty');
  assert.deepEqual(render(wet, t, { stacks: 3 }).color,
    render(wet, t, { stacks: 99 }).color, 'Wet density saturates at three stacks');
}
for (const stacks of [1, 2, 3]) {
  assert.deepEqual(render(wet, 0, { stacks }).color,
    render(wet, wet.meta.duration, { stacks }).color, 'Wet loop seam');
}
console.log('Wet zero-stack, capped density and loop seam passed');

// Regression: the visible crest travels through a long lane, grows to its peak,
// then keeps advancing while shrinking. The host-driven mode has no extra travel.
function waterStats(t, options = {}) {
  const f = render(dragon, t, options);
  let count = 0, sumX = 0, top = f.h;
  const rows = new Uint32Array(f.h);
  for (let i = 0; i < f.color.length; i++) if ((f.color[i] >>> 24) > 128) {
    count++; sumX += i % f.w; rows[Math.floor(i / f.w)]++;
  }
  // Ignore isolated ballistic drops when measuring the dense water body.
  for (let y = 0; y < f.h; y++) if (rows[y] > 18) { top = y; break; }
  return { count, x: sumX / count, height: 360 - top };
}
const early = waterStats(.15), peak = waterStats(.4), late = waterStats(.75);
assert(peak.x > early.x + 70 && late.x > peak.x + 150, 'Crest advances through the lane');
assert(peak.height > early.height + 15 && peak.height > late.height + 15, 'Wave grows then shrinks');
for (const t of [.2, .5, .8]) {
  assert.equal(dragon.travelPose(t, { travelDistance: 0 }).front, 0, 'Host-driven mode avoids double travel');
  assert.equal(dragon.travelPose(t, { travelDistance: 640 }).front, t * 640);
}
assert(!empty(render(dragon, .45, { travelDistance: 0 })), 'Host-driven crest visible');
console.log('Sea wave advances, grows, shrinks and supports a host-driven anchor');
