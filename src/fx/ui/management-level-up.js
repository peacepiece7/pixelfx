// A hero's level is confirmed: one thin gold ring opens at the feet and six to ten points of light rise to the
// chest and fade. Draws no figure, pose or level number.
import { fit, rand, smooth } from "../../core/index.js";
import { envelope, ellipseRing } from "./_tyrant.js";

const D = 0.8;
export const meta = {
  name: "Management level up",
  desc: "One thin gold ring opens at a hero's feet and a few points of light rise to the chest and fade. No figure or number.",
  tags: ["ui", "management", "level-up", "gold", "ring"],
  size: [160, 200], origin: [80, 176], duration: D, loop: false, fps: 30, bg: "dark",
  // chest: how far above the feet the lights rise, px
  options: { palette: ["#281c29", "#71503b", "#b88c50", "#edc16e", "#ffe6a8", "#fff9de"], chest: 110, seed: 4 },
};

export function draw(p, t, o) {
  if (t >= D) return;
  const C = fit(o.palette, 6), S = o.seed, s = smooth(0, 0.5, t), e = envelope(t, 0, 0.06, 0.35, 0.62);
  ellipseRing(p, 0, 0, 10 + 40 * s, 3 + 11 * s, 1.4, C[4], 0.85 * e);
  p.glowRing(0, 0, 8 + 26 * s, 6, C[3], 0.12 * e);
  const n = 6 + Math.floor(rand(S, 0) * 5);
  for (let i = 0; i < n; i++) {
    const at = 0.05 + rand(S, i, 1) * 0.25, tt = t - at, life = 0.4 + rand(S, i, 2) * 0.12;
    if (tt <= 0 || tt >= life) continue;
    const q = tt / life, x = (rand(S, i, 3) - 0.5) * 36, y = -6 - o.chest * (0.35 + 0.65 * rand(S, i, 4)) * smooth(0, 1, q);
    const a = envelope(q, 0, 0.15, 0.6, 1);
    p.dot(x, y, q < 0.5 ? C[5] : C[4], a);
    p.dot(x, y + 1, C[3], 0.5 * a);
    p.glow(x, y, 3, C[4], 0.3 * a);
  }
}
