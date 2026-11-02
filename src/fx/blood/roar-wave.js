import { Rng, fit, band, sparkle, smooth, READY } from "../../core/index.js";

export const meta = {
  name: "Roar wave",
  desc: "Three crimson pressure rings burst from the mouth to a 100px radius, driving rolling dust and grit away from the caster.",
  tags: ["blood", "roar", "shockwave", "aoe", "one-shot"],
  size: [220, 110], origin: [110, 82], duration: 0.9, loop: false, fps: 30,
  bg: "ground", actor: 2,
  options: { palette: ["#2a0710", "#5c0b1a", "#8e1424", "#c0202e", "#e8483f", "#ff8a6a", "#fff1e8"], seed: 9, shake: 1 },
};
const RELEASE = 0.1;
const BRACE = { turn: 1, crouch: 4, lean: -3, fx: -10, fy: -23, bx: 10, by: -23 };
const ROAR = { turn: 1, lean: 3, hy: -1, fx: -14, fy: -18, bx: 14, by: -18, ffx: -6, fbx: 6 };
export const act = {
  poses: [[-0.25, READY], [0, BRACE], [RELEASE, ROAR, "snap"], [0.4, { ...ROAR, lean: 1 }], [0.9, READY]],
};

export function create(o) {
  const C = fit(o.palette, 7), R = new Rng(o.seed);
  // Stock preview mouth follows its 38px actor; standalone use defaults to our 48px hero.
  const mouth = o.actor?.head ? [o.actor.head[0] + 3, o.actor.head[1] + o.actor.h * 0.17] : [3, -40];
  const dust = Array.from({ length: 36 }, (_, i) => ({
    side: i % 2 ? 1 : -1, start: RELEASE + R.range(0.015, 0.3),
    x: R.range(8, 48), y: R.range(-2, 5), vx: R.range(65, 110),
    life: R.range(0.25, 0.46), size: R.range(2, 4.5), phase: R.range(0, 6), grit: i % 3 === 0,
  }));
  const flecks = Array.from({ length: 18 }, () => ({ a: R.range(0, Math.PI * 2), start: RELEASE + R.range(0, 0.15), speed: R.range(65, 135) }));
  let elapsed = 0, t = 0, signalled = false;
  function rings(p, back) {
    if (t >= meta.duration - 1e-9) return;
    for (let i = 0; i < 3; i++) {
      const u = (t - RELEASE - i * 0.105) / 0.52;
      if (u < 0 || u >= 1) continue;
      const r = 4 + 96 * (1 - (1 - u) ** 2), fade = 1 - smooth(0.48, 1, u);
      const width = (5 - i * 0.7) * (1 - u * 0.55);
      band(p, ...mouth, r, 0.36, width, fade * (back ? 0.65 : 1), [C[0], C[1], C[2], C[3], C[4]],
        a => (Math.sin(a) < 0) === back);
      for (let j = 0; j < 18; j++) {
        const a = j * Math.PI * 2 / 18;
        if ((Math.sin(a) < 0) !== back) continue;
        p.glow(mouth[0] + Math.cos(a) * r, mouth[1] + Math.sin(a) * r * 0.36, 5, C[3], fade * 0.12);
      }
      // A fine hot leading lip over the darker pressure band.
      band(p, ...mouth, r + 0.7, 0.36, 0.7, fade * 0.65, [C[2], C[3], C[4], C[5]],
        a => (Math.sin(a) < 0) === back);
    }
  }
  function floor(p, back) {
    if (t >= meta.duration - 1e-9) return;
    for (const d of dust) {
      if ((d.y < 0) !== back) continue;
      const age = t - d.start, u = age / d.life;
      if (u < 0 || u >= 1) continue;
      const x = d.side * (d.x + d.vx * (1 - Math.exp(-3 * age)) / 3);
      const y = d.y - Math.sin(u * Math.PI) * (d.grit ? 7 : 3), fade = Math.sin(Math.PI * u);
      if (d.grit) {
        p.line(x - d.side * 2, y - 1, x, y, C[2], fade);
        p.dot(x, y - 1, C[4], fade);
      } else {
        const size = d.size * (0.7 + u);
        p.disc(x, y, size, C[1], fade * 0.35);
        p.disc(x - d.side, y - size * 0.35, size * 0.75, C[3], fade * 0.2);
        p.disc(x - d.side * 1.5, y - size * 0.6, size * 0.45, C[4], fade * 0.12);
      }
    }
  }
  return {
    update(dt) {
      elapsed += dt;
      t = Math.round(elapsed * 1e9) / 1e9;
      // Host-only optional signal: once on release, never move a camera inside this effect.
      // shake: 0 disables it; onShake({ duration, amplitude }) receives pixel amplitude.
      if (!signalled && t >= RELEASE) {
        signalled = true;
        if (o.shake > 0 && typeof o.onShake === "function") o.onShake({ duration: 0.18, amplitude: 2 * o.shake });
      }
    },
    drawBack(p) { rings(p, true); floor(p, true); },
    draw(p) {
      if (t >= meta.duration - 1e-9) return;
      rings(p, false); floor(p, false);
      const age = t - RELEASE;
      if (age >= 0 && age < 0.16) {
        const k = 1 - age / 0.16;
        sparkle(p, ...mouth, 7 * k, C[6], C[4], k);
        p.glow(...mouth, 23, C[4], 0.45 * k);
      }
      for (const f of flecks) {
        const age = t - f.start, u = age / 0.34;
        if (u < 0 || u >= 1) continue;
        const r = 8 + f.speed * age, x = mouth[0] + Math.cos(f.a) * r, y = mouth[1] + Math.sin(f.a) * r * 0.36;
        p.line(x - Math.cos(f.a) * 3, y - Math.sin(f.a), x, y, C[3], 1 - u);
        p.dot(x, y, C[5], 1 - u);
        p.light(x, y, C[4], 0.15 * (1 - u));
      }
    },
  };
}
