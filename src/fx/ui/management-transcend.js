// A hero transcends: two platform rings at the feet and restrained vertical gold ribbons rising to the chest,
// then gone. No wings, costume change, star count or summon cut-in.
import { fit, smooth } from "../../core/index.js";
import { envelope, ellipseRing } from "./_tyrant.js";

const D = 1.25;
export const meta = {
  name: "Management transcend",
  desc: "Two platform rings at a hero's feet and restrained vertical gold ribbons rising to the chest, then gone.",
  tags: ["ui", "management", "transcend", "gold", "ribbon"],
  size: [240, 280], origin: [120, 256], duration: D, loop: false, fps: 30, bg: "dark",
  // chest: ribbon height in px above the feet
  options: { palette: ["#281c29", "#71503b", "#b88c50", "#edc16e", "#ffe6a8", "#fff9de"], chest: 170, seed: 6 },
};

export function draw(p, t, o) {
  if (t >= D) return;
  const C = fit(o.palette, 6);
  for (const [i, d] of [[0, 0], [1, 0.16]]) {
    const s = smooth(d, d + 0.6, t), e = envelope(t, d, d + 0.08, 0.8, 1.15);
    ellipseRing(p, 0, -i * 4, 16 + 48 * s - i * 10, 5 + 13 * s - i * 3, 1.4, i ? C[4] : C[5], 0.8 * e);
  }
  p.glow(0, -4, 40, C[3], 0.1 * envelope(t, 0, 0.15, 0.7, 1.1));
  // ribbons: a head climbing, a tail hanging behind it, gently swaying
  for (const [i, x0, ph] of [[0, -16, 0], [1, 14, 2.1], [2, -2, 4.2]]) {
    const start = 0.12 + i * 0.1, q = smooth(start, start + 0.75, t), head = o.chest * q, e = envelope(t, start, start + 0.08, 0.85, 1.22) * (i === 2 ? 0.6 : 1);
    if (e <= 0) continue;
    for (let y = 0; y <= head; y += 1) {
      const u = y / Math.max(1, head), x = x0 + Math.sin(y * 0.06 + ph + t * 3) * 4 * (0.3 + u);
      const a = e * (0.15 + 0.85 * u) * (u > 0.97 ? 1 : 0.7);
      p.dot(x, -y, u > 0.9 ? C[5] : u > 0.5 ? C[4] : C[3], a);
    }
    p.glow(x0, -head, 5, C[4], 0.35 * e);
  }
}
