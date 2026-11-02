import { Rng, fit, smooth, clamp, TAU } from "../../core/index.js";

export const meta = {
  name: "Dark shroud",
  desc: "A hollow violet veil sways around the caster, dark behind and translucent in front; each one-second pulse curls shadow hands inward without hiding the centre.",
  tags: ["shadow", "shroud", "aura", "hands", "aoe", "loop"],
  size: [144, 112], origin: [72, 87], duration: 1, loop: true, fps: 30,
  bg: "ground", actor: 2,
  options: { palette: ["#0b0614", "#22113a", "#3d1d63", "#6a2d8f", "#a04ccf", "#e0a8ff"], seed: 11 },
};
// pulse is optional: omit for a timed preview, or supply 0..1 from the host's damage tick envelope.
function paint(p, t, o, back) {
  t = ((t % 1) + 1) % 1;
  const C = fit(o.palette, 6), R = new Rng(o.seed), phase = t * TAU;
  const pulse = Number.isFinite(o.pulse) ? clamp(o.pulse) : smooth(0, 0.06, t) * (1 - smooth(0.12, 0.4, t));
  for (let i = 0; i < 64; i++) {
    const a = (i + 0.5) * TAU / 64, sn = Math.sin(a), cs = Math.cos(a);
    const h0 = R.range(22, 40), drift = R.range(0, TAU);
    if ((sn < 0) !== back) continue;
    const h = h0 + Math.sin(phase + drift) * 5, radius = 59 + Math.sin(phase + a * 3) * 2;
    const bx = cs * radius, by = sn * radius * 0.27;
    const pts = [];
    for (let j = 0; j <= 16; j++) {
      const u = j / 16, sway = Math.sin(phase + drift + u * 4) * 4 * u;
      const x = bx + sway, y = by - h * u;
      const alpha = (1 - u ** 2) * (back ? 0.46 : 0.23);
      p.disc(x, y, 2.2 + (1 - u) * 1.5, C[2], alpha * 0.55);
      if (i % 3 === 0) {
        if (pts.length) p.line(pts.at(-1)[0], pts.at(-1)[1], x, y, C[u > 0.65 ? 2 : 1]);
        pts.push([x, y]);
        if (j > 7 && j < 14) p.blend(x - 1, y, C[3], (back ? 0.4 : 0.6) * (1 - u));
      }
    }
    if (i % 4 === 0) p.glow(bx, by - h * 0.4, 9, C[3], 0.05 + pulse * 0.025);
  }
  const hem = [];
  for (let i = 0; i <= 80; i++) {
    const a = i * TAU / 80;
    if ((Math.sin(a) < 0) !== back) { if (hem.length > 1) p.polyline(hem, C[2]); hem.length = 0; continue; }
    hem.push([Math.cos(a) * 63, Math.sin(a) * 63 * 0.27 + Math.sin(phase + a * 4) * 1.4]);
  }
  if (hem.length > 1) p.polyline(hem, C[2]);
  // Three arms rise from the circumference and sweep inward on each damage pulse.
  for (let i = 0; i < 3; i++) {
    const a0 = i * TAU / 3 + 0.35, a = a0 + pulse * 0.65;
    if ((Math.sin(a0) < 0) !== back || pulse <= 0) continue;
    const radius = 60 - pulse * 28, x = Math.cos(a) * radius, y = Math.sin(a) * radius * 0.27 - 18 - pulse * 9;
    const root = [Math.cos(a0) * 60, Math.sin(a0) * 60 * 0.27];
    const elbow = [Math.cos(a0 + 0.2) * (61 - pulse * 8), root[1] - 14];
    p.beam(...root, ...elbow, 3.8, C[1], pulse);
    p.beam(...elbow, x, y, 3, C[2], pulse);
    p.polyline([root, elbow, [x, y]], C[3], pulse * 0.8);
    const dx = -Math.cos(a), dy = -0.3, nx = -dy, ny = dx;
    p.ellipse(x, y, 3.2, 2.7, C[2], pulse);
    for (let f = 0; f < 4; f++) {
      const spread = (f - 1.5) * 1.7, len = f === 0 || f === 3 ? 5 : 7;
      const bx = x + nx * spread, by = y + ny * spread;
      const joint = [bx + dx * len * 0.65, by + dy * len - 3];
      const tip = [joint[0] + dx * 2, joint[1] + 3 + pulse * 2];
      p.polyline([[bx, by], joint, tip], C[3], pulse);
      p.line(...joint, ...tip, C[4], pulse * 0.85);
    }
    // The hooked thumb gives the silhouette a hand rather than a four-pronged tendril.
    p.polyline([[x - nx * 3, y - ny * 3], [x + dx * 3 - nx * 5, y - ny * 5], [x + dx * 5 - nx * 3, y - ny * 3]], C[4], pulse * 0.7);
    p.glow(x, y, 7, C[4], pulse * 0.14);
  }
}
export function drawBack(p, t, o) { paint(p, t, o, true); }
export function draw(p, t, o) { paint(p, t, o, false); }
