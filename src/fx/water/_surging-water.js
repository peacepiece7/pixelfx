// Reference-directed water surfaces shared by the three Aorbion jets.
// The original geyser supplies the timing/particle idiom; these thicker shaded
// channels retain dark water beneath a narrow foam crown instead of a white beam.
import { clamp, noise2 } from '../../core/index.js';
import { billow } from './_lib.js';

export function surgeColumn(p, H, pressure, { C, t, S, width = 10 }) {
  if (H < 1 || pressure <= 0) return;
  const W = width * pressure;
  // The channel turns slowly while its small bright striations climb rapidly.
  // Sampling the physical rise separately prevents the entire column sliding.
  p.shade(-W - 7, -H - 5, W + 7, 1, (x, y, out) => {
    const v = clamp(-y / H);
    const sway = Math.sin(v * 4.1 - t * 3 + S) * 1.6 * v;
    const rag = noise2(Math.floor(y / 2) * .27 - t * 9, x < 0 ? 1 : 9, S) * 1.2;
    const w = W * (.87 + .18 * Math.cos(v * 5)) + rag;
    const q = (x - sway) / Math.max(1, w);
    const cap = -H + Math.sin(x * .5 + t * 11) * 2 + noise2(x * .3, t * 4, S + 9) * 2;
    if (Math.abs(q) > 1 || y < cap) return;
    const flow = noise2(Math.floor((x - sway + v * 3) / 2) * .7, v * 3 - t * 6, S + 12);
    const vein = Math.sin(q * 9 + v * 3.5 + t * 1.9 + flow * 1.1);
    let level = vein > .72 ? 4 : vein > .05 ? 3 : vein > -.7 ? 2 : 1;
    if (q > .6) level = Math.max(1, level - 1);
    if (q < -.78 && flow > -.15) level = 4;
    const twist = Math.abs(q - Math.sin(v * 5.5 - t * 3) * .65);
    if (twist < .12 && v > .08 && v < .91) level = flow > .25 ? 6 : 5;
    // Fine vertical strands run through the larger channels at a second speed.
    // Their interrupted lengths retain water texture without noisy single dots.
    const strand = noise2(Math.floor(x + v * 2) * 1.71, Math.floor(y / 3) * .21 + t * 12, S + 72);
    const under = noise2(Math.floor(x / 3) * 2.3, v * 4 - t * 3, S + 2);
    if (strand > .23) level = Math.min(6, level + 1);
    if (strand < -.32 && under < .1) level = Math.max(1, level - 1);
    if (y < cap + 3) level = strand > .1 ? 7 : 5;
    out.c = C[level];
  });
  p.glowLine(-W * .3, -3, -W * .25, -H + 3, W + 4, C[4], pressure * .065);
  // Transient thin white veins never fill the trunk. Short intervals leave
  // dark channels visible, including at the peak-pressure frame.
  for (let i = 0; i < 8; i++) {
    const f = ((t * (1.1 + i % 3 * .17) + i * .127) % 1 + 1) % 1;
    const y = -H * f;
    const x = Math.sin(f * 5.5 - t * 3) * W * .65 + (i % 2 ? 1 : -1);
    const k = Math.sin(f * Math.PI) * pressure;
    p.line(x, y, x - .4, y - 2 - i % 3, C[i % 3 ? 5 : 6], k * .8);
  }
}

export function surgeCrown(p, H, pressure, { C, t, S, width = 10, strength = 1 }, back) {
  if (H < 3 || pressure < .03) return;
  const W = width * pressure;
  // Five offset lobes fold outwards, each with a dark underside. They are water
  // curls, not cloud discs: their trailing edges stretch down the trunk.
  for (let i = 0; i < 5; i++) {
    const far = i % 2 === 0;
    if (far !== back) continue;
    const q = (i - 2) / 2;
    const phase = t * (5.1 + i * .31) + i * 2.7 + S;
    const x0 = q * W * .85;
    const h = H + (Math.sin(phase) * 3.2 + Math.sin(i * 6.7) * 2) * pressure;
    const extent = (4.5 + Math.sin(phase * .7) * 1.3) * pressure * strength;
    let last = null;
    for (let j = 0; j < 10; j++) {
      const u = j / 9;
      const side = q < 0 ? -1 : 1;
      const x = x0 + side * Math.sin(u * 1.9) * extent;
      const y = -h - Math.sin(u * Math.PI) * (3 + i % 2) * pressure + u * u * 5 * pressure;
      if (last) {
        p.beam(last[0], last[1] + 2, x, y + 2, 3.5 * pressure, C[back ? 2 : 3]);
        p.beam(last[0], last[1], x, y, 2.8 * pressure, C[back ? 4 : 5]);
        p.line(last[0], last[1] - 1, x, y - 1, C[back ? 5 : 7], 1 - u * .35);
      }
      if (j % 2 === 0) billow(p, x, y, (1.8 + .7 * Math.sin(phase + j)) * pressure, C, back ? .7 : 1);
      last = [x, y];
    }
  }
  if (!back) {
    // Foam bridges the crown but breaks into irregular short strokes.
    for (let x = -W; x < W; x += 2) {
      const n = noise2(x * .35, t * 6, S + 46);
      const y = -H + Math.sin(x * .42 + t * 7) * 2;
      billow(p, x, y, (1.8 + Math.max(0, n) * 2.3) * pressure, C, .9);
    }
    p.glow(0, -H, W + 9, C[4], pressure * .1);
  }
}

export function surgeFoot(p, C, t, width, k, seed, front) {
  if (k < .01) return;
  // Low scalloped collar, deliberately much shorter than the main upstroke.
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * Math.PI * 2;
    if ((Math.sin(a) >= 0) !== front) continue;
    const n = noise2(i * 2.1, t * 7, seed);
    const r = width * (1.05 + n * .15);
    const x = Math.cos(a) * r, y = Math.sin(a) * r * .28;
    const lift = 1 + (n + .5) * 2;
    p.line(x * .8, y, x, y - lift, C[3], k);
    billow(p, x, y - lift, 1.3 + Math.max(0, n) * 1.7, C, k);
  }
}
