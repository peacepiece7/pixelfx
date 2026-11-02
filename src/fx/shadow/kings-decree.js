import { haze, pool } from "../_soft.js";
import { Rng, fit, smooth, clamp, sparkle } from "../../core/index.js";

export const meta = {
  name: "King's decree",
  desc: "A spectral bone crown gathers, fractures in a flash, and casts staggered curse chains. Bone fragments and violet dust settle over small ground seals.",
  tags: ["shadow", "curse", "one-shot"],
  size: [320, 160], origin: [160, 44], duration: 1.8, loop: false, fps: 30, bg: "ground",
  options: {
    palette: ["#140c06", "#3a2a14", "#7a5a26", "#b8902e", "#e0cc8a", "#f4ecd2"],
    seed: 17, targets: null, curse: ["#160919", "#431430", "#8c275c", "#c95c99", "#f0b3da"],
  },
};

// Air anchor: target seals are 100px below it. Keep the ground rim translucent.
function sealRing(p, x, r, c, alpha) {
  p.each(x - r - 1, 100 - r * .28 - 1, x + r + 1, 101 + r * .28, (px, py, sx, sy) => {
    const d = Math.hypot(px - x, (py - 100) / .28);
    if (d < r && d > r - 2) p.blendPx(sx, sy, c, alpha * (1 - (r - d) * .35));
  });
}

export function create(o) {
  const C = fit(o.palette, 6), K = fit(o.curse, 5), R = new Rng(o.seed);
  const targets = (Array.isArray(o.targets) ? o.targets : [-112, -56, 0, 56, 112])
    .filter(Number.isFinite).slice(0, 5).map(x => clamp(x, -136, 136));
  const dust = targets.map(() => Array.from({ length: 16 }, () => ({
    vx: R.range(-30, 30), vy: R.range(-64, -22), life: R.range(.38, .72), size: R.int(1, 2),
  })));
  const fragments = Array.from({ length: 32 }, () => ({
    x: R.range(-43, 43), y: R.range(-24, 8), vx: R.range(-32, 32), vy: R.range(-15, 8),
    life: R.range(.3, .65), size: R.int(1, 3), delay: R.range(0, .15),
  }));
  let t = 0;
  const crown = p => {
    const rise = smooth(0, .26, t), split = smooth(.46, .7, t);
    const lift = 7 * rise, decay = 1 - smooth(.78, 1.25, t);
    if (!rise || !decay) return;
    p.disc(0, -8, 32, K[2], d => .24 * rise * decay * (1 - d) ** 2);
    for (let i = 0; i < 7; i++) {
      const x = (i - 3) * 14, u = clamp(t / .46);
      p.disc(x * (1.3 - .3 * u), 18 - 16 * u + Math.sin(i * 3) * 4,
        8 + 5 * u, C[2], d => .12 * rise * decay * (1 - d) ** 2);
    }
    // Broad facets on a stepped silhouette. Each half opens away from the glowing fracture.
    for (const side of [-1, 1]) {
      const dx = side * split * 13, dy = -lift + split * 5 + (1 - rise) * 12;
      p.each(-62 + dx, -32 + dy, 62 + dx, 15 + dy, (px, py, sx, sy) => {
        const x = Math.floor((px - dx) / 2.6) * 2, y = Math.floor((py - dy) / 2) * 2;
        if (x * side < 0 || Math.abs(x) > 44) return;
        const ax = Math.abs(x), band = 12 - 6 * (ax / 44) ** 2;
        const tip = ax < 12 ? -30 + ax * 1.8 : ax < 29 ? -25 + Math.abs(ax - 23) * 2 : -16 + (44 - ax) * .9;
        if (y < tip || y > band || (y < -3 && ax > 40 + y * .12)) return;
        const cell = Math.sin(Math.floor(x / 4) * 19 + Math.floor(y / 4) * 7);
        if (t < .25 && y < 14 - rise * 48 + cell * 4) return;
        if (t > .78 && cell * .5 + .5 > decay) return;
        const crack = Math.abs(x - (Math.floor(y / 6) % 2 ? 2 : 0)) < 2;
        const color = crack && t > .33 ? (t < .58 ? C[5] : K[3])
          : y > band - 2 ? C[4] : y > band - 5 ? C[2] : y > 0 ? C[3] : y < tip + 3 ? C[5]
          : ax % 22 < 6 ? C[3] : C[1];
        p.blendPx(sx, sy, color, .86);
      });
      // Gem-like broad glints; avoid a noisy filigree pattern at game scale.
      for (const x of [side * 20, side * 36]) {
        if (t < .2 || t > .86) continue;
        p.rect(x * 1.3 + dx - 1, 2 + dy, 3, 3, C[4]);
      }
    }
    const flash = Math.max(0, 1 - Math.abs(t - .49) / .065);
    p.glow(0, -6, 32, C[4], flash * .65);
    if (flash > 0) sparkle(p, 0, -7, 15 * flash, C[5], K[3], flash);
  };
  return {
    update(dt) { t = Math.round((t + dt) * 1e9) / 1e9; },
    drawBack(p) {
      if (t >= meta.duration) return;
      targets.forEach((x, i) => {
        const age = t - (.56 + i * .045 + .13);
        if (age < 0) return;
        const k = 1 - smooth(.45, .95, age), r = 5 + 10 * smooth(0, .15, age);
        pool(p,x,100,25,7,K[2],k*.24);
        sealRing(p, x, r, K[3], k * .65);
        sealRing(p, x, 7 + 14 * smooth(0, .3, age), K[2], k * (1 - smooth(.16, .4, age)) * .5);
        p.polyline([[x - 6, 100], [x, 97], [x + 6, 100], [x, 103], [x - 6, 100]], K[2], k);
      });
    },
    draw(p) {
      if (t >= meta.duration) return;
      crown(p);
      for (const f of fragments) {
        const age = t - .64 - f.delay;
        if (age < 0 || age > f.life) continue;
        const k = 1 - age / f.life, x = f.x + f.vx * age, y = f.y + f.vy * age + 42 * age * age;
        p.disc(x, y, 4, C[2], d => .12 * k * (1 - d));
        p.rect(Math.round(x), Math.round(y), Math.max(1, Math.ceil(f.size * k)), Math.max(1, Math.ceil(2 * k)), C[k > .6 ? 4 : 2]);
      }
      targets.forEach((x, i) => {
        const age = t - (.56 + i * .045);
        if (age < 0) return;
        const sx = (i - (targets.length - 1) / 2) * 11, sy = 4;
        const dx = x - sx, dy = 100 - sy, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
        const head = clamp(age / .13), fade = 1 - smooth(.2, .54, age);
        if (fade > 0) {
          p.glowLine(sx, sy, sx + dx * head, sy + dy * head, 5, K[2], fade * .22);
          for (let d = 0, j = 0; d < L * head; d += 8, j++) {
            // Links unravel from crown to floor, leaving a moving bright leading edge.
            if (age > .23 + d / L * .2) continue;
            const q = d / L, cx = sx + dx * q, cy = sy + dy * q, w = j % 2 ? 1 : 2;
            const ex = cx + dx / L * 5, ey = cy + dy / L * 5;
            p.polyline([[cx + nx * w, cy + ny * w], [ex + nx * w, ey + ny * w],
              [ex - nx * w, ey - ny * w], [cx - nx * w, cy - ny * w], [cx + nx * w, cy + ny * w]], K[3]);
            p.dot(cx + nx * w, cy + ny * w, K[4]);
          }
          if (head < 1) sparkle(p, sx + dx * head, sy + dy * head, 5, K[4], C[4]);
        }
        const u = age - .13;
        if (u < 0) return;
        const impact = Math.max(0, 1 - u / .13);
        p.glow(x, 98, 16, K[3], impact * .55);
        haze(p,x,99-u*10,5+u*15,K[2],smooth(0,.04,u)*(1-smooth(.2,.6,u))*.3);
        if (impact > 0) sparkle(p, x, 99, 9 * impact, C[5], K[3]);
        for (const d of dust[i]) {
          if (u >= d.life) continue;
          const k = 1 - u / d.life, xx = x + d.vx * u, yy = 99 + d.vy * u + 65 * u * u;
          if (d.size === 2) p.disc(xx, yy, 3 + u * 5, K[2], r => .28 * k * (1 - r) ** 2);
          p.rect(Math.round(xx), Math.round(Math.min(102, yy)), 1 + (k > .7 ? d.size - 1 : 0), 1, C[k > .65 ? 4 : 2]);
        }
      });
    },
  };
}
