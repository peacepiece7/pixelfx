// Embers rising off a volcanic floor: sparks lift from a few vents, drift on a slow sway, cool from white-gold
// through orange to deep red and wink out. A transparent ambient overlay for scenery, kept sparse.
import { fit, TAU, loopNoise, cycle, WHITE } from "../../core/index.js";

const D = 8;

export const meta = {
  name: "Embers",
  desc: "Embers drift up from lava cracks on a slow sway, cooling from gold to deep red and winking out. A sparse transparent overlay for volcanic scenery.",
  tags: ["weather", "embers", "fire", "volcano", "lava", "ambient", "loop"],
  size: [320, 180],
  origin: [160, 170],
  duration: D,
  loop: true,
  fps: 30,
  bg: "dark",
  // density scales the spark count; vents are x positions (px from the origin) sparks rise from
  options: {
    palette: ["#3a0d08", "#6e1a0c", "#a8320f", "#e0581a", "#ff8f2e", "#ffc65a", "#fff0b0"],
    density: 1, seed: 5,
  },
};

const VENTS = [-120, -64, -14, 38, 96, 134];

export function draw(p, t, o) {
  const C = fit(o.palette, 7), n = Math.round(58 * Math.max(0, o.density));
  cycle(t, D, n, o.seed * 13 + 1, (g) => g.range(2.6, 5.2), (age, life, r, i) => {
    const q = age / life, vent = VENTS[r.int(0, VENTS.length - 1)] + r.range(-10, 10), rise = r.range(0.7, 0.95);
    const sway = r.range(6, 16), ph = r.range(0, TAU), big = r.chance(0.32);
    // lifts fast off the crack, then floats; the sway widens as it climbs
    const climb = 168 * rise * (1 - Math.pow(1 - q, 1.6));
    const x = vent + Math.sin(ph + q * TAU * r.range(0.6, 1.2)) * sway * q + 9 * loopNoise(t / D, 1, i * 7) * q, y = -2 - climb;
    // cooling: gold, orange, red, ember-dark; a flicker on the way
    const heat = 1 - q, flick = 0.75 + 0.25 * Math.sin(age * r.range(9, 17) + ph);
    const c = heat > 0.8 ? (big ? WHITE : C[6]) : heat > 0.6 ? C[5] : heat > 0.4 ? C[4] : heat > 0.22 ? C[3] : C[2];
    const a = Math.min(1, q * 8) * (q > 0.82 ? (1 - q) / 0.18 : 1) * flick;
    if (a < 0.08) return;
    // a short tail trailing below, longer while it's still rising fast
    const tail = big ? 3 : 2;
    p.line(x, y, x - Math.cos(ph + q * 4) * 0.6, y + tail * (0.6 + heat), C[Math.max(2, (c === WHITE ? 6 : C.indexOf(c)) - 2)], a * 0.55);
    p.dot(x, y, c, a);
    if (big) {
      p.dot(x + 1, y, c, a * 0.7);
      p.glow(x, y, 6, C[4], 0.45 * a * (0.4 + heat));
    } else p.glow(x, y, 3.5, C[4], 0.28 * a * (0.3 + heat));
  });
  // a low warm haze breathing over the vents
  for (const v of VENTS) p.glow(v, -2, 16, C[3], 0.06 + 0.03 * Math.sin((TAU * t) / D + v));
}
