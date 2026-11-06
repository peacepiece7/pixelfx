// Enhancement succeeded: a short gold star flash where hammer meets anvil, eight small sparks rising, and a
// brief glint left on the item's edge. No screen flash.
import { fit, rand } from "../../core/index.js";
import { envelope, glint } from "./_tyrant.js";

const D = 0.7;
export const meta = {
  name: "Management enhance success",
  desc: "A short gold star flash at the anvil contact, eight small sparks rising, and a brief glint left on the item's edge.",
  tags: ["ui", "management", "enhance", "success", "gold", "sparks"],
  size: [200, 180], origin: [100, 120], duration: D, loop: false, fps: 30, bg: "dark",
  // edge: where the final glint sits, px from the contact point (the item's upper edge)
  options: { palette: ["#281c29", "#71503b", "#b88c50", "#edc16e", "#ffe6a8", "#fff9de"], edge: [-22, -46], seed: 5 },
};

export function draw(p, t, o) {
  if (t >= D) return;
  const C = fit(o.palette, 6), S = o.seed, f = envelope(t, 0, 0.03, 0.06, 0.2);
  glint(p, 0, 0, 16 * f, C[5], C[4], f, 0.7);
  p.glow(0, 0, 18, C[3], 0.25 * f);
  for (let i = 0; i < 8; i++) {
    const a = -Math.PI / 2 + (rand(S, i) - 0.5) * 1.8, v = 70 + rand(S, i, 1) * 70, life = 0.35 + rand(S, i, 2) * 0.2, tt = t - 0.02;
    if (tt <= 0 || tt >= life) continue;
    const q = tt / life, x = Math.cos(a) * v * tt, y = Math.sin(a) * v * tt + 140 * tt * tt, x1 = x - Math.cos(a) * 3, y1 = y - Math.sin(a) * 3 + 2;
    const al = 1 - q;
    p.line(x1, y1, x, y, C[3], 0.6 * al);
    p.dot(x, y, q < 0.4 ? C[5] : C[4], al);
    p.glow(x, y, 2.5, C[4], 0.3 * al);
  }
  const g = envelope(t, 0.42, 0.5, 0.54, 0.68);
  glint(p, o.edge[0], o.edge[1], 6 * g, C[5], C[4], g, 0.4);
}
