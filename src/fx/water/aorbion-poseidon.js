import { Rng, fit, clamp, smooth, tileNoise, TAU } from "../../core/index.js";
import { bead, ring, billow } from "./_lib.js";
import { haze, pool, softBand, softShade } from "../_soft.js";
// Flow-lane technique follows the local waterfall/whirlpool recipes, adapted
// from Sprite Fusion bubbles/black-hole (MIT, Copyright 2026 Hugo Duprez).
// Research and design notes: docs/POSEIDON_RESEARCH.md.

export const meta = {
  name: "Aorbion Poseidon",
  desc: "Three surging jets roll around a churning water belt: bright broken crowns, rising channels, falling veils and ballistic spray leave frothy wakes.",
  tags: ["water", "geyser", "orbit", "loop"],
  size: [256, 208],
  origin: [128, 150],
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
  // Orbital movement is slow; the column renews much faster. Harmonics close
  // exactly at six seconds, without reversing a scrolling noise clock.
  const breath = Math.sin(t * TAU + i * 2.1) * 4 + Math.sin(t / 2 * TAU + i * .7) * 2;
  return { x: Math.cos(angle) * 57, y: Math.sin(angle) * 57 * .34,
    angle, height: 61 + breath, pressure: .88 + .1 * Math.sin(t * TAU + i * 2.1) };
}

// Static floor geometry is reused; motion lives in the shading fields.
const FLOOR = Array.from({ length: 152 * 58 }, (_, i) => {
  const x = i % 152 - 75.5, y = Math.floor(i / 152) - 28.5;
  return [Math.hypot(x, y / .34), Math.atan2(y / .34, x)];
});

function zone(p, C, t, front, pulse, seed) {
  const ph = t / 6;
  // A connected annulus has dark troughs and fast broken foam, rather than
  // three decorative outlines. Leave the actor's central floor clear.
  softShade(p, -76, -29, 76, 29, (x, y, out) => {
    if ((y >= 0) !== front) return;
    const row = clamp(Math.floor(y + 29), 0, 57), col = clamp(Math.floor(x + 76), 0, 151);
    const [r, a] = FLOOR[row * 152 + col];
    if (r < 42 || r > 75) return;
    const bend = a - ph * TAU + (r - 55) * .055;
    const ripple = Math.sin(bend * 3) * 3.5 + Math.sin(a * 7 + ph * TAU * 4) * 1.5;
    const d = r - (57 + ripple);
    const strand = tileNoise(Math.floor(d * .65) * 1.67, a / TAU * 36 + ph * 36, 0, 36, seed);
    const crest = Math.sin(d * 1.5 + Math.sin(bend * 4) * 2 + ph * TAU * 8);
    const edge = smooth(42, 49, r) * (1 - smooth(66, 75, r));
    let level = crest > .7 ? 3 : crest > -.3 ? 2 : 1;
    if (strand > .25 && crest > .3) level = 4;
    if (strand > .48 && crest > .8) level = 6;
    out.c = C[level];
    out.a = edge * (level > 3 ? .85 : .42) * (.72 + .28 * Math.sin(bend * 3) ** 2);
  });
  // Three asymmetric rolling lips connect each jet to the next one's wake.
  for (let i = 0; i < 3; i++) {
    const s = site(t, i, seed);
    let previous = null;
    for (let j = 0; j <= 50; j++) {
      const u = j / 50, a = s.angle - .18 - u * 1.55;
      if ((Math.sin(a) >= 0) !== front) { previous = null; continue; }
      const r = 59 + Math.sin(u * 7 + i) * 2;
      const h = Math.sin(u * Math.PI) ** 1.4 * (6 + 2 * Math.sin(t * TAU + i));
      const x = Math.cos(a) * r, y = Math.sin(a) * r * .34 - h;
      const rough = tileNoise(j * .31, ph * 24, 0, 24, seed + i * 13);
      if (previous) {
        p.beam(previous[0], previous[1] + 2, x, y + 2, 3.2, C[2], .85);
        p.line(previous[0], previous[1], x, y, C[rough > .1 ? 5 : 3], .95);
      }
      if (j % 4 === 0 && rough > -.1) billow(p, x, y, 1.1 + Math.max(0, rough) * 2, C, .8);
      previous = [x, y];
    }
  }
  if (!front) pool(p, 0, 0, 72, 25, C[3], .07 + pulse * .045);
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
    const x = Math.cos(a) * (11 + wave), y = Math.sin(a) * 2.1;
    billow(p, x, y - .5, 2.1 + .7 * wave, C, front ? 1 : .8);
    // Short outward folds carry the jet pressure into the circulating surface.
    // Each fold rises, curls over and settles independently of the crown.
    const q = wrap(t + j * .103 + i * .19, .75) / .75;
    const spread = 7 + 14 * q;
    const lift = Math.sin(q * Math.PI) * (3 + (j % 3));
    const tipX = Math.cos(a) * spread;
    const tipY = Math.sin(a) * spread * .27 - lift;
    const k = Math.sin(q * Math.PI);
    if (k > .15) {
      p.beam(x * .55, y, tipX, tipY + 1, 2.1 * k, C[3], .85);
      p.line(x * .75, y - 1, tipX, tipY, C[5], k);
      billow(p, tipX, tipY, .7 + 1.6 * k, C, .95);
      p.blend(tipX - 1, tipY - 1, C[7], k);
    }
  }
  const age = wrap(t + i * .17, .75), q = age / .75;
  ring(p, 0, 0, 9 + 15 * q, .25, Math.sin(q * Math.PI) * .3, C, {
    n: 1,
    half: side,
    seed: i + 31,
    hot: false,
    wob: .4,
  });
}

function column(p, C, t, s, i, seed, pulse) {
  const H = s.height, ph = t / 6, S = seed + i * 71;
  const lean = -Math.sin(s.angle) * 6;
  const axis = v => lean * v * v + Math.sin(v * 5 + t * TAU + i) * 1.4 * v;
  // Backfall curtains: off-axis water drains from the crown while the dense
  // main jet continues upward. Different directions are visible simultaneously.
  for (let side of [-1, 1]) for (let lane = 0; lane < 5; lane++) {
    const u = wrap(t + lane * .117 + i * .13 + (side > 0 ? .2 : 0), .6) / .6;
    const fall = 5 + u * u * 30;
    const x = lean + side * (7 + lane * 1.7 + u * 5);
    const y = -H + fall;
    const alpha = Math.sin(u * Math.PI) * (.65 - lane * .08);
    p.line(x, y, x + side * .8, y + 2 + u * 5, C[lane < 2 ? 4 : 3], alpha);
    p.blend(x, y, C[5], alpha);
  }
  // Pixel lanes stretch along rising jet-time: broad dark channels underneath,
  // fast narrow pale filaments above. Top width flares without a rigid tube rim.
  const rows = Array.from({ length: Math.ceil(H) + 5 }, (_, row) => {
    const y = -row + .5, v = clamp(-y / H);
    return { v, cx: axis(v), transport: Math.sqrt(Math.max(1, H + y)) * 1.35 + ph * 96,
      width: (7.2 + 6.8 * v ** 1.8) * s.pressure,
      left: tileNoise(v * 13, ph * 24, 0, 24, S + 2) * (1 + v),
      right: tileNoise(v * 13, ph * 24, 0, 24, S + 9) * (1 + v) };
  });
  p.shade(-23, -H - 3, 23, 1, (x, y, out) => {
    const row = rows[clamp(Math.round(.5 - y), 0, rows.length - 1)];
    const { v, cx, transport } = row;
    const width = row.width + (x < cx ? row.left : row.right);
    const q = (x - cx) / width;
    const cap = -H + tileNoise(x * .3, ph * 18, 0, 18, S + 7) * 2 + (x - lean) * .12;
    if (Math.abs(q) > 1 || y < cap) return;
    const fine = tileNoise(Math.floor(x - cx) * 1.618, transport, 0, 96, S);
    const broad = tileNoise(Math.floor((x - cx + 32) / 3) * 2.3, transport * .5, 0, 48, S + 1);
    let level = Math.abs(q) < .25 ? 5 : Math.abs(q) < .65 ? 4 : 2;
    if (q > .25) level--;
    if (fine > .18) level++;
    if (broad < -.28) level--;
    if (fine > .45 && Math.abs(q) < .65) level = 7;
    if (y < cap + 2) level = 5;
    out.c = C[clamp(level, 1, 7)];
  });
  // Unequal lobes boil across a broad crown; the lower fringe breaks into
  // falling teeth. It must read as aerated water, not three rigid curled horns.
  for (let j = 0; j < 13; j++) {
    const q = (j - 6) / 6;
    const n = tileNoise(j * .87, ph * 30, 0, 30, S + 41);
    const x = lean + q * (12 + s.pressure * 3);
    const y = -H - (1 - q * q) * (3 + 2 * Math.sin(t * TAU + i)) + n * 3 + q * (2 + Math.sin(t * TAU + i) * 2);
    const radius = 2.1 + (1 - Math.abs(q)) * 1.1 + n * .8;
    billow(p, x + 1, y + 2, radius + .8, [C[0],C[1],C[2],C[3],C[4],C[4],C[5],C[5]], .95);
    billow(p, x, y, radius, C, 1);
    if (j % 2 === 0) {
      p.line(x, y + radius, x + q * 1.8, y + radius + 3 + n * 3, C[4]);
      p.blend(x - 1, y - radius * .5, C[7], .9);
    }
  }
  p.glowLine(-1, -4, lean - 1, -H + 4, 13, C[4], .14 + pulse * .11);
  p.glow(lean, -H, 21, C[4], .16 + pulse * .08);
  haze(p, lean - 1, -H + 5, 12, C[3], .08);
}

function spray(p, C, t, i, seed, front) {
  const R = new Rng(seed + i * 71 + 19);
  for (let j = 0; j < 22; j++) {
    const period = j % 2 ? .75 : 1;
    const offset = R.range(0, period), age = wrap(t - offset, period);
    const birth = wrap(t - age), s = site(birth, i, seed);
    const dx = R.range(-12, 12), z = R.range(-5, 5);
    const vx = R.range(-28, 28) - Math.sin(s.angle) * 30;
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
  zone(p, C, t, front, pulse, o.seed);
  const sites = [0, 1, 2].map(i => ({ i, ...site(t, i, o.seed) })).sort((a, b) => a.y - b.y);
  for (const s of sites) {
    movingFilm(p, C, t, s.i, o.seed, front);
    spray(p, C, t, s.i, o.seed, front);
    bubbles(p, C, t, s.i, o.seed, front);
    if ((s.y >= 0) !== front) continue;
    const tx = p.tx, ty = p.ty, light = p.lightK;
    p.tx = tx + s.x * p.fx * p.cs - s.y * p.sn;
    p.ty = ty + s.x * p.fx * p.sn + s.y * p.cs;
    p.lightK *= front ? .8 : .6;
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
