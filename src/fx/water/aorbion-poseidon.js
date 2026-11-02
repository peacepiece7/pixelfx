import { Rng, fit, clamp, TAU } from "../../core/index.js";
import { bead, ring, billow } from "./_lib.js";
import { haze, pool, softBand } from "../_soft.js";
import { drawGeyserColumn, drawGeyserFoam } from "./geyser.js";

export const meta = {
  name: "Aorbion Poseidon",
  desc: "Three textured geysers orbit a radius-70 water zone; rolling foam, trailing droplets and landing ripples follow their paths. Pulse only modulates light.",
  tags: ["water", "geyser", "orbit", "loop"],
  size: [232, 176],
  origin: [116, 118],
  duration: 6,
  loop: true,
  fps: 40,
  bg: "ground",
  actor: 2,
  options: {
    palette: ["#071e38", "#0c4169", "#147d9c", "#32b9d0", "#8de8ed", "#e3ffff"],
    seed: 17,
    pulse: null,
  },
};

const wrap = (t, d = 6) => ((t % d) + d) % d;

function site(t, i, seed) {
  const offset = new Rng(seed).range(0, TAU);
  const angle = t / 6 * TAU + i * TAU / 3 + offset;
  // Harmonics divide the six-second loop exactly; the three jets breathe differently.
  const breathing = Math.sin(t * TAU + i * 2.1) * 2.3 + Math.sin(t / 2 * TAU + i * .7) * 1.3;
  return {
    x: Math.cos(angle) * 60,
    y: Math.sin(angle) * 60 * .26,
    angle,
    height: 36 + breathing,
    pressure: .78 + .07 * Math.sin(t / 1.5 * TAU + i * 1.7),
    foam: .48 + .09 * Math.cos(t / 2 * TAU + i * 2),
    // Sample the actual geyser turbulence on a closed path so the loop cannot snap.
    waterTime: 1.9 + .24 * Math.sin(t / 2 * TAU + i) + .12 * Math.cos(t * TAU + i * 2),
  };
}

function zone(p, C, t, front, pulse) {
  softBand(p, 0, 0, 70, .26, 2, .22, C.slice(0, 6), a => (Math.sin(a) >= 0) === front);
  for (let i = 0; i < 12; i++) {
    const a = i * TAU / 12 + Math.sin(t / 3 * TAU + i) * .025;
    if ((Math.sin(a) >= 0) !== front) continue;
    const r = 64 + 2 * Math.sin(t / 2 * TAU + i * 1.7);
    const x = Math.cos(a) * r, y = Math.sin(a) * r * .26;
    p.blend(x, y, C[4], .22 + .12 * Math.sin(t * TAU + i) ** 2);
  }
  if (!front) pool(p, 0, 0, 70, 18, C[2], .055 + pulse * .025);
}

function movingFilm(p, C, t, i, seed, front) {
  for (let j = 0; j < 5; j++) {
    const age = .04 + j * .045;
    const s = site(wrap(t - age), i, seed);
    if ((s.y >= 0) !== front) continue;
    const k = (1 - j / 5) * .28;
    softBand(p, s.x, s.y, 6 + j * 1.9, .25, 1.2, k, C.slice(0, 6));
  }
}

function foot(p, C, t, s, i, front) {
  const side = front ? 1 : -1;
  for (let j = 0; j < 6; j++) {
    const a = (j / 6) * Math.PI + (front ? 0 : Math.PI);
    const wave = Math.sin(t / 1.5 * TAU + j * 1.3 + i);
    const x = Math.cos(a) * (5 + wave), y = Math.sin(a) * 2.1;
    billow(p, x, y - .5, 1.1 + .3 * wave, C, front ? .65 : .4);
  }
  const age = wrap(t + i * .17, .75), q = age / .75;
  ring(p, 0, 0, 6 + 12 * q, .25, Math.sin(q * Math.PI) * .3, C, {
    n: 1,
    half: side,
    seed: i + 31,
    hot: false,
    wob: .4,
  });
}

function column(p, C, t, s, i, seed, pulse) {
  const water = { C, t: s.waterTime, HMAX: 44, S: seed + i * 71 };
  // Exact geyser shading and churning crown, scaled for three sustained orbiting jets.
  drawGeyserFoam(p, s.height, s.foam, true, water);
  drawGeyserColumn(p, s.height, s.pressure, water);
  drawGeyserFoam(p, s.height, s.foam, false, water);
  haze(p, -2, -s.height + 2, 7, C[3], .075);
  p.glowLine(0, -3, -1, -s.height + 3, 8, C[4], .045 + pulse * .07);
  for (let j = 0; j < 4; j++) {
    const age = wrap(t + j * .12 + i * .1, .6);
    const q = age / .6, y = -4 - q * (s.height - 8);
    const x = Math.sin(q * 5 + j) * 2;
    const k = Math.sin(q * Math.PI);
    p.blend(x, y, C[2], k * .55);
    p.blend(x - 1, y - 1, C[6], k * .55);
  }
}

function spray(p, C, t, i, seed, front) {
  const R = new Rng(seed + i * 71 + 19);
  for (let j = 0; j < 12; j++) {
    const period = j % 2 ? .75 : 1;
    const offset = R.range(0, period), age = wrap(t - offset, period);
    const birth = wrap(t - age), s = site(birth, i, seed);
    const dx = R.range(-6, 6), z = R.range(-5, 5);
    const vx = R.range(-15, 15) - Math.sin(s.angle) * 18;
    const vy = R.range(-4, 4) + Math.cos(s.angle) * 5;
    const vh = R.range(12, 35), h = s.height - R.range(1, 7);
    const land = (vh + Math.sqrt(vh * vh + 1400 * h)) / 700;
    const life = land + .13;
    if (age > life) continue;
    const x = s.x + dx + vx * Math.min(age, land);
    const floor = s.y + z + vy * Math.min(age, land);
    if ((floor >= 0) !== front) continue;
    if (age < land) {
      const y = floor - h - vh * age + 350 * age * age;
      bead(p, x, y, vx, vy - vh + 700 * age, j % 5 === 0 ? 2 : 1, C, .75);
    } else {
      const u = age - land, k = 1 - u / .13;
      ring(p, x, floor, 1 + u * 25, .25, k * .38, C, { n: 1, seed: j + i * 31, hot: false });
      if (u < .035) p.blend(x, floor - 1, C[5], k * .7);
    }
  }
}

function bubbles(p, C, t, i, seed, front) {
  const R = new Rng(seed + i * 41 + 90);
  for (let j = 0; j < 5; j++) {
    const offset = R.range(0, 1), age = wrap(t - offset, 1);
    const s = site(wrap(t - age), i, seed);
    const dx = R.range(-8, 8), drift = R.range(-8, 8);
    const life = R.range(.22, .4), radius = R.range(.8, 1.7);
    if (age > life) continue;
    const x = s.x + dx + drift * age, y = s.y + Math.sign(dx) * age * 6;
    if ((y >= 0) !== front) continue;
    const u = age / life, k = Math.sin(u * Math.PI);
    p.disc(x, y, radius, C[2], d => k * .25 * (1 - d));
    p.arc(x, y, radius, .7, 3.4, 5.8, C[5], k * .65);
    p.blend(x - .5, y - .5, C[6], k * .65);
  }
}

function layer(p, time, o, front) {
  const t = Math.round(wrap(time) * 1e9) / 1e9;
  const C = fit(o.palette, 8);
  const pulse = Number.isFinite(o.pulse) ? clamp(o.pulse) : .5 + .5 * Math.cos(t * TAU * 2);
  zone(p, C, t, front, pulse);
  const sites = [0, 1, 2].map(i => ({ i, ...site(t, i, o.seed) })).sort((a, b) => a.y - b.y);
  for (const s of sites) {
    movingFilm(p, C, t, s.i, o.seed, front);
    spray(p, C, t, s.i, o.seed, front);
    bubbles(p, C, t, s.i, o.seed, front);
    if ((s.y >= 0) !== front) continue;
    const tx = p.tx, ty = p.ty, light = p.lightK;
    p.tx = tx + s.x * p.fx * p.cs - s.y * p.sn;
    p.ty = ty + s.x * p.fx * p.sn + s.y * p.cs;
    p.lightK *= front ? .55 : .35;
    try {
      pool(p, 0, 0, 17, 5, C[3], .1 + pulse * .06);
      foot(p, C, t, s, s.i, false);
      column(p, C, t, s, s.i, o.seed, pulse);
      foot(p, C, t, s, s.i, true);
    } finally {
      p.tx = tx;
      p.ty = ty;
      p.lightK = light;
    }
  }
}

export function drawBack(p, t, o) { layer(p, t, o, false); }
export function draw(p, t, o) { layer(p, t, o, true); }
