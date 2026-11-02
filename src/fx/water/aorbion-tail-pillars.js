import { clamp } from "../../core/index.js";
import { create as createGeyser, meta as geyserMeta } from "./geyser.js";

export const meta = {
  name: "Aorbion tail pillars",
  desc: "Overlapping water jets rise along a vertical line, 35px apart. Narrow textured columns surge upward and recede without overflowing foam or wide spray.",
  tags: ["water", "geyser", "splash", "one-shot"],
  size: [208, 320], origin: [104, 220], duration: 0.8, loop: false, fps: 30, bg: "ground",
  options: {
    palette: ["#071e38", "#0c4169", "#147d9c", "#32b9d0", "#8de8ed", "#e3ffff"],
    seed: 17, count: 3,
  },
};

// Reuse the geyser's rising water core; suppress its ambient overflow and spray.
// Metadata fits up to five pillars; larger counts need a taller host viewport.
export function create(o) {
  const n = clamp(Math.floor(Number.isFinite(o.count) ? o.count : 3), 1, 12);
  const warmup = 1.1, delay = 0.018;
  const clock = u => u < 0.16 ? warmup + u / 0.16 * 1.5
    : 2.6 + (u - 0.16) / (meta.duration - delay * (n - 1) - 0.16) * 2.4;
  const pillars = Array.from({ length: n }, (_, i) => {
    const fx = createGeyser({ ...geyserMeta.options, palette: o.palette, height: 58, jetOnly: true, seed: o.seed + i * 31 });
    // Start just before eruption; the slower ambient buildup is omitted for this combat skill.
    for (let t = 0; t < warmup - 1e-9; t += 1 / 120) fx.update(Math.min(1 / 120, warmup - t));
    return { y: (i - (n - 1) / 2) * 35, start: i * delay, fx };
  });
  let elapsed = 0;
  const draw = (p, back) => {
    if (elapsed >= meta.duration) return;
    const tx = p.tx, ty = p.ty, light = p.lightK;
    p.lightK *= 0.35;
    try {
      for (const pillar of pillars) {
        if (elapsed < pillar.start) continue;
        p.tx = tx - pillar.y * p.sn;
        p.ty = ty + pillar.y * p.cs;
        if (back) pillar.fx.drawBack(p);
        else pillar.fx.draw(p);
      }
    } finally { p.tx = tx; p.ty = ty; p.lightK = light; }
  };
  return {
    update(dt) {
      const prev = elapsed;
      elapsed += dt;
      for (const pillar of pillars) {
        const step = Math.min(elapsed, meta.duration) - Math.max(prev, pillar.start);
        // Small fixed substeps preserve the geyser's spray emission when time is compressed.
        for (let left = step > 0 ? clock(Math.max(0, Math.min(elapsed, meta.duration) - pillar.start)) - clock(Math.max(0, prev - pillar.start)) : 0; left > 1e-9; left -= 1 / 120)
          pillar.fx.update(Math.min(1 / 120, left));
      }
    },
    drawBack(p) { draw(p, true); },
    draw(p) { draw(p, false); },
  };
}
