import { haze } from "../_soft.js";
import { Rng, fit, smooth, TAU } from "../../core/index.js";
import { drawLeaf } from "./_lib.js";

export const meta = {
  name: "Pull vortex",
  desc: "Dust, grit and dry grass spiral inward from every direction along the floor, converging on the slam point in front of the caster.",
  tags: ["nature", "wind", "pull", "vortex", "charge", "ground", "loop"],
  size: [144, 80], origin: [20, 48], duration: 2, loop: true, fps: 30,
  bg: "ground", actor: 2,
  options: {
    palette: ["#2b2116", "#5a4632", "#8c6e4a", "#c2a172", "#e8d6a8"],
    centerX: 56, radius: 52, seed: 8,
  },
};
const wrap = u => ((u % 1) + 1) % 1;
// Radius decreases faster near the end: all paths terminate at the same ground point.
function point(u, phase, o) {
  const r = o.radius * (1 - u ** 1.6), a = phase + u * TAU * 0.55;
  return { x: o.centerX + Math.cos(a) * r, y: Math.sin(a) * r * 0.4, r };
}

export function drawBack(p, t, o) {
  const C = fit(o.palette, 5), R = new Rng(o.seed), time = wrap(t / meta.duration);
  // Short curved streaks show 360-degree convergence without a funnel or upright column.
  for (let i = 0; i < 30; i++) {
    const phase = i * TAU / 30 + R.range(-0.08, 0.08), born = R.next();
    const u = wrap(time * 2 - born), fade = smooth(0, 0.12, u) * (1 - smooth(0.88, 1, u));
    let prev = point(u, phase, o);
    p.glow(prev.x, prev.y, 5, C[3], fade * .08);
    for (let j = 1; j <= 10; j++) {
      const age = u - j * 0.009;
      if (age < 0) break;
      const tail = point(age, phase, o);
      p.line(prev.x, prev.y, tail.x, tail.y, C[j < 3 ? 4 : j < 7 ? 3 : 2], fade * (1 - j / 11));
      prev = tail;
    }
  }
  for (let i = 0; i < 48; i++) {
    const phase = R.range(0, TAU), born = R.next(), size = R.range(1, 2.5);
    const u = wrap(time * (i % 3 === 0 ? 1 : 2) - born), v = point(u, phase, o);
    const fade = smooth(0, 0.12, u) * (1 - smooth(0.87, 1, u));
    if (i < 30) {
      haze(p, v.x, v.y - 1, size * (1 + u * 1.7), C[2], fade * 0.38);
      p.blend(v.x, v.y - 1, C[3], fade * 0.25);
    } else if (i < 38) {
      drawLeaf(p, v.x, v.y - 1, 4, 0.7, phase + u * 8, u * 9 + phase, [C[0], C[3], C[1], C[2]], fade);
    } else {
      p.line(v.x, v.y, v.x + 1, v.y - 1, C[1], fade);
      p.dot(v.x, v.y - 1, C[3], fade);
    }
  }
  // Low dust at the impact point stays flat against the floor and behind the hero.
  p.ellipse(o.centerX, 0, 5, 2, C[1], 0.5);
  haze(p, o.centerX, -1, 3, C[2], 0.22);
}

// This is entirely a floor effect, including particles on the near side.
export function draw() {}
