import { Rng, fit, smooth, clamp, band, sparkle, TAU, READY } from "../../core/index.js";

export const meta = {
  name: "Vampire awaken",
  desc: "Crimson moonlight climbs behind the caster; a flock of flapping bats bursts free as a dark ring opens to radius 90 and the last moon glow dies.",
  tags: ["shadow", "vampire", "transform", "bats", "moon", "one-shot"],
  size: [200, 160], origin: [100, 130], duration: 1.6, loop: false, fps: 30,
  bg: "ground", actor: 2,
  options: { palette: ["#0b0614", "#22113a", "#3d1d63", "#6a2d8f", "#a04ccf", "#e0a8ff"],
    moonlight: ["#300818", "#80182c", "#ce3855", "#ffb4ba"], seed: 15 },
};
export const act = {
  poses: [[-0.22, READY], [0, { crouch: 4, turn: 1, fx: -7, fy: -26, bx: 8, by: -26 }],
    [0.24, { turn: 1, fx: -13, fy: -37, bx: 13, by: -37 }, "snap"],
    [0.65, { turn: 1, fx: -14, fy: -26, bx: 14, by: -26 }], [1.6, READY]],
  hits: [{ t: 0.24, shake: 0.16, amp: 1.5, target: false }],
};
export function create(o) {
  const C = fit(o.palette, 6), M = fit(o.moonlight, 4), R = new Rng(o.seed), count = R.int(20, 30);
  const bats = Array.from({ length: count }, (_, i) => ({
    side: i % 2 ? -1 : 1, target: R.range(30, 83), rise: R.range(15, 72),
    start: R.range(0.22, 0.44), life: R.range(0.65, 0.95), scale: R.range(0.85, 1.25),
    phase: R.range(0, TAU), back: i % 3 === 0,
  }));
  let elapsed = 0, t = 0;
  function ring(p, back) {
    if (t >= meta.duration) return;
    const k = smooth(0.12, 0.45, t), fade = 1 - smooth(1.05, 1.6, t);
    band(p, 0, 0, 90 * k, 0.22, 7, fade * k, [C[0], C[0], C[1], C[2]], a => (Math.sin(a) < 0) === back);
    band(p, 0, 0, 90 * k, 0.22, 0.8, fade * k * 0.65, [C[1], C[2], C[3], C[4]], a => (Math.sin(a) < 0) === back);
  }
  function flock(p, back) {
    if (t >= meta.duration) return;
    for (const b of bats) {
      if (b.back !== back) continue;
      const u = (t - b.start) / b.life;
      if (u < 0 || u >= 1) continue;
      const spread = 1 - (1 - u) ** 2, x = b.side * (3 + b.target * spread), y = -28 - b.rise * u + Math.sin(u * TAU + b.phase) * 3;
      const fade = smooth(0, 0.07, u) * (1 - smooth(0.72, 1, u));
      const flap = [ -1, -0.3, 0.7, 0.1 ][Math.floor((t - b.start) * 28 + b.phase) % 4];
      const s = b.scale, body = back ? C[2] : C[3], edge = back ? C[3] : C[4];
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
      ring(p, true);
      const fade = smooth(0, 0.08, t) * (1 - smooth(0.3, 0.7, t)), h = 110 * smooth(0, 0.18, t);
      if (fade > 0) {
        for (let y = 0; y <= h; y++) {
          const q = y / Math.max(1, h), x = Math.sin(q * 7 - t * 9) * 3 * q, width = (14 - q * 9) * (0.8 + Math.sin(q * 13 + t * 8) * 0.1);
          p.disc(x, -y, width * 0.8, M[1], fade * 0.055);
          p.line(x - width, -y, x + width, -y, M[0], fade * 0.65);
          p.line(x - width * 0.45, -y, x + width * 0.3, -y, M[1], fade);
          p.dot(x - width * 0.2, -y, M[2], fade);
          p.blend(x - width * 0.45, -y, M[3], fade * 0.4);
        }
        p.glowLine(0, -3, 0, -h, 12, M[2], fade * 0.25);
        p.glow(0, -25, 28, M[1], fade * 0.3);
      }
      flock(p, true);
    },
    draw(p) {
      if (t >= meta.duration) return;
      ring(p, false); flock(p, false);
      const age = t - 0.22;
      if (age >= 0 && age < 0.16) {
        const k = 1 - age / 0.16;
        sparkle(p, 0, -25, 9 * k, M[3], C[4], k);
        p.glow(0, -22, 21, M[2], k * 0.4);
      }
    },
  };
}
