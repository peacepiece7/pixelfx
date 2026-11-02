import { Rng, fit, crystal, band, sparkle, smooth, READY, TAU } from "../../core/index.js";

export const meta = {
  name: "Freeze slam",
  desc: "A landing flash drives a radial crown of ice to radius 90; frost mist rolls between the spikes, fractures light up and the crown bursts into falling splinters.",
  tags: ["ice", "slam", "landing", "aoe", "shatter", "one-shot"],
  size: [200, 120], origin: [100, 91], duration: 1.6, loop: false, fps: 30,
  bg: "ground", actor: 2,
  options: { palette: ["#151a3d", "#212f6b", "#2c58aa", "#3a8bd8", "#62c8f4", "#a6ecff", "#dcfbff", "#ffffff"], seed: 12 },
};
export const act = {
  poses: [[-0.3, { ...READY, y: -24, fx: -7, fy: -40, bx: 8, by: -40 }],
    [0, { crouch: 8, lean: 3, fx: -9, fy: -8, bx: 10, by: -8 }, "snap"],
    [0.35, { crouch: 5, fx: -9, fy: -16, bx: 10, by: -16 }], [1.6, READY]],
  hits: [{ t: 0, stop: 0.06, shake: 0.2, amp: 2, target: false }],
};
export function create(o) {
  const C = fit(o.palette, 8), R = new Rng(o.seed);
  const sites = [];
  for (let ring = 0; ring < 3; ring++) {
    const radius = [23, 54, 88][ring], n = [5, 8, 10][ring];
    for (let i = 0; i < n; i++) {
      const a = (i + 0.3 * (ring % 2)) * TAU / n, x = Math.cos(a) * radius, y = Math.sin(a) * radius * 0.17;
      const h = R.range(34, 49) * (1 - ring * 0.24), lean = Math.cos(a) * R.range(4, 9);
      sites.push({ x, y, h, lean, w: R.range(10, 15) * (1 - ring * 0.16), back: y < 0,
        born: 0.025 + radius / 450 + R.range(0, 0.03), break: R.range(0.92, 1.08),
        chips: Array.from({ length: 3 }, () => ({ q: R.range(0.25, 0.95), vx: R.range(-16, 16), vy: R.range(-36, -15), size: R.range(1.5, 3), spin: R.range(-9, 9) })) });
    }
  }
  const mist = Array.from({ length: 22 }, () => ({ x: R.range(-80, 80), y: R.range(-5, 8), size: R.range(4, 8), phase: R.range(0, TAU), start: R.range(0.25, 0.5) }));
  let elapsed = 0, t = 0;
  function layer(p, back) {
    if (t >= meta.duration) return;
    const floorFade = 1 - smooth(1.12, 1.6, t), spread = smooth(0, 0.28, t);
    band(p, 0, 0, 90 * spread, 0.19, 1.5, (1 - smooth(0.25, 0.65, t)) * spread, C, a => (Math.sin(a) < 0) === back);
    for (const s of sites) {
      if (s.back !== back || t < s.born) continue;
      const rise = smooth(s.born, s.born + 0.09, t), age = t - s.break;
      if (back) p.line(0, 0, s.x * spread, s.y * spread, C[3], floorFade * 0.4);
      p.ellipse(s.x, s.y, s.w * 0.65, 1.5, C[3], floorFade * rise * 0.3);
      if (age < 0) {
        crystal(p, s.x, s.y, s.h * rise, s.w * rise, s.lean * rise, C, { a: back ? 0.85 : 1, glint: (t - s.born) * 1.8 });
        p.glow(s.x + s.lean, s.y - s.h * rise, 5, C[4], rise * 0.12);
        const crack = smooth(s.break - 0.24, s.break - 0.03, t);
        if (crack > 0) {
          const y = s.y - s.h * 0.48, x = s.x + s.lean * 0.48;
          p.polyline([[x - s.w * 0.22, y - 3], [x + 1, y], [x - 1, y + 3], [x + s.w * 0.2, y + 5]], C[6], crack);
          p.glow(x, y, 5, C[4], crack * 0.2);
        }
      } else if (age < 0.45) {
        const fade = 1 - smooth(0.16, 0.45, age);
        for (const b of s.chips) {
          const x = s.x + s.lean * b.q + (b.vx - s.x * 0.12) * age, y = Math.min(s.y, s.y - s.h * b.q + b.vy * age + 150 * age * age);
          const a = age * b.spin, dx = Math.cos(a) * b.size, dy = Math.sin(a) * b.size;
          p.poly([[x + dx, y + dy], [x - dy * 0.4, y + dx * 0.4], [x - dx, y - dy], [x + dy * 0.4, y - dx * 0.4]], C[4], fade);
          p.line(x - dx, y - dy, x + dx, y + dy, C[6], fade);
        }
      }
    }
    for (const m of mist) {
      if ((m.y < 0) !== back) continue;
      const age = t - m.start;
      if (age < 0) continue;
      const k = smooth(0, 0.16, age) * (1 - smooth(0.65, 1.05, age));
      const x = m.x + Math.sin(m.phase + age * 2) * 4, y = m.y - age * 8, r = m.size * (0.7 + age * 0.7);
      p.disc(x, y, r, C[3], k * 0.17);
      p.disc(x - 1, y - r * 0.35, r * 0.7, C[5], k * 0.15);
    }
  }
  return {
    update(dt) { elapsed += dt; t = Math.round(elapsed * 1e9) / 1e9; },
    drawBack(p) { layer(p, true); },
    draw(p) {
      layer(p, false);
      if (t >= meta.duration) return;
      if (t < 0.14) {
        const k = 1 - t / 0.14;
        sparkle(p, 0, -3, 22 * k, C[7], C[4], k);
        p.ellipse(0, 0, 20 * k, 4 * k, C[6], k);
        p.glow(0, -5, 40, C[5], k * 0.7);
      }
      if (t < 0.9) p.glow(0, -5, 30, C[4], 0.15 * (1 - t / 0.9));
    },
  };
}
