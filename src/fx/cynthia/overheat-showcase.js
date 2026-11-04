import * as glitch from '../scifi/glitch.js';
import { fit, Rng, TAU, WHITE, stockActor, READY } from '../../core/index.js';
import { haze } from '../_soft.js';

export const meta = {
  name: 'Cynthia · Crimson overheat glitch',
  desc: 'Subtle red Glitch slices flicker over the intact hero while crimson heat wisps and tiny red fragments rise from the body.',
  tags: ['cynthia', 'overheat', 'glitch', 'red', 'aura', 'loop'],
  size: [128, 128], origin: [64, 108], duration: 2.4, loop: true, fps: 30,
  bg: 'ground', actor: 2,
  options: { palette: ['#24030a', '#4b0710', '#89101d', '#bd1b2b', '#e93642', '#ff6066', '#ff8a83'], seed: 7, strength: .35 },
};
export const act = { onBody: true, poses: [[0, READY], [.6, {...READY, lean: 1}], [1.2, READY], [1.8, {...READY, lean: -1}], [2.4, READY]] };
// Keep the actual hero visible; only the red corruption and heat are overlaid.
export const actorAlpha = () => 1;
const phase = t => ((t % meta.duration) + meta.duration) % meta.duration;

function heat(p, t, o, front) {
  const A = o.actor ?? stockActor(2), C = fit(o.palette, 7), R = new Rng(o.seed);
  const floor = A.y + A.h, cx = A.x + A.w / 2, h = A.h + 20;
  const strength = Math.max(0, o.strength ?? .35);
  for (let i = 0; i < 14; i++) {
    const offset = R.next(), x0 = R.range(-A.w * .5 - 4, A.w * .5 + 4), sway = R.range(1, 4);
    const u = (t / meta.duration * 2 + offset) % 1, k = Math.sin(u * Math.PI) ** 2;
    if ((i % 4 === 0) !== front) continue;
    const x = cx + x0 + Math.sin(u * TAU + offset * TAU) * sway, y = floor - u * h;
    haze(p, x, y, 3 + k * 2, C[3], k * strength * (front ? .17 : .32));
    p.glow(x, y, 5, C[3], k * strength * .25);
    p.glowLine(x, y + 6, x, y, 2, C[3], k * strength * .35);
    p.blend(x, y, C[5], k * strength * .75);
    p.blend(x, y + 2, C[3], k * strength * .45);
    if (i % 3 === 0) p.line(x - 1, y, x + 1, y, C[4], k * strength);
  }
  if (!front) p.glow(cx, A.y + A.h * .6, 22, C[3], strength * (.18 + .09 * Math.sin(t / meta.duration * TAU)));
}
export function drawBack(p, time, o) { heat(p, phase(time), o, false); }
export function draw(p, time, o) {
  const t = phase(time), A = o.actor ?? stockActor(2), C = fit(o.palette, 7);
  const strength = Math.max(0, o.strength ?? .35);
  const redActor = {...A, pixels: Uint32Array.from(A.pixels, c => c ? C[3] : 0)};
  const q = Object.create(p);
  q.fade = p.fade * strength;
  // Glitch's opaque body/white junk pixels become a transparent red overlay.
  q.px = (x, y, c) => p.blend(x, y, (c >>> 0) === (WHITE >>> 0) ? C[5] : c, strength * .65);
  q.put = (x, y, c, a = 1) => p.blendPx(x, y, (c >>> 0) === (WHITE >>> 0) ? C[5] : c, a * strength);
  glitch.draw(q, t, {...o, actor: redActor});
  heat(p, t, o, true);
}
