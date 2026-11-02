import { Rng, fit, smooth, clamp, sparkle, TAU, READY } from "../../core/index.js";

export const meta = {
  name: "Dark wave",
  desc: "A hollow wave of midnight shadow rolls outward to radius 110, its ragged violet lip shedding bright embers while the dark wake thins away.",
  tags: ["shadow", "wave", "aoe", "pulse", "one-shot"],
  size: [260, 130], origin: [130, 96], duration: 1, loop: false, fps: 30,
  bg: "ground", actor: 2,
  options: { palette: ["#0b0614", "#22113a", "#3d1d63", "#6a2d8f", "#a04ccf", "#e0a8ff"], seed: 13 },
};
const RELEASE = 0.06, CY = -8, SY = 0.3;
const radius = t => 110 * (1 - (1 - clamp((t - RELEASE) / 0.57)) ** 3);
export const act = {
  poses: [[-0.22, READY], [0, { turn: 1, crouch: 4, fx: -8, fy: -28, bx: 8, by: -28 }],
    [RELEASE, { turn: 1, lean: 2, fx: -15, fy: -23, bx: 15, by: -23 }, "snap"],
    [0.5, { turn: 1, fx: -12, fy: -20, bx: 12, by: -20 }], [1, READY]],
  hits: [{ t: RELEASE, shake: 0.12, amp: 1, target: false }],
};
export function create(o) {
  const C = fit(o.palette, 6), R = new Rng(o.seed), phase = R.range(0, TAU);
  const embers = Array.from({ length: 52 }, () => ({
    a: R.range(0, TAU), start: R.range(0.12, 0.49), speed: R.range(15, 35),
    life: R.range(0.2, 0.38), lift: R.range(5, 20), size: R.range(0.5, 1.3),
  }));
  let elapsed = 0, t = 0;
  function layer(p, back) {
    if (t >= meta.duration || t < RELEASE) return;
    const r = radius(t), fade = 1 - smooth(0.52, 0.9, t), width = 7 + r * 0.17;
    if (fade > 0 && r > 1) {
      p.shade(-r - 4, CY - r * SY - 3, r + 4, CY + r * SY + 3, (x, y, out) => {
        if ((y < CY) !== back) return;
        const d = Math.hypot(x, (y - CY) / SY), a = Math.atan2((y - CY) / SY, x);
        const edge = r + Math.sin(a * 17 + phase + t * 7) * 1.5;
        const thickness = width * (0.75 + 0.25 * Math.sin(a * 11 + phase + t * 3));
        const u = (edge - d) / thickness;
        if (u < 0 || u > 1) return;
        out.c = u < 0.08 ? C[5] : u < 0.2 ? C[4] : u < 0.45 ? C[3] : u < 0.7 ? C[2] : C[1];
        out.a = fade * (back ? 0.85 : 0.95) * (u < 0.6 ? 1 : (1 - u) / 0.4);
      });
      for (let i = 0; i < 28; i++) {
        const a = i * TAU / 28;
        if ((Math.sin(a) < 0) !== back) continue;
        p.glow(Math.cos(a) * r, CY + Math.sin(a) * r * SY, 6, C[3], fade * 0.17);
      }
    }
    for (const [i, e] of embers.entries()) {
      if ((Math.sin(e.a) < 0) !== back) continue;
      const age = t - e.start, u = age / e.life;
      if (u < 0 || u >= 1) continue;
      const r = radius(e.start) + e.speed * age;
      const x = Math.cos(e.a) * r, y = CY + Math.sin(e.a) * r * SY - e.lift * age + 10 * age * age;
      const fade = smooth(0, 0.08, u) * (1 - smooth(0.4, 1, u));
      if (i < 18) {
        p.disc(x, y + 1, 3 + u * 3, C[1], fade * 0.25);
        p.disc(x, y - 1, 2 + u * 2, C[3], fade * 0.12);
      }
      p.line(x - Math.cos(e.a) * 2.5, y + 1, x, y, C[3], fade);
      p.disc(x, y, e.size, C[4], fade * 0.7);
      p.dot(x, y, u < 0.5 ? C[5] : C[4], fade);
      p.glow(x, y, 3, C[4], fade * 0.22);
    }
  }
  return {
    update(dt) { elapsed += dt; t = Math.round(elapsed * 1e9) / 1e9; },
    drawBack(p) { layer(p, true); },
    draw(p) {
      layer(p, false);
      const age = t - RELEASE;
      if (t >= meta.duration || age < 0 || age >= 0.12) return;
      const k = 1 - age / 0.12;
      sparkle(p, 0, CY, 11 * k, C[5], C[3], k);
      p.glow(0, CY, 26, C[3], k * 0.35);
    },
  };
}
