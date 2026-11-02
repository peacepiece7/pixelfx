// Thick reference-directed water jets retain geyser-style layered shading.
// A restrained foam crown keeps the motion rising, without overflowing sideways.
import { Rng, fit, clamp, smooth, noise2 } from "../../core/index.js";
import { bead, ring, billow } from "./_lib.js";
import { surgeColumn, surgeCrown, surgeFoot } from "./_surging-water.js";
import { haze, pool, softShade } from "../_soft.js";

export const meta = {
  name: "Aorbion tail pillars",
  desc: "Overlapping jets rise through layered teal water, pale veins and uneven tips; tiny side bubbles and falling beads leave restrained landing ripples.",
  tags: ["water", "geyser", "splash", "one-shot"],
  size: [208, 320],
  origin: [104, 220],
  duration: 0.8,
  loop: false,
  fps: 40,
  bg: "ground",
  options: {
    palette: ["#071e38", "#0c4169", "#147d9c", "#32b9d0", "#8de8ed", "#e3ffff"],
    seed: 17,
    count: 3,
  },
};

// 50ms authoring keys: height, pressure/width, hot vein, foam, ground spread, births.
// Pressure falls before the water disappears; each visual layer has a separate decay.
export const choreography = [
  [0.00,  0, .00, .00, .00,  0, 0],
  [0.05, 10, .40, .30, .12, 10, 2],
  [0.10, 35, .85, .85, .35, 18, 5],
  [0.15, 58, 1.0, 1.0, .48, 25, 4],
  [0.20, 62, .96, .82, .42, 29, 3],
  [0.25, 57, .88, .68, .38, 30, 2],
  [0.30, 53, .84, .72, .32, 30, 3],
  [0.35, 46, .73, .55, .25, 29, 1],
  [0.40, 37, .62, .40, .20, 28, 0],
  [0.45, 28, .50, .28, .16, 27, 0],
  [0.50, 18, .36, .18, .12, 25, 0],
  [0.55,  9, .20, .08, .08, 23, 0],
  [0.60,  0, .00, .00, .05, 21, 0],
  [0.65,  0, .00, .00, .03, 18, 0],
  [0.70,  0, .00, .00, .01, 14, 0],
  [0.75,  0, .00, .00, .00,  8, 0],
  [0.80,  0, .00, .00, .00,  0, 0],
];

function state(t) {
  const f = clamp(t / .05, 0, choreography.length - 1);
  const i = Math.min(choreography.length - 2, Math.floor(f));
  const a = choreography[i], b = choreography[i + 1];
  const u = smooth(0, 1, f - i);
  return a.map((v, j) => v + (b[j] - v) * u);
}

function waterline(p, C, radius, k, seed, front) {
  if (radius < 1 || k <= 0) return;
  ring(p, 0, 0, radius, .27, k * .24, C, {
    n: 1,
    half: front ? 1 : -1,
    hot: false,
    wob: .65,
    seed,
  });
}

function film(p, C, s, age) {
  const r = s[5], k = smooth(0, .05, age) * (1 - smooth(.45, .8, age));
  if (r < 1 || k <= 0) return;
  softShade(p, -r, -9, r, 9, (x, y, out) => {
    const d = (x / r) ** 2 + (y / 9) ** 2;
    if (d >= 1) return;
    out.c = d > .8 ? C[3] : C[1];
    out.a = k * .2 * (1 - d * .65);
  });
  pool(p, 0, 0, r, 8, C[3], s[3] * .13);
}

function column(p, C, s, age, seed, heightScale) {
  const H = s[1] * heightScale;
  if (H < 1 || s[2] <= 0) return;
  // Thick dark channels and a narrow rolling cap follow the approved still.
  const water = { C, t: 1.15 + age * 2.5, S: seed, width: 13, strength: .85 };
  surgeColumn(p, H, s[2], water);
  surgeCrown(p, H, s[2], water, false);
  surgeFoot(p, C, age, 11, s[2], seed, true);
}

function veins(p, C, s, age, seed, heightScale) {
  const H = s[1] * heightScale;
  if (H < 5) return;
  for (let i = 0; i < 7; i++) {
    const f = (age * (1.7 + i * .17) + i * .139) % 1;
    const y = -H * f;
    const x = (i - 3) * 1.5 + noise2(age * 9, i, seed) * .7;
    const len = (2 + i % 3) * s[2];
    const k = Math.sin(f * Math.PI) * s[3];
    p.line(x, y, x - .4, y - len, C[i % 3 === 0 ? 6 : 5], k);
  }
}

function bubble(p, C, b, age, front) {
  const u = age - b.birth;
  if (u < 0 || u > b.life || (b.z > 0) !== front) return;
  const v = u / b.life;
  const x = b.x + b.vx * u, y = b.z * .27 - Math.sin(v * Math.PI) * b.lift;
  const radius = b.size * (.5 + .5 * smooth(0, .5, v));
  const k = smooth(0, .07, u) * (1 - smooth(.65, 1, v));
  p.disc(x, y, radius, C[2], d => k * .3 * (1 - d * d));
  p.arc(x, y, radius, .7, 3.4, 5.7, C[5], k * .8);
  p.blend(x - radius * .35, y - radius * .5, C[7], k * .7);
  if (v > .72) {
    const pop = (v - .72) / .28;
    for (const side of [-1, 1]) {
      p.blend(x + side * (radius + pop * 2), y - pop, C[4], (1 - pop) * .5);
    }
  }
}

function fallingWater(p, C, d, age, front) {
  const u = age - d.birth;
  if (u < 0 || u > d.life || (d.z > 0) !== front) return;
  const x = d.x + d.vx * u, z = d.z + d.vz * u;
  const h = d.h + d.vh * u - 340 * u * u;
  const landing = (d.vh + Math.sqrt(d.vh * d.vh + 1360 * d.h)) / 680;
  if (u < landing) {
    const k = 1 - smooth(d.life - .12, d.life, u);
    bead(p, x, z * .27 - h, d.vx, d.vz * .27 - d.vh + 680 * u, d.size, C, k);
    if (d.size > 1) p.glow(x, z * .27 - h, 3, C[4], k * .07);
  } else {
    const a = u - landing, lx = d.x + d.vx * landing, lz = d.z + d.vz * landing;
    const k = 1 - smooth(.03, .16, a);
    ring(p, lx, lz * .27, 1 + a * 22, .27, k * .42, C, {
      n: 1,
      half: front ? 1 : -1,
      seed: d.seed,
      hot: false,
    });
    if (a < .06) p.blend(lx, lz * .27 - 1, C[6], k * .7);
  }
}

function foamFoot(p, C, s, age, seed, front) {
  if (s[4] < .01) return;
  for (let i = 0; i < 8; i++) {
    const a = i * 2.399 + seed;
    const side = Math.sin(a);
    if ((side > 0) !== front) continue;
    const drift = smooth(.12, .55, age);
    const x = Math.cos(a) * (5 + drift * (4 + i % 3));
    const y = side * (2 + drift * 2);
    billow(p, x, y, (1 + i % 3 * .35) * s[4], C, .65);
    p.blend(x - .7, y - .5, C[6], s[4] * .6);
  }
}

// Air pockets rise inside the water rather than repeating a surface-ring texture.
function airPockets(p, C, s, age, seed, heightScale) {
  const H = s[1] * heightScale;
  if (H < 8) return;
  const R = new Rng(seed + 87);
  for (let i = 0; i < 5; i++) {
    const born = .055 + i * .047 + R.range(-.008, .008);
    const u = age - born;
    const life = R.range(.12, .2);
    const x = R.range(-3, 3);
    const speed = R.range(75, 115);
    if (u < 0 || u > life) continue;
    const y = -4 - u * speed;
    if (-y > H - 4) continue;
    const k = Math.sin(u / life * Math.PI) * s[2];
    p.blend(x, y, C[2], k * .65);
    p.blend(x - 1, y - 1, C[5], k * .8);
    p.blend(x + 1, y, C[4], k * .5);
    // A tiny displaced highlight runs up the left face of the pocket.
    p.blend(x - 1, y - 2, C[6], k * .45);
    if (i === 2) p.light(x, y - 1, C[4], k * .05);
  }
}

export function create(o) {
  const C = fit(o.palette, 8);
  const n = clamp(Math.floor(Number.isFinite(o.count) ? o.count : 3), 1, 12);
  // Keep drops, surface bubbles and five internal air pockets below 180.
  const budget = Math.min(24, Math.floor(180 / n) - 11);
  const pillars = Array.from({ length: n }, (_, i) => {
    const seed = o.seed + i * 131, R = new Rng(seed);
    const drops = [];
    const heightScale = R.range(.93, 1.05);
    for (const key of choreography) {
      for (let j = 0; j < key[6] && drops.length < budget; j++) {
        const birth = key[0] + R.range(-.012, .012);
        const s = state(birth);
        drops.push({
          birth,
          x: R.range(-6, 6),
          z: R.range(-6, 6),
          h: s[1] * heightScale * R.range(.65, .94),
          vx: R.range(-17, 17),
          vz: R.range(-9, 9),
          vh: R.range(18, 46),
          size: R.next() < .23 ? 2 : 1,
          life: Math.min(.5, .76 - birth),
          seed: R.int(1, 10000),
        });
      }
    }
    const bubbles = Array.from({ length: 6 }, (_, j) => ({
      birth: .035 + j * .065 + R.range(-.012, .012),
      life: R.range(.14, .23),
      x: R.range(-7, 7),
      z: R.range(-10, 10),
      vx: R.range(-16, 16),
      lift: R.range(.5, 2.5),
      size: R.range(1, 2.2),
    }));
    return { seed, heightScale, drops, bubbles, y: (i - (n - 1) / 2) * 35, delay: i * .009 };
  });
  let elapsed = 0;
  function drawLayer(p, front) {
    const frameTime = Math.round(elapsed * 1e9) / 1e9;
    if (frameTime <= 0 || frameTime >= meta.duration) return;
    const tx = p.tx, ty = p.ty;
    try {
      for (const pillar of pillars) {
        const age = frameTime - pillar.delay;
        if (age < 0 || age >= .8) continue;
        const s = state(age);
        p.tx = tx - pillar.y * p.sn;
        p.ty = ty + pillar.y * p.cs;
        if (!front) {
          film(p, C, s, age);
          surgeCrown(p, s[1] * pillar.heightScale, s[2],
            { C, t: 1.15 + age * 2.5, S: pillar.seed, width: 13, strength: .85 }, true);
          waterline(p, C, s[5], 1 - smooth(.25, .8, age), pillar.seed, false);
        } else {
          column(p, C, s, age, pillar.seed, pillar.heightScale);
          veins(p, C, s, age, pillar.seed, pillar.heightScale);
          airPockets(p, C, s, age, pillar.seed, pillar.heightScale);
          waterline(p, C, s[5], 1 - smooth(.25, .8, age), pillar.seed, true);
        }
        foamFoot(p, C, s, age, pillar.seed, front);
        for (const b of pillar.bubbles) bubble(p, C, b, age, front);
        for (const d of pillar.drops) fallingWater(p, C, d, age, front);
        if (front && s[4] > .1) {
          haze(p, -3, -s[1] * .6, 7, C[3], s[4] * .05);
        }
      }
    } finally {
      p.tx = tx;
      p.ty = ty;
    }
  }
  return {
    update(dt) { elapsed = Math.min(meta.duration, elapsed + dt); },
    drawBack(p) { drawLayer(p, false); },
    draw(p) { drawLayer(p, true); },
  };
}
