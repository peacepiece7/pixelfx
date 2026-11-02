import { Rng, fit, smooth, TAU } from "../../core/index.js";
import { drawLeaf } from "./_lib.js";

export const meta = {
  name: "Pull vortex",
  desc: "A fan of earth-coloured wind coils inward from the right; rolling dust, tumbling grit and dry grass accelerate left into the caster's grasp.",
  tags: ["nature", "wind", "pull", "vortex", "charge", "directional", "loop"],
  size: [120, 80], origin: [8, 61], duration: 2, loop: true, fps: 30,
  bg: "ground", actor: 2,
  options: { palette: ["#2b2116", "#5a4632", "#8c6e4a", "#c2a172", "#e8d6a8"], seed: 8 },
};
const wrap = u => ((u % 1) + 1) % 1;
// Every particle travels a complete inward pass; it is invisible at both wrapping endpoints.
function point(u, phase) {
  const q = 1 - u ** 1.5, a = phase + u * TAU * 1.3;
  return { x: 7 + 96 * q, y: -18 + Math.sin(a) * (3 + q * 26), back: Math.sin(a) < 0, q };
}
function paint(p, t, o, back) {
  const C = fit(o.palette, 5), R = new Rng(o.seed), time = wrap(t / meta.duration);
  // Two continuous pressure ribbons keep the inward funnel readable between dust clusters.
  for (let strand = 0; strand < 2; strand++) {
    let prev;
    for (let j = 0; j <= 100; j++) {
      const q = j / 100, angle = time * TAU * 2 + q * 5 + strand * TAU / 2;
      const x = 7 + 96 * q, y = -18 + Math.sin(angle) * (3 + q * 26);
      if ((Math.sin(angle) < 0) !== back) { prev = undefined; continue; }
      if (j % 3 === 0) p.disc(x, y + 1, 1.5 + q * 2.5, C[2], back ? 0.08 : 0.16);
      if (prev) {
        p.line(prev[0], prev[1], x, y, C[back ? 1 : 2]);
        if (!back && Math.cos(angle) > 0.3) p.line(prev[0], prev[1] - 1, x, y - 1, C[3]);
      }
      prev = [x, y];
    }
  }
  // Helical wisps: the tail lies farther right, so motion reads as suction rather than a blast.
  for (let i = 0; i < 20; i++) {
    const phase = R.range(0, TAU), born = R.next(), length = R.range(0.07, 0.15);
    const u = wrap(time * 2 - born), head = point(u, phase);
    if (head.back !== back) continue;
    const fade = smooth(0, 0.12, u) * (1 - smooth(0.83, 1, u));
    let prev;
    for (let j = 0; j <= 15; j++) {
      const age = u - j * length / 15;
      if (age < 0) break;
      const v = point(age, phase), k = fade * (1 - j / 16) * (back ? 0.5 : 0.85);
      if (prev) p.line(prev.x, prev.y, v.x, v.y, C[j < 3 ? 4 : j < 8 ? 3 : 2], k);
      prev = v;
    }
    if (!back) p.glow(head.x, head.y, 4, C[3], fade * 0.09);
  }
  for (let i = 0; i < 42; i++) {
    const phase = R.range(0, TAU), born = R.next(), size = R.range(1.5, 4), spin = R.range(-5, 5);
    const u = wrap(time * (i % 3 === 0 ? 1 : 2) - born), v = point(u, phase);
    if (v.back !== back) continue;
    const fade = smooth(0, 0.12, u) * (1 - smooth(0.82, 1, u)), alpha = fade * (back ? 0.55 : 1);
    if (i < 24) {
      const r = size * (0.5 + v.q * 0.7);
      p.disc(v.x, v.y, r, C[1], alpha * 0.22);
      p.disc(v.x - 0.6, v.y - r * 0.35, r * 0.7, C[3], alpha * 0.16);
    } else if (i < 34) {
      drawLeaf(p, v.x, v.y, 4 + size, 0.8, phase + u * spin, u * 9 + phase, [C[0], C[3], C[1], C[2]], alpha);
    } else {
      const a = phase + u * spin, dx = Math.cos(a) * 1.3, dy = Math.sin(a) * 1.3;
      p.line(v.x - dx, v.y - dy, v.x + dx, v.y + dy, C[1], alpha);
      p.dot(v.x - dx, v.y - dy - 1, C[3], alpha);
    }
  }
}
export function drawBack(p, t, o) { paint(p, t, o, true); }
export function draw(p, t, o) { paint(p, t, o, false); }
