import { fit, cycle, smooth, clamp, sparkle, TAU } from "../../core/index.js";
import { GOLD, oval } from "./_lib.js";

export const meta = {
  name: "Valhalla zone",
  desc: "A gold seal unfolds beneath the caster: rotating runes, a radiant compass and rising rim motes brighten on each second, then fold into the floor.",
  tags: ["holy", "gold", "zone", "aoe", "runes", "loop"],
  size: [224, 160],
  origin: [112, 104],
  duration: 6,
  loop: true,
  fps: 30,
  bg: "ground",
  actor: 2,
  // null uses the preview's 1 Hz tick; a caller-supplied 0..1 controls the whole seal.
  options: { palette: GOLD, seed: 17, pulse: null },
};

const RADIUS = 90, PERSPECTIVE = 0.45;

function seal(p, t, o) {
  const C = fit(o.palette, 8);
  const open = smooth(0, 0.3, t) * (1 - smooth(5.7, 6, t));
  if (open <= 0) return;
  const tick = o.pulse == null ? (1 - smooth(0, 0.28, t % 1)) : clamp(o.pulse);
  const r = RADIUS * open, spin = t * TAU / 36, alpha = open * (0.86 + tick * 0.14);
  const point = (a, d) => [Math.cos(a) * r * d, Math.sin(a) * r * d * PERSPECTIVE];
  const stroke = (pts, bright = false) => {
    p.polyline(pts, C[bright ? tick > 0.5 ? 7 : 6 : tick > 0.5 ? 6 : 4], alpha);
  };

  // All floor ink stays behind the body, including the near half of the seal.
  // Thin rims and separated glyphs keep the interior transparent.
  for (const d of [1, 0.94, 0.68, 0.63]) {
    oval(p, 0, 0, r * d, r * d * PERSPECTIVE, C[d === 1 ? tick > 0.5 ? 7 : 6 : tick > 0.5 ? 6 : 4], alpha);
  }
  // Sparse light pools follow the ellipse instead of making a circular fog bank.
  for (let i = 0; i < 16; i++) {
    const a = i * TAU / 16, [x, y] = point(a, 0.97);
    p.glow(x, y, 14 * open, C[4], open * (0.19 + tick * 0.3));
  }
  p.glow(0, 0, 32 * open, C[4], open * (0.1 + tick * 0.2));

  // Twelve angular, alternating rune forms rotate around the compass.
  for (let i = 0; i < 12; i++) {
    const a = spin + i * TAU / 12;
    stroke([point(a - 0.035, 0.74), point(a, 0.88), point(a + 0.035, 0.74)]);
    stroke([point(a - 0.05, 0.8), point(a + 0.05, 0.8)]);
    if (i % 2 === 0) stroke([point(a, 0.88), point(a + 0.07, 0.85)]);
    const [x, y] = point(a + TAU / 24, 0.82);
    p.dot(x, y, C[6], alpha);
  }
  // An eight-point compass counter-rotates, with an open diamond at its heart.
  for (let i = 0; i < 8; i++) {
    const a = -spin + i * TAU / 8;
    stroke([point(a - 0.15, 0.22), point(a, i % 2 ? 0.42 : 0.59), point(a + 0.15, 0.22)], i % 2 === 0);
    const [x, y] = point(a, 0.66);
    p.glow(x, y, 5 * open, C[5], alpha * (0.16 + tick * 0.25));
    if (i % 2 === 0) sparkle(p, x, y, (1 + tick * 2) * open, C[6], C[4], alpha * (0.3 + tick * 0.4));
  }
  const diamond = Array.from({ length: 5 }, (_, i) => point(-spin + i * TAU / 4, 0.18));
  stroke(diamond, true);
  // A short, outward echo makes each damage tick readable without a solid fill.
  if (tick > 0) oval(p, 0, 0, r * (0.7 + 0.29 * (1 - tick)), r * (0.7 + 0.29 * (1 - tick)) * PERSPECTIVE, C[6], open * tick * 0.65);
}

function motes(p, t, o, back) {
  const open = smooth(0, 0.3, t) * (1 - smooth(5.7, 6, t));
  if (open <= 0) return;
  const C = fit(o.palette, 8);
  cycle(t, 6, 96, o.seed, (R) => R.range(0.8, 1.6), (age, life, R) => {
    const a = R.range(0, TAU);
    if ((Math.sin(a) < 0) !== back) return;
    const u = age / life, d = R.range(0.94, 1), rise = R.range(12, 28);
    const x = Math.cos(a) * RADIUS * d * open + Math.sin(u * 3 + a) * 2 * open;
    const y = Math.sin(a) * RADIUS * d * PERSPECTIVE * open - u * rise * open;
    const k = Math.sin(u * Math.PI) * open * (back ? 0.65 : 1);
    p.line(x, y + (2 + 3 * u) * open, x, y, C[4], k * 0.5);
    p.dot(x, y, C[6], k);
    p.glow(x, y, 3.5 * open, C[4], k * 0.25);
    if (R.next() > 0.78) sparkle(p, x, y, (1 + Math.sin(u * Math.PI) * 1.5) * open, C[7], C[5], k * 0.65);
  });
}

export function drawBack(p, t, o) {
  seal(p, t, o);
  motes(p, t, o, true);
}

export function draw(p, t, o) {
  motes(p, t, o, false);
}
