// A reward card appears: two or three small star glints and a short light running along the card's edge.
// The card, item and numbers are the page's; this only adds the glint. emphasis 1 for the single best card.
import { fit, Rng } from "../../core/index.js";
import { envelope, glint } from "./_tyrant.js";

const D = 0.55;
export const meta = {
  name: "Abyss loot glint",
  desc: "Two or three small star glints and a short light running round a reward card's edge. Draws no card or item.",
  tags: ["ui", "reward", "loot", "glint", "sparkle", "abyss"],
  size: [96, 96], origin: [48, 48], duration: D, loop: false, fps: 30, bg: "dark",
  // w/h: the card's size in px; emphasis 0..1 brightens one standout card a little
  options: { palette: ["#2b183a", "#65402d", "#a66b2c", "#e4a948", "#ffd978", "#fff1c2"], w: 60, h: 76, emphasis: 0, seed: 6 },
};

export function create(o) {
  const C = fit(o.palette, 6), R = new Rng(o.seed * 53 + 1), hw = o.w / 2, hh = o.h / 2, boost = 1 + 0.35 * Math.max(0, Math.min(1, o.emphasis));
  const corners = [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]];
  const stars = Array.from({ length: R.chance(0.5) ? 2 : 3 }, (_, i) => {
    const [cx, cy] = corners[(i * 2 + R.int(0, 1)) % 4];
    return { x: cx * R.range(0.55, 0.95), y: cy * R.range(0.55, 0.95), at: 0.05 + i * 0.1 + R.range(0, 0.05), len: R.range(4, 7) };
  });
  const per = 2 * (o.w + o.h), start = R.range(0, per);
  const edge = (s) => {
    s = ((s % per) + per) % per;
    if (s < o.w) return [-hw + s, -hh];
    if ((s -= o.w) < o.h) return [hw, -hh + s];
    if ((s -= o.h) < o.w) return [hw - s, hh];
    return [-hw, hh - (s - o.w)];
  };
  let t = 0;
  return {
    update(dt) { t += dt; },
    draw(p) {
      if (t >= D) return;
      // the edge light: a short bright segment travelling ~40% of the way round
      const e = envelope(t, 0, 0.08, 0.32, 0.46) * boost, head = start + per * 0.4 * Math.min(1, t / 0.42);
      for (let i = 0; i < 24; i++) {
        const [x, y] = edge(head - i * 1.2), a = e * (1 - i / 24);
        p.dot(x, y, i < 4 ? C[5] : C[4], Math.min(1, a));
        if (i % 6 === 0) p.glow(x, y, 3, C[4], 0.18 * a);
      }
      for (const s of stars) {
        const l = envelope(t, s.at, s.at + 0.07, s.at + 0.13, s.at + 0.3);
        glint(p, s.x, s.y, s.len * l * boost, C[5], C[4], Math.min(1, l * boost), 0.35);
      }
    },
  };
}
