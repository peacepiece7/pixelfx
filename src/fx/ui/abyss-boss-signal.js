// The abyss gatekeeper really appears: a short violet pulse spreads behind the boss name and crystal shard
// outlines open at both sides, then everything clears. No text, no screen-wide dark, no warning shapes.
import { fit, smooth } from "../../core/index.js";
import { envelope, ellipseRing } from "./_tyrant.js";

const D = 0.65;
export const meta = {
  name: "Abyss boss signal",
  desc: "Behind a boss name: one short violet pulse spreads and crystal shard outlines open at both sides, then clear.",
  tags: ["ui", "boss", "warning", "crystal", "abyss"],
  size: [240, 100], origin: [120, 50], duration: D, loop: false, fps: 30, bg: "dark",
  options: { palette: ["#140d27", "#352052", "#66358c", "#a65ada", "#d9a2ff", "#f2d6ff"], seed: 2 },
};

// shards as [x, y, height, lean] around one side; mirrored for the other
const SHARDS = [[78, 2, 26, -0.25], [92, 8, 18, 0.2], [66, 10, 14, -0.45]];

export function create(o) {
  const C = fit(o.palette, 6);
  let t = 0;
  return {
    update(dt) { t += dt; },
    draw(p) {
      if (t >= D) return;
      const s = smooth(0, 0.45, t), e = envelope(t, 0, 0.06, 0.3, 0.62);
      p.glow(0, 0, 26 + 30 * s, C[3], 0.2 * e);
      ellipseRing(p, 0, 0, 18 + 96 * s, 6 + 28 * s, 2, C[4], 0.75 * e);
      ellipseRing(p, 0, 0, 10 + 70 * smooth(0.08, 0.5, t), 4 + 20 * smooth(0.08, 0.5, t), 1, C[5], 0.5 * envelope(t, 0.08, 0.14, 0.3, 0.55));
      const open = smooth(0.06, 0.32, t), sh = envelope(t, 0.06, 0.16, 0.38, 0.64);
      for (const side of [-1, 1])
        for (const [x, y, h, lean] of SHARDS) {
          const bx = side * (x - 18 * (1 - open)), H = h * open, tip = [bx + side * lean * H, y - H], l = [bx - 4, y], r = [bx + 4, y], m = [bx + side * lean * H * 0.5 + side * 3, y - H * 0.55];
          if (H < 1) continue;
          p.poly([l, m, tip, r], C[1], 0.55 * sh);
          p.polyline([l, tip, r], C[4], 0.85 * sh);
          p.light(tip[0], tip[1], C[5], 0.4 * sh);
        }
    },
  };
}
