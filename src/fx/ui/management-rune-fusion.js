// Two runes fuse: thin violet particle trails run from both source slots into the result slot, then one thin
// hexagonal wave. Rune art, frames, tiers and recipe are the page's.
import { fit, rand, TAU, smooth } from "../../core/index.js";
import { envelope } from "./_tyrant.js";

const D = 0.95;
export const meta = {
  name: "Management rune fusion",
  desc: "Thin violet trails run from two source slots into the result slot, then one thin hexagonal wave. No rune art or numbers.",
  tags: ["ui", "management", "rune", "fusion", "arcane"],
  size: [280, 140], origin: [140, 70], duration: D, loop: false, fps: 30, bg: "dark",
  // from: the two source slots, to: the result slot, px from the origin
  options: { palette: ["#18132b", "#443164", "#805199", "#ba7fc8", "#ecc4f0", "#fff0ff"], from: [[-104, 0], [104, 0]], to: [0, 0], seed: 3 },
};

const bez = (a, c, b, u) => (1 - u) * (1 - u) * a + 2 * (1 - u) * u * c + u * u * b;

export function draw(p, t, o) {
  if (t >= D) return;
  const C = fit(o.palette, 6), S = o.seed, [tx, ty] = o.to;
  o.from.forEach(([fx, fy], side) => {
    for (let i = 0; i < 9; i++) {
      const at = 0.02 + rand(S, side, i) * 0.22, tt = t - at, life = 0.38 + rand(S, side, i, 1) * 0.08;
      if (tt <= 0 || tt >= life) continue;
      const lift = -14 - rand(S, side, i, 2) * 22, cx = (fx + tx) / 2, cy = (fy + ty) / 2 + lift, u = smooth(0, 1, tt / life);
      for (let k = 0; k < 6; k++) {
        const v = Math.max(0, u - k * 0.03), x = bez(fx, cx, tx, v), y = bez(fy, cy, ty, v);
        p.dot(x, y, k === 0 ? C[5] : k < 3 ? C[4] : C[3], (1 - k / 6) * 0.9);
      }
      p.glow(bez(fx, cx, tx, u), bez(fy, cy, ty, u), 3, C[3], 0.25);
    }
  });
  const h = envelope(t, 0.58, 0.64, 0.7, 0.93), r = 8 + 30 * smooth(0.58, 0.93, t);
  if (h > 0) {
    const pts = Array.from({ length: 7 }, (_, i) => [tx + Math.cos(i * TAU / 6 - Math.PI / 2) * r, ty + Math.sin(i * TAU / 6 - Math.PI / 2) * r * 0.9]);
    p.polyline(pts, C[4], h);
    p.glowRing(tx, ty, r * 0.95, 4, C[3], 0.18 * h);
    p.glow(tx, ty, 12, C[4], 0.25 * envelope(t, 0.55, 0.6, 0.62, 0.75));
  }
}
