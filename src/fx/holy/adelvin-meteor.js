// Composes holy/sunburst with the expanding light rings of arcane/mana-burst
// and holy/smite. Energy release adapted from Sprite Fusion energy, MIT,
// Copyright (c) 2026 Hugo Duprez: https://www.spritefusion.com/pixel-art-vfx/energy
import { Rng, ease, TAU, sparkle, flare, band, fit, clamp, smooth } from '../../core/index.js';
import { AURORA, colors } from './_adelvin.js';
import { oval } from './_lib.js';
import { draw as sunburst, meta as sunMeta } from './sunburst.js';

export const IMPACT = .3;
export const meta = {
  name: 'Gabriel radiant meteor',
  desc: 'A large pearl-gold light meteor releases an enlarged sunburst, two aura shells, floor light waves and drifting sparks. No stone, dark crater or curtains.',
  tags: ['holy', 'adelvin', 'gabriel', 'meteor', 'light', 'burst', 'one-shot'],
  size: [288, 288], origin: [144, 190], duration: 1.15, loop: false, fps: 30, bg: 'ground',
  options: { palette: AURORA, radius: 70, seed: 53 },
};

// A local painter view preserves placement/flip/rotation and the host's fade/light.
// Reused effects cannot change the caller's painter state.
function at(p, x, y, alpha = 1) {
  const q = Object.create(p);
  q.tx = p.toX(x, y); q.ty = p.toY(x, y); q.fade = p.fade * alpha;
  return q;
}

export function create(o) {
  const input = colors(o), C = fit([input[5], input[6], input[7]], 8);
  const R = new Rng(o.seed);
  const motes = Array.from({ length: 72 }, (_, i) => ({
    a: i * TAU / 72 + R.range(-.1, .1), speed: R.range(85, 225),
    life: R.range(.35, .81), size: R.range(.65, 1.9), delay: R.range(0, .035),
    phase: R.range(0, TAU), star: i % 5 === 0,
  }));
  let elapsed = 0, t = 0;
  const active = () => t > 0 && t < meta.duration;

  function floor(p, back) {
    const age = t - IMPACT;
    if (age < 0) {
      if (!back) return;
      const k = smooth(0, .07, t), r = o.radius * (.9 + .1 * t / IMPACT);
      oval(p, 0, 0, r, r * .27, input[4], k * .55);
      oval(p, 0, 0, r * .8, r * .21, C[2], k * .45);
      p.glow(0, -2, 34, C[2], .18 * k);
      return;
    }
    // Smite's split floor bands, enlarged without adding an opaque ground fill.
    for (let i = 0; i < 2; i++) {
      const u = (age - i * .07) / .46;
      if (u < 0 || u >= 1) continue;
      band(p, 0, 0, 5 + o.radius * ease.outCubic(u), .29,
        Math.max(1, 5 * (1 - u)), (1 - u) * .85, C,
        a => (Math.sin(a) < 0) === back, u < .08);
    }
  }

  function descent(p) {
    if (t <= .025) return;
    const u = clamp((t - .025) / (IMPACT - .025));
    const x = -20 * (1 - u), y = -132 + 107 * ease.inQuad(u), r = 22 + 5 * u;
    const k = smooth(.025, .065, t), q = at(p, x, y, k);
    // Reuse the sun's corona around a larger layered pearl; never a rock outline.
    sunburst(q, t, { ...sunMeta.options, palette: C, scale: .72, rays: 6, seed: o.seed });
    for (let j = 0; j < 36; j++) {
      const v = j / 36, w = r * .7 * (1 - v);
      q.line(-w - v * 6, -v * 52, w - v * 6, -v * 52, C[1], (1 - v) * .8);
    }
    q.circle(0, 0, r, C[0], .75);
    q.circle(-1, 2, r * .86, C[3]);
    q.circle(-3, 3, r * .66, C[6]);
    q.circle(-5, 4, r * .4, C[7]);
    q.glow(0, 0, 38, C[2], .25);
  }

  function release(p) {
    const age = t - IMPACT;
    // The actual library sunburst is enlarged and given a finite attack envelope.
    const burst = 1 - smooth(.06, .32, age);
    if (burst > 0) sunburst(at(p, 0, -20, burst), age * .8,
      { ...sunMeta.options, palette: C, rays: 8, scale: .65 + 1.05 * ease.outCubic(clamp(age / .11)), seed: o.seed });
    // Mana-burst's expanding aura shells: bright rims, transparent interiors.
    for (let i = 0; i < 2; i++) {
      const u = (age - i * .055) / (.43 + i * .08);
      if (u < 0 || u >= 1) continue;
      const r = 8 + (o.radius - i * 17) * ease.outCubic(u);
      p.ring(0, -20, r, Math.max(1, (4 - i) * (1 - u)), C[i ? 1 : 5],
        (v, a) => -20 + Math.sin(a) * r > 1 ? 0 : (1 - u) * .8);
    }
    if (age < .14) {
      const k = 1 - age / .14;
      flare(p, 0, -18, 42 * k + 4, k, C);
      p.circle(0, -16, 22 * k, C[7], k);
    }
    for (const m of motes) {
      const u = age - m.delay;
      if (u < 0 || u >= m.life) continue;
      const travel = m.speed * (1 - Math.exp(-u * 3.4)) / 3.4;
      const x = Math.cos(m.a) * travel;
      const y = -20 + Math.sin(m.a) * travel * (Math.sin(m.a) > 0 ? .28 : 1) - u * 9;
      const k = (1 - smooth(m.life * .5, m.life, u)) * smooth(0, .025, u);
      if (m.star) sparkle(p, x, y, m.size * (1 + .4 * Math.sin(u * 16 + m.phase)), C[7], C[1], k);
      else {
        const tail = 3.5 * Math.exp(-u * 8);
        p.line(x, y, x - Math.cos(m.a) * tail, y - Math.sin(m.a) * tail, C[3 + (m.size > 1.3 ? 3 : 0)], k);
      }
      if (m.star) p.glow(x, y, 5, C[2], .22 * k);
    }
    p.glow(0, -20, 78, C[2], .4 * (1 - smooth(0, .52, age)));
  }

  return {
    update(dt) { elapsed += dt; t = Math.round(elapsed * 1e9) / 1e9; },
    drawBack(p) { if (active()) floor(p, true); },
    draw(p) {
      if (!active()) return;
      if (t < IMPACT) descent(p);
      else { floor(p, false); release(p); }
    },
  };
}
