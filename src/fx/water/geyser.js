// The column (a banded white core, strands running through it, light down its length) and the slam with its
// floor ring follow Sprite Fusion's open-source holy-light (https://www.spritefusion.com/pixel-art-vfx/holy-light),
// MIT License, Copyright (c) 2026 Hugo Duprez.
import { Rng, fit, clamp, smooth, ease, noise, noise2, rand, TAU, WHITE } from "../../core/index.js";
import { WATER, bead, ring, lace, billow } from "./_lib.js";
import { haze, pool } from "../_soft.js";

export const meta = {
  name: "Geyser",
  desc: "One fast water strike: a dense rising jet, a brilliant foam crown, then a single collapse into ballistic spray and fading landing ripples.",
  tags: ["water", "geyser", "eruption", "steam", "column", "nature", "one-shot"],
  size: [184, 168],
  origin: [92, 146],
  duration: .85,
  loop: false,
  fps: 60,
  bg: "ground",
  options: { palette: WATER, height: 100, seed: 4, jetOnly: false, channelDepth: .45 },
};

const SY = .22, G = 820;
const DROP_G = 1800;

// A single attack envelope. The maximum is the impact, never a sustained beam.
// [time, height, pressure, crown, ground foam, light]
export const choreography = [
  [.00, .00, .00, .00, .00, .00],
  [.05, .30, .75, .18, .45, .65],
  [.10, .94, 1.0, .95, 1.0, 1.0],
  [.15, 1.0, .96, 1.0, .90, .72],
  [.20, .87, .87, .85, .75, .50],
  [.25, .65, .73, .65, .62, .32],
  [.30, .39, .54, .40, .48, .20],
  [.35, .16, .31, .15, .34, .11],
  [.40, .00, .00, .00, .24, .06],
  [.45, .00, .00, .00, .18, .04],
  [.50, .00, .00, .00, .13, .025],
  [.55, .00, .00, .00, .09, .015],
  [.60, .00, .00, .00, .06, .01],
  [.65, .00, .00, .00, .035, .005],
  [.70, .00, .00, .00, .015, .00],
  [.75, .00, .00, .00, .005, .00],
  [.80, .00, .00, .00, .00, .00],
  [.85, .00, .00, .00, .00, .00],
];

function state(t) {
  const f = clamp(t / .05, 0, choreography.length - 1);
  const i = Math.min(choreography.length - 2, Math.floor(f));
  const u = smooth(0, 1, f - i);
  return choreography[i].map((v, j) => v + (choreography[i + 1][j] - v) * u);
}

export function create(o) {
  const C = fit(o.palette, 8), R = new Rng(o.seed), HMAX = o.height, S = o.seed;
  // Pre-authored burst births make stepping independent of rendering rate.
  // The second group is water shed by that same crown, not a second eruption.
  const drops = Array.from({ length: o.jetOnly ? 18 : 72 }, (_, i) => {
    const crown = i >= 40, birth = crown ? R.range(.12, .23) : R.range(.035, .105);
    const a = R.range(0, TAU), speed = R.range(22, crown ? 75 : 100);
    const h = crown ? HMAX * state(birth)[1] * R.range(.72, .96) : R.range(2, 9);
    const vh = crown ? R.range(-95, -20) : R.range(180, 360);
    const land = (vh + Math.sqrt(vh * vh + 2 * DROP_G * h)) / DROP_G;
    return { birth, h, vh, land, x: R.range(-7, 7), z: R.range(-4, 4),
      vx: Math.cos(a) * speed, vz: Math.sin(a) * speed,
      size: R.next() < .24 ? 2 : 1, seed: R.int(0, 10000) };
  });
  let elapsed = 0;

  function droplet(p, d, t, front) {
    const age = t - d.birth;
    if (age < 0 || age > d.land + .14) return;
    const floorAge = Math.min(age, d.land);
    const x = d.x + d.vx * floorAge, z = d.z + d.vz * floorAge;
    if ((z >= 0) !== front) return;
    const end = 1 - smooth(.66, .84, t);
    if (age < d.land) {
      const h = d.h + d.vh * age - DROP_G * age * age / 2;
      const y = z * SY - h;
      bead(p, x, y, d.vx, d.vz * SY - d.vh + DROP_G * age, d.size, C, end);
      if (d.size > 1) p.glow(x, y, 4, C[4], end * .1);
    } else {
      const u = age - d.land, k = (1 - smooth(.02, .14, u)) * end;
      ring(p, x, z * SY, 1 + u * 24, .26, k * .7, C,
        { n: 1, seed: d.seed, half: front ? 1 : -1, hot: u < .025 });
      if (u < .065 && d.size > 1) {
        const hop = Math.sin(u / .065 * Math.PI) * 2;
        p.line(x - 2, z * SY - hop, x, z * SY, C[5], k);
        p.blend(x + 2, z * SY - hop, C[6], k);
      }
    }
  }

  function ground(p, t, s, front) {
    const age = t - .025;
    if (age <= 0) return;
    const k = smooth(0, .035, age) * (1 - smooth(.2, .65, t));
    const radius = 5 + 30 * ease.outCubic(clamp(age / .32));
    if (!front) {
      p.each(-radius, -radius * SY, radius, radius * SY, (x, y, sx, sy) => {
        const q = (x / radius) ** 2 + (y / (radius * SY)) ** 2;
        if (q < 1) p.blendPx(sx, sy, C[1], (1 - q) * k * .36);
      });
      pool(p, 0, 0, 36, 9, C[3], s[5] * .2);
    }
    ring(p, 0, 0, radius, SY, k * .85, C,
      { n: 2, gap: 2, half: front ? 1 : -1, hot: age < .08, seed: S, wob: .6 });
    if (front && s[4] > .01 && !o.jetOnly) {
      const foamRadius = 8 + 9 * smooth(.04, .24, t);
      lace(p, 0, 0, foamRadius, foamRadius * SY + .5, s[4], C, 1.15 + t * 2.4, S);
    }
    if (s[4] > .01) {
      for (let i = 0; i < 9; i++) {
        const a = i / 9 * TAU + t * 2, side = Math.sin(a);
        if ((side >= 0) !== front) continue;
        const r = 7 + 7 * smooth(.06, .32, t);
        billow(p, Math.cos(a) * r, side * r * SY - 1,
          (1.8 + rand(i, S) * 1.4) * Math.sqrt(s[4]), C, Math.min(1, s[4] * 1.6));
      }
    }
  }

  function layer(p, front) {
    const t = Math.round(elapsed * 1e9) / 1e9;
    if (t <= 0 || t >= meta.duration) return;
    const s = state(t), H = HMAX * s[1];
    // Use the original detailed column and crown with their own flowing clock.
    // Texture keeps moving while the attack envelope compresses the lifecycle.
    const water = { C, t: 1.15 + t * 2.4, HMAX, S, jetOnly: o.jetOnly, channelDepth: o.channelDepth };
    ground(p, t, s, front);
    if (!front && !o.jetOnly) drawGeyserFoam(p, H, s[3], true, water);
    if (front) {
      drawGeyserColumn(p, H, s[2], water);
      if (!o.jetOnly) drawGeyserFoam(p, H, s[3], false, water);
      if (H > 1) p.glowLine(0, -2, 0, -H, 20, C[4], s[5] * .17);
      const flash = smooth(.015, .04, t) * (1 - smooth(.055, .1, t));
      if (flash > 0) {
        p.ellipse(0, -2, 7, 2, C[6], flash);
        p.glow(0, -4, 23, C[5], flash * .5);
      }
      // Fine low vapour follows the collapsing water, with no late upward jet.
      for (let i = 0; i < 6; i++) {
        const age = t - .16 - i * .012;
        if (age < 0 || age > .42) continue;
        const u = age / .42, k = Math.sin(u * Math.PI) * (1 - u);
        const side = i % 2 ? 1 : -1;
        haze(p, side * (5 + age * (20 + i * 3)), -2 - age * 5,
          4 + u * 5, C[4], k * .12);
      }
    }
    for (const d of drops) droplet(p, d, t, front);
  }

  return {
    update(dt) { elapsed = Math.min(meta.duration, elapsed + dt); },
    drawBack(p) { layer(p, false); },
    draw(p) { layer(p, true); },
  };
}

// Shared rendering primitives keep combat variants on the same water recipe.
  // the column: a white core banded out to blue edges, shadowed on the right; 1 px strands whose streaks run up
  // in jet time (fast and long low down, bunching where the water slows near the top); it spreads as it rises,
  // its sides ragged and running, a sway through it, light all the way up
export function drawGeyserColumn(p, H, thin, { C, t, HMAX, S, jetOnly = false, channelDepth = 0 }) {
    const V0 = Math.sqrt(2 * G * HMAX);
    if (H < 1) return;
    const tau = (h) => (V0 - Math.sqrt(Math.max(0, V0 * V0 - 2 * G * Math.min(h, HMAX * 0.96)))) / G;
    p.shade(-22, -H - 2, 22, 0, (x, y, out) => {
      const h = -y, v = h / H, sway = noise(t * 1.6 + h * 0.025, S + 5) * 2.5 * v;
      const rag = noise2(h * 0.2 - t * 11, x < sway ? 3 : 7, S + 6) * (0.5 + 1.8 * v);
      const cap = jetOnly ? Math.sqrt(1 - smooth(.76, 1, v)) : 1;
      if (jetOnly && h > H) return;
      const w = ((3.6 + 7.5 * Math.pow(v, 1.8)) * thin + rag) * cap, q = (x - sway) / Math.max(1, w), aq = Math.abs(q);
      if (aq > 1) return;
      const X = Math.floor(x), streak = noise2(X * 1.618 + 0.3, (tau(h) - t) * 14, S), body = noise2(Math.floor((x + 40) / 2) * 2.3, (tau(h) - t) * 5, S + 1);
      let lvl = aq < 0.42 ? 0 : aq < 0.7 ? 1 : aq < 0.9 ? 2 : 3;
      if (q > 0.38) lvl++;
      if (streak > 0.28) lvl--;
      if (body < -0.4) lvl++;
      // A shaded secondary stream keeps the approved deep-teal channels visible
      // alongside the original hot upstroke, without flattening the foam crown.
      if (!jetOnly && channelDepth > 0 && aq > .3 && body < clamp(channelDepth) - .42) lvl += 2;
      out.c = jetOnly ? [C[6], C[5], C[4], C[3], C[2]][clamp(lvl, 0, 4)] : [WHITE, C[6], C[5], C[4], C[3], C[2]][clamp(lvl, 0, channelDepth > 0 ? 5 : 4)];
    });
    p.glowLine(0, 0, 0, -H, 16 + 8 * thin, C[5], 0.12 * thin);
  }

  // the head: water boiling over at the top and falling back round the column in an umbrella of streaks, foam
  // billows churning in it, shadowed underneath, lit on top
export function drawGeyserFoam(p, H, k, back, { C, t, S }) {
    if (k <= 0.01 || H < 4) return;
    if (back) {
      // the umbrella: streaks pouring off the rim of the head, running down and thinning out
      for (let i = 0; i < 16; i++) {
        const side = i % 2 ? 1 : -1, x0 = side * (5 + 9 * rand(i, S + 20)) * k, len = (14 + 26 * rand(i, S + 21)) * k, speed = 70 + 50 * rand(i, S + 22);
        for (let j = 0; j < 3; j++) {
          const f = (t * speed / len + j / 3 + rand(i, S + 23)) % 1, y0 = -H + 2 + f * len, x = x0 + side * f * f * 6, L = 1 + 4 * f * (1 - f) * 2;
          if (f < 0.85) p.line(x, y0, x + side * 0.6, y0 + L, f < 0.4 ? C[6] : f < 0.7 ? C[5] : C[4]);
        }
      }
    }
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * TAU + t * (i % 2 ? 1.3 : -1.1), z = Math.sin(a);
      if (z < 0 !== back) continue;
      const rho = (3 + 7 * rand(i, S)) * k, x = Math.cos(a) * rho * 1.25 + noise(t * 3 + i, S + 8) * 2.5;
      const y = -H + z * rho * 0.45 + (rho / 10) * 4 - 4 * (1 - rho / (10 * k)) + noise(t * 3 + i + 50, S + 9) * 2.5, r = (2 + 2.6 * rand(i, S + 2) + 0.7 * Math.sin(t * 7 + i)) * k;
      if (back) billow(p, x, y, r, [C[0], C[1], C[2], C[3], C[3], C[4], C[5], C[5]]);
      else {
        p.circle(x + r * 0.15, y + r * 0.25, r, C[4]);
        p.circle(x, y, r * 0.82, rho > 6 * k ? C[5] : C[6]);
        p.circle(x - r * 0.25, y - r * 0.3, r * 0.5, WHITE);
      }
    }
    if (!back) p.glow(0, -H - 2, 38, C[5], 0.34 * k);
  }
