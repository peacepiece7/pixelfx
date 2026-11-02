// The shaded anger mark is adapted from Sprite Fusion's open-source heal
// (https://www.spritefusion.com/pixel-art-vfx/heal), MIT License, Copyright (c) 2026 Hugo Duprez.
import { fit, rand, TAU } from "../../core/index.js";
import { icon, bitmap } from "./_lib.js";

export const meta = {
  name: "Rage",
  desc: "An anger mark hovers above the head. Paired blood-red bursts throw short rays and rising sparks outward, leaving the hero's body clear.",
  tags: ["status", "rage", "berserk", "anger", "buff", "loop"],
  size: [80, 96],
  origin: [40, 88],
  duration: 1.2,
  loop: true,
  fps: 30,
  bg: "ground",
  options: {
    palette: ["#2a0710", "#5c0b1a", "#8e1424", "#c0202e", "#e8483f", "#ff8a6a", "#fff1e8"],
    headY: -58,
    scale: 1,
    seed: 6,
  },
};

const MARK = bitmap(["...#.#...", "...#.#...", "..##.##..", "###...###", ".........", "###...###", "..##.##..", "...#.#...", "...#.#..."]);
const since = (t, at) => ((t - at) % meta.duration + meta.duration) % meta.duration;

export function draw(p, t, o) {
  const C = fit(o.palette, 7), y = o.headY, s = o.scale;
  // The marker stays readable between bursts; the body is never repainted.
  icon(p, 0, y, 5 * s, MARK, [C[0], C[3], C[4], C[5]]);
  p.glow(0, y, 8 * s, C[3], 0.15);
  for (const [at, power] of [[0.05, 1], [0.3, 0.65]]) {
    const age = since(t, at), life = 0.38;
    if (age >= life) continue;
    const u = age / life, fade = (1 - u) ** 2;
    p.glow(0, y, (7 + 6 * u) * s, C[4], fade * power * 0.45);
    for (let i = 0; i < 8; i++) {
      const a = i * TAU / 8 + rand(i, o.seed) * 0.25;
      const r = (5 + 9 * u) * s, len = (2 + 4 * (1 - u)) * s * power;
      const ca = Math.cos(a), sa = Math.sin(a);
      p.line(ca * r, y + sa * r, ca * (r + len), y + sa * (r + len), C[u < 0.2 ? 6 : 4], fade);
      const sx = ca * (6 + 12 * u) * s, sy = y + sa * (6 + 8 * u) * s - 5 * u * s;
      p.dot(sx, sy, C[5], fade * power);
    }
  }
}
