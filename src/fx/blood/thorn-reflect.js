import { Rng, fit, smooth, sparkle } from "../../core/index.js";

export const meta = {
  name: "Thorn reflect",
  desc: "A sharp blood-red hit flashes, then five to seven barbed shards kick back toward the attacker, trailing thin red wakes and cooling away in midair.",
  tags: ["blood", "reflect", "thorn", "hit", "directional", "one-shot"],
  size: [64, 64], origin: [32, 32], duration: 0.4, loop: false, fps: 30,
  bg: "dark",
  options: { palette: ["#2a0710", "#5c0b1a", "#8e1424", "#c0202e", "#e8483f", "#ff8a6a", "#fff1e8"], seed: 6 },
};

export function create(o) {
  const C = fit(o.palette, 7), R = new Rng(o.seed), count = R.int(5, 7);
  const shards = Array.from({ length: count }, (_, i) => {
    const a = -0.85 + i * 1.7 / (count - 1) + R.range(-0.06, 0.06);
    return { a, speed: R.range(78, 108), length: R.range(8, 12), width: R.range(1.3, 2.2),
      spin: R.range(-1.1, 1.1), start: R.range(0, 0.016), life: R.range(0.28, 0.38) };
  });
  let elapsed = 0, t = 0;
  return {
    update(dt) { elapsed += dt; t = Math.round(elapsed * 1e9) / 1e9; },
    draw(p) {
      if (t >= meta.duration) return;
      if (t < 0.1) {
        const k = 1 - t / 0.1;
        sparkle(p, 0, 0, 7 * k, C[6], C[3], k);
        p.glow(0, 0, 13, C[4], 0.5 * k * k);
      }
      for (const s of shards) {
        const u = t - s.start;
        if (u < 0 || u >= s.life) continue;
        const travel = s.speed * (1 - Math.exp(-3.5 * u)) / 3.5;
        const x = Math.cos(s.a) * travel, y = Math.sin(s.a) * travel + 16 * u * u;
        const a = s.a + s.spin * u, ca = Math.cos(a), sa = Math.sin(a);
        const fade = 1 - smooth(s.life * 0.6, s.life, u), grow = 0.5 + 0.5 * smooth(0, 0.025, u);
        const L = s.length * grow, W = s.width;
        const at = (dx, dy) => [x + ca * dx - sa * dy, y + sa * dx + ca * dy];
        const tail = at(-L * 0.65, 0), tip = at(L * 0.5, 0);
        // A faceted splinter with two backwards-facing barbs, rather than a solid beam.
        const outline = [[-L * 0.65, 0], [-L * 0.12, -W], [-L * 0.3, -W * 1.7],
          [L * 0.12, -W * 0.6], [L * 0.5, 0], [0, W], [-L * 0.22, W * 1.6], [-L * 0.17, W * 0.5]];
        p.poly(outline.map(v => at(...v)), C[2], fade);
        p.poly([tail, at(-L * 0.1, -W), tip, at(0, 0)], C[4], fade);
        p.line(...tail, ...tip, C[3], fade);
        p.line(...at(-L * 0.3, -W * 1.7), ...at(-L * 0.12, -W), C[4], fade);
        p.line(...at(0, -0.5), ...tip, C[5], fade);
        p.dot(...tip, u < 0.12 ? C[6] : C[5], fade);
        const wake = Math.min(13, travel * 0.65);
        p.glowLine(x - ca * (L + wake), y - sa * (L + wake), ...tip, 5, C[3], fade * (1 - smooth(.08, .28, u)) * .3);
        p.line(x - ca * (L * 0.65 + wake), y - sa * (L * 0.65 + wake), ...tail, C[2], fade * 0.5);
        p.glow(...tip, 4, C[4], fade * 0.24);
      }
    },
  };
}
