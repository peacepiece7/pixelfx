import { clamp, ease, Rng, smooth, TAU } from "../../core/index.js";
import { plus } from "./_lib.js";
import { HEAL, colors, envelope } from "./_adelvin.js";
import { pool, softShade } from "../_soft.js";

export const meta = {
  name: "Michael healing pulse",
  desc: "A full-radius mint sanctuary ignites at once: ivory rune engravings, a petal mandala, rising aurora veils and eight healing crosses dissolve in 0.7 seconds.",
  tags: ["holy", "adelvin", "michael", "heal", "runes", "aura", "pulse", "one-shot"],
  size: [272, 160],
  origin: [136, 110],
  duration: .7,
  loop: false,
  fps: 30,
  bg: "ground",
  options: { palette: HEAL, radius: 100, seed: 43 },
};

const SY = .27;
// Four authored geometric glyphs, not a font or an external image. Their local
// tangent/radius coordinates are projected onto the same plane as the seal.
const GLYPHS = [
  [[[-3,-4],[0,-1],[3,-4]],[[0,-1],[0,4]],[[-2,2],[2,2]]],
  [[[0,-4],[-3,0],[0,4],[3,0],[0,-4]],[[-3,0],[3,0]]],
  [[[-3,-3],[-3,3],[3,3]],[[0,-4],[0,0],[3,0]]],
  [[[-3,-3],[0,0],[-3,3]],[[3,-3],[0,0],[3,3]],[[0,0],[0,4]]],
];

function floorPoint(angle, radius, height = 0) {
  return [Math.cos(angle) * radius, Math.sin(angle) * radius * SY - height];
}

// Continuous one-pixel rims; a single rolling ivory catch gives the mint field
// a clear leading edge without filling its interior with opaque white.
function rim(p, r, height, t, C, alpha, back, phase = 0, accent = false) {
  const n = Math.max(48, Math.ceil(r * 5)), sweep = t * 7 + phase;
  let last;
  for (let i = 0; i <= n; i++) {
    const g = i / n * TAU;
    if ((Math.sin(g) < 0) !== back) { last = null; continue; }
    const pt = floorPoint(g, r, height);
    const catchLight = Math.cos(g - sweep) > .87;
    const c = C[catchLight ? 7 : accent ? 5 : 3];
    if (last) p.line(...last, ...pt, c, alpha * (back ? .65 : .95));
    last = pt;
  }
}

function seal(p, t, r, C, alpha, back) {
  const ink = alpha * (1 - smooth(.34, .66, t));
  const breathe = 1 + Math.sin(t * 8) * .009;
  rim(p, r * breathe, 0, t, C, ink, back, 0, true);
  rim(p, r * .95, 0, t, C, ink * .65, back, 1);
  rim(p, r * .78, 0, t, C, ink * .85, back, 2, true);
  rim(p, r * .61, 0, t, C, ink * .65, back, 3);

  for (let i = 0; i < 16; i++) {
    const g = i * TAU / 16;
    if ((Math.sin(g) < 0) !== back) continue;
    const sn = Math.sin(g), cs = Math.cos(g);
    const scale = r / 100, rr = r * .865;
    const point = ([x, y]) => [cs * (rr + y * scale) - sn * x * scale,
      (sn * (rr + y * scale) + cs * x * scale) * SY];
    for (const stroke of GLYPHS[i % GLYPHS.length])
      p.polyline(stroke.map(point), C[(i + Math.floor(t * 10)) % 5 === 0 ? 7 : 5], ink * .9);
    const a = floorPoint(g, r * .96), b = floorPoint(g, r * 1.015);
    p.line(...a, ...b, C[6], ink);
    if (i % 2 === 0) {
      const pt = floorPoint(g, r * .78);
      p.glow(...pt, 5, C[4], ink * .16);
    }
  }

  // Eight interwoven almond petals form a legible sanctuary rosette. The center
  // stays open so the summon body remains the visual focus when applied later.
  for (let petal = 0; petal < 8; petal++) {
    const g = petal * TAU / 8;
    if ((Math.sin(g) < 0) !== back) continue;
    for (const side of [-1, 1]) {
      const pts = [];
      for (let j = 0; j <= 12; j++) {
        const v = j / 12, d = r * (.14 + .47 * v);
        const angle = g + side * Math.sin(v * Math.PI) * .2;
        pts.push(floorPoint(angle, d));
      }
      p.polyline(pts, C[side < 0 ? 2 : 4], ink * .65);
    }
  }
}

// Two short comet-like catches illuminate the engravings as they circulate.
// These live entirely on the ground and carry no projectile or healing state.
function orbitLight(p, t, r, C, alpha, back) {
  for (let i = 0; i < 2; i++) {
    const g = i * Math.PI + t * 8;
    if ((Math.sin(g) < 0) !== back) continue;
    const k = alpha * (1 - smooth(.28, .61, t));
    const pt = floorPoint(g, r * .9);
    for (let j = 1; j <= 9; j++) {
      const a = floorPoint(g - j * .025, r * .9);
      const b = floorPoint(g - (j - 1) * .025, r * .9);
      p.line(...a, ...b, C[6], k * (1 - j / 10) * .8);
    }
    p.line(pt[0] - 2, pt[1], pt[0] + 2, pt[1], C[7], k);
    p.line(pt[0], pt[1] - 2, pt[0], pt[1] + 2, C[6], k * .7);
    p.glow(...pt, 9, C[4], k * .3);
  }
}

function veils(p, t, r, C, alpha, back, seed) {
  const R = new Rng(seed + 791);
  for (let i = 0; i < 12; i++) {
    const g = (i + .25) * TAU / 12, sn = Math.sin(g);
    const h = R.range(19, 34), width = R.range(4, 7), delay = R.range(0, .045);
    if ((sn < 0) !== back) continue;
    const u = clamp((t - delay) / .64);
    const energy = Math.sin(Math.PI * u) ** .65 * alpha;
    if (energy < .01) continue;
    const [x, y] = floorPoint(g + t * .13, r * .75);
    const height = h * (.45 + .55 * ease.outCubic(u));
    // Small translucent folds, brighter at their lower roots, with a narrow
    // wandering edge. These are healing auroras rather than solid light pillars.
    softShade(p, x - width - 4, y - height - 1, x + width + 4, y + 1, (px, py, out) => {
      const v = clamp((y - py) / height);
      const axis = x + Math.sin(v * 3 - t * 10 + i) * v * 3;
      const w = width * (1 - v * .68), q = Math.abs(px - axis) / w;
      if (q > 1 || py > y || py < y - height) return;
      const edge = 1 - smooth(.7, 1, q), tip = 1 - smooth(.7, 1, v);
      out.c = C[q > .65 ? 4 : 2];
      out.a = energy * edge * tip * (back ? .2 : .29);
      out.l = C[3]; out.k = energy * edge * tip * .09;
    });
    const edge = [];
    for (let j = 0; j <= 10; j++) {
      const v = j / 10;
      edge.push([x + Math.sin(v * 3 - t * 10 + i) * v * 3 - width * (1 - v * .68), y - v * height]);
    }
    p.polyline(edge, C[4], energy * .45);
  }
}

function crosses(p, t, r, C, alpha, back, seed) {
  const R = new Rng(seed);
  for (let i = 0; i < 8; i++) {
    const g = (i + .5) * TAU / 8;
    const delay = R.range(0, .055), rise = R.range(19, 30);
    const u = clamp((t - delay) / (.65 - delay));
    if ((Math.sin(g) < 0) !== back || u <= 0 || u >= 1) continue;
    const k = alpha * smooth(0, .1, u) * (1 - smooth(.55, 1, u));
    const [x, y] = floorPoint(g, r * .67, 3 + rise * ease.outCubic(u));
    plus(p, x, y, i % 3 === 0 ? 4 : 3, 1, C, k * (back ? .7 : 1), true);
    p.glow(x, y, 8, C[4], k * .25);
    p.line(x, y + 5, x, y + 10, C[3], k * .35);
  }
}

function layer(p, t, o, back) {
  // Stable common-frame timing even when update() was partitioned differently.
  t = Math.round(t * 1e9) / 1e9;
  const a = envelope(t, meta.duration);
  if (!a) return;
  const r = Math.max(0, Number.isFinite(o.radius) ? o.radius : 100);
  if (!r) return;
  const C = colors(o);
  // Engravings fade as continuous translucent ink instead of breaking into
  // checkerboard dots. Keep the existing painter's placement and light controls.
  const source = p, surface = Object.create(source);
  surface.put = (x, y, c, alpha = 1) => source.blendPx(x, y, c, alpha);
  p = surface;
  if (back) {
    pool(p, 0, 0, r * 1.1, r * .34, C[2], a * .42 * (1 - t));
    pool(p, 0, -1, r * .64, r * .19, C[4], a * .26 * (1 - t));
  }
  seal(p, t, r, C, a, back);
  orbitLight(p, t, r, C, a, back);
  veils(p, t, r, C, a, back, o.seed);
  // The one outgoing pulse starts at 94% radius, not at the center. A delayed
  // elevated inner hoop is an aura accent, never another heal or duration tick.
  const u = t / meta.duration;
  rim(p, r * (.94 + .13 * ease.outCubic(u)), 0, t, C,
    a * (1 - smooth(.12, .66, t)), back, 0, true);
  rim(p, r * (.66 + .12 * u), ease.outCubic(u) * 24, t, C,
    a * Math.sin(Math.PI * u) * .55, back, 2);
  crosses(p, t, r, C, a, back, o.seed);
}

export const drawBack = (p, t, o) => layer(p, t, o, true);
export const draw = (p, t, o) => layer(p, t, o, false);
