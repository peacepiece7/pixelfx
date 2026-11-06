// A portal that fills a stone gate's pointed arch: a slow two-armed vortex in a few hard tones, a lit rim and a
// handful of motes. Built to sit inside painted pixel-art scenery, so it moves in stepped frames and stays calm.
// The dithered ramp (tone) is adapted from Sprite Fusion's open-source black hole
// (https://www.spritefusion.com/pixel-art-vfx/black-hole), MIT License, Copyright (c) 2026 Hugo Duprez.
import { fit, cycle, smooth, clamp, TAU, WHITE } from "../../core/index.js";
import { tone } from "./_lib.js";

const D = 4;

export const meta = {
  name: "Gate portal",
  desc: "A calm portal filling a pointed stone arch: two broad spiral arms turn slowly in hard tones, a pale rim, motes drifting in. Stepped frames for painted scenery.",
  tags: ["arcane", "portal", "gate", "arch", "teleport", "ambient", "loop"],
  size: [64, 96],
  origin: [32, 88],
  duration: D,
  loop: true,
  fps: 10,
  bg: "dark",
  // width/height: the arch opening in px; arch: how tall the pointed top is; steps: animation frames per second
  options: {
    palette: ["#040817", "#081843", "#0c2f7a", "#1450b4", "#2478dc", "#52a8f2", "#a2dcff", "#e8f8ff"],
    width: 40, height: 72, arch: 24, steps: 10, seed: 3,
  },
};

/** Signed distance (px, positive inside) from the arch opening's edge, approximate but monotone. */
function edge(x, y, hw, H, R) {
  const up = -y, side = hw - Math.abs(x);
  if (up < 0) return up;
  if (up <= H - R) return Math.min(side, up + 6);
  const s = (up - (H - R)) / R, half = hw * Math.pow(Math.max(0, 1 - s), 0.62);
  return Math.min(half - Math.abs(x), (H - up) * 1.4);
}

function setup(t, o) {
  const steps = Math.max(1, o.steps), tq = Math.floor(t * steps + 1e-6) / steps, ph = tq / D;
  const C = fit(o.palette, 8), hw = o.width / 2, H = o.height, R = Math.min(o.arch, H * 0.6), cy = -H * 0.47;
  return { C, hw, H, R, cy, ph, tq, S: o.seed };
}

function body(p, s) {
  const { C, hw, H, R, cy, ph } = s, breath = 0.92 + 0.08 * Math.sin(ph * TAU);
  p.shade(-hw - 1, -H - 1, hw + 1, 1, (x, y, out) => {
    const d = edge(x, y, hw, H, R);
    if (d < 0) return;
    const dx = x / hw, dy = (y - cy) / (H * 0.52), r = Math.hypot(dx, dy), th = Math.atan2(dy, dx), z = Math.log(r + 0.07);
    // two broad arms; turning half a revolution a loop keeps the two-fold pattern seamless
    const phi = 2 * (th - Math.PI * ph) - 4.6 * z, arm = Math.pow(0.5 + 0.5 * Math.cos(phi), 5);
    const inner = Math.pow(0.5 + 0.5 * Math.cos(phi + 2.1), 9) * 0.45;
    // faint rings sinking toward the core, twice a loop
    const ring = Math.pow(0.5 + 0.5 * Math.cos(TAU * (1.1 * z - 2 * ph)), 12) * 0.22;
    const depth = smooth(0.06, 1.05, r);
    let I = 0.1 + 0.42 * depth + (arm * 0.5 + inner) * smooth(0.1, 0.42, r) + ring * smooth(0.15, 0.5, r);
    I += Math.max(0, 1 - d / 5) * 0.4;
    I *= breath;
    if (d < 1.2) {
      out.c = C[7];
      out.k = 0.3;
      return;
    }
    if (d < 2.4) {
      out.c = C[6];
      out.k = 0.12;
      return;
    }
    out.c = r < 0.1 ? C[0] : tone(C, clamp(I), x, y, 0, 0.55) || C[0];
  });
}

// motes riding the arms inward, a few at a time
function motes(p, s) {
  const { C, hw, H, cy, tq, S } = s;
  cycle(tq, D, 12, S * 5 + 1, (g) => g.range(1.4, 2.4), (age, life, r) => {
    const q = age / life, a0 = r.range(0, TAU), rho = 0.95 * (1 - q * 0.85), th = a0 + q * 2.2;
    const x = Math.round(Math.cos(th) * rho * hw * 0.92), y = Math.round(cy + Math.sin(th) * rho * H * 0.48);
    const a = Math.min(1, q * 5) * (rho > 0.3 ? 1 : rho / 0.3);
    if (a < 0.35) return;
    p.px(x, y, rho > 0.6 && r.chance(0.4) ? WHITE : C[6]);
    p.glow(x, y, 2.5, C[5], 0.25 * a);
  });
}

export function draw(p, t, o) {
  const s = setup(t, o), { C, hw, H, cy, ph } = s;
  body(p, s);
  motes(p, s);
  // light comes from the rim, a soft breath in the body
  p.glow(0, cy, H * 0.55, C[4], 0.08 + 0.03 * Math.sin(ph * TAU));
  for (let i = 0; i <= 6; i++) {
    const v = i / 6;
    p.glow(-hw + 1, -v * (H - s.R), 5, C[5], 0.1);
    p.glow(hw - 1, -v * (H - s.R), 5, C[5], 0.1);
  }
}
