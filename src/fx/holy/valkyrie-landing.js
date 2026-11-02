import { Particles, Lights, P, PF, Rng, fit, band, sparkle, smooth, clamp, ease, TAU, READY } from "../../core/index.js";
import { GOLD, Feathers, feather, oval } from "./_lib.js";

export const meta = {
  name: "Valkyrie landing",
  desc: "A floor sigil tightens before a white landing flash; two gold wing-shaped shockwaves unfurl, scattering ten fluttering feathers over a rolling dust ring.",
  tags: ["holy", "landing", "wings", "feather", "impact", "one-shot"],
  size: [160, 100], origin: [80, 78], duration: 1, loop: false, fps: 30,
  bg: "ground", actor: 2, options: { palette: GOLD, seed: 8 },
};

const HIT = 0.14;
const AIR = { ...READY, y: -23, crouch: 3, lean: -3, fx: -6, fy: -28, bx: 10, by: -26, ffx: -5, fbx: 6 };
const LAND = { ...READY, crouch: 9, lean: 4, fx: 8, fy: -9, bx: -8, by: -13, ffx: 10, fbx: -9 };
export const act = {
  poses: [[-0.2, { ...AIR, y: -32 }], [0, AIR], [HIT, LAND, "in"], [0.3, { ...LAND, crouch: 7 }], [0.65, { ...READY, crouch: 2 }], [1, READY]],
  hits: [{ t: HIT, stop: 0.06, shake: 0.16, amp: 2, target: false }],
};

export function create(o) {
  const C = fit(o.palette, 8), R = new Rng(o.seed);
  const ps = new Particles({ rng: R, ground: () => 2, sparks: [C[7], C[6], C[4], C[2]], haze: C[3] });
  const loose = new Feathers(R, 2), lights = new Lights();
  let t = 0, released = false;

  function floor(p, back) {
    if (t >= meta.duration) return;
    const keep = (a) => (Math.sin(a) < 0) === back;
    if (t < HIT) {
      const k = t / HIT, r = 21 - k * 5;
      oval(p, 0, 0, r, r * 0.25, C[5], 0.4 + k * 0.6, keep);
      oval(p, 0, 0, r + 4, (r + 4) * 0.25, C[3], 0.5, keep);
      for (let i = 0; i < 8; i++) {
        const a = i * TAU / 8;
        if (keep(a)) p.line(Math.cos(a) * (r - 2), Math.sin(a) * (r - 2) * 0.25,
          Math.cos(a) * (r + 2), Math.sin(a) * (r + 2) * 0.25, C[6], 0.8);
      }
      p.glow(0, -1, 28, C[4], 0.18 + k * 0.2);
      return;
    }
    const u = (t - HIT) / 0.48;
    if (u < 1) band(p, 0, 1, 10 + 57 * ease.outCubic(u), 0.19, 2.5 * (1 - u) + 0.5, 1 - u, C, keep, u < 0.1);
  }

  function wings(p) {
    for (let layer = 0; layer < 2; layer++) {
      const age = t - HIT - layer * 0.075;
      if (age < 0 || age >= 0.4) continue;
      const spread = ease.outCubic(clamp(age / 0.18)), k = 1 - smooth(0.20, 0.37, age);
      for (const side of [-1, 1]) {
        // Separated primaries sweep out and up, with air between the ribs.
        for (let i = 5; i >= 0; i--) {
          const q = i / 5, x = side * (5 + q * 12) * spread;
          const y = -4 - q * 8 * spread - layer * 2;
          const a = side > 0 ? -0.10 - q * 1.0 : Math.PI + 0.10 + q * 1.0;
          const len = (36 + q * 16) * spread * (1 - layer * 0.34);
          feather(p, x, y, a, len, (3.6 + q * 0.8) * spread * k, C, Math.min(1, k * 3) * (layer ? 0.75 : 1), side, age < 0.045 ? 1 : 0);
          p.glowLine(x, y, x + Math.cos(a) * len, y + Math.sin(a) * len, 5, C[4], 0.14 * k);
        }
      }
    }
  }

  return {
    update(dt) {
      t += dt;
      if (!released && t >= HIT) {
        released = true;
        lights.add(0, -6, 42, C[4], 0.8, 0.38);
        lights.add(0, -9, 22, C[7], 0.9, 0.09);
        for (let i = 0; i < 10; i++) {
          const side = i % 2 ? 1 : -1;
          loose.add({ x: side * R.range(4, 24), y: -R.range(8, 23), vx: side * R.range(55, 135), vy: -R.range(45, 125),
            a: R.range(-Math.PI, 0), len: R.range(7, 11), wid: R.range(1.5, 2.3), life: R.range(0.61, 0.78),
            back: i % 3 === 0, sink: R.range(40, 55), amp: R.range(10, 18) });
        }
        for (let i = 0; i < 24; i++) {
          const a = i * TAU / 24, x = Math.cos(a), y = Math.sin(a);
          ps.spawn(P.DUST, x * 13, y * 3, x * R.range(45, 95), y * 10 - 5,
            R.range(0.25, 0.49), C[2], R.range(1.6, 2.8), 0, y < 0 ? PF.BACK : 0);
        }
        for (let i = 0; i < 20; i++) {
          const a = R.range(-Math.PI, 0), speed = R.range(35, 135);
          ps.spawn(P.SPARK, 0, -4, Math.cos(a) * speed, Math.sin(a) * speed, R.range(0.14, 0.32));
        }
      }
      ps.update(dt); loose.update(dt); lights.update(dt);
    },
    drawBack(p) {
      if (t >= meta.duration) return;
      floor(p, true); wings(p); loose.draw(p, C, "back"); ps.draw(p, "back");
    },
    draw(p) {
      if (t >= meta.duration) return;
      floor(p, false);
      const age = t - HIT;
      if (age >= 0 && age < 0.13) {
        const k = 1 - age / 0.13;
        sparkle(p, 0, -7, 20 * k, C[7], C[5], k);
        p.beam(0, -5, 0, -7 - 39 * k, 1 + 3 * k, C[7], k);
        p.glowLine(0, -4, 0, -40 * k, 7, C[5], 0.4 * k);
      }
      loose.draw(p, C, "front"); ps.draw(p, "front"); lights.draw(p);
    },
  };
}
