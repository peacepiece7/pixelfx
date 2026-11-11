// An upright gold halo opens at both sides of a chapter title; embers rise as it settles.
import { fit, Rng, smooth } from '../../core/index.js';
import { envelope, glint } from './_tyrant.js';
import { protectTitle } from './_theme-title.js';
export const meta = {
  name: 'Theme chapter halo', desc: 'Upright brass halo and opening side arcs celebrate a first chapter clear, with a protected title and rising embers.',
  tags: ['ui', 'theme', 'chapter', 'halo'], size: [360, 220], origin: [180, 116], duration: 0.9, loop: false, fps: 30, bg: 'dark',
  options: { palette: ['#30203b', '#80502d', '#c48a34', '#efb84f', '#ffdc87', '#fff2c5'], intensity: 1, clearW: 160, clearH: 44, seed: 8 },
};
export function create(o) {
  const C = fit(o.palette, 6), R = new Rng(o.seed), k = Math.max(0, Math.min(2, o.intensity));
  const motes = Array.from({ length: 18 }, (_, i) => ({ x: (i % 2 ? -1 : 1) * R.range(85, 122), y: R.range(-16, 8), delay: R.range(0.15, 0.3), rise: R.range(32, 72), phase: R.range(0, 6.28) }));
  let t = 0;
  return {
    update(dt) { t += dt; },
    draw(p) {
      if (t <= 0 || t >= meta.duration || !k) return;
      p = protectTitle(p, o);
      const e = envelope(t, 0, 0.15, 0.38, 0.9) * k, grow = smooth(0.1, 0.4, t);
      const rx = 82 + 56 * grow, ry = 48 + 40 * grow;
      p.glow(0, -20, 94, C[3], 0.5 * e);
      const crest = envelope(t, 0.17, 0.23, 0.29, 0.48) * k;
      glint(p, 0, -ry, 7 * crest, C[5], C[4], crest, 0.3);
      // Tall ellipse, two opposing opening arcs; the lower centre remains quiet.
      for (const side of [-1, 1]) {
        const points = [];
        for (let i = 0; i <= 40; i++) {
          const a = -1.34 + i / 40 * (1.55 + 0.8 * grow);
          points.push([side * Math.cos(a) * rx, Math.sin(a) * ry]);
        }
        p.polyline(points, C[4], 0.86 * e);
        p.polyline(points.slice(10, 31).map(([x, y]) => [x * 0.94, y * 0.94]), C[3], 0.48 * e);
        for (let i = 0; i < points.length - 1; i += 4) {
          p.glowLine(...points[i], ...points[Math.min(i + 4, points.length - 1)], 6, C[3], 0.25 * e);
        }
        const [x, y] = points[0];
        glint(p, x, y, 5 * e, C[5], C[4], e, 0.25);
      }
      for (const m of motes) {
        const age = t - m.delay;
        if (age <= 0) continue;
        const a = envelope(t, m.delay, m.delay + 0.06, 0.4, 0.88) * k;
        const x = m.x + Math.sin(age * 4 + m.phase) * 3, y = m.y - m.rise * age;
        p.dot(x, y, C[4], a); p.glow(x, y, 3, C[3], 0.2 * a);
      }
    },
  };
}
