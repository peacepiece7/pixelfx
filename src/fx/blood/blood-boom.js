import { pool, softBand, softShade } from "../_soft.js";
import { Rng, fit, clamp, smooth, READY } from "../../core/index.js";

export const meta = {
  name: "Blood boom",
  desc: "Swelling crimson cracks erupt into a broad upward blood fountain that engulfs the caster; forty ballistic droplets splash into pools that dry inside a ground ring.",
  tags: ["blood", "eruption", "aoe", "magic", "one-shot"],
  size: [120, 140], origin: [60, 116], duration: 1.4, loop: false, fps: 30,
  bg: "ground", actor: 2,
  options: { palette: ["#2a0710", "#5c0b1a", "#8e1424", "#c0202e", "#e8483f", "#ff8a6a", "#fff1e8"], seed: 7 },
};
export const act = {
  poses: [[-0.3, READY], [0, { crouch: 4, turn: 1, fx: -8, fy: -35, bx: 8, by: -35 }],
    [0.25, { crouch: 7, turn: 1, fx: -10, fy: -8, bx: 10, by: -8 }, "snap"],
    [0.65, { crouch: 5, fx: -9, fy: -14, bx: 9, by: -14 }], [1.4, READY]],
  hits: [{ t: 0.25, stop: 0.06, shake: 0.18, amp: 2, target: false }],
};

export function create(o) {
  const C = fit(o.palette, 7), R = new Rng(o.seed);
  const sheets = Array.from({ length: 8 }, (_, i) => ({
    side: i % 2 ? 1 : -1, reach: R.range(28, 48), height: R.range(35, 84),
    delay: i * 0.012, width: R.range(7, 12), speed: R.range(190, 240),
  }));
  // The 70-unit combat radius is projected to 56 px to fit the requested canvas.
  const cracks = Array.from({ length: 11 }, (_, i) => {
    const a = i * Math.PI * 2 / 11 + R.range(-0.12, 0.12);
    return Array.from({ length: 5 }, (_, j) => {
      const d = j * R.range(9, 12);
      return [Math.cos(a) * d, Math.sin(a) * d * 0.22 + R.range(-1, 1)];
    });
  });
  const drops = Array.from({ length: 40 }, () => {
    const vy = -R.range(190, 280), flight = -vy / 260, vx = R.range(-57, 57);
    return { start: R.range(0.25, 0.4), flight, vx, vy,
      floor: R.range(-9, 12), s: R.range(1.1, 2.8), c: R.int(2, 4) };
  });
  let t = 0;
  const fade = () => 1 - smooth(1.08, 1.4, t);
  function ground(p, back) {
    if (t >= meta.duration) return;
    const a = fade(), swell = smooth(0, 0.25, t);
    // One ring, split into near and far halves for actor depth.
    softBand(p, 0, 1, 56 * smooth(0, 0.22, t), 0.24, 1, a * swell * 0.8,
      [C[1], C[2], C[3], C[4]], g => (Math.sin(g) < 0) === back);
    if (!back) return;
    p.ellipse(0, -swell * 3 * (1 - smooth(0.25, 0.4, t)), 19 * swell, 5, C[1], a * swell);
    for (const pts of cracks) {
      const end = Math.min(4, Math.floor(swell * 5));
      p.polyline(pts.slice(0, end + 1), C[3], a);
      if (end >= 3) p.line(pts[2][0], pts[2][1], pts[3][0] - 5, pts[3][1] + 3, C[2], a);
      if (t < 0.55) p.polyline(pts.slice(0, end + 1), C[4], swell * (1 - smooth(0.25, 0.55, t)));
    }
    pool(p, 0, 0, 54, 13, C[3], 0.44 * swell * a);
    for (const d of drops) {
      const age = t - d.start - d.flight;
      if (age < 0) continue;
      const dry = (1 - smooth(0.12, 0.65, age)) * a, x = d.vx * d.flight;
      p.ellipse(x, d.floor, d.s * (2 + smooth(0, 0.06, age)), d.s * 0.6, C[1], dry);
      p.line(x - d.s, d.floor - 1, x + d.s, d.floor - 1, C[4], dry * 0.8);
      if (age < 0.09) p.line(x, d.floor, x + d.s, d.floor - 5 * Math.sin(age / 0.09 * Math.PI), C[3], dry);
    }
  }
  return {
    update(dt) { t += dt; },
    drawBack(p) { ground(p, true); },
    draw(p) {
      if (t >= meta.duration) return;
      ground(p, false);
      const age = t - 0.25;
      // A fast succession of broad torn splash sheets opens like a crown from the floor.
      for (const sheet of sheets) {
        const u = age - sheet.delay;
        if (u <= 0 || u >= 0.52) continue;
        const open = 1 - (1 - clamp(u / 0.085)) ** 3;
        const fall = smooth(0.15, 0.52, u), k = 1 - smooth(0.24, 0.52, u);
        const sx = sheet.side, x = sheet.reach * open, h = sheet.height * open * (1 - fall * 0.65), w = sheet.width;
        const pts = [[sx * 4, 1], [sx * (x * 0.4 - w), -h * 0.42],
          [sx * (x * 0.68 - w * 0.5), -h * 0.83], [sx * x, -h],
          [sx * (x - 3), -h * 0.77], [sx * (x * 0.66 + w * 0.35), -h * 0.62],
          [sx * (x * 0.6 + w), -h * 0.24], [sx * 20, 1]];
        p.poly(pts, C[1], k);
        p.poly(pts.map(([px, py]) => [px * 0.91, py * 0.94]), C[3], k);
        p.polyline([[sx * 7, 0], [sx * x * 0.58, -h * 0.48], [sx * (x - 3), -h * 0.91]], C[4], k);
      }
      if (age > 0 && age < 0.8) {
        const rise = smooth(0, 0.12, age), collapse = smooth(0.22, 0.8, age);
        const height = 104 * rise * (1 - collapse);
        // The fountain falls back down, rather than turning into transparent flames.
        const opacity = 1 - smooth(0.45, 0.8, age);
        softShade(p, -43, -112, 43, 3, (x, y, out) => {
          if (y > 1 || height < 1) return;
          const q = Math.max(0, -y / height);
          if (q > 1) return;
          const drift = Math.sin(y * 0.09 + age * 17) * 3 * q;
          const width = (32 - 8 * q) * rise * (1 - collapse * 0.65) + Math.sin(y * 0.26 + age * 27) * 2;
          const crest = height * (0.8 + 0.1 * Math.sin(x * 0.22 + age * 10) + 0.07 * Math.cos(x * 0.51));
          if (Math.abs(x - drift) > width || -y > crest) return;
          const edge = Math.abs(x - drift) / Math.max(1, width);
          const flow = Math.sin(x * 0.29 + Math.sin((y + age * 160) * 0.1) * 1.7);
          out.c = edge > 0.9 ? C[1] : edge > 0.72 ? C[2] : flow > 0.82 ? C[4] : flow > -0.25 ? C[3] : C[2];
          out.a = opacity * (edge < .65 ? 1 : .45 + .45 * (1 - edge));
          out.l = C[3];
          out.k = (1 - edge) * 0.23 * opacity;
        });
        // Broad torn sheets peel off the connected fountain, then fall under gravity.
        for (const sheet of sheets) {
          const u = age - sheet.delay;
          if (u < 0 || u > 0.5) continue;
          const x = sheet.side * (18 + (sheet.reach - 18) * smooth(0, .5, u));
          const y = -sheet.height * Math.sin(u / .55 * Math.PI);
          const w = sheet.width * (1 - u / 0.6), h = 9 * Math.sin(u / 0.5 * Math.PI);
          const points = [[x - w, y + h], [x - w * .7, y - h], [x, y - h * 1.3], [x + w, y - h * .3], [x + w * .6, y + h]];
          p.poly(points, C[2], opacity);
          p.line(x - w * .5, y - h * .6, x + w * .5, y + h * .3, C[4], opacity);
        }
      }
      if (age > 0 && age < .75) {
        p.glow(0,-25,39,C[3],smooth(0,.1,age)*(1-smooth(.25,.75,age))*.25);
      }
      const flash = clamp(1 - (t - 0.25) / 0.1);
      if (t >= 0.25 && flash > 0) {
        p.ellipse(0, -2, 27 * flash, 5 * flash, C[6], flash);
        p.glow(0, -3, 30, C[4], flash * 0.5);
      }
      for (const d of drops) {
        const u = t - d.start;
        if (u < 0 || u >= d.flight) continue;
        const x = d.vx * u, y = d.floor + d.vy * u + 260 * u * u;
        const vy = d.vy + 520 * u;
        p.beam(x - d.vx * 0.018, y - vy * 0.018, x, y, d.s, C[d.c], fade());
        p.dot(x - 0.5, y - 1, C[5], 0.9 * fade());
        p.glow(x, y, 3, C[4], 0.16 * fade());
      }
    },
  };
}
