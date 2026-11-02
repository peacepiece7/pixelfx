import { Rng, fit, smooth, clamp, TAU, band, sparkle } from "../../core/index.js";

export const meta = {
  name: "Rosilia support shot",
  desc: "A compact reticle marks the strike point. Each external pulse drives a heavy round from the upper left, fractures the ground and throws stone, brass and dust outward.",
  tags: ["projectiles", "impact", "debris", "loop"],
  size: [200, 120], origin: [100, 87], duration: 2, loop: true, fps: 30, bg: "ground",
  options: {
    palette: ["#251b19", "#564239", "#866a46", "#b59a63", "#ddc98a", "#f7e9bd", "#ffffff"],
    radius: 90, seed: 17, pulse: 0,
  },
};

export function drawBack(p, t, o) {
  const C = fit(o.palette, 7), r = o.radius, k = clamp(o.pulse ?? 0);
  band(p, 0, 0, r, 0.24, 0.8, 0.5, [C[0], C[1], C[2], C[3]]);
  for (const s of [-1, 1]) {
    p.line(s * (r - 7), 0, s * (r + 4), 0, C[3], 0.7);
    p.line(0, s * r * 0.18, 0, s * r * 0.27, C[3], 0.7);
  }
  if (!k) return;
  const R = new Rng(o.seed), age = (1 - k) * 0.35, spread = smooth(0, 0.13, age);
  // Dark broken ground, with thin warm edges rather than fire or a magic seal.
  p.ellipse(0, 0, 17 * spread, 4 * spread, C[0], k);
  for (let i = 0; i < 11; i++) {
    const a = i * TAU / 11 + R.range(-0.15, 0.15), length = R.range(30, 61) * spread;
    const pts = Array.from({ length: 5 }, (_, j) => {
      const d = j / 4 * length;
      return [Math.cos(a) * d + R.range(-2, 2), Math.sin(a) * d * 0.3 + R.range(-1, 1)];
    });
    p.polyline(pts.map(([x, y]) => [x, y + 1]), C[0], k);
    p.polyline(pts, C[2], k);
  }
  band(p, 0, 0, 7 + 55 * spread, 0.26, 3 * k + 1, k * 0.7, [C[0], C[1], C[2], C[3]]);
}

export function draw(p, t, o) {
  const k = clamp(o.pulse ?? 0);
  if (!k) return;
  const C = fit(o.palette, 7), R = new Rng(o.seed), age = (1 - k) * 0.35;
  const strike = 1 - smooth(0.025, 0.09, age);
  // Thick pointed slug and tapered wake: upper left -> lower right, into the ground.
  if (strike > 0) {
    p.beam(-82, -80, -3, -4, 5, C[3], strike);
    p.beam(-57, -56, -3, -4, 2.5, C[5], strike);
    p.poly([[-20, -27], [-11, -31], [5, 2], [-2, 1]], C[4], strike);
    p.line(-15, -25, 1, -2, C[6], strike);
    p.glowLine(-60, -60, 0, -2, 7, C[4], strike * 0.2);
  }
  sparkle(p, 0, -2, 15 * strike, C[6], C[4], strike);
  p.glow(0, -2, 23, C[4], strike * 0.35);
  // Heavy irregular rock chunks lift and tumble, with a few small brass fragments.
  for (let i = 0; i < 28; i++) {
    const a = R.range(0, TAU), speed = R.range(70, 190), lift = R.range(70, 185);
    const x = Math.cos(a) * speed * age, floor = Math.sin(a) * speed * age * 0.23;
    const y = floor - lift * age + 420 * age * age, size = R.range(1.6, 4);
    const rotation = R.range(0, TAU) + age * R.range(-12, 12);
    const pts = Array.from({ length: 5 }, (_, j) => {
      const th = rotation + j * TAU / 5;
      return [x + Math.cos(th) * size, y + Math.sin(th) * size * 0.7];
    });
    p.poly(pts, C[i % 5 === 0 ? 3 : 1], k);
    p.line(...pts[0], ...pts[1], C[i % 5 === 0 ? 5 : 2], k);
    if (i % 2 === 0) p.disc(x, floor - 1, 3 + age * 17, C[2], k * (1 - k) * 0.5);
  }
}
