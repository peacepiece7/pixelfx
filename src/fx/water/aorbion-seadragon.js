import { Rng, fit, clamp, smooth, noise2, TAU } from "../../core/index.js";
import { bead, ring, billow } from "./_lib.js";
import { haze, pool, softShade } from "../_soft.js";

export const meta = {
  name: "Aorbion sea dragon",
  desc: "A broad tidal wave rises from shallow water, hints at a dragon in its curling lip, then settles along its full length into foam and ripples.",
  tags: ["water", "dragon", "ultimate", "charge", "one-shot"],
  size: [400, 200],
  origin: [40, 144],
  duration: 1,
  loop: false,
  fps: 40,
  bg: "ground",
  options: {
    palette: ["#071e38", "#0c4169", "#147d9c", "#32b9d0", "#8de8ed", "#e3ffff"],
    seed: 17,
  },
};

// 50ms keys: formation, heave, bend, lip fold, curl shear, wisp lift, light, foam, settling.
export const choreography = [
  [0.00, .00,  0, -.20, .00, -.30,  .10, .00, .00, .00],
  [0.05, 0.120,  5, -.35, .00, -.25,  .20, .12, .12, .00],
  [0.10, 0.380,  1, -.10, .10, -.15,  .55, .38, .35, .00],
  [0.15, 0.720, -4,  .25, .40,  .20,  .70, .72, .65, .00],
  [0.20, 1.000, -7,  .60, .85,  .65,  .40, 1.0, .90, .00],
  [0.25, 1.000, -5,  .85, 1.0,  .90,  .00, .82, .72, .00],
  [0.30, 1.000, -1,  .55, .70,  .30, -.30, .72, .62, .00],
  [0.35, 1.000,  3,  .05, .40, -.20, -.55, .62, .52, .00],
  [0.40, 0.990,  4, -.40, .25, -.40, -.15, .65, .65, .00],
  [0.45, 0.970,  1, -.65, .50, -.10,  .30, .82, .82, .00],
  [0.50, 0.930, -3, -.35, .72,  .40,  .60, .72, .67, .00],
  [0.55, 0.850, -5,  .10, .55,  .65,  .20, .58, .55, .00],
  [0.60, 0.740, -3,  .45, .35,  .20, -.30, .48, .45, .08],
  [0.65, 0.610,  0,  .60, .30, -.25, -.55, .40, .40, .24],
  [0.70, 0.470,  3,  .30, .20, -.50, -.20, .30, .35, .42],
  [0.75, 0.340,  5, -.10, .12, -.60,  .10, .22, .28, .58],
  [0.80, 0.220,  6, -.30, .08, -.70,  .20, .14, .20, .73],
  [0.85, 0.120,  7, -.15, .00, -.80,  .00, .08, .14, .88],
  [0.90, 0.050,  8,  .00, .00, -.80,  .00, .03, .08, 1.0],
  [0.95, 0.012,  8,  .00, .00, -.80,  .00, .01, .03, 1.0],
  [1.00, 0.000,  8,  .00, .00, -.80,  .00, .00, .00, 1.0],
];

function pose(t) {
  const f = clamp(t / .05, 0, choreography.length - 1);
  const i = Math.min(choreography.length - 2, Math.floor(f));
  const u = smooth(0, 1, f - i);
  return choreography[i].map((v, j) => v + (choreography[i + 1][j] - v) * u);
}

// The silhouette is a grounded surge, not an articulated animal. The leading
// hollow is cut from the water volume; a short rolled lip suggests a snout.
function spine(x, s) {
  return (-8 - 29 * (x / 300) ** 1.5 + Math.sin(x * .045 - s[3]) * 3) * lift(s);
}

// The whole 300px surge rises and settles together. No moving erase plane:
// both ends feather into shallow water, so a long attack never becomes a stump.
function cohesion(x, y, t, s, seed) {
  const shore = smooth(0, 27, x) * (1 - smooth(301, 321, x));
  return shore * smooth(0, .12, t) * (1 - smooth(.83, 1, t));
}

function lift(s) { return Math.max(.002, s[1]); }

function waveTop(x, t, s) {
  const u = clamp(x / 300);
  const surge = 12 + 48 * u ** 1.65;
  const rolling = Math.sin(x * .046 - t * 8) * (2 + u * 5);
  const shoulder = 14 * Math.exp(-(((x - 245) / 40) ** 2));
  return (-(surge + shoulder + rolling) + s[2] * .35) * lift(s) * smooth(0, 32, x);
}

function hollow(x, y, t, s) {
  const cx = 304 + Math.sin(t * 9) * 3 + s[5] * 2;
  const cy = (-23 + s[2] * .2) * lift(s);
  return ((x - cx) / 28) ** 2 + ((y - cy) / (23 * lift(s))) ** 2;
}

// Water is shaded in long curved ribbons. Quantized transverse noise keeps
// connected pixel clusters instead of a static granular fill or smooth gradient.
function body(p, C, t, s, seed) {
  const tops = Array.from({length: 321}, (_, x) => waveTop(x, t, s));
  const survival = Array.from({length: 81}, (_, x) =>
    Array.from({length: 33}, (_, y) => cohesion(x * 4, y * 3 - 90, t, s, seed)));
  const fronts = Array.from({length: 96}, (_, y) => 311 + Math.sin((y - 90) * .08 + t * 6) * 3);
  const sample = (x, y, out) => {
    const top = tops[clamp(Math.floor(x), 0, 320)];
    const floor = (1 + Math.sin(x * .075 + t * 5) * 2) * lift(s);
    const tip = fronts[clamp(Math.floor(y + 90), 0, 95)] - 8 * smooth(.4, 1, -y / (72 * lift(s)));
    if (y < top || y > floor || x > tip || hollow(x, y, t, s) < 1) return;
    const k = survival[clamp(Math.floor(x / 4), 0, 80)][clamp(Math.floor((y + 90) / 3), 0, 32)];
    if (k < .02) return;
    const v = (y - top) / (floor - top);
    const bend = Math.atan2((y / lift(s) + 23) / 23, (x - 304) / 28);
    const curl = Math.sqrt(hollow(x, y, t, s));
    const turn = smooth(210, 290, x);
    const line = (curl * 17 + bend * 3) * turn + (v * 24 + Math.sin(x * .035 - t * 4) * 3) * (1 - turn);
    const flow = noise2(Math.floor(line / 1.5) * .65, Math.floor(x / 5) * .14 - t * 8, seed + 7);
    const channel = Math.sin(line * 1.1 + t * 12 + flow * 1.7);
    let level = channel > .82 ? 4 : channel > .25 ? 3 : channel > -.65 ? 2 : 1;
    if (v > .84) level = Math.max(1, level - 1);
    const strand = noise2(Math.floor(line * 2) * 1.37, Math.floor(x / 4) * .21 - t * 11, seed + 18);
    if (strand > .27) level = Math.min(5, level + 1);
    if (strand < -.4) level = Math.max(1, level - 1);
    const rim = y - top;
    if (rim < 1.5 && flow > -.3) level = 5;
    if (curl < 1.1) level = 3;
    out.c = C[level];
    out.a = k * (v > .94 ? .6 : .94) * (1 - smooth(tip - 6, tip, x));
  };
  // Broad water planes are authored on 2px clusters; 1px foam and caustics are
  // overlaid separately. Cache each cluster once instead of repeating its noise.
  const cells = new Array(160 * 48);
  softShade(p, 0, -88, 320, 5, (x, y, out) => {
    const ix = Math.floor(x / 2), iy = Math.floor((y + 88) / 2);
    const index = iy * 160 + ix;
    let cell = cells[index];
    if (!cell) {
      cell = { c: 0, a: 1 };
      sample(ix * 2 + .5, iy * 2 - 87.5, cell);
      cells[index] = cell;
    }
    out.c = cell.c;
    out.a = cell.a;
  });
}

// Foam follows several asynchronous rolling ridges, not an animal's dorsal fins.
// Each crest folds forward, breaks into beads, then leaves a dark trough behind it.
function crest(p, C, t, s, seed) {
  for (let lane = 0; lane < 4; lane++) {
    const start = 15 + lane * 19;
    let previous = null;
    for (let x = start; x < 303 - lane * 9; x += 2) {
      const top = waveTop(x, t, s);
      const v = lane / 5;
      const y = top * (1 - v) + Math.sin(x * .052 - t * (8 + lane) + lane) * (2 + lane) * lift(s);
      const flow = noise2(Math.floor(x / 3) * .43 - t * (4 + lane), lane * 3.7, seed + 33);
      const k = cohesion(x, y, t, s, seed) * (lane === 0 ? .95 : .62);
      if (k < .03 || hollow(x, y, t, s) < 1.05) { previous = null; continue; }
      if (previous && flow > -.48) {
        p.line(previous[0], previous[1] + 2, x, y + 2, C[3], k);
        p.line(previous[0], previous[1], x, y, C[flow > .25 ? 7 : 5], k);
      }
      if (flow > .2 && x % 6 < 2) {
        const radius = (1.5 + (flow + .2) * (lane === 0 ? 3.8 : 2.2)) * Math.sqrt(lift(s));
        billow(p, x, y - .5, radius, C, k);
        p.blend(x - 1, y - radius, C[7], k);
      }
      previous = [x, y];
    }
  }
}

function head(p, C, t, s, seed) {
  const k = smooth(.05, .2, t) * (1 - smooth(.76, .98, t));
  if (k < .01) return;
  // A broad curling brow and rounded drooping lip are the only dragon cues.
  // No eyes, teeth, horns, limbs, separate head sphere or outlined mouth.
  const top = waveTop(285, t, s);
  for (let lane = 0; lane < 3; lane++) {
    let last = null;
    for (let i = 0; i <= 35; i++) {
      const u = i / 35;
      const x = 253 + 61 * u - 8 * u ** 4;
      const y = top + (-Math.sin(u * Math.PI) * 8 + u ** 4 * (22 + s[4] * 5) + lane * 3) * lift(s);
      const n = noise2(i * .31 - t * 7, lane * 2, seed + 27);
      if (last) {
        p.beam(last[0], last[1] + 2, x, y + 2, (5 - lane * .7) * Math.sqrt(lift(s)), C[4], k * .8);
        p.line(last[0], last[1], x, y, C[n > .12 ? 7 : 5], k);
      }
      if (i % 4 === 0) billow(p, x, y, (1.5 + Math.max(0, n) * 2) * Math.sqrt(lift(s)), C, k * .9);
      last = [x, y];
    }
  }
  // Wind tears two low wisps from the water lip. Their lag differs from the crest.
  for (let side = 0; side < 2; side++) {
    let last = null;
    for (let i = 0; i < 24; i++) {
      const u = i / 23;
      const x = 302 - u * (34 + side * 17);
      const y = top + (19 + side * 8 + Math.sin(u * Math.PI * 1.4 - t * 5) * (5 + s[6] * 2)) * lift(s);
      if (last) p.line(last[0], last[1], x, y, C[4], k * (1 - u) * .5);
      last = [x, y];
    }
  }
  p.glow(280, top + 6, 22, C[4], k * s[7] * .16);
}

// Broken curtains of foam slide down the face, branching into droplets.
// These broad patches bridge the fine flow ribbons and the foamy crest.
function fallingLace(p, C, t, s, seed) {
  for (let i = 0; i < 13; i++) {
    const x0 = 35 + i * 21;
    const phase = (t * (1.6 + i % 3 * .22) + i * .277) % 1;
    const top = waveTop(x0, t, s);
    const length = (9 + i % 4 * 5) * Math.sin(phase * Math.PI) * lift(s);
    const k = cohesion(x0, top, t, s, seed) * Math.sin(phase * Math.PI);
    for (let j = 0; j < length; j += 2) {
      const x = x0 - j * .48 + Math.sin(j * .25 + i) * 2;
      const y = top + j + phase * 8 * lift(s);
      if (hollow(x, y, t, s) < 1.05 || y > 0) continue;
      const n = noise2(i * 2 + j * .3, t * 7, seed + 108);
      if (n < -.32) continue;
      const r = (1 - j / (length + 2)) * (2.4 + Math.max(0, n) * 2);
      billow(p, x, y, r, C, k * .83);
    }
  }
  // The bow strikes the ground in several offset white foam tongues.
  for (let i = 0; i < 11; i++) {
    const x = 219 + i * 8 + Math.sin(i * 7) * 4;
    const phase = (t * 2.5 + i * .173) % 1;
    const k = cohesion(x, 0, t, s, seed) * Math.sin(phase * Math.PI);
    const xx = x + phase * 10, yy = -1 - Math.sin(phase * Math.PI) * (2 + i % 4);
    p.beam(xx - 4, yy + 2, xx + 3, yy, 2, C[4], k);
    billow(p, xx, yy, 1.2 + Math.sin(phase * Math.PI) * 1.4, C, k * .85);
  }
}

function droplets(seed) {
  const R = new Rng(seed), list = [];
  for (let i = 0; i < 76; i++) {
    const birth = .09 + R.range(0, .65), bow = i < 32;
    const x = bow ? R.range(270, 303) : R.range(22, 270);
    const s = pose(birth);
    list.push({
      birth, x,
      z: R.range(-14, 14),
      h: Math.max(3, -waveTop(x, birth, s) + R.range(-3, 4)),
      vx: bow ? R.range(-75, -20) : R.range(-26, 12),
      vz: R.range(-20, 20),
      vh: R.range(10, 65),
      size: R.next() < .24 ? 2 : 1,
      life: Math.min(.42, .99 - birth),
      seed: R.int(0, 10000),
    });
  }
  return list;
}

function spray(p, C, d, t, front) {
  const u = t - d.birth;
  if (u < 0 || u > d.life || (d.z >= 0) !== front) return;
  const land = (d.vh + Math.sqrt(d.vh * d.vh + 1320 * d.h)) / 660;
  const k = 1 - smooth(d.life - .12, d.life, u);
  if (u < land) {
    const x = d.x + d.vx * u, y = (d.z + d.vz * u) * .32 - d.h - d.vh * u + 330 * u * u;
    bead(p, x, y, d.vx, d.vz * .32 - d.vh + 660 * u, d.size, C, k);
    if (d.size > 1) p.glow(x, y, 3, C[4], k * .08);
  } else {
    const age = u - land, x = d.x + d.vx * land, z = (d.z + d.vz * land) * .32;
    ring(p, x, z, 1 + age * 25, .3, k * (1 - smooth(.02, .13, age)) * .45, C, {
      n: 1, half: front ? 1 : -1, seed: d.seed, hot: false,
    });
  }
}

function wake(p, C, t, s, seed, front) {
  const R = new Rng(seed + 56);
  for (let i = 0; i < 22; i++) {
    const x = R.range(10, 296), birth = R.range(.02, .65), life = R.range(.22, .4);
    const side = R.sign(), vx = R.range(-25, -6), radius = R.range(1.2, 2.6);
    const age = t - birth;
    if (age < 0 || age >= life || (side > 0) !== front) continue;
    const u = age / life, drift = (1 - Math.exp(-age * 5)) / 5;
    const xx = x + vx * drift, y = side * (3 + 14 * u);
    const k = smooth(0, .035, age) * (1 - smooth(.5, 1, u)) * (1 - smooth(.86, 1, t));
    p.disc(xx, y, radius, C[2], d => k * .22 * (1 - d));
    p.arc(xx, y, radius, .7, 3.4, 5.9, C[5], k * .65);
    p.blend(xx - .5, y - radius * .5, C[6], k * .6);
    if (u > .7) p.blend(xx + radius + (u - .7) * 4, y, C[4], (1 - u) * .7);
  }
  for (let i = 0; i < 9; i++) {
    const birth = .04 + i * .065, age = t - birth;
    if (age < 0 || age > .36) continue;
    const x = 14 + i * 33, r = 4 + 16 * smooth(0, .3, age);
    ring(p, x, 0, r, .4, (1 - age / .36) * .4, C, {
      n: 1, half: front ? 1 : -1, wob: .6, seed: seed + i, hot: false,
    });
  }
  if (!front) {
    pool(p, 151, 0, 150, 18, C[3], s[8] * .14);
    for (let i = 0; i < 6; i++) {
      const x = 30 + i * 48;
      haze(p, x, 2, 13, C[2], s[8] * .07);
    }
  }
}

// Staggered sheets roll out under the body. Each row has a different birth and curl.
function waterSheets(p, C, t, s, seed, front) {
  const sites = [[27, .05, 22], [71, .12, 27], [123, .19, 23], [174, .27, 29], [226, .34, 24], [278, .42, 20]];
  for (let i = 0; i < sites.length; i++) {
    const [x, birth, radius] = sites[i], age = t - birth;
    if (age < 0 || age > .42) continue;
    const u = age / .42, k = Math.sin(u * Math.PI) * (1 - smooth(.84, 1, t));
    const side = front ? 1 : -1, drift = side * (3 + 11 * u);
    softShade(p, x - radius, drift - 3, x + radius, drift + 3, (px, py, out) => {
      const q = (px - x) / radius;
      const crest = drift + Math.sin(q * Math.PI + i * .8) * 1.4;
      const d = Math.abs(py - crest);
      if (Math.abs(q) > 1 || d > 2) return;
      out.c = C[d < .55 ? 5 : d < 1.2 ? 3 : 2];
      out.a = k * (1 - Math.abs(q)) * (front ? .6 : .35);
    });
    for (let j = 0; j < 3; j++) {
      const xx = x + (j - 1) * 7 - age * (5 + j * 4);
      const yy = drift - 1 + Math.sin(i + j * 2 + u * 3);
      const size = (1.1 + j * .35) * k;
      if (size > .2) billow(p, xx, yy, size, C, front ? .65 : .4);
    }
  }
}

function bowFoam(p, C, t, s, seed, front) {
  for (let i = 0; i < 9; i++) {
    const side = i % 2 ? 1 : -1;
    if ((side > 0) !== front) continue;
    const born = .1 + i * .025, age = t - born;
    if (age < 0 || age > .35) continue;
    const k = Math.sin(age / .35 * Math.PI) * s[8];
    const x = 300 - age * (30 + i * 3);
    const y = side * (3 + age * 18) - Math.sin(age / .35 * Math.PI) * (5 + i % 3 * 2);
    billow(p, x, y, (1.3 + i % 3 * .45) * k, C, .75);
    haze(p, x - 2, y + 2, 5, C[3], k * .12);
  }
}

// Water lost from the height becomes a broad, low wash. Its footprint stays
// connected across the attack lane while separate foam patches stretch outward.
function settlingWash(p, C, t, s, seed, front) {
  const settle = smooth(.42, .78, t);
  const fade = 1 - smooth(.82, 1, t);
  if (settle * fade <= 0) return;
  for (let i = 0; i < 9; i++) {
    const x = 20 + i * 34 + Math.sin(i * 8.1) * 7;
    const delayed = smooth(.42 + i % 4 * .025, .84, t);
    const r = 7 + delayed * (12 + i % 3 * 5);
    const side = front ? 1 : -1;
    const z = side * (2 + delayed * (6 + i % 4 * 2));
    ring(p, x, z, r, .25, Math.sin(delayed * Math.PI * .8) * fade * .28, C,
      { n: 1, half: side, seed: seed + i * 13, hot: false, wob: .8 });
    for (let j = 0; j < 3; j++) {
      const xx = x + (j - 1) * 5 + delayed * (j - 1) * 4;
      const yy = z + Math.sin(i * 2 + j + t * 8) * 1.3;
      const k = delayed * fade * (.45 + .2 * Math.sin(i + j));
      p.line(xx - 3, yy, xx + 3, yy, C[4], k);
      billow(p, xx, yy, (.7 + .5 * Math.sin(i * 3 + j) ** 2) * fade, C, k);
    }
  }
}

export function drawBack(p, t, o) {
  t = Math.round(t * 1e9) / 1e9;
  if (t <= 0 || t >= meta.duration) return;
  const C = fit(o.palette, 8), s = pose(t);
  waterSheets(p, C, t, s, o.seed, false);
  wake(p, C, t, s, o.seed, false);
  for (const d of droplets(o.seed)) spray(p, C, d, t, false);
  bowFoam(p, C, t, s, o.seed, false);
  settlingWash(p, C, t, s, o.seed, false);
}

export function draw(p, t, o) {
  t = Math.round(t * 1e9) / 1e9;
  if (t <= 0 || t >= meta.duration) return;
  const C = fit(o.palette, 8), s = pose(t);

  body(p, C, t, s, o.seed);
  crest(p, C, t, s, o.seed);
  head(p, C, t, s, o.seed);
  fallingLace(p, C, t, s, o.seed);
  // Restrained spray haze sits under the rolling crests; color carries the volume.
  for (const x of [48, 108, 172, 232]) {
    const y = spine(x, s), k = cohesion(x, y, t, s, o.seed);
    haze(p, x, y + 7, 10, C[3], k * .12);
    p.glow(x, y - 4, 15, C[3], k * s[7] * .06);
  }
  bowFoam(p, C, t, s, o.seed, true);
  waterSheets(p, C, t, s, o.seed, true);
  wake(p, C, t, s, o.seed, true);
  for (const d of droplets(o.seed)) spray(p, C, d, t, true);
  settlingWash(p, C, t, s, o.seed, true);
}
