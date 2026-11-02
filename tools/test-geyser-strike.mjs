import assert from 'node:assert/strict';
import { createFrame, createFx } from '../src/core/index.js';
import * as geyser from '../src/fx/water/geyser.js';

function frame(t, options = {}, steps = 1) {
  const f = createFrame(320, 240), fx = createFx(geyser, { x: 160, y: 190, ...options });
  for (let i = 0; i < steps; i++) fx.update(t / steps);
  fx.draw(f, 'back'); fx.draw(f, 'front');
  return f;
}
const empty = f => f.color.every(v => !v) && f.light.every(v => !v);
const rows = geyser.choreography;
assert.equal(rows.length, Math.round(geyser.meta.duration / .05) + 1);
const peak = rows.reduce((best, row, i) => row[1] > rows[best][1] ? i : best, 0);
assert(peak > 0 && rows[peak][0] <= .15, 'Fast rise to one impact');
for (let i = 1; i < rows.length; i++) {
  assert(Math.abs(rows[i][0] - i * .05) < 1e-8);
  assert(i <= peak ? rows[i][1] >= rows[i - 1][1] : rows[i][1] <= rows[i - 1][1], 'No second eruption');
  if (rows[i][0] >= .4) assert.equal(rows[i][1], 0, 'Only aftermath after .4s');
}
for (const options of [{}, {height: 58}, {jetOnly: true}, {seed: 21, flip: true}]) {
  assert(empty(frame(0, options)));
  assert(!empty(frame(.15, options)));
  assert(empty(frame(geyser.meta.duration, options)));
  assert(empty(frame(geyser.meta.duration + .5, options)));
  for (const t of [.05, .15, .25, .4, .55, .7, .84]) {
    const a = frame(t, options), b = frame(t, options, 24);
    assert.deepEqual(a.color, b.color, 'Partition-independent spray');
    assert.deepEqual(a.light, b.light, 'Partition-independent light');
  }
}
console.log('Geyser: one fast peak, no re-eruption, clean ends, height/jetOnly/facing/seed and timestep checks passed');
