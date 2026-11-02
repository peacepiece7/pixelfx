import { haze, pool, softBand, softShade } from '../_soft.js';
import { Rng, fit, smooth, clamp, TAU, sparkle } from '../../core/index.js';

export const meta = {
  name: 'Rosilia support shot',
  desc: 'A solid brass round descends into a breathing ground sight, buries its tip and breaks the soil. Its segmented wake erases oldest first while chips, dust and contact light settle.',
  tags: ['projectiles', 'impact', 'debris', 'loop'],
  size: [200, 120], origin: [100, 87], duration: 2, loop: true, fps: 30, bg: 'ground',
  options: {
    palette: ['#251b19', '#564239', '#866a46', '#b59a63', '#ddc98a', '#f7e9bd', '#ffffff'],
    radius: 62, seed: 17, pulse: 0,
  },
};

// The caller supplies a single 1 -> 0 pulse over .35 seconds. No shot scheduler.
// Every .05s has a distinct pose; interpolation preserves continuous motion.
// time, flight, burial, flash, fracture, dust, residue
const BEATS = [
  [0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00],
  [0.05, 0.42, 0.00, 0.00, 0.00, 0.00, 0.00],
  [0.10, 1.00, 0.00, 0.65, 0.15, 0.00, 0.20],
  [0.15, 1.00, 1.00, 0.18, 1.00, 0.68, 1.00],
  [0.20, 1.00, 1.00, 0.00, 0.85, 1.00, 0.85],
  [0.25, 1.00, 1.00, 0.00, 0.60, 0.70, 0.55],
  [0.30, 1.00, 1.00, 0.00, 0.25, 0.25, 0.20],
  [0.35, 1.00, 1.00, 0.00, 0.00, 0.00, 0.00],
];

function pose(o) {
  const seconds = (1 - clamp(o.pulse ?? 0)) * .35;
  const index = Math.min(6, Math.floor(seconds / .05));
  const a = BEATS[index], b = BEATS[index + 1];
  const q = clamp((seconds - a[0]) / .05);
  return [seconds, ...a.slice(1).map((value, i) => value + (b[i + 1] - value) * q)];
}

// Reticle motion never moves the actual impact centre or combat radius.
function sight(p, t, o, C) {
  const phase = ((t % meta.duration) + meta.duration) % meta.duration * TAU / meta.duration;
  const breath = .5 - .5 * Math.cos(phase);
  const radius = (o.radius ?? 62) + Math.sin(phase) * 1.25;
  const rotation = Math.sin(phase) * .035;
  const ramp = C.slice(1, 5);
  softBand(p, 0, 0, radius, .24, 1.6, .38, ramp,
    a => Math.cos((a - rotation) * 4) < .91);
  // Overlapping pale rim changes colour smoothly, without a palette step.
  softBand(p, 0, 0, radius, .24, 1.1, breath * .26, C.slice(3, 6),
    a => Math.cos((a - rotation) * 4) < .91);
  pool(p, 0, 0, radius, 19, C[3], .055 + breath * .045);
  for (let i = 0; i < 4; i++) {
    const a = i * TAU / 4 + rotation;
    const x = Math.cos(a), y = Math.sin(a) * .24;
    p.line(x * (radius - 8), y * (radius - 8), x * (radius - 2), y * (radius - 2), C[4], .7);
  }
  // Four short travelling accents, not a rotating solid magic disc.
  for (let i = 0; i < 4; i++) {
    const a = i * TAU / 4 + phase;
    const x = Math.cos(a) * radius, y = Math.sin(a) * radius * .24;
    p.glow(x, y, 3, C[4], .12);
  }
}

function fractures(p, seconds, strength, C, seed) {
  const R = new Rng(seed + 23);
  const growth = smooth(.095, .16, seconds);
  for (let i = 0; i < 7; i++) {
    const a = i * TAU / 7 + R.range(-.2, .2);
    const length = R.range(18, 37) * growth;
    let x = 0, y = 1;
    for (let j = 1; j <= 4; j++) {
      const d = length * j / 4;
      const nx = Math.cos(a) * d;
      const ny = Math.sin(a) * d * .27 + R.range(-1.2, 1.2);
      p.line(x, y, nx, ny, C[0], strength);
      p.line(x, y - 1, nx, ny - 1, C[3], strength * .55);
      if (j === 3) {
        p.line(nx, ny, nx + Math.cos(a + .7) * 5, ny + Math.sin(a + .7) * 2, C[1], strength * .7);
      }
      x = nx; y = ny;
    }
  }
}

export function drawBack(p, t, o) {
  const C = fit(o.palette, 7);
  sight(p, t, o, C);
  if (!(o.pulse > 0)) return;
  const [seconds, , , flash, crack, dust, residue] = pose(o);
  const spread = smooth(.10, .29, seconds);
  // Deep contact pocket: dark centre below a broken raised lip.
  haze(p, 2, 2, 11, C[0], residue * .9);
  softShade(p, -9, -2, 12, 6, (x, y, out) => {
    const depth = ((x - 2) / 10) ** 2 + ((y - 2) / 3.5) ** 2;
    if (depth >= 1) return;
    out.c = C[0];
    out.a = (1 - depth) * residue * .85;
  });
  softBand(p, 1, 2, 10 + spread * 5, .35, 3, residue * .8, C.slice(0, 4),
    a => Math.sin(a * 7) < .7);
  fractures(p, seconds, crack, C, o.seed);
  pool(p, 0, 0, 22 + spread * 28, 8 + spread * 6, C[4], flash * .75);
  softBand(p, 0, 1, 9 + spread * 52, .24, 4 - spread * 2,
    dust * .36, C.slice(1, 5));
}

// A local coordinate along the descending round and its perpendicular.
const DX = .716, DY = .698;
function point(x, y, along, across) {
  return [x + DX * along - DY * across, y + DY * along + DX * across];
}

function wake(p, seconds, C) {
  // Each piece is born when the projectile passes it, never ahead of the tip.
  // The upstream pieces are older and disappear first; the endpoint persists.
  for (let i = 0; i < 24; i++) {
    const q = i / 24, born = .05 * (q <= .42 ? q / .42 : 1 + (q - .42) / .58);
    const age = seconds - born;
    if (age < 0) continue;
    const fade = (1 - smooth(.075, .17, age)) * smooth(0, .012, age);
    if (!fade) continue;
    const x = -73 * (1 - q), y = -71 * (1 - q);
    const end = point(x, y, 4.5, 0);
    // Narrow opaque-ish copper wake under a very restrained soft halo.
    p.glowLine(x, y, ...end, 3, C[3], fade * .10);
    softShade(p, x - 2, y - 2, end[0] + 2, end[1] + 2, (px, py, out) => {
      const along = (px - x) * DX + (py - y) * DY;
      const across = Math.abs(-(px - x) * DY + (py - y) * DX);
      if (along < 0 || along > 4.5 || across > 1.7) return;
      out.c = across < .55 ? C[5] : C[3];
      out.a = fade * .65 * (1 - across / 1.7);
    });
  }
}

function round(p, flight, burial, C) {
  if (burial >= 1) return;
  const x = -73 * (1 - flight) + burial * 14;
  const y = -71 * (1 - flight) + burial * 14;
  const at = (along, across) => {
    const [px, py] = point(x, y, along, across);
    return [px, Math.min(2, py)];
  };
  // Solid, shaded 17px ammunition body with a pointed nose, crimp and dark base.
  // Burial shortens the visible rear; nothing projects below the ground plane.
  const rear = -17;
  p.poly([at(rear, -3), at(-5, -3), at(0, 0), at(-5, 3), at(rear, 3)], C[1]);
  p.poly([at(rear + 1, -2), at(-5, -2), at(-1, 0), at(-6, 1), at(rear + 1, 1)], C[4]);
  p.line(...at(rear + 2, -2), ...at(-5, -2), C[5]);
  p.line(...at(-5, -2), ...at(-1, 0), C[6]);
  p.line(...at(rear + 3, -3), ...at(rear + 3, 3), C[2]);
  p.line(...at(rear, -3), ...at(rear, 3), C[0]);
}

function debris(p, seconds, C, seed) {
  const R = new Rng(seed + 71);
  for (let i = 0; i < 28; i++) {
    const angle = R.range(-Math.PI, 0), speed = R.range(70, 210);
    const delay = R.range(.10, .125), age = seconds - delay;
    const life = R.range(.14, .22), w = R.range(1.4, 3.4);
    if (age <= 0 || age >= life) continue;
    const fade = 1 - smooth(life * .55, life, age);
    const x = Math.cos(angle) * speed * age;
    const y = Math.sin(angle) * speed * age + 410 * age * age;
    const brass = i % 5 === 0;
    if (brass) {
      p.line(x - 2, y - 3, x + 1, y, C[4], fade);
      p.dot(x, y - 2, C[6], fade);
      p.glow(x, y, 3, C[4], fade * .12);
    } else {
      p.poly([[x - w, y], [x, y - w], [x + w, y - .5], [x + 1, y + w * .5]], C[1], fade);
      p.line(x - w, y, x, y - w, C[3], fade);
    }
  }
}

function dustSkirt(p, seconds, strength, C, seed) {
  const R = new Rng(seed + 109);
  for (let i = 0; i < 20; i++) {
    const a = R.range(0, TAU), delay = R.range(.105, .145);
    const age = Math.max(0, seconds - delay);
    const speed = R.range(120, 240), size = R.range(3, 6);
    const distance = speed * (1 - Math.exp(-age * 8)) / 8;
    const x = Math.cos(a) * distance;
    const y = Math.sin(a) * distance * .25 - Math.sin(clamp(age / .23) * Math.PI) * 5;
    const alpha = smooth(0, .025, age) * strength;
    const radius = size + age * 26;
    haze(p, x, y, radius, C[1], alpha * .5);
    haze(p, x - 1, y - radius * .25, radius * .75, C[3], alpha * .3);
  }
}

export function draw(p, t, o) {
  if (!(o.pulse > 0)) return;
  const C = fit(o.palette, 7);
  const [seconds, flight, burial, flash, , dust] = pose(o);
  wake(p, seconds, C);
  round(p, flight, burial, C);
  // Contact is brief and small: it must not replace the descending bullet.
  p.glow(0, -1, 21, C[3], flash * .45);
  p.glow(0, -1, 8, C[5], flash * .65);
  sparkle(p, 0, -1, 9 * flash, C[6], C[4], flash);
  debris(p, seconds, C, o.seed);
  dustSkirt(p, seconds, dust, C, o.seed);
}
