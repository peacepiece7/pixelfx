// Warm brass gathering, a quick fan of broad gold rays, then drifting embers behind the victory title.
import { fit, Rng, smooth } from '../../core/index.js';
import { envelope, dragged, glint } from './_tyrant.js';
import { protectTitle } from './_theme-title.js';

export const meta = {
  name: 'Theme victory radiance', desc: 'Broad uneven brass rays open behind a protected title, then gold dust settles. No text or badge.',
  tags: ['ui', 'theme', 'victory', 'gold'], size: [360, 200], origin: [180, 104], duration: 1.2, loop: false, fps: 30, bg: 'dark',
  options: { palette: ['#30203b', '#80502d', '#c48a34', '#efb84f', '#ffdc87', '#fff2c5'], intensity: 1, clearW: 136, clearH: 36, seed: 7 },
};
export function create(o) {
  const C = fit(o.palette, 6), R = new Rng(o.seed), k = Math.max(0, Math.min(2, o.intensity));
  const rays = Array.from({ length: 8 }, (_, i) => ({ a: -Math.PI + 0.16 + i / 7 * (Math.PI - 0.32) + R.range(-0.045, 0.045), len: R.range(116, 155), width: R.range(4, 8), delay: R.range(0, 0.045) }));
  const dust = Array.from({ length: 22 }, () => ({ a: R.range(-Math.PI, 0), v: R.range(55, 120), delay: R.range(0.16, 0.32), life: R.range(0.5, 0.82), star: R.chance(0.18) }));
  let t = 0;
  return {
    update(dt) { t += dt; },
    draw(p) {
      if (t <= 0 || t >= meta.duration || !k) return;
      p = protectTitle(p, o);
      const e = envelope(t, 0, 0.12, 0.3, 1.16) * k;
      p.glow(0, -14, 86, C[3], 0.55 * e);
      for (const r of rays) {
        const u = t - r.delay, grow = smooth(0.1, 0.3, u), a = envelope(u, 0.08, 0.19, 0.28, 1.04) * k;
        if (a <= 0) continue;
        const ca = Math.cos(r.a), sa = Math.sin(r.a), len = r.len * (0.45 + 0.55 * grow);
        const x = ca * len, y = sa * len * 0.52;
        p.glowLine(ca * 32, sa * 16, x, y, r.width * 1.6, C[3], 0.36 * a);
        p.tri(ca * 28, sa * 14, x - sa * r.width, y + ca * r.width * 0.5, x + sa * r.width, y - ca * r.width * 0.5, C[2], 0.24 * a);
        p.line(ca * 36, sa * 18, x * 0.88, y * 0.88, C[4], 0.75 * a);
      }
      const flash = envelope(t, 0.12, 0.15, 0.18, 0.23) * k;
      glint(p, 0, -o.clearH / 2 - 5, 7 * flash, C[5], C[4], flash, 0.3);
      for (const d of dust) {
        const age = t - d.delay;
        if (age <= 0 || age >= d.life) continue;
        const r = 48 + dragged(d.v, 3.5, age), x = Math.cos(d.a) * r, y = Math.sin(d.a) * r * 0.65 + age * age * 12;
        const a = envelope(age, 0, 0.05, 0.15, d.life) * k;
        if (d.star) glint(p, x, y, 2.5 * a, C[5], C[4], a, 0.18);
        else { p.dot(x, y, C[4], a); p.glow(x, y, 2.5, C[3], 0.18 * a); }
      }
    },
  };
}
