// A set scroll's result on an item: on success a short violet engraving light circles the item and finishes with
// two gold points; on failure only a dim grey-violet afterglow fades. No set text, prefix letters or item.
import { fit, TAU, smooth, ease } from "../../core/index.js";
import { envelope, ellipseRing, glint } from "./_tyrant.js";

const D = 0.7;
export const meta = {
  name: "Management scroll result",
  desc: "Success: a short violet engraving light circles the item and closes with two gold points. Failure: a dim afterglow fades.",
  tags: ["ui", "management", "scroll", "set", "engrave", "arcane"],
  size: [160, 160], origin: [80, 80], duration: D, loop: false, fps: 30, bg: "dark",
  // success: false plays the dim failure afterglow; r: radius round the item, px
  options: { palette: ["#18132b", "#443164", "#805199", "#ba7fc8", "#ecc4f0", "#fff0ff"], gold: ["#edc16e", "#fff9de"], success: true, r: 46, seed: 3 },
};

export function draw(p, t, o) {
  if (t >= D) return;
  const C = fit(o.palette, 6), G = fit(o.gold, 2), R = o.r;
  if (!o.success) {
    const e = envelope(t, 0, 0.06, 0.12, 0.5);
    ellipseRing(p, 0, 0, R * (0.9 + 0.1 * smooth(0, 0.5, t)), R * (0.9 + 0.1 * smooth(0, 0.5, t)), 1.2, C[2], 0.45 * e);
    p.glow(0, 0, R * 0.7, C[1], 0.12 * e);
    return;
  }
  const run = ease.outCubic(smooth(0, 0.48, t)), a0 = Math.PI * 0.75, head = a0 + TAU * run, fade = envelope(t, 0, 0.04, 0.46, 0.64);
  const tail = Math.min(TAU * run, TAU * 0.4);
  if (tail > 0.02) p.arc(0, 0, R + 1, 2, head - tail, head, (u) => (u > 0.9 ? C[5] : C[4]), (u) => fade * (0.2 + 0.8 * u));
  p.glow(Math.cos(head) * R, Math.sin(head) * R, 5, C[4], 0.4 * fade * (1 - smooth(0.46, 0.55, t)));
  // two gold points close it, opposite each other
  const g = envelope(t, 0.44, 0.5, 0.56, 0.69);
  for (const a of [a0, a0 + Math.PI]) {
    const x = Math.cos(a) * R, y = Math.sin(a) * R;
    glint(p, x, y, 5 * g, G[1], G[0], g, 0.45);
  }
}
