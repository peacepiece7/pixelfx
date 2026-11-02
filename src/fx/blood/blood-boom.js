import { Rng, fit, clamp, smooth, band, READY } from "../../core/index.js";

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
  const spraySpeeds = Array.from({ length: 12 }, () => R.range(0, 55));
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
    return { start: R.range(0.27, 0.46), flight, vx, vy,
      floor: R.range(-9, 12), s: R.range(0.8, 2.2), c: R.int(2, 4) };
  });
  let t = 0;
  const fade = () => 1 - smooth(1.08, 1.4, t);
  function ground(p, back) {
    if (t >= meta.duration) return;
    const a = fade(), swell = smooth(0, 0.25, t);
    // One ring, split into near and far halves for actor depth.
    band(p, 0, 1, 56 * smooth(0, 0.22, t), 0.24, 1, a * swell * 0.8,
      [C[1], C[2], C[3], C[4]], g => (Math.sin(g) < 0) === back);
    if (!back) return;
    p.ellipse(0, -swell * 3 * (1 - smooth(0.25, 0.4, t)), 19 * swell, 5, C[1], a * swell);
    for (const pts of cracks) {
      const end = Math.min(4, Math.floor(swell * 5));
      p.polyline(pts.slice(0, end + 1), C[3], a);
      if (end >= 3) p.line(pts[2][0], pts[2][1], pts[3][0] - 5, pts[3][1] + 3, C[2], a);
      if (t < 0.55) p.polyline(pts.slice(0, end + 1), C[5], swell * (1 - smooth(0.25, 0.55, t)));
    }
    p.glow(0, -2, 35, C[3], 0.32 * swell * a);
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
      if (age > 0 && age < 0.8) {
        const rise = smooth(0, 0.13, age), collapse = smooth(0.3, 0.8, age);
        const height = 108 * rise * (1 - collapse), opacity = 1 - smooth(0.44, 0.8, age);
        // One connected, opaque sheet rises from the floor. Broad torn crests replace tendrils.
        p.shade(-43, -112, 43, 3, (x, y, out) => {
          if (y > 1 || height < 1) return;
          const q = Math.max(0, -y / height);
          if (q < 0 || q > 1) return;
          const width = (34 - 18 * q) * rise + Math.sin(y * 0.22 + age * 32) * 2;
          const crest = height * (0.78 + 0.12 * Math.cos(x * 0.3) + 0.09 * Math.sin(x * 0.65 + age * 18));
          if (Math.abs(x) > width || -y > crest) return;
          const edge = Math.abs(x) / Math.max(1, width);
          const flow = Math.sin(x * 0.47 + Math.sin(y * 0.06 + age * 20) * 0.9);
          out.c = edge > 0.9 ? C[1] : edge > 0.73 ? C[3] : flow > 0.55 ? C[5] : flow > -0.15 ? C[4] : C[2];
          out.a = opacity;
          out.l = C[4];
          out.k = (1 - edge) * 0.2 * opacity;
        });
        // Short detached sheets move upward and spread, then fall away as spray.
        for (let i = 0; i < 12; i++) {
          const u = age - i * 0.014;
          if (u < 0 || u > 0.42) continue;
          const side = i % 2 ? 1 : -1, x = side * (12 + u * (45 + i * 3));
          const y = -u * (190 + spraySpeeds[i]) + 200 * u * u;
          p.beam(x - side * 3, y + 8, x, y, 2.5, C[i % 3 === 0 ? 4 : 3], opacity);
        }
      }
      const flash = clamp(1 - (t - 0.25) / 0.1);
      if (t >= 0.25 && flash > 0) {
        p.ellipse(0, -25, 12 * flash, 16 * flash, C[5], flash);
        p.glow(0, -12, 36, C[5], flash * 0.7);
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
