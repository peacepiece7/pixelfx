import { Rng, fit, clamp, smooth, noise2, TAU } from "../../core/index.js";
import { bead, ring, billow } from "./_lib.js";
import { haze, pool, softShade } from "../_soft.js";

export const meta = {
  name: "Aorbion sea dragon",
  desc: "A legless water spirit flows through translucent currents; a soft indistinct head and trailing wisps dissolve into foam, spray and ripples.",
  tags: ["water", "dragon", "ultimate", "charge", "one-shot"],
  size: [368, 176],
  origin: [24, 128],
  duration: 1,
  loop: false,
  fps: 40,
  bg: "ground",
  options: {
    palette: ["#071e38", "#0c4169", "#147d9c", "#32b9d0", "#8de8ed", "#e3ffff"],
    seed: 17,
  },
};

// 50ms keys: formation, heave, body bend, three retired anatomical channels, light, foam, erosion.
// Retired columns retain the timeline layout; only the water body and wisps are rendered.
export const choreography = [
  [0.00, .00,  0, -.20, .00, -.30,  .10, .00, .00, .00],
  [0.05, .16,  5, -.35, .00, -.25,  .20, .12, .12, .00],
  [0.10, .42,  1, -.10, .10, -.15,  .55, .38, .35, .00],
  [0.15, .76, -4,  .25, .40,  .20,  .70, .72, .65, .00],
  [0.20, 1.0, -7,  .60, .85,  .65,  .40, 1.0, .90, .00],
  [0.25, 1.0, -5,  .85, 1.0,  .90,  .00, .82, .72, .00],
  [0.30, 1.0, -1,  .55, .70,  .30, -.30, .72, .62, .00],
  [0.35, 1.0,  3,  .05, .40, -.20, -.55, .62, .52, .00],
  [0.40, 1.0,  4, -.40, .25, -.40, -.15, .65, .65, .00],
  [0.45, 1.0,  1, -.65, .50, -.10,  .30, .82, .82, .00],
  [0.50, 1.0, -3, -.35, .72,  .40,  .60, .72, .67, .00],
  [0.55, 1.0, -5,  .10, .55,  .65,  .20, .58, .55, .00],
  [0.60, 1.0, -3,  .45, .35,  .20, -.30, .48, .45, .08],
  [0.65, .96,  0,  .60, .30, -.25, -.55, .40, .40, .24],
  [0.70, .85,  3,  .30, .20, -.50, -.20, .30, .35, .42],
  [0.75, .70,  5, -.10, .12, -.60,  .10, .22, .28, .58],
  [0.80, .50,  6, -.30, .08, -.70,  .20, .14, .20, .73],
  [0.85, .25,  7, -.15, .00, -.80,  .00, .08, .14, .88],
  [0.90, .00,  8,  .00, .00, -.80,  .00, .03, .08, 1.0],
  [0.95, .00,  8,  .00, .00, -.80,  .00, .01, .03, 1.0],
  [1.00, .00,  8,  .00, .00, -.80,  .00, .00, .00, 1.0],
];

function pose(t) {
  const f = clamp(t / .05, 0, choreography.length - 1);
  const i = Math.min(choreography.length - 2, Math.floor(f));
  const u = smooth(0, 1, f - i);
  return choreography[i].map((v, j) => v + (choreography[i + 1][j] - v) * u);
}

function spine(x, s) {
  const u = x / 280;
  const main = Math.sin(u * TAU * 1.1 - s[3] * 1.6) * (9 - u * 4);
  const shoulder = Math.sin(u * Math.PI) * s[3] * 5;
  return -33 + main + shoulder + s[2] * (.25 + u * .75);
}

function thickness(x) {
  return 1.2 + 15 * Math.sin(Math.PI * clamp(x / 302)) ** .8;
}

function cohesion(x, y, t, s, seed) {
  const cell = noise2(Math.floor(x / 4) * .7, Math.floor(y / 3) * .8, seed);
  const appear = smooth(x / 300 * .15, .05 + x / 300 * .15, t);
  const front = s[9] * 340;
  const remain = 1 - smooth(x - 12 + cell * 13, x + 24 + cell * 13, front);
  return appear * remain;
}

// Translucent polygon faces keep water volume soft without checkerboard fading.
function waterPoly(p, points, color, alpha) {
  if (alpha <= .01) return;
  const xs = points.map(v => v[0]), ys = points.map(v => v[1]);
  p.each(Math.min(...xs), Math.min(...ys), Math.max(...xs) + 1, Math.max(...ys) + 1, (x, y, sx, sy) => {
    let inside = false;
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
      const a = points[i], b = points[j];
      if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside;
    }
    if (inside) p.blendPx(sx, sy, color, alpha);
  });
}

// Curves are sampled in local pixel space. Bend changes with the authored delayed head motion.
function whisker(p, C, pts, k) {
  if (k <= .01) return;
  let previous = pts[0];
  for (let i = 1; i <= 24; i++) {
    const u = i / 24, v = 1 - u;
    const x = v ** 3 * pts[0][0] + 3 * v * v * u * pts[1][0] + 3 * v * u * u * pts[2][0] + u ** 3 * pts[3][0];
    const y = v ** 3 * pts[0][1] + 3 * v * v * u * pts[1][1] + 3 * v * u * u * pts[2][1] + u ** 3 * pts[3][1];
    p.line(previous[0], previous[1], x, y, C[u < .4 ? 6 : 4], k * (1 - u * .5));
    if (i < 10) p.blend(x, y + 1, C[2], k * .6);
    previous = [x, y];
  }
}

function dorsal(p, C, t, s, seed) {
  const fins = [[38, 10], [66, 13], [95, 9], [127, 16], [159, 12], [188, 17], [216, 13], [242, 10]];
  for (let i = 0; i < fins.length; i++) {
    const [x, height] = fins[i], delayed = pose(t - .008 * i);
    const y = spine(x, s) - thickness(x) * .7;
    const sway = (delayed[3] - s[3]) * 12 + noise2(i, t * 5, seed) * 2;
    const k = cohesion(x, y, t, s, seed);
    if (k < .03) continue;
    const tip = [x - 14 + sway, y - height];
    waterPoly(p, [[x - 9, y + 3], tip, [x - 2, y - 4], [x + 9, y + 2]], C[2], k * .8);
    p.polyline([tip, [x - 2, y - 4], [x + 9, y + 2]], C[5], k * .8);
    p.line(tip[0] + 2, tip[1] + 2, x, y, C[3], k * .7);
  }
}

function body(p, C, t, s, seed) {
  const columns = Array.from({ length: 281 }, (_, x) => ({
    y: spine(x, s),
    w: thickness(x),
    vein: noise2(x * .12 - t * 8, t * 3, seed),
  }));
  softShade(p, 0, -72, 280, 0, (x, y, out) => {
    const col = columns[clamp(Math.floor(x), 0, 280)];
    const q = (y - col.y) / col.w;
    if (Math.abs(q) > 1) return;
    const k = cohesion(x, y, t, s, seed);
    if (k < .03) return;
    const flow = noise2(Math.floor(x / 3) * .31 - t * 9, Math.floor(y / 2) * .3, seed + 7);
    out.c = C[q > .65 ? 1 : q > .25 ? 2 : q < -.8 ? 5 : flow > .25 ? 4 : 3];
    out.a = k * (.65 + .25 * (1 - Math.abs(q)));
    if (q < -.25 && q > -.6 && col.vein > .1) out.c = C[5];
  });
  // Disconnected caustic strokes travel through the body at different speeds.
  for (let i = 0; i < 20; i++) {
    const x = 14 + i * 13, y = spine(x, s);
    const k = cohesion(x, y, t, s, seed);
    const drift = noise2(i * 2, t * (5 + i % 3), seed + 19);
    if (k < .1 || drift < -.15) continue;
    const yy = y - thickness(x) * (.15 + .35 * drift);
    p.line(x - 3, yy, x + 3 + drift * 4, yy - 1, C[5], k * .65);
    if (i % 4 === 0) p.glow(x, yy, 9, C[3], k * s[7] * .07);
  }
}

function head(p, C, t, s) {
  const y = spine(272, s), k = smooth(.11, .2, t) * (1 - smooth(.78, .9, t));
  if (k <= 0) return;
  // A soft water mass only suggests a head: no eye sockets, jaw plates or facial lines.
  softShade(p, 250, y - 27, 320, y + 19, (x, yy, out) => {
    const crown = ((x - 274) / 21) ** 2 + ((yy - y + 5) / 17) ** 2;
    const muzzle = ((x - 296) / 20) ** 2 + ((yy - y + 1) / 11) ** 2;
    const flow = noise2(Math.floor(x / 2) * .23 - t * 7, Math.floor(yy / 2) * .2, 47);
    const d = Math.min(crown, muzzle) + flow * .1;
    if (d > 1) return;
    const upper = (yy - y + 22) / 40;
    out.c = C[d > .78 ? 2 : upper < .3 ? 5 : flow > .25 ? 4 : upper > .68 ? 2 : 3];
    out.a = k * (.42 + .5 * (1 - smooth(.6, 1, d)));
  });
  for (let i = 0; i < 6; i++) {
    const x = 263 + i * 8, yy = y - 8 + Math.sin(i * 1.7 + s[3]) * 4;
    haze(p, x, yy, 8 + i % 3, C[4], k * .11);
    if (i % 2 === 0) billow(p, x, yy - 4, 1.2 + s[8], C, k * .5);
  }
  const lag = pose(t - .045)[2] - s[2];
  whisker(p, C, [[298, y + 1], [315, y - 12], [300, y - 21 + lag], [278, y - 18]], k * .38);
  whisker(p, C, [[298, y + 3], [313, y + 13], [297, y + 20], [278, y + 14 - lag]], k * .3);
  p.glow(284, y - 7, 14, C[4], k * s[7] * .1);
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
      h: bow ? R.range(4, 20) : Math.max(3, -spine(x, s) - R.range(6, 16)),
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
    const k = smooth(0, .035, age) * (1 - smooth(.5, 1, u));
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

function unravel(p, C, t, s, seed) {
  const R = new Rng(seed + 99);
  for (let i = 0; i < 28; i++) {
    const x0 = R.range(12, 298), born = .59 + x0 / 300 * .23;
    const age = t - born, life = R.range(.1, .18);
    const z = R.range(-10, 9), vx = R.range(-18, 28);
    if (age < 0 || age > life) continue;
    const k = 1 - age / life, source = pose(born);
    const x = x0 + vx * age, y = spine(x0, source) + z + age * 24;
    const size = 1 + Math.ceil(3 * k);
    p.rect(Math.round(x / 2) * 2, Math.round(y / 2) * 2, size, Math.max(1, size - 1), C[k > .6 ? 4 : 2]);
    haze(p, x, y, 4 + age * 10, C[3], k * .1);
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
}

export function draw(p, t, o) {
  t = Math.round(t * 1e9) / 1e9;
  if (t <= 0 || t >= meta.duration) return;
  const C = fit(o.palette, 8), s = pose(t);
  dorsal(p, C, t, s, o.seed);
  body(p, C, t, s, o.seed);
  head(p, C, t, s);
  // Underbody haze follows the articulated spine, never a full-screen glow.
  for (const x of [48, 108, 172, 232]) {
    const y = spine(x, s), k = cohesion(x, y, t, s, o.seed);
    haze(p, x, y + 7, 10, C[3], k * .12);
    p.glow(x, y - 4, 15, C[3], k * s[7] * .06);
  }
  bowFoam(p, C, t, s, o.seed, true);
  waterSheets(p, C, t, s, o.seed, true);
  wake(p, C, t, s, o.seed, true);
  for (const d of droplets(o.seed)) spray(p, C, d, t, true);
  unravel(p, C, t, s, o.seed);
}
