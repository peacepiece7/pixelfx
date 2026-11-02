import { fit, Rng, smooth, stockActor } from "../../core/index.js";
import { shape } from "../status/_lib.js";

export const meta = {
  name: "Bleeding status",
  desc: "Wet beads gather on the target's torso, fall and kick up tiny crowns; stacks increase the drip frequency while dark splats dry underfoot.",
  tags: ["blood", "bleed", "status", "dot", "loop"],
  size: [64, 72], origin: [32, 60], duration: 1.2, loop: true, fps: 30,
  bg: "ground", actor: 2,
  options: { palette: ["#2a0710", "#5c0b1a", "#8e1424", "#c0202e", "#e8483f", "#ff8a6a", "#fff1e8"], stacks: 1, seed: 5 },
};

export function draw(p, t, o) {
  const stacks = Number.isFinite(o.stacks) ? Math.max(0, Math.min(8, Math.floor(o.stacks))) : 1;
  if (!stacks) return;
  const C = fit(o.palette, 7), a = o.actor ?? stockActor(2), S = shape(a), R = new Rng(o.seed);
  // Sample only occupied torso pixels; dimensions follow a supplied 48px (or other) actor.
  const torso = S.body.filter(([x, y]) => y >= S.h * 0.36 && y <= S.h * 0.52 && Math.abs(x - S.w / 2) < S.w * 0.22);
  if (!torso.length) return;
  const n = stacks * 2, D = meta.duration, G = 740;
  t = ((t % D) + D) % D;
  for (let i = 0; i < n; i++) {
    const [mx, my] = torso[R.int(0, torso.length - 1)], x = a.x + mx, y0 = a.y + my;
    const vx = R.range(-5, 5), size = R.range(0.8, 1.5), ground = R.range(0, 2);
    const born = (i + R.range(0.1, 0.5)) * D / n;
    const age = ((t - born) % D + D) % D, gather = 0.16;
    const fall = Math.sqrt(2 * Math.max(1, ground - y0 - 2) / G), land = gather + fall;
    if (age < gather) {
      const u = age / gather;
      p.line(x, y0, x, y0 + 1 + u * 2, C[2], smooth(0, 0.25, u));
      p.ellipse(x, y0 + 1 + u * 2, size * u, size * u + 0.3, C[3]);
      if (u > 0.55) p.dot(x, y0 + u * 2, C[5], 0.8);
    } else if (age < land) {
      const f = age - gather, y = y0 + 2 + G * f * f / 2, dx = vx * f;
      p.line(x + dx, y - Math.min(4, G * f * 0.018), x + dx, y, C[2]);
      p.ellipse(x + dx, y, size, size + 0.4, C[3]);
      p.dot(x + dx - 0.5, y - 0.7, C[5], 0.85);
      p.dot(x + dx, y + 0.8, C[1], 0.9);
      p.light(x + dx, y, C[4], 0.08);
    } else {
      const hit = age - land, fade = 1 - smooth(0.22, 0.49, hit), lx = x + vx * fall;
      if (fade <= 0) continue;
      const spread = smooth(0, 0.07, hit), width = size * (1.4 + spread * 1.6);
      p.ellipse(lx, ground, width, 0.9, C[hit < 0.12 ? 2 : 1], fade);
      p.line(lx - width * 0.6, ground - 1, lx + width * 0.4, ground - 1, C[3], fade * 0.8);
      if (hit < 0.2) {
        for (const side of [-1, 1]) {
          const dx = side * (15 + size * 5) * hit, dy = -38 * hit + G * hit * hit / 2;
          if (dy > 0) continue;
          p.line(lx + dx * 0.6, ground + dy * 0.5, lx + dx, ground + dy, C[3], 1 - hit / 0.2);
          p.dot(lx + dx, ground + dy, hit < 0.06 ? C[5] : C[4], 1 - hit / 0.2);
        }
        p.glow(lx, ground, 3, C[3], 0.1 * (1 - hit / 0.2));
      }
    }
  }
}
