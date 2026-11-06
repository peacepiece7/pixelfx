// An important abyss record (a first tenth-floor breakthrough, a quality tier's first pass): two thin gold
// rings open slowly behind the line of text and a little light dust is left above it.
import { fit, Rng, TAU, smooth } from "../../core/index.js";
import { envelope, ellipseRing } from "./_tyrant.js";

const D = 0.9;
export const meta = {
  name: "Abyss milestone halo",
  desc: "Behind a record line: two thin gold rings open slowly and a little light dust lingers above. No medal, text or reward.",
  tags: ["ui", "milestone", "record", "halo", "gold", "abyss"],
  size: [240, 160], origin: [120, 84], duration: D, loop: false, fps: 30, bg: "dark",
  options: { palette: ["#2b183a", "#65402d", "#a66b2c", "#e4a948", "#ffd978", "#fff1c2"], intensity: 1, seed: 8 },
};

export function create(o) {
  const C = fit(o.palette, 6), R = new Rng(o.seed * 71 + 3), k = Math.max(0, o.intensity);
  const motes = Array.from({ length: 12 }, () => ({ x: R.range(-60, 60), y: R.range(-30, -12), at: R.range(0.15, 0.4), rise: R.range(10, 24), tw: R.range(7, 13), ph: R.range(0, TAU) }));
  let t = 0;
  return {
    update(dt) { t += dt; },
    draw(p) {
      if (t >= D) return;
      for (const [i, d] of [[0, 0], [1, 0.12]]) {
        const s = smooth(d, d + 0.7, t), e = envelope(t, d, d + 0.1, 0.55, 0.88) * k;
        const rx = 34 + 64 * s - i * 14, ry = rx * 0.32;
        ellipseRing(p, 0, 0, rx, ry, 1.2, i ? C[4] : C[5], 0.8 * e);
        for (let j = 0; j < 8; j++) { const a = (j / 8) * Math.PI * 2 + t; p.glow(Math.cos(a) * rx, Math.sin(a) * ry, 5, C[3], 0.1 * e); }
      }
      for (const m of motes) {
        const tt = t - m.at;
        if (tt <= 0) continue;
        const a = envelope(tt, 0, 0.1, 0.3, D - m.at) * (0.6 + 0.4 * Math.sin(tt * m.tw + m.ph)) * Math.min(1, k);
        const x = m.x + Math.sin(tt * 3 + m.ph) * 2, y = m.y - m.rise * tt;
        p.dot(x, y, C[5], a);
        p.glow(x, y, 2.5, C[4], 0.25 * a);
      }
    },
  };
}
