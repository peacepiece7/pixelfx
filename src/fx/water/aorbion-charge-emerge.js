import { haze, pool } from "../_soft.js";
import { Rng, fit, smooth, clamp, ease, noise2, TAU } from "../../core/index.js";
import { Drops, Ripples, lace, billow } from "./_lib.js";

export const meta = {
  name: "Aorbion charge emerge",
  desc: "A foaming bow wave races 100px forward as three sharp water-claw ribbons rake through it; spray arcs down into ripples and a lacy wake drains away.",
  tags: ["water", "charge", "claw", "splash", "one-shot"],
  size: [176, 104], origin: [30, 76], duration: 0.65, loop: false, fps: 30, bg: "ground",
  options: { palette: ["#071e38", "#0c4169", "#147d9c", "#32b9d0", "#8de8ed", "#e3ffff"], seed: 17 },
};

export function create(o) {
  const C = fit(o.palette, 8), R = new Rng(o.seed), rings = new Ripples({ sy: 0.25 });
  const drops = new Drops({ sy: 0.25, g: 840, onLand: d => {
    rings.add(d.x, d.z, 1, 2 + d.s, 0.18, { n: 1, k: 0.65 });
  } });
  for (let i = 0; i < 24; i++) {
    const x = R.range(1, 98), side = R.sign();
    drops.add({ x, z: side * R.range(2, 24), h: R.range(1, 6), vx: R.range(15, 62),
      vz: side * R.range(10, 38), vh: R.range(50, 130), s: R.int(1, 3),
      delay: x / 100 * 0.13, life: 0.5 });
  }
  const foam = Array.from({ length: 7 }, () => ({ y: R.range(-9, 7), size: R.range(1.8, 3.6), phase: R.range(0, TAU) }));
  let elapsed = 0;
  const fade = () => 1 - smooth(0.3, 0.65, elapsed);
  return {
    update(dt) { elapsed += dt; drops.update(dt); rings.update(dt); },
    drawBack(p) {
      if (elapsed >= meta.duration) return;
      const head = 100 * ease.outCubic(clamp(elapsed / 0.18)), k = fade();
      pool(p,head*.5,0,Math.max(1,head*.5),9,C[3],k*.18);
      // Narrow footprint and broken foam persist after the forward crest passes.
      p.ellipse(head * 0.5, 0, Math.max(0.1, head * 0.5), 8, C[1], k * 0.25);
      lace(p, head * 0.5, 0, head * 0.5, 9, k * 0.35, C, elapsed * 8, o.seed);
      rings.draw(p, C, "back"); drops.draw(p, C, "back");
    },
    draw(p) {
      if (elapsed >= meta.duration) return;
      const t = elapsed, k = fade(), head = 100 * ease.outCubic(clamp(t / 0.18));
      const surge = 1 - smooth(0.16, 0.36, t);
      // Shaded, curling front: deep underside, bright rolling lip, and running water texture.
      if (surge > 0 && head > 1) {
        p.shade(0, -24, head + 4, 10, (x, y, out) => {
          const u = x / head;
          if (u < 0 || u > 1) return;
          const height = 3 + 15 * Math.exp(-(((x - head + 7) / 10) ** 2));
          const width = 8 * Math.sin(Math.PI * u) + 2;
          if (y > width * 0.5 || y < -height) return;
          const rim = y < -height + 1.5;
          const flow = noise2(x * 0.3 - t * 30, y * 0.5, o.seed);
          out.c = rim ? C[7] : y < -height * 0.65 ? C[5] : flow > 0.2 ? C[4] : C[2];
          out.a = surge;
        });
        for (const f of foam)
          billow(p, head - 5 + Math.sin(f.phase + t * 25) * 3, f.y - 10, f.size * surge, C, surge);
      }
      haze(p,head-8,-8,13,C[3],surge*.19);
      // Three tapered lens-shaped claws open quickly, then close from both ends.
      for (let j = 0; j < 3; j++) {
        const u = t - j * 0.024;
        if (u < 0) continue;
        const progress = ease.outCubic(clamp(u / 0.11)), close = smooth(0.14, 0.4, u);
        const lo = 8 + close * 40, hi = Math.min(100 * progress, 100 - close * 40);
        if (hi <= lo) continue;
        p.shade(lo, -37, hi, 7, (x, y, out) => {
          const q = (x - 8) / 92, cy = (j - 1) * 6 - 6 - Math.sin(Math.PI * q) * (12 + j * 2);
          const w = 2.7 * Math.sin(Math.PI * q) * (1 - close);
          const d = Math.abs(y - cy) / Math.max(0.1, w);
          // Retreat in staggered chunks instead of dissolving every pixel at once.
          if (u > 0.18 && Math.floor(x / 6) % 3 < (u - 0.18) * 12) return;
          if (d > 1) return;
          out.c = d < 0.32 ? C[7] : d < 0.7 ? C[5] : C[3]; out.a = 1;
        });
      }
      drops.draw(p, C, "front"); rings.draw(p, C, "front");
    },
  };
}
