// Shared by tyrantDefense's UI effects (abyss screens, management screens): flat elliptical rings, four-point
// glints and soft envelopes. UI effects draw no figures, text or numbers and end fully transparent.
import { clamp, smooth } from "../../core/index.js";

/** 0 before a, rises to 1 by b, holds, falls to 0 between c and d. */
export const envelope = (t, a, b, c, d) => (t <= a || t >= d ? 0 : t < b ? smooth(a, b, t) : t > c ? 1 - smooth(c, d, t) : 1);

/** A thin elliptical ring (radii rx, ry, width w px along the normal); c may be a function of angle. */
export function ellipseRing(p, cx, cy, rx, ry, w, c, a = 1) {
  if (rx < 0.5 || ry < 0.5 || a <= 0.01) return;
  p.shade(cx - rx - w, cy - ry - w, cx + rx + w, cy + ry + w, (x, y, o) => {
    const dx = (x - cx) / rx, dy = (y - cy) / ry, d = Math.hypot(dx, dy);
    // distance to the rim in px, approximately, using the local radius
    const r = Math.hypot(dx * rx, dy * ry) / (d || 1e-6), e = Math.abs(d - 1) * r;
    if (e > w / 2) return;
    o.c = typeof c === "function" ? c(Math.atan2(dy, dx)) : c;
    o.a = a * (1 - e / (w / 2 + 0.5)) ;
  });
}

/** A four-point star glint: crossed lines with a hot core, plus its light. */
export function glint(p, x, y, len, core, edge, a = 1, k = 0.5) {
  if (len < 0.5 || a <= 0.02) return;
  p.line(x - len, y, x + len, y, (u) => (Math.abs(u - 0.5) < 0.18 ? core : edge), (u) => a * (1 - Math.abs(u - 0.5) * 1.6));
  p.line(x, y - len, x, y + len, (u) => (Math.abs(u - 0.5) < 0.18 ? core : edge), (u) => a * (1 - Math.abs(u - 0.5) * 1.6));
  const d = len * 0.38;
  if (d >= 1) {
    p.line(x - d, y - d, x + d, y + d, edge, a * 0.45);
    p.line(x - d, y + d, x + d, y - d, edge, a * 0.45);
  }
  p.dot(x, y, core, a);
  p.glow(x, y, Math.max(2, len * 0.9), edge, k * a);
}

/** Ease-out position of something launched at speed v with linear drag k, after t seconds. */
export const dragged = (v, k, t) => (v * (1 - Math.exp(-k * t))) / k;

export const fade01 = (v) => clamp(v);
