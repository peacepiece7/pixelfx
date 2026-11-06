// A seal is fitted or a slot opens: a thin violet arc with a point of light runs once clockwise round the slot
// and stops. Only this slot; the static circle and rune art are the page's.
import { fit, TAU, smooth, ease } from "../../core/index.js";
import { envelope } from "./_tyrant.js";

const D = 0.75;
export const meta = {
  name: "Management seal activation",
  desc: "A thin violet arc with a point of light runs once clockwise round a seal slot and stops, then fades.",
  tags: ["ui", "management", "seal", "slot", "arcane"],
  size: [200, 200], origin: [100, 100], duration: D, loop: false, fps: 30, bg: "dark",
  // r: the slot's radius in px
  options: { palette: ["#18132b", "#443164", "#805199", "#ba7fc8", "#ecc4f0", "#fff0ff"], r: 62, seed: 2 },
};

export function draw(p, t, o) {
  if (t >= D) return;
  const C = fit(o.palette, 6), R = o.r, a0 = -Math.PI / 2, run = ease.outCubic(smooth(0.04, 0.58, t)), head = a0 + TAU * run, fade = envelope(t, 0, 0.05, 0.56, 0.74);
  const tail = Math.min(TAU * run, TAU * 0.55);
  if (tail > 0.02) p.arc(0, 0, R + 1, 2, head - tail, head, (u) => (u > 0.92 ? C[5] : u > 0.5 ? C[4] : C[3]), (u) => fade * (0.25 + 0.75 * u));
  const hx = Math.cos(head) * R, hy = Math.sin(head) * R, lit = fade * (1 - smooth(0.58, 0.72, t));
  p.dot(hx, hy, C[5], lit);
  p.glow(hx, hy, 6, C[4], 0.45 * lit);
  // a completed circle settles for a moment as the head stops
  const ring = envelope(t, 0.5, 0.58, 0.62, 0.74);
  if (ring > 0) p.ring(0, 0, R + 1, 1, C[3], 0.5 * ring);
}
