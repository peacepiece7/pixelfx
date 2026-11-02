// Showcase regression: the filled water silhouettes must survive host transforms,
// frame-rate changes and arbitrary short palettes without losing their volume.
import assert from 'node:assert/strict';
import { createFrame, createFx } from '../src/core/index.js';
import * as dragon from '../src/fx/water/aorbion-seadragon.js';

function render(t, options = {}, steps = 1) {
  const frame = createFrame(1024, 768);
  const fx = createFx(dragon, {x: 512, y: 384, travelDistance: 0, ...options});
  for (let i = 0; i < steps; i++) fx.update(t / steps);
  fx.draw(frame, 'back'); fx.draw(frame, 'front');
  return frame;
}
const coverage = f => f.color.reduce((n, c) => n + Number((c >>> 24) > 128), 0);
for (const t of [.15, .35, .55, .75]) {
  const base = render(t), count = coverage(base);
  assert(count > 100, 'Water silhouette has substantial coverage');
  for (const transform of [{flip: true}, {angle: Math.PI / 2}, {angle: -.45, flip: true}]) {
    const ratio = coverage(render(t, transform)) / count;
    assert(ratio > .85 && ratio < 1.15, `Host transform preserves volume: ${ratio}`);
  }
}
for (let i = 0; i <= 30; i++) {
  const t = i / 30;
  const a = render(t, {}, Math.max(1,i)), b = render(t, {}, Math.max(1,i*2));
  assert.deepEqual(a.color,b.color,'30/60Hz color at common times');
  assert.deepEqual(a.light,b.light,'30/60Hz light at common times');
}
assert.notDeepEqual(render(.4, {seed: 7}).color, render(.4, {seed: 17}).color, 'Seed changes spray and caustics');
assert(render(.4,{light:0}).light.every(c => !c), 'Host light=0 disables additive light');
assert(coverage(render(.4,{palette:['#102030','#eeffff']})) > 100, 'Two-color palette resamples safely');
for (const t of [0,1,1.1]) {
  const f=render(t);
  assert(f.color.every(c=>!c) && f.light.every(c=>!c),'Lifecycle endpoints are empty');
}
console.log('Sea dragon: transformed volume, 30/60Hz, seed, palette, lighting and lifecycle passed');
