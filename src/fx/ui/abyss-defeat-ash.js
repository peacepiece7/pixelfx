// Abyss defeat, behind and below the result title: dark violet ash pulls in, then spreads left, right and back,
// slowing and settling. Drawn with normal alpha in the colour buffer (dark dust is invisible as added light).
import { fit, Rng, TAU, smooth } from "../../core/index.js";
import { envelope, dragged } from "./_tyrant.js";

const D = 1;
export const meta = {
  name: "Abyss defeat ash",
  desc: "Dark violet ash draws in, spreads sideways and back, slows and settles. Alpha-blended dust, one small ember glow, gone within a second.",
  tags: ["ui", "result", "defeat", "ash", "dust", "abyss"],
  size: [320, 180], origin: [160, 92], duration: D, loop: false, fps: 30, bg: "dark",
  options: { palette: ["#0d0b16", "#1e1828", "#342334", "#51303e", "#75515b", "#a98586"], seed: 4 },
};

export function create(o) {
  const C = fit(o.palette, 6), R = new Rng(o.seed * 131 + 9);
  const ash = Array.from({ length: R.int(24, 36) }, () => {
    const side = R.sign(), a = (side > 0 ? 0 : Math.PI) + R.range(-0.7, 0.7);
    return { a, v: R.range(80, 190), x0: R.range(-14, 14), y0: R.range(-4, 6), sink: R.range(10, 26), c: R.int(2, 5), size: R.chance(0.3) ? 1.5 : 0.5 };
  });
  const clumps = Array.from({ length: R.int(4, 6) }, (_, i) => ({ a: (i % 2 ? 0 : Math.PI) + R.range(-0.5, 0.5), v: R.range(110, 170), r: R.range(8, 13), c: R.int(2, 3), lobes: Array.from({ length: 3 }, () => [R.range(-6, 6), R.range(-3, 3), R.range(0.6, 1)]) }));
  let t = 0;
  return {
    update(dt) { t += dt; },
    draw(p) {
      if (t >= D) return;
      const pull = smooth(0, 0.12, t), spread = Math.max(0, t - 0.12), fade = 1 - smooth(0.6, 1, t);
      // 0..0.12: a tight dark knot drawing in
      if (t < 0.18) p.disc(0, 2, 14 - 6 * pull, C[2], (d) => 0.55 * (1 - smooth(0.12, 0.18, t)) * Math.pow(1 - d, 1.4));
      // thin clumps of dust rolling outward, swelling and thinning
      for (const c of clumps) {
        const r = dragged(c.v, 3, spread), x = Math.cos(c.a) * r * 1.6, y = 4 + Math.sin(c.a) * r * 0.35 + spread * 8;
        const rr = c.r * (0.6 + 0.9 * smooth(0, 0.5, spread)), base = 0.5 * fade * (t > 0.12 ? 1 : pull);
        for (const [ox, oy, s] of c.lobes) p.disc(x + ox * (0.5 + spread), y + oy, rr * s, (d) => (d < 0.45 ? C[c.c] : C[c.c - 1]), (d) => base * Math.pow(1 - d, 1.6));
      }
      // ash grains: sideways and back, slowing, sinking
      for (const g of ash) {
        if (t < 0.12) { p.dot(g.x0 * (1 - pull * 0.6), g.y0, C[g.c], 0.6 * pull); continue; }
        const r = dragged(g.v, 3.2, spread), x = g.x0 + Math.cos(g.a) * r, y = g.y0 + Math.sin(g.a) * r * 0.4 + g.sink * spread * spread * 2.4;
        p.dot(x, y, C[g.c], 0.85 * fade);
        if (g.size > 1) p.dot(x + 1, y, C[g.c - 1 < 1 ? 1 : g.c - 1], 0.6 * fade);
      }
      // one small dark-red ember, once
      p.glow(0, 4, 8, C[4], 0.22 * envelope(t, 0.1, 0.16, 0.22, 0.4));
    },
  };
}
