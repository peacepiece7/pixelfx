// Run: node tools/test-theme-ui.mjs
import assert from 'node:assert/strict';
import { createFx, createFrame, clearFrame, Painter } from '../src/core/index.js';
import * as victory from '../src/fx/ui/theme-victory-radiance.js';
import * as reward from '../src/fx/ui/theme-reward-glint.js';
import * as chapter from '../src/fx/ui/theme-chapter-halo.js';

for (const mod of [victory, reward, chapter]) {
  const options = { x: 220, y: 160, seed: 7 };
  const a = createFx(mod, options), b = createFx(mod, options);
  const fa = createFrame(440, 320), fb = createFrame(440, 320);
  let visible = false;
  for (let i = 0; i <= Math.ceil(mod.meta.duration * 30); i++) {
    clearFrame(fa); clearFrame(fb); a.draw(fa); b.draw(fb);
    assert.deepEqual(fa.color, fb.color, `${mod.meta.name}: 30/60Hz color`);
    assert.deepEqual(fa.light, fb.light, `${mod.meta.name}: 30/60Hz light`);
    if (i === 0 || i >= mod.meta.duration * 30) {
      assert(!fa.color.some(Boolean) && !fa.light.some(Boolean), 'Both ends must be empty');
    } else visible ||= fa.color.some(Boolean) && fa.light.some(Boolean);
    a.update(1 / 30); b.update(1 / 60); b.update(1 / 60);
  }
  assert(visible, 'An effect must become visible');
  for (const flip of [false, true]) for (const angle of [0, 0.4]) {
    const fx = createFx(mod, { ...options, flip, angle, palette: ['#432100', '#fff0b0'] });
    const f = createFrame(440, 320), p = new Painter(f).place(options.x, options.y, flip, angle);
    for (let i = 0; i < Math.ceil(mod.meta.duration * 30); i++) {
      clearFrame(f); fx.update(1 / 30); fx.draw(f);
      if (mod === reward) continue;
      for (let y = 120; y < 200; y++) for (let x = 120; x < 320; x++) {
        if (Math.abs(p.fromX(x + 0.5, y + 0.5)) >= mod.meta.options.clearW / 2 || Math.abs(p.fromY(x + 0.5, y + 0.5)) >= mod.meta.options.clearH / 2) continue;
        const n = y * f.w + x;
        assert.equal(f.color[n], 0, 'Title color is protected, even with transforms');
        assert.equal(f.light[n], 0, 'Title light is protected, even with transforms');
      }
    }
  }
  const dark = createFx(mod, { ...options, light: 0 }); dark.update(0.3); clearFrame(fa); dark.draw(fa);
  assert(!fa.light.some(Boolean), 'light:0 disables glow');
  if (mod !== reward) {
    const quiet = createFx(mod, { ...options, intensity: 0 }); quiet.update(0.3); clearFrame(fa); quiet.draw(fa);
    assert(!fa.color.some(Boolean) && !fa.light.some(Boolean), 'intensity:0 is empty');
    fa.color.fill(0xff123456); fa.light.fill(0xff010203);
    const fx = createFx(mod, options); fx.update(0.3); fx.draw(fa);
    assert.equal(fa.color[160 * fa.w + 220], 0xff123456, 'Title masking never erases the host');
    assert.equal(fa.light[160 * fa.w + 220], 0xff010203, 'Title masking preserves existing light');
  }
}
// The glint must leave the label below even the largest supported icon untouched.
for (const size of [16, 52, 64]) {
  const f = createFrame(96, 96), fx = createFx(reward, { x: 48, y: 48, w: size, h: size });
  for (let i = 0; i < 17; i++) {
    fx.update(1 / 30); clearFrame(f); fx.draw(f);
    for (let y = Math.ceil(48 + size / 2 + 8); y < 96; y++) {
      assert(!f.color.subarray(y * 96, (y + 1) * 96).some(Boolean));
      assert(!f.light.subarray(y * 96, (y + 1) * 96).some(Boolean));
    }
  }
}
console.log('Theme UI: timing, 30/60Hz pixels, transformed title protection, palette, light and quantity safety pass.');
