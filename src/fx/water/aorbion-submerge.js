import { Rng, fit, smooth, clamp, TAU } from "../../core/index.js";

export const meta = {
  name: "Aorbion submerge",
  desc: "The actor sinks through the surface, leaves spreading ripples along its travel path, then rises through a small crown of water. The host owns movement and interruption.",
  tags: ["water", "movement", "loop"], size: [200, 80], origin: [150, 60],
  duration: 0.5, loop: true, fps: 30, bg: "ground", actor: 2,
  options: {
    palette: ["#071e38", "#0c4169", "#147d9c", "#32b9d0", "#8de8ed", "#e3ffff"],
    seed: 17, speed: 240,
  },
};

// The effect draws the supplied actor pixels, clipped at the waterline, during entry/exit.
// Removing it restores the host's normal actor immediately; no combat visibility is changed here.
export const actorAlpha = () => 0;
// Total preview cycle is a multiple of the 0.5s effect loop, keeping repeated dives in phase.
export const previewMotion = { distance: 120, duration: 0.5, rest: 0.5 };
const phase = t => ((t % .5) + .5) % .5;
const travelSpeed = o => clamp(Number.isFinite(o.speed) ? o.speed : 240, 0, 280);
const envelope = t => smooth(0, .035, t) * (1 - smooth(.4, .5, t));

// Translucent water rims retain crisp pixel edges without checkerboard alpha or canvas blur.
function ripple(p, x, y, r, k, C, front) {
  if (r <= 0 || k <= 0) return;
  const ry = r * .22;
  p.each(x - r - 1, y - ry - 1, x + r + 1, y + ry + 1, (px, py, sx, sy) => {
    if ((py >= y) !== front) return;
    const dx = px - x, dy = (py - y) / .22, d = Math.hypot(dx, dy);
    if (d > r || d < r - 3) return;
    const q = (r - d) / 3;
    p.blendPx(sx, sy, C[q < .28 ? 4 : 2], k * (1 - q) * (.7 + .3 * Math.abs(dx) / r));
  });
}

function surface(p, t, o, front) {
  const C = fit(o.palette, 6), k = envelope(t);
  const speed = travelSpeed(o);
  // Under constant host velocity, -speed * age keeps a ripple at its emission location.
  // Supply actual speed in local facing direction; the painter handles flip and angle.
  for (let i = 0; i < 9; i++) {
    const age = t - (.025 + i * .04);
    if (age < 0 || age > .34) continue;
    const x = -speed * age, life = 1 - smooth(.12, .34, age);
    ripple(p, x, 0, 7 + age * 42, k * life * .6, C, front);
    if (!front) {
      p.each(x - 9, -3, x + 9, 3, (px, py, sx, sy) => {
        const d = ((px - x) / 9) ** 2 + (py / 3) ** 2;
        if (d < 1) p.blendPx(sx, sy, C[2], k * life * .12 * (1 - d));
      });
    }
  }
  // A narrow V-shaped wake opens behind the submerged body, never a protective bubble.
  for (const side of [-1, 1]) {
    if ((side > 0) !== front) continue;
    for (let j = 0; j < 22 && j * 2 <= speed * t; j++) {
      const x = -j * 2, y = side * (2 + j * .19 + Math.sin(j * .4 - t * 16) * .6);
      p.blend(x, y, C[j % 6 < 2 ? 4 : 3], k * (1 - j / 22) * .55);
    }
  }
  ripple(p, 0, 0, 11 + 3 * Math.sin(t * TAU / .5), k * .85, C, front);
}

export function drawBack(p, t, o) { surface(p, phase(t), o, false); }

export function draw(p, time, o) {
  const t = phase(time), C = fit(o.palette, 6), A = o.actor;
  const depth = smooth(.015, .13, t) * (1 - smooth(.355, .485, t));
  if (A?.pixels && depth < 1) {
    const sink = Math.round((-A.y + 2) * depth);
    for (let y = 0; y < A.h; y++) {
      const yy = A.y + y + sink;
      if (yy >= 0) continue;
      for (let x = 0; x < A.w; x++) {
        const c = A.pixels[y * A.w + x];
        if (!c) continue;
        // A small forward lean reads as a dive, and unwinds as the body resurfaces.
        const lean = Math.round(depth * 3 * (1 - y / A.h));
        p.px(A.x + x + lean, yy, c);
        if (yy > -3 && depth > .05) p.blend(A.x + x + lean, yy, C[3], .35);
      }
    }
  }
  surface(p, t, o, true);
  const R = new Rng(o.seed);
  // Separate entry and exit splashes: a shallow inward dip, then an upward fan.
  for (const start of [.025, .355]) {
    const age = t - start, out = start > .3, life = out ? .145 : .19;
    for (let i = 0; i < 12; i++) {
      const side = i % 2 ? 1 : -1, x0 = side * R.range(5, 13), vx = side * R.range(14, 42);
      const vy = -R.range(out ? 65 : 30, out ? 95 : 50);
      if (age < 0 || age >= life) continue;
      const k = Math.sin(Math.PI * age / life), x = x0 + vx * age;
      const y = -1 + vy * age + 230 * age * age;
      p.rect(Math.round(x), Math.round(y), 2, age < .06 ? 3 : 2, C[3]);
      p.blend(x, y, C[5], k * .85);
      p.disc(x, y + 1, 3, C[3], d => k * .12 * (1 - d) ** 2);
    }
  }
  for (let i = 0; i < 5; i++) {
    const birth = .09 + i * .045, age = t - birth;
    if (age < 0 || age > .13) continue;
    const x = -travelSpeed(o) * age - 3, y = -2 - age * 22, k = Math.sin(age / .13 * Math.PI) * envelope(t);
    p.blend(x - 1, y, C[4], k * .7); p.blend(x, y - 1, C[5], k * .75);
    p.blend(x + 1, y, C[3], k * .6);
  }
}
