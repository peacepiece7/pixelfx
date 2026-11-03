// Grenade/small-explosion blast recipe and their shared fireBall renderer,
// adapted from Sprite Fusion explosion, MIT, Copyright (c) 2026 Hugo Duprez.
// https://www.spritefusion.com/pixel-art-vfx/explosion
import { Particles, P, Rng, fit, flare, ease, smooth, TAU } from '../../core/index.js';
import { drawPs, fireRamp } from '../explosions/_lib.js';
import { VENOM, clock } from './_lib.js';

export const meta = {
  name: 'Poison detonation',
  desc: 'An immediate green bomb blast: dense hot puffs, radial shrapnel streaks and a short rolling smoke aftershock. Snapshot stacks change visual size only.',
  tags: ['poison', 'hilding', 'detonation', 'bomb', 'stacks', 'one-shot'],
  size: [160, 128], origin: [80, 98], duration: .7, loop: false, fps: 40, bg: 'ground',
  options: { palette: VENOM, stacks: 6, seed: 67 },
};

export function create(o) {
  const C = fit(o.palette, 8), FR = fireRamp([C[1], C[2], C[3], C[4], C[4], C[5], C[6], C[7]]), R = new Rng(o.seed), time = clock();
  const stacks = Math.max(0, Number.isFinite(o.stacks) ? o.stacks : 1);
  // Snapshot once. The same puff count and timing at every stack value.
  const s = .7 + .4 * (1 - Math.exp(-stacks / 10)), y = -24;
  const ps = new Particles({ rng: R, ground: () => 0, sparks: [C[6], C[5], C[4], C[3]] });
  // Reuse the explosions' crisp, layered fireballs, recolored entirely in VENOM.
  for (let i = 0; i < 26; i++) {
    const a = i * TAU / 26 + R.range(-.16, .16), speed = R.range(45, 150) * s;
    ps.spawn(P.FIRE, Math.cos(a) * 3 * s, y + Math.sin(a) * 3 * s,
      Math.cos(a) * speed, Math.sin(a) * speed * .75 - 16,
      R.range(.3, .49), 0, R.range(7, 12) * s, R.range(0, .025));
  }
  for (let i = 0; i < 5; i++) ps.spawn(P.FIRE, R.range(-3, 3) * s, y + R.range(-3, 3),
    R.range(-12, 12), R.range(-20, -5), R.range(.16, .24), 0, R.range(11, 15) * s);
  // Grenade-style short, fast fragments instead of liquid drops and splash crowns.
  for (let i = 0; i < 42; i++) {
    const a = R.range(0, TAU), speed = R.range(140, 270) * s;
    ps.spawn(P.SPARK, 0, y, Math.cos(a) * speed, Math.sin(a) * speed * .7 - 20,
      R.range(.12, .3));
  }
  for (let i = 0; i < 12; i++) {
    const a = i * TAU / 12, speed = R.range(30, 65) * s;
    ps.spawn(P.SMOKE, Math.cos(a) * 5 * s, y + Math.sin(a) * 4 * s,
      Math.cos(a) * speed, Math.sin(a) * speed * .45 - 18,
      R.range(.3, .48), C[i % 4 === 0 ? 3 : 2], R.range(5, 8) * s, R.range(.07, .14));
  }
  // A few cooling fragments bridge the blast and smoke without another burst.
  for (let i = 0; i < 10; i++) {
    const a = R.range(0, TAU), speed = R.range(35, 85) * s;
    ps.spawn(P.MOTE, 0, y, Math.cos(a) * speed, Math.sin(a) * speed * .6 - 15,
      R.range(.3, .46), C[i % 3 ? 4 : 6], .7);
  }
  function painter(p) {
    const q = Object.create(p);
    q.fade = p.fade * (1 - smooth(.48, .7, time.t));
    return q;
  }
  return {
    update(dt) { time.update(dt); ps.update(dt); },
    draw(p) {
      const t = time.t;
      if (t <= 0 || t >= meta.duration) return;
      p = painter(p);
      drawPs(p, ps, 'back', FR);
      drawPs(p, ps, 'front', FR);
      if (t < .08) {
        const k = 1 - t / .08;
        p.circle(0, y, (12 + 6 * k) * s, C[5]);
        p.circle(-1, y - 1, (8 + 5 * k) * s, C[6]);
      }
      if (t < .16) flare(p, 0, y, 39 * s * Math.pow(1 - t / .16, 1.3), 1 - t / .16, C);
      if (t < .23) {
        const u = t / .23;
        p.ring(0, y, (7 + 37 * ease.outCubic(u)) * s, Math.max(1, 3 * (1 - u)), C[5], 1 - u);
      }
      p.glow(0, y, 46 * s, C[4], .48 * (1 - smooth(0, .25, t)));
    },
  };
}
