// Enhancement failed: a small grey-violet ripple just above the anvil fades out and its afterglow goes quickly.
// The item and its level stay; no breaking, shards, downgrade or cracked icon.
import { fit, smooth } from "../../core/index.js";
import { envelope, ellipseRing } from "./_tyrant.js";

const D = 0.55;
export const meta = {
  name: "Management enhance failure",
  desc: "A small grey-violet ripple just above the anvil fades and its afterglow goes quickly. Nothing breaks.",
  tags: ["ui", "management", "enhance", "failure", "ripple"],
  size: [160, 140], origin: [80, 84], duration: D, loop: false, fps: 30, bg: "dark",
  options: { palette: ["#18132b", "#443164", "#805199", "#ba7fc8", "#ecc4f0", "#fff0ff"], seed: 1 },
};

export function draw(p, t, o) {
  if (t >= D) return;
  const C = fit(o.palette, 6), s = smooth(0, 0.45, t), e = envelope(t, 0, 0.05, 0.12, 0.45);
  ellipseRing(p, 0, -6, 6 + 26 * s, 2 + 8 * s, 1.6, C[3], 0.8 * e);
  ellipseRing(p, 0, -6, 4 + 14 * smooth(0.06, 0.4, t), 1.5 + 4 * smooth(0.06, 0.4, t), 1, C[2], 0.4 * envelope(t, 0.06, 0.1, 0.15, 0.4));
  p.glow(0, -6, 14, C[3], 0.24 * envelope(t, 0, 0.04, 0.1, 0.3));
}
