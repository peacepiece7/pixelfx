import { Rng, fit, smooth, noise2, TAU } from "../../core/index.js";
import { billow, bead, lace } from "./_lib.js";

export const meta = {
  name: "Aorbion sea dragon",
  desc: "A horned water dragon surges through a foaming bow wave: a shaded serpentine body, plated belly, streaming fins, talons and a roaring jaw trail spray across a 300px lane.",
  tags: ["water", "dragon", "ultimate", "charge", "one-shot"],
  size: [360, 160], origin: [24, 112], duration: 1, loop: false, fps: 30, bg: "ground",
  options: { palette: ["#071e38", "#0c4169", "#147d9c", "#32b9d0", "#8de8ed", "#e3ffff"], seed: 17 },
};

// Host owns travel and facing. Local animation only articulates the dragon and its water.
const spine = (x, t) => -31 + Math.sin(x / 270 * TAU * 1.25 - t * 9) * (5 + 6 * (1 - x / 300));
const width = x => 2 + 17 * Math.sin(Math.PI * Math.min(1, x / 295)) ** 0.65;
const strength = t => smooth(0, 0.07, t) * (1 - smooth(0.79, 1, t));

export function drawBack(p, t, o) {
  if (t < 0 || t >= meta.duration) return;
  const C = fit(o.palette, 8), k = strength(t);
  // Thin textured wake anchors the creature to water instead of a floating neon ribbon.
  p.ellipse(151, 1, 148, 12, C[1], k * 0.2);
  lace(p, 151, 0, 148, 13, k * 0.85, C, t * 18, o.seed);
  const R = new Rng(o.seed);
  for (let i = 0; i < 24; i++) {
    const x = R.range(16, 286), z = R.range(-12, 10), u = (t * 2.5 + R.next()) % 1;
    p.line(x, z, x - 10 - 22 * u, z, C[3], k * Math.sin(u * Math.PI) * 0.4);
  }
}

export function draw(p, t, o) {
  if (t < 0 || t >= meta.duration) return;
  const C = fit(o.palette, 8), k = strength(t), R = new Rng(o.seed);
  // Broad swept dorsal fins have dark roots, translucent blue faces and pale tips.
  for (let x = 34; x < 258; x += 18) {
    const y = spine(x, t) - width(x) * 0.68, sway = Math.sin(t * 12 - x * 0.06) * 3;
    const pts = [[x - 10, y + 4], [x - 20 + sway, y - 14], [x - 6, y - 8], [x + 7, y + 1]];
    p.poly(pts, C[2], k);
    p.polyline([pts[1], pts[2], pts[3]], C[5], k * 0.85);
  }
  // Solid silhouette, lit back, deep underside, running caustics and a segmented belly.
  const columns = Array.from({ length: 279 }, (_, x) => ({
    w: width(x + 0.5), y: spine(x + 0.5, t), flow: noise2(x * 0.19 - t * 9, t * 7, o.seed),
  }));
  p.shade(0, -68, 278, 2, (x, y, out) => {
    const column = columns[Math.max(0, Math.min(278, Math.floor(x)))];
    const w = column.w, dy = y - column.y, q = dy / w;
    if (Math.abs(q) > 1) return;
    const flow = column.flow * 0.7 + Math.sin(y * 0.4 + x * 0.15 - t * 11) * 0.3;
    const belly = q > 0.27, plate = Math.sin(x * 0.44 + q * 3);
    out.c = Math.abs(q) > 0.92 ? C[0] : q < -0.68 ? C[6] : q < -0.38 ? C[4]
      : belly ? (plate > 0.25 ? C[4] : C[2]) : flow > 0.28 ? C[4] : flow < -0.25 ? C[1] : C[3];
    out.a = k;
  });
  // Four swept limbs, each ending in three distinct hooked talons.
  for (const [x, side] of [[154, -1], [179, 1], [225, -1], [241, 1]]) {
    const y = spine(x, t) + 5, bob = Math.sin(t * 10 + x) * 3;
    const pts = [[x - 5, y], [x + 5, y - 2], [x + 13, y + 10 * side],
      [x + 3, y + 19 * side + bob], [x - 3, y + 15 * side], [x + 4, y + 8 * side]];
    p.poly(pts, C[2], k); p.polyline(pts.slice(1, 4), C[5], k);
    for (let j = 0; j < 3; j++) p.polyline([[x + j * 4, y + 15 * side + bob],
      [x + j * 4 + 6, y + 20 * side + bob], [x + j * 4 + 9, y + 15 * side + bob]], C[6], k);
  }
  // Crown, horns, brow, long snout and open jaw establish a dragon silhouette at battle scale.
  const y = spine(272, t);
  const head = [[256, y + 8], [254, y - 11], [267, y - 20], [282, y - 19],
    [290, y - 11], [308, y - 7], [315, y - 1], [311, y + 5], [288, y + 3], [276, y + 13]];
  p.poly(head, C[1], k);
  p.poly(head.map(([x, yy]) => [x, yy - 2]), C[3], k);
  p.poly([[261, y - 12], [270, y - 19], [282, y - 18], [291, y - 9], [306, y - 6], [292, y - 5], [279, y - 10]], C[5], k);
  for (const [x, h] of [[261, 29], [274, 33]]) {
    p.poly([[x - 3, y - 13], [x - 14, y - h], [x - 5, y - h + 4], [x + 3, y - 17]], C[4], k);
    p.polyline([[x - 14, y - h], [x - 5, y - h + 4], [x + 3, y - 17]], C[7], k);
  }
  p.poly([[279, y + 8], [293, y + 14], [309, y + 9], [313, y + 3], [297, y + 7], [287, y + 2]], C[2], k);
  p.polyline([[280, y + 8], [293, y + 14], [309, y + 9]], C[5], k);
  for (const x of [292, 300, 307]) p.tri(x, y + 1, x + 3, y + 2, x + 1, y + 7, C[7], k);
  p.line(278, y - 9, 285, y - 7, C[0], k);
  p.line(280, y - 8, 285, y - 7, C[7], k);
  p.glow(283, y - 7, 6, C[4], k * 0.3);
  p.dot(308, y - 4, C[0], k);
  for (const side of [-1, 1]) p.polyline([[294, y + 1], [307, y + side * 12], [319, y + side * 13], [325, y + side * 8]], C[6], k * 0.85);
  // Bow crest and the mane break into shaded water beads streaming backward.
  for (let i = 0; i < 18; i++) {
    const phase = R.next(), u = (t * 2 + phase) % 1, side = i % 2 ? 1 : -1;
    const x = 296 - u * 70, yy = -4 - Math.sin(u * Math.PI) * (17 + R.range(0, 18)) + side * 4;
    if (i < 9) billow(p, x, yy, (2 + R.range(0, 2)) * (1 - u * 0.65), C, k * (1 - u));
    bead(p, x - 9 * u, yy - 7, -95, -30 + 80 * u, i % 3 + 1, C, k * Math.sin(u * Math.PI));
  }
}
