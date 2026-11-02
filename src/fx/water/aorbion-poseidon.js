import { Rng, fit, clamp, smooth, tileNoise, TAU } from "../../core/index.js";
import { bead, ring, billow } from "./_lib.js";
import { pool, softShade } from "../_soft.js";
// Flow-lane technique follows the local waterfall/whirlpool recipes, adapted
// from Sprite Fusion bubbles/black-hole (MIT, Copyright 2026 Hugo Duprez).
// Research and design notes: docs/POSEIDON_RESEARCH.md.

export const meta = {
  name: "Aorbion Poseidon wave storm",
  desc: "An open water storm: layered spiral waves, curling splash sheets, foam and falling spray, with a four-beat local shimmer. No pillars.",
  tags: ["water", "storm", "orbit", "loop"],
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
    // Host lifecycle envelopes: elapsed since activation and remaining seconds.
    elapsed: null,
    remaining: null,
  },
};

const wrap = (t, d = 6) => ((t % d) + d) % d;

function site(t, i, seed) {
  const offset = new Rng(seed).range(0, TAU);
  const angle = t / 6 * TAU + i * TAU / 3 + offset;
  // Orbiting release points distribute falling spray around the entire storm.
  return { x: Math.cos(angle) * 57, y: Math.sin(angle) * 57 * .34, angle };
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
  softShade(p, -76, front ? 0 : -29, 76, front ? 29 : 0, (x, y, out) => {
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
  // Three asymmetric rolling lips carry the floor current around the storm.
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

function spray(p, C, t, i, seed, front) {
  const R = new Rng(seed + i * 71 + 19);
  for (let j = 0; j < 22; j++) {
    const period = j % 2 ? .75 : 1;
    const offset = R.range(0, period), age = wrap(t - offset, period);
    const birth = wrap(t - age), s = site(birth, i, seed);
    const dx = R.range(-12, 12), z = R.range(-5, 5);
    const vx = R.range(-28, 28) - Math.sin(s.angle) * 30;
    const vy = R.range(-4, 4) + Math.cos(s.angle) * 5;
    const vh = R.range(12, 35), h = 20 + R.range(0, 35);
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

// Reference-study addition: open, rising helices, never a solid cylinder.
// Two broad pitches leave windows between the storm and the orbiting jets.
function storm(p, C, t, seed, front, pulse) {
  for (let lane = 0; lane < 2; lane++) {
    let last = null;
    for (let j = 0; j <= 56; j++) {
      const u = j / 56;
      const a = u * TAU * 1.35 - t * TAU / 1.5 + lane * Math.PI;
      const r = 42 + 22 * u + Math.sin(a * 3 + t * TAU) * 2;
      const floor = Math.sin(a) * r * .31;
      const h = 4 + u * 68 + Math.sin(u * 8 + lane + t * TAU) * 3;
      const x = Math.cos(a) * r, y = floor - h;
      if ((floor >= 0) !== front) { last = null; continue; }
      const edge = Math.sin(u * Math.PI) ** .6;
      const flow = tileNoise(u * 24 - t * 4, lane * 7, 24, 0, seed + 301);
      const beat = Math.max(0, Math.cos(t * TAU * 4 - u * TAU * 2 - lane));
      const thick = (2.4 + 6 * Math.max(0, flow + .35) + beat * 1.3) * edge;
      if (last && flow > -.48) {
        if (thick > 2.8) p.beam(last[0], last[1] + 2, x, y + 2, thick + 2, C[2], edge);
        p.beam(last[0], last[1], x, y, thick, C[4], edge);
        p.line(last[0], last[1] - 1, x, y - 1, C[flow > .18 ? 7 : 5], edge);
        if (j % 14 === 0 && flow > .12) p.glow(x, y, 6, C[4], edge * (.16 + pulse * .12));
      }
      // Broad water folds terminate in a feather of foam, with a dark underside.
      if (j % 9 === 0 && flow > .05) {
        const tip = a - .17;
        const xx = Math.cos(tip) * (r + 3), yy = Math.sin(tip) * r * .31 - h - 4;
        p.beam(x, y, xx, yy, 2 * edge, C[4], edge);
        p.line(x, y - 1, xx, yy - 1, C[6], edge);
        billow(p, xx, yy, 1.1 + edge, C, edge);
      }
      last = [x, y];
    }
  }
  // Water sheets lift out of the ground, curl inward, then separate into beads.
  // All periods divide six; no particles teleport at the loop seam.
  for (let i = 0; i < 12; i++) {
    const age = wrap(t + (i < 3 ? i * .5 : i * .139), 1.5), u = age / 1.5;
    const a = i * TAU / 12 - t * TAU / 6;
    const r = 65 + Math.sin(i * 7) * 4;
    const baseX = Math.cos(a) * r, baseY = Math.sin(a) * r * .34;
    if ((baseY >= 0) !== front) continue;
    const k = Math.sin(u * Math.PI) ** 1.3;
    const height = (i < 3 ? 30 : 15 + i % 4 * 4) * k;
    let last = null;
    for (let j = 0; j <= 13; j++) {
      const v = j / 13;
      const x = baseX + Math.cos(a) * (8 * v - 13 * v * v) * k;
      const y = baseY - height * v + 5 * v ** 4;
      if (last) {
        p.beam(last[0], last[1], x, y, (3.8 * (1 - v) + .6) * k, C[3], k);
        p.line(last[0] - 1, last[1], x - 1, y, C[6], k);
      }
      last = [x, y];
    }
    if (u > .48 && u < .88) {
      const fall = (u - .48) * 1.5;
      bead(p, last[0] + Math.cos(a) * fall * 16, last[1] - fall * 22 + 80 * fall * fall,
        Math.cos(a) * 16, -22 + 160 * fall, 2, C, k);
    }
  }
}

function layer(base, time, o, front) {
  const enter = Number.isFinite(o.elapsed) ? smooth(0, .3, o.elapsed) : 1;
  const leave = Number.isFinite(o.remaining) ? smooth(0, .3, o.remaining) : 1;
  const envelope = enter * leave;
  if (envelope <= 0) return;
  // Shrink vertically into the water surface, preserving host rotation and flip.
  // A derived painter prevents lifecycle placement/fade leaking to other effects.
  const p = Object.create(base), height = .12 + .88 * envelope;
  p.toX = (x, y) => base.toX(x, y * height);
  p.toY = (x, y) => base.toY(x, y * height);
  p.fromX = (x, y) => base.fromX(x, y);
  p.fromY = (x, y) => base.fromY(x, y) / height;
  p.fade = base.fade * envelope;
  const t = Math.round(wrap(time) * 1e9) / 1e9;
  const C = fit(o.palette, 8);
  const pulse = Number.isFinite(o.pulse) ? clamp(o.pulse) : .5 + .5 * Math.cos(t * TAU * 4);
  zone(p, C, t, front, pulse, o.seed);
  if (!front) storm(p, C, t, o.seed, false, pulse);
  for (let i = 0; i < 3; i++) {
    spray(p, C, t, i, o.seed, front);
    bubbles(p, C, t, i, o.seed, front);
  }
  if (front) storm(p, C, t, o.seed, true, pulse);
}

export function drawBack(p, t, o) { layer(p, t, o, false); }
export function draw(p, t, o) { layer(p, t, o, true); }
