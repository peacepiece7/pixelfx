// A short brass edge sweep and two staggered diagonal glints around a square reward icon.
import { fit, Rng } from '../../core/index.js';
import { envelope, glint } from './_tyrant.js';
export const meta = {
  name: 'Theme reward glint', desc: 'A short gold sweep and two opposite corner glints frame a reward icon, keeping its centre and quantity clear.',
  tags: ['ui', 'theme', 'reward', 'glint'], size: [96, 96], origin: [48, 48], duration: 0.55, loop: false, fps: 30, bg: 'dark',
  options: { palette: ['#30203b', '#80502d', '#c48a34', '#efb84f', '#ffdc87', '#fff2c5'], w: 52, h: 52, seed: 7 },
};
export function create(o) {
  const C = fit(o.palette, 6), R = new Rng(o.seed), hw = Math.max(8, Math.min(32, o.w / 2)), hh = Math.max(8, Math.min(32, o.h / 2));
  const start = R.range(0, 0.025);
  let t = 0;
  return {
    update(dt) { t += dt; },
    draw(p) {
      if (t <= 0 || t >= meta.duration) return;
      const a = envelope(t, 0, 0.07, 0.22, 0.48), head = (hw * 2 + hh * 1.35) * Math.min(1, t / 0.36);
      // Only the top and right rim: never travel under the reward's quantity label.
      for (let i = 0; i < 18; i++) {
        const s = head - i * 1.2;
        if (s < 0) continue;
        const x = s < hw * 2 ? -hw + s : hw, y = s < hw * 2 ? -hh : -hh + s - hw * 2;
        p.dot(x, y, i < 3 ? C[5] : C[3], a * (1 - i / 18));
        if (i % 6 === 0) p.glow(x, y, 3, C[3], 0.22 * a * (1 - i / 18));
      }
      for (const [x, y, at] of [[-hw, -hh, start + 0.035], [hw, hh * 0.45, start + 0.16]]) {
        const e = envelope(t, at, at + 0.055, at + 0.11, at + 0.29);
        glint(p, x, y, 7 * e, C[5], C[4], e, 0.3);
      }
    },
  };
}
