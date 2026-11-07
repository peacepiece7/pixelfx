// Abyss victory, behind the result title: a small warm gathering, then six to eight uneven gold rays fan out
// behind the words while gold dust slows and fades. The title area stays clear and the centre stays dim.
import { fit, Rng, TAU, smooth } from "../../core/index.js";
import { envelope, dragged } from "./_tyrant.js";

const D = 1.2;
export const meta = {
  name: "Abyss victory radiance",
  desc: "Behind a result title: a warm gathering, then uneven gold rays fan out and slowing gold dust fades. The title area stays clear.",
  tags: ["ui", "result", "victory", "rays", "gold", "abyss"],
  size: [320, 180], origin: [160, 72], duration: D, loop: false, fps: 30, bg: "dark",
  // intensity: 1 first clear, ~0.4 for repeat clears; clearW/clearH: the title box kept free of rays and dust
  options: { palette: ["#2b183a", "#65402d", "#a66b2c", "#e4a948", "#ffd978", "#fff1c2"], intensity: 1, clearW: 92, clearH: 16, seed: 3 },
};

export function create(o) {
  const C = fit(o.palette, 6), R = new Rng(o.seed * 97 + 5), k = Math.max(0, o.intensity);
  const count = R.int(6, 8);
  const rays = Array.from({ length: count }, (_, i) => ({
    a: -Math.PI / 2 + (i / (count - 1) - 0.5) * Math.PI * 1.15 + R.range(-0.14, 0.14),
    len: R.range(70, 150), w: R.range(5, 11), delay: R.range(0, 0.12),
  }));
  const dust = Array.from({ length: Math.round(R.range(24, 40) * Math.min(1, 0.4 + k * 0.6)) }, () => {
    const a = R.range(0, TAU);
    return { a, v: R.range(70, 170), r0: R.range(16, 26), life: R.range(0.55, 0.95), delay: R.range(0.12, 0.3), tw: R.range(8, 16), big: R.chance(0.2) };
  });
  const hw = o.clearW / 2, hh = o.clearH / 2, inTitle = (x, y) => Math.abs(x) < hw && Math.abs(y) < hh;
  let t = 0;
  return {
    update(dt) { t += dt; },
    draw(p) {
      if (t >= D) return;
      // gathering: a small warm point, kept dim so the title reads
      const gather = envelope(t, 0, 0.16, 0.22, 0.5);
      p.glow(0, 0, 10 + 14 * smooth(0, 0.2, t), C[4], 0.22 * gather * k);
      // rays: light along each, a dithered gold body only outside the title box
      for (const r of rays) {
        const e = envelope(t - r.delay, 0.12, 0.34, 0.6, 1.05) * k;
        if (e <= 0) continue;
        const grow = smooth(0.12, 0.5, t - r.delay), L = r.len * (0.35 + 0.65 * grow), ca = Math.cos(r.a), sa = Math.sin(r.a);
        const x0 = ca * 24, y0 = sa * 24 * 0.45, x1 = ca * L, y1 = sa * L * 0.45;
        p.glowLine(x0, y0, x1, y1, r.w, C[3], 0.24 * e);
        // a thin bright core so the ray reads over painted, already-lit backgrounds
        p.glowLine(x0, y0, x0 + (x1 - x0) * 0.7, y0 + (y1 - y0) * 0.7, Math.max(2, r.w * 0.35), C[4], 0.22 * e);
        for (let s = 0; s <= 1; s += 1 / 48) {
          const x = x0 + (x1 - x0) * s, y = y0 + (y1 - y0) * s;
          if (inTitle(x, y)) continue;
          p.dot(x, y, s < 0.45 ? C[5] : s < 0.75 ? C[4] : C[3], Math.min(1, e * 0.9 * (1 - s * 0.8)));
        }
      }
      // dust: launched outward, slowing, twinkling, gone
      for (const d of dust) {
        const tt = t - d.delay;
        if (tt <= 0 || tt >= d.life) continue;
        const q = tt / d.life, r = d.r0 + dragged(d.v, 4, tt), x = Math.cos(d.a) * r, y = Math.sin(d.a) * r * 0.6 + 10 * q * q;
        if (inTitle(x, y)) continue;
        const a = (1 - q) * (0.7 + 0.3 * Math.sin(tt * d.tw)) * Math.min(1, 0.4 + k);
        p.dot(x, y, q < 0.35 ? C[5] : q < 0.7 ? C[4] : C[3], a);
        if (d.big) p.glow(x, y, 3, C[4], 0.3 * a);
      }
    },
  };
}
