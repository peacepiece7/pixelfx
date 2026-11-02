import { Rng, fit, smooth, clamp, noise2 } from "../../core/index.js";
import { bead, ring, billow } from "./_lib.js";
import { haze, pool, softShade } from "../_soft.js";

export const meta = {
  name: "Aorbion charge emerge",
  desc: "A layered water crest surges 100px forward; three offset claws peel into spray, floating foam, popping bubbles and small landing ripples.",
  tags: ["water", "charge", "claw", "splash", "one-shot"],
  size: [184, 112],
  origin: [30, 82],
  duration: .65,
  loop: false,
  fps: 40,
  bg: "ground",
  options: {
    palette: ["#071e38", "#0c4169", "#147d9c", "#32b9d0", "#8de8ed", "#e3ffff"],
    seed: 17,
  },
};

// Every 50ms: front x, crest height, white heat, foam, ground film, droplet births.
// Front advance stops at .25; spray, fingers of water and the three claws continue independently.
export const choreography = [
  [0.00,   0,  0, .00, .00, .00,  0],
  [0.05,  12,  8, .35, .12, .20,  3],
  [0.10,  38, 20, 1.0, .50, .60,  8],
  [0.15,  69, 25, .90, .85, .85, 10],
  [0.20,  91, 21, .70, .75, 1.0,  7],
  [0.25, 100, 15, .50, .65, .95,  5],
  [0.30, 100, 10, .25, .50, .85,  4],
  [0.35, 100,  6, .12, .38, .72,  2],
  [0.40, 100,  3, .04, .27, .58,  0],
  [0.45, 100,  1, .00, .18, .43,  0],
  [0.50, 100,  0, .00, .12, .30,  0],
  [0.55, 100,  0, .00, .06, .17,  0],
  [0.60, 100,  0, .00, .02, .06,  0],
  [0.65, 100,  0, .00, .00, .00,  0],
];

function state(t) {
  const f = clamp(t / .05, 0, choreography.length - 1);
  const i = Math.min(choreography.length - 2, Math.floor(f));
  const u = smooth(0, 1, f - i);
  return choreography[i].map((v, j) => v + (choreography[i + 1][j] - v) * u);
}

// Three individual sweeps, not three copies of the same sine-wave trajectory.
const CLAWS = [
  { start: .045, reach: .14, close: .22, end: .34, y: -13, arch: 18, width: 2.5, bend: -4 },
  { start: .075, reach: .18, close: .255, end: .39, y: -7, arch: 23, width: 3.0, bend: 3 },
  { start: .115, reach: .225, close: .29, end: .43, y: -1, arch: 17, width: 2.2, bend: 6 },
];

function clawHeight(q, c) {
  return c.y - Math.sin(Math.PI * q) * c.arch + c.bend * q * (1 - q);
}

function claw(p, C, c, t, index, seed) {
  if (t < c.start || t > c.end) return;
  const opening = smooth(c.start, c.reach, t);
  const closing = smooth(c.close, c.end, t);
  const hi = 100 * opening, lo = 5 + closing * 85;
  if (hi <= lo) return;
  p.shade(lo, -40, hi + 1, 3, (x, y, out) => {
    const q = clamp(x / 100), cy = clawHeight(q, c);
    const w = c.width * Math.sin(Math.PI * q) ** .65 * (1 - closing * .7);
    const d = Math.abs(y - cy) / Math.max(.2, w);
    if (d > 1) return;
    const cell = Math.floor(x / (4 + index));
    if (t > c.close && noise2(cell * 2.1, index, seed) < closing - .6) return;
    out.c = C[d < .28 && closing < .3 ? 7 : d < .65 ? 5 : 3];
  });
  const tipY = clawHeight(opening, c);
  if (closing < .2) {
    p.glow(hi - 1, tipY, 7, C[4], .18 * Math.sin(opening * Math.PI));
  }
  // A delayed thin echo drains into the water instead of blinking off with the white edge.
  for (let j = 0; j < 12; j++) {
    const x = 10 + j * 7.5, q = x / 100;
    const born = c.start + q * (c.reach - c.start), age = t - born;
    if (age < .1 || age > .25) continue;
    const k = Math.sin((age - .1) / .15 * Math.PI);
    const y = clawHeight(q, c) + (age - .1) * (14 + index * 5);
    p.blend(x, y, C[4], k * .5);
    p.blend(x + 1, y + 1, C[2], k * .35);
  }
}

function groundFilm(p, C, s, t, seed) {
  const head = s[1], k = s[5];
  if (head < 1 || k <= 0) return;
  softShade(p, -5, -16, head + 7, 16, (x, y, out) => {
    const q = clamp(x / Math.max(1, head));
    const w = 3 + 11 * Math.sin(Math.PI * q) ** .7;
    if (Math.abs(y) > w || x < 0 || x > head) return;
    const flow = noise2(Math.floor(x / 3) * .4 - t * 5, y * .25, seed);
    out.c = C[flow > .2 ? 3 : 1];
    out.a = k * .28 * (1 - Math.abs(y) / (w + 1));
  });
  pool(p, head * .5, 0, head * .5 + 4, 12, C[3], k * .11);
}

function crest(p, C, s, t, seed) {
  const head = s[1], H = s[2];
  if (head < 2 || H < .5) return;
  // Dark hollow, saturated middle sheet, pale lip: four readable depth planes.
  softShade(p, 0, -H - 7, head + 7, 8, (x, y, out) => {
    if (x < 0 || x > head) return;
    const dist = head - x;
    const top = 2 + H * Math.exp(-(((dist - 7) / 12) ** 2));
    const curl = Math.sin(clamp(dist / 20) * Math.PI) * 2;
    if (y < -top || y > 4) return;
    const edge = (y + top) / (top + 4);
    const flow = noise2(Math.floor(x / 2) * .23 - t * 18, Math.floor(y / 2) * .3, seed);
    out.c = C[edge < .09 ? 6 : edge < .27 ? 5 : flow > .3 ? 4 : 2];
    out.a = (.62 + .3 * s[3]) * (1 - smooth(.32, .43, t));
    if (dist < 7 && y < -top + 3 + curl) out.c = C[7];
  });
  // Forward lip curls downward independently of the pressure envelope.
  const roll = smooth(.13, .3, t);
  for (let i = 0; i < 8; i++) {
    const a = -.9 + i * .22 + roll * 1.5;
    const r = 3.5 + i % 3 * .5;
    const x = head - 6 + Math.cos(a) * r;
    const y = -H + 5 + Math.sin(a) * r;
    p.blend(x, y, C[i < 3 ? 7 : 5], s[4] * .8);
    if (i % 3 === 0) billow(p, x, y + 1, 1.2 * s[4], C, .7);
  }
  haze(p, head - 8, -H * .4, 12, C[3], s[4] * .11);
  p.glow(head - 7, -H + 2, 11, C[4], s[3] * .16);
}

function streamlets(p, C, s, t, seed) {
  if (s[2] < 1) return;
  for (let i = 0; i < 9; i++) {
    const q = (i + .5) / 9;
    const x = s[1] * q;
    const age = t - .025 - q * .16;
    if (age < 0 || age > .22) continue;
    const drift = noise2(i, age * 6, seed) * 2;
    const y = -2 - Math.sin(q * Math.PI) * (3 + s[2] * .22);
    const k = Math.sin(age / .22 * Math.PI);
    p.line(x - 4 - age * 13, y + drift, x, y, C[i % 3 === 0 ? 6 : 4], k * .65);
  }
}

function spray(p, C, d, t, front) {
  const age = t - d.birth;
  if (age < 0 || age >= d.life || (d.z > 0) !== front) return;
  const land = (d.vh + Math.sqrt(d.vh * d.vh + 1520 * d.h)) / 760;
  const k = 1 - smooth(d.life - .1, d.life, age);
  if (age < land) {
    const x = d.x + d.vx * age, z = d.z + d.vz * age;
    const h = d.h + d.vh * age - 380 * age * age;
    bead(p, x, z * .25 - h, d.vx, d.vz * .25 - d.vh + 760 * age, d.size, C, k);
    if (d.size > 1) p.glow(x, z * .25 - h, 3, C[4], k * .08);
  } else {
    const u = age - land, x = d.x + d.vx * land, y = (d.z + d.vz * land) * .25;
    ring(p, x, y, 1 + u * 25, .25, k * (1 - smooth(.02, .14, u)) * .5, C, {
      n: 1,
      half: front ? 1 : -1,
      hot: u < .025,
      seed: d.seed,
    });
    if (u < .075) {
      for (const side of [-1, 1]) {
        const yy = y - 28 * u + 380 * u * u;
        p.blend(x + side * 12 * u, yy, C[5], (1 - u / .075) * .7);
      }
    }
  }
}

function floatingFoam(p, C, f, t, front) {
  const age = t - f.birth;
  if (age < 0 || age >= f.life || (f.z > 0) !== front) return;
  const q = age / f.life;
  const travel = (1 - Math.exp(-age * 8)) / 8;
  const x = f.x + f.vx * travel, y = (f.z + f.vz * travel) * .25;
  const k = smooth(0, .025, age) * (1 - smooth(.45, 1, q));
  const r = f.size * (.6 + .4 * Math.sin(q * Math.PI));
  p.disc(x, y, r, C[2], d => k * .24 * (1 - d * d));
  p.arc(x, y, r, .7, 3.5, 5.8, C[5], k * .7);
  p.blend(x - r * .3, y - r * .5, C[6], k * .8);
  if (q > .65) {
    const pop = (q - .65) / .35;
    p.blend(x - r - pop * 2, y - pop, C[4], (1 - pop) * .45);
    p.blend(x + r + pop, y + pop, C[3], (1 - pop) * .4);
  }
}

function groundArcs(p, C, s, t, front, seed) {
  for (const [birth, x, radius] of [[.055, 8, 12], [.14, 40, 17], [.24, 87, 15]]) {
    const age = t - birth;
    if (age < 0 || age > .34) continue;
    const q = age / .34;
    ring(p, x, 0, 3 + radius * (1 - (1 - q) ** 2), .28, (1 - q) * .52, C, {
      n: 1,
      half: front ? 1 : -1,
      wob: .5,
      seed: seed + x,
      hot: false,
    });
  }
}

// Torn pieces inherit the tangent of their own claw, then bow down under gravity.
function clawFragments(p, C, t, seed) {
  const R = new Rng(seed + 301);
  for (let j = 0; j < CLAWS.length; j++) {
    const c = CLAWS[j];
    for (let i = 0; i < 6; i++) {
      const q = .2 + i * .12;
      const birth = c.close + R.range(-.012, .025);
      const age = t - birth;
      const life = R.range(.1, .18);
      const vx = R.range(10, 35);
      const vy = R.range(-8, 9);
      if (age < 0 || age > life) continue;
      const k = 1 - age / life;
      const x = q * 100 + vx * age;
      const y = clawHeight(q, c) + vy * age + 180 * age * age;
      const length = (2 + i % 3) * k;
      p.line(x - length, y - .5, x, y, C[k > .65 ? 5 : 3], k);
      p.blend(x, y + 1, C[2], k * .5);
      if (i === 2) p.glow(x, y, 3, C[4], k * .08);
    }
  }
}

export function create(o) {
  const C = fit(o.palette, 8), R = new Rng(o.seed);
  const drops = [], foam = [];
  for (const key of choreography) {
    for (let i = 0; i < key[6]; i++) {
      const birth = key[0] + R.range(-.013, .009);
      const s = state(birth), side = R.sign();
      drops.push({
        birth,
        x: Math.max(0, s[1] - R.range(2, 13)),
        z: side * R.range(2, 12),
        h: R.range(2, Math.max(3, s[2] * .7)),
        vx: R.range(15, 66) * (1 - birth),
        vz: side * R.range(7, 27),
        vh: R.range(30, 92),
        size: R.next() < .27 ? 2 : 1,
        life: Math.min(.4, .64 - birth),
        seed: R.int(1, 10000),
      });
    }
  }
  for (let i = 0; i < 23; i++) {
    const birth = .045 + i * .012 + R.range(-.008, .008);
    const s = state(birth), side = R.sign();
    foam.push({
      birth,
      x: Math.max(0, s[1] - R.range(1, 20)),
      z: side * R.range(3, 24),
      vx: R.range(-10, 28),
      vz: side * R.range(5, 22),
      size: R.range(.8, 2),
      life: Math.min(R.range(.2, .34), .63 - birth),
    });
  }
  let elapsed = 0;
  function drawLayer(p, front) {
    const t = Math.round(elapsed * 1e9) / 1e9;
    if (t <= 0 || t >= meta.duration) return;
    const s = state(t);
    if (!front) groundFilm(p, C, s, t, o.seed);
    groundArcs(p, C, s, t, front, o.seed);
    if (front) {
      crest(p, C, s, t, o.seed);
      streamlets(p, C, s, t, o.seed);
      clawFragments(p, C, t, o.seed);
      CLAWS.forEach((c, i) => claw(p, C, c, t, i, o.seed));
    }
    for (const f of foam) floatingFoam(p, C, f, t, front);
    for (const d of drops) spray(p, C, d, t, front);
    if (front && s[4] > .1) {
      haze(p, s[1] - 12, -4, 8, C[3], s[4] * .08);
    }
  }
  return {
    update(dt) { elapsed = Math.min(meta.duration, elapsed + dt); },
    drawBack(p) { drawLayer(p, false); },
    draw(p) { drawLayer(p, true); },
  };
}
