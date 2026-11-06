// Into the abyss: dark crystal silhouettes close in from the screen edge, a short dark beat, then they part on
// the new field. Near crags move further than the far haze, so it reads as descending, not zooming.
// The stage option lets a game hold the dark while the server answers: "close", "hold", "open" or "full".
import { fit, Rng, TAU, smooth, ease } from "../../core/index.js";

const D = 0.65, CLOSE = 0.28, OPEN = 0.37;
export const meta = {
  name: "Abyss depth wipe",
  desc: "Dark crystal silhouettes close in from the edges, a short dark beat, then part on the new field; near crags move more than far haze.",
  tags: ["transition", "wipe", "abyss", "crystal", "descend"],
  size: [320, 180], origin: [160, 90], duration: D, loop: false, fps: 30, bg: "sky",
  options: { palette: ["#140d27", "#352052", "#66358c", "#a65ada", "#d9a2ff", "#f2d6ff"], stage: "full", seed: 5 },
};

export function create(o) {
  const C = fit(o.palette, 6), R = new Rng(o.seed * 211 + 7);
  // the crag outline: a few sharp crystal spikes round the circle, radius factor 0.74..1
  const spikes = Array.from({ length: 13 }, () => ({ a: R.range(0, TAU), w: R.range(0.12, 0.3), h: R.range(0.1, 0.26) }));
  const LUT = new Float32Array(720);
  for (let i = 0; i < 720; i++) {
    const th = (i / 720) * TAU - Math.PI;
    let f = 1;
    for (const s of spikes) {
      let d = Math.abs(th - s.a + Math.PI) % TAU;
      d = Math.min(d, TAU - d);
      if (d < s.w) f -= s.h * (1 - d / s.w);
    }
    LUT[i] = Math.max(0.74, f);
  }
  const shape = (th) => LUT[Math.min(719, Math.floor(((th + Math.PI) / TAU) * 720))];
  // openness 1.35 (clear) .. 0 (covered)
  const open = (t) => {
    if (o.stage === "hold") return 0;
    if (o.stage === "close") return 1.35 * (1 - ease.inQuad(Math.min(1, t / CLOSE)));
    if (o.stage === "open") return 1.35 * ease.outCubic(Math.min(1, t / (D - OPEN)));
    return t < CLOSE ? 1.35 * (1 - ease.inQuad(t / CLOSE)) : t < OPEN ? 0 : 1.35 * ease.outCubic((t - OPEN) / (D - OPEN));
  };
  let t = 0;
  return {
    update(dt) { t += dt; },
    draw(p) {
      if (o.stage !== "hold" && t >= D) return;
      const s = open(t);
      if (s >= 1.34) return;
      // descending: the far haze rides upward as it opens, the near crags drop and spread faster
      const near = s * 196, far = s * 160 + 22, lift = (o.stage === "open" || t > OPEN ? 1 : 0) * smooth(0, 1, s / 1.35) * 18;
      p.shade(-160, -90, 159, 89, (x, y, out) => {
        const rn = Math.hypot(x * 0.56, y + lift * 0.4) / 0.56, rf = Math.hypot(x * 0.56, y - lift) / 0.56;
        // well inside both outlines: nothing to draw, skip the angle lookup
        if (rn < near * 0.74 && rf < far * 0.88) return;
        const f = shape(Math.atan2(y, x * 0.56));
        if (rn > near * f) {
          const e = rn - near * f;
          out.c = e < 1.2 ? C[4] : e < 3 ? C[2] : e < 14 ? C[1] : C[0];
          if (e < 1.2) out.k = 0.25;
          return;
        }
        if (rf > far * (0.88 + 0.12 * f)) {
          out.c = C[1];
          out.a = 0.55 * (1 - Math.min(1, s / 1.35));
        }
      });
    },
  };
}
