import { Rng, fit, clamp, TAU, stockActor } from "../../core/index.js";
import { shape } from "./_lib.js";

export const meta = {
  name: "Rosilia infinite magazine",
  desc: "A brass-ivory sheen breathes over the body and rifle, with a broad warm halo and small edge lights. A travelling highlight and intro refill glow follow the silhouette.",
  tags: ["status", "buff", "sheen", "loop"],
  size: [96, 80], origin: [48, 66], duration: 1, loop: true, fps: 30,
  bg: "ground", actor: 2,
  options: { palette: ["#251b19", "#564239", "#866a46", "#b59a63", "#ddc98a", "#f7e9bd", "#ffffff"], seed: 17, intro: 0 },
};

function state(t, o) {
  t = ((t % 1) + 1) % 1;
  const R = new Rng(o.seed), phase = R.next();
  return { actor: o.actor ?? stockActor(2), C: fit(o.palette, 7),
    breath: 0.5 + 0.5 * Math.sin((t + phase) * TAU),
    sweep: (t + phase) % 1, intro: clamp(o.intro ?? 0) };
}

export function drawBack(p, t, o) {
  const { actor: a, C, breath, intro } = state(t, o);
  const [cx, cy] = a.chest ?? [0, a.y + a.h * 0.45];
  // Light sits behind the silhouette, leaving the face and muzzle readable.
  p.glow(cx, cy, 28, C[3], 0.18 + breath * 0.3 + intro * 0.28);
  p.glow(cx, cy + a.h * 0.22, 16, C[4], 0.07 + breath * 0.08);
}

export function draw(p, t, o) {
  const { actor: a, C, breath, sweep, intro } = state(t, o), S = shape(a);
  const scan = a.y + sweep * a.h, scanFade = Math.sin(sweep * Math.PI);
  for (const [mx, my] of S.body) {
    const x = a.x + mx, y = a.y + my;
    // A translucent sheen follows the actual body/rifle pixels, never replacing them.
    const band = Math.max(0, 1 - Math.abs(y - scan + mx * 0.18) / 6) * scanFade;
    p.blend(x, y, C[4], 0.025 + breath * 0.09 + intro * 0.1);
    if (band > 0) p.blend(x, y, C[5], band * 0.52 + band * intro * 0.08);
    // Broken highlights along upward/left-facing edges; no full-body neon outline.
    if ((!S.on(mx, my - 1) || !S.on(mx - 1, my)) && (mx + my) % 3 === 0) {
      p.blend(x, y, C[5], 0.16 + breath * 0.18 + intro * 0.22);
      p.light(x, y, C[3], 0.04 + breath * 0.06 + intro * 0.06);
      // A small halo follows occupied body/rifle edges, including a supplied weapon silhouette.
      p.glow(x, y, 3.5, C[4], 0.055 + breath * 0.07 + intro * 0.06);
    }
  }
}
