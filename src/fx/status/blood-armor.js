import { fit, TAU } from "../../core/index.js";

export const meta = {
  name: "Blood armor",
  desc: "A sustained blood-red aura shaped into paired pauldrons, a breastplate and plated gauntlets. Open seams pulse with heat while the head stays clear.",
  tags: ["status", "rage", "armor", "gauntlet", "buff", "loop"],
  size: [80, 80],
  origin: [40, 70],
  duration: 1.2,
  loop: true,
  fps: 30,
  bg: "ground",
  options: {
    palette: ["#2a0710", "#5c0b1a", "#8e1424", "#c0202e", "#e8483f", "#ff8a6a", "#fff1e8"],
    scale: 1,
  },
};

// Separate plates leave the hero visible through the aura; no stand-in body is painted.
const PLATES = [
  [[5, -34], [11, -39], [18, -35], [20, -30], [12, -28]],
  [[2, -31], [10, -29], [9, -20], [3, -16]],
  [[13, -26], [20, -28], [22, -18], [18, -13], [12, -17]],
];

export function drawBack(p, t, o) {
  const C = fit(o.palette, 7), pulse = 0.5 + 0.5 * Math.cos(t / meta.duration * TAU);
  for (const side of [-1, 1])
    p.glow(side * 14 * o.scale, -26 * o.scale, 12 * o.scale, C[3], 0.12 + pulse * 0.1);
}

export function draw(p, t, o) {
  const C = fit(o.palette, 7), pulse = 0.5 + 0.5 * Math.cos(t / meta.duration * TAU), s = o.scale;
  for (const side of [-1, 1]) {
    for (const plate of PLATES) {
      const pts = plate.map(([x, y]) => [side * x * s, y * s]);
      p.poly(pts, C[1], 0.3 + pulse * 0.12);
      p.polyline([...pts, pts[0]], C[3], 0.55 + pulse * 0.25);
      p.line(...pts[0], ...pts[1], C[5], 0.65 + pulse * 0.3);
    }
    // Three transverse knuckle ridges make the lower plates read as gauntlets.
    for (let i = 0; i < 3; i++) {
      const y = (-23 + i * 3) * s;
      p.line(side * 14 * s, y, side * 19 * s, y - s, C[4], 0.5 + pulse * 0.35);
    }
    p.dot(side * 11 * s, -37 * s, C[6], 0.35 + pulse * 0.4);
  }
}
