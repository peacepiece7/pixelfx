import { haze, pool, softBand } from "../_soft.js";
import { Rng, fit, smooth,  TAU, READY } from "../../core/index.js";

export const meta = {
  name: "Vampire awaken",
  desc: "A dense cascade of ninety bats pours across the caster and scatters outward in overlapping waves above a dark ground ring; no central pillar.",
  tags: ["shadow", "vampire", "transform", "bats", "moon", "one-shot"],
  size: [200, 160], origin: [100, 130], duration: 1.6, loop: false, fps: 30,
  bg: "ground", actor: 2,
  options: { palette: ["#0b0614", "#22113a", "#3d1d63", "#6a2d8f", "#a04ccf", "#e0a8ff"],
    bats: 90, seed: 15 },
};
export const act = {
  poses: [[-0.22, READY], [0, { crouch: 4, turn: 1, fx: -7, fy: -26, bx: 8, by: -26 }],
    [0.24, { turn: 1, fx: -13, fy: -37, bx: 13, by: -37 }, "snap"],
    [0.65, { turn: 1, fx: -14, fy: -26, bx: 14, by: -26 }], [1.6, READY]],
  hits: [{ t: 0.24, shake: 0.16, amp: 1.5, target: false }],
};
export function create(o) {
  const C = fit(o.palette, 6), R = new Rng(o.seed), count = o.bats;
  const bats = Array.from({ length: count }, (_, i) => ({
    side: i % 2 ? -1 : 1, target: R.range(35, 76), rise: R.range(20, 60),
    start: R.range(0.06, 0.66), life: R.range(0.6, 0.9), scale: R.range(1, 1.5),
    x: R.range(-7, 7), y: R.range(-44, -8),
    phase: R.range(0, TAU),
  }));
  let elapsed = 0, t = 0;
  function ring(p, back) {
    if (t >= meta.duration) return;
    const k = smooth(0.12, 0.45, t), fade = 1 - smooth(1.05, 1.6, t);
    softBand(p, 0, 0, 90 * k, 0.22, 7, fade * k, [C[0], C[0], C[1], C[2]], a => (Math.sin(a) < 0) === back);
    softBand(p, 0, 0, 90 * k, 0.22, 0.8, fade * k * 0.65, [C[1], C[2], C[3], C[4]], a => (Math.sin(a) < 0) === back);
  }
  function flock(p) {
    if (t >= meta.duration) return;
    for (const b of bats) {
      const u = (t - b.start) / b.life;
      if (u < 0 || u >= 1) continue;
      const spread = 1 - (1 - u) ** 2, x = b.x + b.side * b.target * spread, y = b.y - b.rise * u + Math.sin(u * TAU + b.phase) * 3;
      const fade = smooth(0, 0.025, u) * (1 - smooth(0.72, 1, u));
      const flap = [ -1, -0.3, 0.7, 0.1 ][Math.floor((t - b.start) * 28 + b.phase) % 4];
      const s = b.scale, body = C[2], edge = C[4];
      if (b.scale > 1.35) {
        haze(p,x-b.side*5,y+2,7+u*4,C[2],fade*.22);
        p.glow(x,y,6,C[3],fade*.06);
      }
      for (const side of [-1, 1]) {
        const points = [[0, 0], [side * 3 * s, -2 * s], [side * 7 * s, flap * 4 * s],
          [side * 4.5 * s, (flap * 2 + 1.5) * s], [side * 3 * s, 1.1 * s], [side * 1.5 * s, 2 * s]];
        p.poly(points.map(([dx, dy]) => [x + dx, y + dy]), body, fade);
        p.polyline([[x, y], [x + side * 3 * s, y - 2 * s], [x + side * 7 * s, y + flap * 4 * s]], edge, fade);
      }
      p.ellipse(x, y, s, 2 * s, C[1], fade);
      p.tri(x - s, y - s, x - s, y - 4 * s, x, y - 2 * s, edge, fade);
      p.tri(x, y - 2 * s, x + s, y - 4 * s, x + s, y - s, edge, fade);
      p.dot(x, y - 1, C[5], fade * 0.65);
    }
  }
  return {
    update(dt) { elapsed += dt; t = Math.round(elapsed * 1e9) / 1e9; },
    drawBack(p) {
      if (t >= meta.duration) return;
      pool(p,0,-1,74,18,C[3],smooth(0,.2,t)*(1-smooth(.6,1.6,t))*.28);
      ring(p, true);
      ring(p, false);
    },
    draw(p) {
      // The entire swarm passes in front of the caster, including its central launch area.
      flock(p);
    },
  };
}
