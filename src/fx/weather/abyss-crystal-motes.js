// Abyss ambience: a sparse drift of small violet crystal motes near the screen edges, rising at different
// speeds, and a faint breathing light on the edge crystals. Draws no floor, crystals, grass or sky, and leaves a
// clear rectangle (battle field, HP bars, buttons) empty.
import { fit, TAU, cycle, loopNoise } from "../../core/index.js";

const D = 8;
export const meta = {
  name: "Abyss crystal motes",
  desc: "Sparse violet crystal motes drift up near the screen edges at different speeds while the edge light breathes. A clear centre stays empty.",
  tags: ["weather", "ambient", "motes", "crystal", "abyss", "loop"],
  size: [320, 180], origin: [160, 90], duration: D, loop: true, fps: 30, bg: "dark",
  // clear: [x, y, w, h] in px from the origin left empty; density 0.5 for low-end devices
  options: { palette: ["#140d27", "#352052", "#66358c", "#a65ada", "#d9a2ff", "#f2d6ff"], clear: [-110, -60, 220, 120], density: 1, seed: 7 },
};

export function draw(p, t, o) {
  const C = fit(o.palette, 6), [cx, cy, cw, ch] = o.clear, n = Math.round(16 * Math.max(0, o.density));
  const blocked = (x, y) => x > cx && x < cx + cw && y > cy && y < cy + ch;
  // edge breathing: 4 s period (two per loop), soft light only
  const breath = 0.5 + 0.5 * Math.cos((TAU * 2 * t) / D);
  for (const [x, y] of [[-150, 60], [-152, -10], [150, 55], [148, -20], [-120, 82], [124, 84]]) p.glow(x, y, 28, C[3], 0.07 + 0.08 * breath);
  cycle(t, D, n, o.seed * 29 + 3, (g) => g.range(4, 7.5), (age, life, r, i) => {
    const q = age / life, side = r.sign(), x0 = side * r.range(110, 144), y0 = r.range(20, 88), speed = r.range(14, 34);
    const x = x0 + Math.sin(q * TAU * r.range(0.6, 1.4) + r.range(0, TAU)) * r.range(3, 8) + 4 * loopNoise(t / D, 1, i * 5), y = y0 - speed * age;
    if (blocked(x, y) || y < -86) return;
    const a = Math.min(1, q * 5) * (q > 0.75 ? (1 - q) / 0.25 : 1) * (0.65 + 0.35 * Math.sin(age * r.range(3, 6)));
    const big = i % 5 === 0;
    p.dot(x, y, big ? C[5] : C[4], a);
    if (big) { p.dot(x + 1, y, C[4], 0.7 * a); p.dot(x, y + 1, C[3], 0.6 * a); }
    p.glow(x, y, big ? 5 : 3.5, C[3], (big ? 0.42 : 0.28) * a);
  });
}
