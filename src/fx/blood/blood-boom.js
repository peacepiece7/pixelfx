import { haze, pool, softBand, softShade } from "../_soft.js";
import { Rng, fit, clamp, smooth, lerp, sparkle, TAU, READY } from "../../core/index.js";

export const meta = {
  name: "Blood boom",
  desc: "A ground strike hurls five torn blood membranes skyward: curling split crests, moving wet folds, arcing beads and stretched falling sheets over a hot fractured seal.",
  tags: ["blood", "eruption", "aoe", "magic", "one-shot"],
  size: [120, 140], origin: [60, 116], duration: 1.4, loop: false, fps: 60,
  bg: "ground", actor: 2,
  options: { palette: ["#2a0710", "#5c0b1a", "#8e1424", "#c0202e", "#e8483f", "#ff8a6a", "#fff1e8"], seed: 7 },
};

export const act = {
  poses: [[-0.3, READY], [0, { crouch: 4, turn: 1, fx: -8, fy: -35, bx: 8, by: -35 }],
    [0.25, { crouch: 7, turn: 1, fx: -10, fy: -8, bx: 10, by: -8 }, "snap"],
    [0.55, { crouch: 5, fx: -9, fy: -14, bx: 9, by: -14 }],
    [0.95, { crouch: 2, fx: -8, fy: -20, bx: 8, by: -20 }], [1.4, READY]],
  hits: [{ t: 0.25, stop: 0.06, shake: 0.18, amp: 2, target: false }],
};

// Every row is an authored 50ms beat, interpolated at the runtime's simulation rate.
// [height, half-width, pressure, sheet breakup, seal light, pool visibility]
// Independent channels let pressure die before the suspended liquid lands.
export const FLOW_BEATS = [
  [ 0,  0, .00, .00, .00, .00], // 0.00 untouched ground
  [ 1,  5, .04, .00, .12, .00], // 0.05 first inscription
  [ 2,  9, .10, .00, .25, .00], // 0.10 opposing arcs join
  [ 3, 14, .18, .00, .42, .00], // 0.15 cracks light in sequence
  [ 5, 19, .30, .00, .65, .00], // 0.20 ground heaves
  [12, 24, 1.00, .00, 1.00, .00], // 0.25 vent ruptures
  [99, 29, .95, .00, .90, .00], // 0.30 impact impulse reaches full height
  [99, 31, .88, .00, .76, .00], // 0.35 torn tips coast above the caster
  [99, 32, .84, .00, .66, .00], // 0.40 full opaque foreground
  [82, 33, .76, .03, .58, .00], // 0.45 crown folds outwards
  [64, 32, .67, .10, .52, .02], // 0.50 first heavy sheets detach
  [48, 30, .56, .19, .47, .06], // 0.55 pressure falls, crest still hangs
  [35, 28, .43, .31, .42, .12], // 0.60 folds pull down
  [25, 26, .31, .44, .38, .20], // 0.65 holes open between sheets
  [17, 23, .23, .57, .34, .30], // 0.70 broken curtain drops
  [11, 20, .16, .70, .30, .43], // 0.75 lower body reappears
  [ 7, 17, .10, .81, .27, .59], // 0.80 low returning splash
  [ 4, 14, .06, .90, .24, .74], // 0.85 folds hit the floor
  [ 2, 11, .03, .96, .21, .86], // 0.90 rebound crowns
  [ 1,  8, .01, 1.0, .18, .96], // 0.95 small last spurts
  [ 0,  0, .00, 1.0, .15, 1.0], // 1.00 airborne core is gone
  [ 0,  0, .00, 1.0, .12, .95], // 1.05 last droplets land
  [ 0,  0, .00, 1.0, .09, .83], // 1.10 pools flatten
  [ 0,  0, .00, 1.0, .06, .67], // 1.15 outer inscription extinguishes
  [ 0,  0, .00, 1.0, .04, .49], // 1.20 pool margins retreat
  [ 0,  0, .00, 1.0, .02, .30], // 1.25 isolated wet glints
  [ 0,  0, .00, 1.0, .01, .14], // 1.30 dark residue shrinks
  [ 0,  0, .00, 1.0, .00, .04], // 1.35 last reflected light
  [ 0,  0, .00, 1.0, .00, .00], // 1.40 both buffers empty
];

function flowAt(t) {
  const pos = clamp(t / .05, 0, FLOW_BEATS.length - 1);
  const i = Math.min(FLOW_BEATS.length - 2, Math.floor(pos)), f = pos - i;
  return FLOW_BEATS[i].map((v, j) => lerp(v, FLOW_BEATS[i + 1][j], f));
}

// Thin, genuinely translucent strokes retain pixel steps as their light fades.
function wetLine(p, points, c, alpha) {
  if (alpha <= .004) return;
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1], [x1, y1] = points[i];
    const steps = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0)));
    for (let j = 0; j < steps; j++) {
      const u = j / steps;
      p.blend(x0 + (x1 - x0) * u, y0 + (y1 - y0) * u, c, alpha);
    }
  }
}

// Liquid membranes use true alpha rather than stippled polygon fades.
function membrane(p, points, color, alpha) {
  if (alpha <= .004) return;
  const xs = points.map(v => v[0]), ys = points.map(v => v[1]);
  softShade(p, Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys), (x, y, out) => {
    let inside = false;
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
      const [xi, yi] = points[i], [xj, yj] = points[j];
      if ((yi > y) !== (yj > y) && x < (xj-xi)*(y-yi)/(yj-yi)+xi) inside = !inside;
    }
    if (inside) { out.c = color; out.a = alpha; }
  });
}

export function create(o) {
  const C = fit(o.palette, 7), R = new Rng(o.seed), phase = R.range(0, TAU);
  // Combat radius 70 projects to 56 on the requested 120px canvas; no gameplay radius is changed.
  const radius = 56, sy = .24, gravity = 760;
  const sigils = Array.from({ length: 12 }, (_, i) => ({
    a: i * TAU / 12, start: .035 + (i % 6) * .022, die: 1.02 + (i % 5) * .035,
    variant: R.int(0, 2), shimmer: R.range(0, TAU),
  }));
  const cracks = Array.from({ length: 9 }, (_, i) => {
    const a = i * TAU / 9 + R.range(-.1, .1);
    return { start: .09 + R.range(0, .08), points: Array.from({ length: 6 }, (_, j) => {
      const d = j * R.range(7.5, 9);
      return [Math.cos(a) * d, Math.sin(a) * d * sy + R.range(-.6, .6)];
    }) };
  });
  // Detached pieces begin as wide membranes, fold edge-on, and become streaks near landing.
  const sheets = Array.from({ length: 12 }, (_, i) => ({
    side: i % 2 ? 1 : -1, start: .43 + (i >> 1) * .035,
    x: R.range(16, 26), h: R.range(48, 78), vx: R.range(17, 34),
    vy: R.range(-22, 12), w: R.range(5, 9), phase: R.range(0, TAU),
    floor: R.range(-5, 7),
  }));
  // Forty primary beads. Landing times precede the drying interval.
  const drops = Array.from({ length: 40 }, (_, i) => {
    const start = .25 + (i % 5) * .009 + R.range(0, .008);
    const height = R.range(12, 42), vy = -R.range(140, 230);
    const flight = (-vy + Math.sqrt(vy * vy + 2 * gravity * height)) / gravity;
    const side = i % 2 ? 1 : -1;
    return { start, flight, height, vy, vx: side * R.range(60, 85), x: side * R.range(16, 26),
      floor: R.range(-7, 10), size: R.range(1.2, 2.3), phase: R.range(0, TAU),
      back: i % 4 === 0, c: R.int(2, 4) };
  });
  const spray = Array.from({ length: 20 }, (_, i) => ({
    start: .3 + i * .017, side: i % 2 ? 1 : -1,
    x: R.range(16, 29), y: R.range(30, 100), vx: R.range(10, 32), vy: R.range(-35, 15),
  }));
  let elapsed = 0, t = 0, F = flowAt(0);
  const alive = () => t >= 0 && t < meta.duration;
  const ending = () => 1 - smooth(1.23, 1.4, t);

  function inscription(p, back) {
    const written = smooth(0, .23, t), off = smooth(1.01, 1.35, t);
    if (!written || off >= 1) return;
    // Two counter-writing semicircles; the hot head moves rather than revealing the entire ring at once.
    const extent = written * Math.PI;
    const keep = a => (Math.sin(a) < 0) === back && Math.abs(a) <= extent &&
      (off <= 0 || .5 + .5 * Math.sin(a * 7 + phase) > off);
    softBand(p, 0, 1, radius, sy, 1.8, (1 - off) * .85, C.slice(1, 6), keep);
    softBand(p, 0, 1, 44, sy, 1, written * (1 - off) * .5, C.slice(1, 5), keep);
    if (written < 1) for (const sign of [-1, 1]) {
      const a = sign * extent;
      if ((Math.sin(a) < 0) !== back) continue;
      const x = Math.cos(a) * radius, y = 1 + Math.sin(a) * radius * sy;
      p.glow(x, y, 5, C[4], Math.sin(written * Math.PI) * .45);
      p.blend(x, y, C[6], .85);
    }
    for (const s of sigils) {
      if ((Math.sin(s.a) < 0) !== back) continue;
      const born = smooth(s.start, s.start + .065, t), gone = 1 - smooth(s.die, s.die + .17, t);
      const k = born * gone, cs = Math.cos(s.a), sn = Math.sin(s.a);
      const point = (r, tangent) => [cs * r - sn * tangent, 1 + (sn * r + cs * tangent) * sy];
      const points = [point(47, -2), point(51, 0), point(47, 2)];
      wetLine(p, points, C[4], k * (.5 + F[4] * .35));
      if (s.variant > 0) wetLine(p, [point(48, -2), point(48, 2)], C[3], k * .7);
      if (s.variant === 2) wetLine(p, [point(46, 0), point(52, 0)], C[5], k * .6);
      pool(p, ...point(49, 0), 6, 2, C[3], k * F[4] * .25);
    }
  }

  function floor(p, back) {
    inscription(p, back);
    if (!back) return;
    const charge = smooth(.04, .25, t), heat = F[4];
    pool(p, 0, 1, 56, 15, C[3], heat * .42);
    pool(p, 0, 0, 27, 7, C[4], F[2] * .6);
    for (const crack of cracks) {
      const grow = smooth(crack.start, crack.start + .1, t);
      const fade = 1 - smooth(.75, 1.25, t);
      const count = grow * (crack.points.length - 1), full = Math.floor(count);
      const pts = crack.points.slice(0, full + 1);
      if (full < 5) {
        const a = crack.points[full], b = crack.points[full + 1], f = count - full;
        pts.push([lerp(a[0], b[0], f), lerp(a[1], b[1], f)]);
      }
      wetLine(p, pts, C[1], charge * fade);
      wetLine(p, pts.map(([x, y]) => [x, y - .7]), C[t < .3 ? 4 : 3], heat * fade);
      const hot = smooth(.24,.27,t)*(1-smooth(.36,.65,t));
      wetLine(p,pts.slice(0,3).map(([x,y])=>[x,y-.7]),C[5],hot*.85);
      if(pts.length>2) {
        const [x,y]=pts[2];
        pool(p,x,y,8,2,C[4],hot*.3);
        wetLine(p,[[x,y],[x*.9+3,y+2],[x*.8+4,y+3]],C[3],heat*fade*.8);
      }
    }
    // Compressed mound flattens into the first upward sheet on release.
    if (t < .3) {
      const h = F[0], w = F[1];
      softShade(p, -w, -h, w, 1, (x, y, out) => {
        const d = (x / Math.max(1, w)) ** 2;
        if (y < -h * (1 - d) || d > 1) return;
        out.c = y < -h * (1 - d) + 1 ? C[4] : C[2];
        out.a = charge;
      });
    }
    // Returning blood forms a low uneven pool; margins retreat before the final fade.
    if (F[5] > 0) {
      const shrink = 1 - smooth(1.1, 1.4, t), rx = 34 * (.55 + .45 * shrink);
      softShade(p, -rx, -5, rx, 8, (x, y, out) => {
        const d = (x / rx) ** 2 + ((y - 1) / 5) ** 2;
        if (d > .9 + .06 * Math.sin(x * .8 + phase)) return;
        out.c = d > .68 ? C[1] : C[0]; out.a = F[5] * .75;
        if (y < 0 && d > .45) out.c = C[2];
      });
    }
  }

  function fountain(p) {
    const [height, width, pressure, broken] = F;
    if (t < .25 || height < 1) return;
    // The reference silhouette is a narrow torn crest above a wide splash skirt.
    // A continuous opaque lower core still hides the 48px caster at peak.
    const rows = Array.from({ length: Math.ceil(height * 1.1) + 2 }, (_, i) => {
      const q = i / height;
      const drift = Math.sin(q * 5 - t * 6 + phase) * 2 * q;
      const notch = Math.sin(Math.floor(i / 4) * 1.7 - t * 12 + phase);
      const widthHere = width * (.72 - .42 * q) + Math.sin(q * 19 - t * 14) * 1.7 * q + notch * 1.3 * q;
      const centre = Math.sin(q * 8 - t * 9 + phase) * 3;
      return { drift, width: widthHere, centre };
    });
    softShade(p, -35, -height * 1.1, 35, 1, (x, y, out) => {
      const h = -y, q = h / height;
      if (h < 0 || q > 1.08) return;
      const row = rows[Math.min(rows.length - 1, Math.floor(h))];
      const edge = Math.abs(x - row.drift) / Math.max(1, row.width);
      // Angular notches and unequal peaks, never a rounded mushroom cap.
      const tooth = Math.abs(((x * .09 + phase * .1) % 1 + 1) % 1 - .5) * 2;
      const cap = height * (.84 + tooth * .22) + Math.sin(x * .3 - t * 8) * 2;
      if (edge > 1 || h > cap || q > .55 && Math.sin(x * .35 + q * 11) > .4) return;
      const cellX = Math.floor(x / 2) * 2, cellY = Math.floor((h + t * 95) / 2) * 2;
      const tear = .5 + .5 * Math.sin(cellX * .31 + Math.sin(cellY * .13 + phase)) * Math.cos(cellY * .21 + phase);
      if (broken > .25 && q > .22 && tear < (broken - .25) * .95) return;
      // Long irregular liquid folds: bright inner ribbons with deep red outer faces.
      // Their contours advect upward, then reverse as pressure collapses.
      const travel = t < .55 ? t * 80 : 44 - (t - .55) * 100;
      const folded = Math.sin(x * .28 + Math.sin((h - travel) * .075) * 1.7);
      const hotWidth = Math.max(1, row.width * (.27 + .12 * Math.sin(h * .16 - t * 18)));
      const core = Math.abs(x - row.centre) / hotWidth;
      out.c = edge > .88 ? C[1] : edge > .67 ? C[2] : folded > .2 ? C[3] : C[2];
      if (core < 1 && q < .95) out.c = core < .72 ? C[3] : C[2];
      const ripple = Math.sin(h * .15 - t * 34 + x * .20);
      if (ripple > .82 && edge < .75) out.c = C[4];
      if (ripple < -.9 && edge > .25) out.c = C[1];
      if (core > 1 && core < 1.5 && folded > -.5) out.c = C[3];
      if (cap - h < 1.2) out.c = C[4];
      // Several dark channels cut into the hot ribbon so it reads as liquid, not a laser.
      if (core < 1 && Math.sin(h * .18 + x * .37 - t * 13) > .87) out.c = C[3];
      out.a = (edge < .85 ? 1 : .9) * (1 - smooth(.88, 1, t));
      out.l = C[4]; out.k = core < 1.3 ? pressure * .18 : 0;
    });
    p.glowLine(0, -4, 0, -height * .85, 14, C[3], pressure * .18);
    pool(p, 0, 0, 32, 8, C[5], pressure * .45);
  }

  // Five independently timed sheets share the impact point, then fan upward.
  // This is a ballistic strike response: fast extension, free tips, delayed fall.
  function impactSheets(p, back) {
    const directions = [[-36, 79, 8], [-19, 101, 7], [4, 110, 9], [26, 94, 7], [44, 64, 8]];
    directions.forEach(([reach, rise, width], i) => {
      if ((i === 0 || i === 4) !== back) return;
      const age = t - .25 - i * .004;
      if (age <= 0 || age >= .58) return;
      const attack = 1 - (1 - clamp(age / .045)) ** 3;
      const fall = Math.max(0, age - .12);
      const top = rise * attack - 280 * fall * fall;
      const detached = smooth(.10, .32, age) * .88;
      const fade = 1 - smooth(.24, .48, age);
      // Each sheet has its own moving cross-section, scalloped lip, split crest
      // and fold highlights. These are liquid surfaces, not tapered spear polygons.
      const rows = Array.from({length: Math.ceil(top) + 2}, (_, j) => {
        const q = j / Math.max(1, top);
        const curl = Math.sin(q * 7 + i * 1.8 + phase) * q * 4;
        const x = reach * q ** 1.25 * attack + curl;
        const fold = .85 + .24 * Math.sin(q * 23 - age * 29 + i);
        const base = detached > .04 ? smooth(detached, detached + .10, q) : 1;
        const w = width * (.65 + .35 * Math.sin(q * Math.PI)) * fold * attack * base;
        return {x, w};
      });
      const leftBound = Math.min(0, reach) - width - 6;
      const rightBound = Math.max(0, reach) + width + 6;
      softShade(p, leftBound, -top, rightBound, -top * detached, (x, y, out) => {
        const q = -y / Math.max(1, top), row = rows[Math.min(rows.length - 1, Math.floor(-y))];
        if (!row || row.w < .1) return;
        const u = (x - row.x) / row.w, edge = Math.abs(u);
        // Three uneven fingers tear out of a blunt, curling liquid crest.
        const crest = .91 + .075 * Math.sin(u * 7 + i) + .025 * Math.sin(u * 17 + phase);
        if (edge > 1 || q > crest) return;
        const hole = Math.sin(q * 21 + age * 19 + i) * Math.sin(u * 6 - q * 5);
        if (age > .14 && q > .38 && edge > .25 && hole > .88 - smooth(.14,.40,age)*.3) return;
        const channel = Math.sin(q * 13 - age * 24 + i) * .32;
        const core = Math.abs(u - channel);
        out.c = edge > .86 ? C[1] : edge > .62 ? C[2] : C[3];
        if (core < .52) out.c = C[4];
        if (core < .24 && Math.sin(q * 19 + i) < .7) out.c = C[back ? 4 : 5];
        if (core < .065 && q < .86) out.c = C[back ? 5 : 6];
        // A wet crease runs across each fold, not uniformly up its whole length.
        if (Math.sin(q * 29 - age * 38 + u * 2) > .96 && edge < .72) out.c = C[5];
        if (crest - q < .012 && edge < .8) out.c = C[5];
        out.a = fade;
        out.l = C[4]; out.k = core < .4 ? fade * .16 : 0;
      });
      const tipX = reach * attack, tipY = -top * .96;
      p.glow(tipX, tipY + 7, 9, C[4], fade * .2);
      // Pieces shear from the torn rim, curve away and descend independently.
      for (let k = 0; k < 3; k++) {
        const free = age - .045 - k * .015;
        if (free <= 0 || free > .3) continue;
        const sign = i < 2 ? -1 : 1;
        const x = reach + sign * (k - 1) * 2 + sign * free * 13;
        const y = -rise * (.88 - k * .08) - free * (25 + k * 8) + 280 * free * free;
        const strength = 1 - smooth(.18,.3,free);
        p.beam(x - sign, y + 3, x, y, 1.3 + k * .2, C[3], strength);
        p.blend(x - .5, y - .5, C[5], strength);
        wetLine(p, [[x-sign*2,y+6],[x-sign,y+3],[x,y]], C[4], strength*.55);
      }

    });
  }

  function shoulders(p) {
    // Broad torn fins emerge at staggered heights; the thin tip is the edge of a
    // membrane, not a cylindrical tentacle. Each retains its own rise/fall phase.
    for (let tier = 0; tier < 4; tier++) for (const side of [-1, 1]) {
      const age = t - (.265 + tier * .017 + (side > 0 ? .012 : 0));
      if (age < 0 || age > .48) continue;
      const open = 1 - (1 - clamp(age / .035)) ** 3, fall = smooth(.08, .48, age);
      const height = F[0], base = height * (tier * .19 + (side > 0 ? .025 : -.025) * tier);
      const reach = (44 - tier * 7 + side * (tier % 2 ? -4 : 2)) * open;
      const lift = (25 - tier * 2 + side * (tier % 2 ? 6 : -3)) * open * (1 - fall);
      const root = side * (7 + tier * 1.5), x = side * reach;
      const y = -base - lift;
      const k = 1 - smooth(.23, .48, age);
      const pts = [[root, -base + 7], [side * (12 + tier), -base - 7 * open],
        [x - side * 5, y + 2], [x - side * 3, y - 5], [x + side * 2, y - 4],
        [x + side * 3, y], [x - side * 1, y - 1], [x - side * 7, y + 8],
        [side * (22 + tier), -base + 13], [root, -base + 19]].map(([px, py]) => [px, Math.min(0, py)]);
      membrane(p, pts, C[2], k);
      membrane(p, [pts[0], pts[1], pts[2], pts[7], pts[8]], C[3], k);
      wetLine(p, [pts[1], pts[2], pts[3], pts[4]], C[4], k);
      wetLine(p, [pts[0], [side * (18 + tier), -base - 2], pts[2]], C[5], k * .85);
    }
  }

  function fallingSheets(p) {
    for (const s of sheets) {
      const age = t - s.start;
      if (age < 0) continue;
      const x = s.side * (s.x + s.vx * (1 - Math.exp(-age * 3)) / 3);
      const y = -s.h + s.vy * age + gravity * age * age * .5;
      if (y >= s.floor) {
        const land = (-s.vy + Math.sqrt(s.vy*s.vy+2*gravity*(s.h+s.floor)))/gravity;
        const lx = s.side*(s.x+s.vx*(1-Math.exp(-land*3))/3);
        splash(p,{x:lx,vx:0,flight:0,floor:s.floor,size:1.7},age-land);
        continue;
      }
      const opening = smooth(0, .055, age), thin = 1 - smooth(.13, .38, age);
      const landing = clamp((s.floor-y)/12);
      const w = s.w * opening * (.3 + thin * .7), h = (4 + age * 25) * landing;
      const tilt = Math.sin(s.phase + age * 8) * 2;
      // Falling membranes stretch into pendant drops with folded, perforated tops.
      softShade(p, x-w-3, y-h-2, x+w+3, Math.min(s.floor,y+h+2), (px,py,out) => {
        const q = (py-y) / Math.max(.1,h);
        if (Math.abs(q)>1) return;
        const centre = x + tilt*q + Math.sin(q*4+s.phase)*.7;
        const localWidth = w * Math.sqrt(Math.max(0,1-q*q)) * (.7+.25*Math.sin(q*6-age*15+s.phase));
        const u = (px-centre)/Math.max(.2,localWidth);
        if(Math.abs(u)>1) return;
        if(age>.14&&q<-.1&&Math.sin(q*9+u*5+s.phase)>.82) return;
        out.c = Math.abs(u)>.8?C[1]:u<-.25?C[4]:u<.3?C[3]:C[2];
        if(u>-.55&&u<-.30)out.c=C[5];
        out.a=ending();
        out.l=C[4];out.k=u<-.25?.10*ending():0;
      });
      haze(p,x,y,8,C[3],.08*thin*ending());

    }
  }

  function splash(p, d, age) {
    const x = d.x + d.vx * (1 - Math.exp(-d.flight * 3)) / 3, y = d.floor, fade = ending();
    const dry = (1 - smooth(.13, .4, age)) * fade;
    if (dry <= 0) return;
    const spread = smooth(0,.045,age), shrink = 1 - smooth(.16,.4,age);
    const rx = d.size * (1 + spread * 2.3) * (.4 + shrink * .6);
    const ry = .7+d.size*.3;
    softShade(p,x-rx,y-ry,x+rx,y+ry,(px,py,out)=>{
      const d=((px-x)/Math.max(.1,rx))**2+((py-y)/ry)**2;
      if(d>1)return;
      out.c=C[1];out.a=dry*(1-d*.5);
    });
    wetLine(p,[[x-rx*.65,y-1],[x+rx*.35,y-1]],C[3],dry*.8);
    if (age < .13) {
      const u = age / .13, crown = Math.sin(u*Math.PI), radius = 1 + u*6;
      softBand(p,x,y,radius,.3,1,(1-u)*.6,C.slice(1,5));
      for (const side of [-1,1]) {
        const dx = side * (1 + age*22), dy = -crown*(2+d.size*2);
        wetLine(p,[[x+side,y],[x+dx,y+dy]],C[4],1-u);
        p.blend(x+dx,y+dy,C[5],(1-u)*.8);
      }
      pool(p,x,y,7,2,C[4],(1-u)*.24);
    }
  }

  function droplets(p, back) {
    for (const d of drops) {
      if (d.back !== back) continue;
      const age = t - d.start;
      if (age < 0) continue;
      if (age >= d.flight) { splash(p,d,age-d.flight); continue; }
      const x = d.x + d.vx * (1 - Math.exp(-age * 3)) / 3;
      const y = d.floor - d.height + d.vy * age + gravity * age * age * .5;
      const vy = d.vy + gravity * age, tail = clamp(Math.abs(vy)*.018,1,5);
      // The trail samples this same trajectory at earlier instants, so the curve
      // follows the drop through its apex and never extends ahead of its head.
      for (let j = 1; j <= 8; j++) {
        const before = age - j * .008, after = age - (j - 1) * .008;
        if (before < 0) continue;
        const at = a => [d.x + d.vx * (1 - Math.exp(-a * 3)) / 3,
          d.floor - d.height + d.vy * a + gravity * a * a * .5];
        wetLine(p, [at(before), at(after)], C[j < 3 ? 5 : 3], (1 - j / 9) * .75 * ending());
      }
      // The moving bead stretches, rounds at its apex and stretches down on return.
      p.beam(x-d.vx*.012,y-Math.sign(vy)*tail,x,y,d.size,C[d.c],ending());
      p.blend(x-.5,y-.7,C[5],.8*ending());
      p.glow(x,y,3,C[4],.12*ending());
    }
  }

  function fineSpray(p) {
    for (const s of spray) {
      const age = t - s.start, life = .22;
      if (age < 0 || age >= life) continue;
      const x = s.side*(s.x+s.vx*age), y = -s.y+s.vy*age+gravity*age*age*.35;
      const k = Math.sin(age/life*Math.PI)*ending();
      p.blend(x,y,C[4],k*.7);
      haze(p,x,y,3,C[3],k*.12);
    }
  }

  function vent(p) {
    const age = t - .25;
    if (age >= 0 && age < .1) {
      const k = 1 - age/.1;
      p.ellipse(0,-2,23*(.7+.3*k),3,C[5],k);
      sparkle(p,0,-3,11*k,C[6],C[4],k);
      p.glow(0,-5,28,C[4],k*.55);
    }
    // A second low pulse marks the collapsed curtain hitting the floor.
    const rebound = smooth(.74,.82,t)*(1-smooth(.88,1.04,t));
    if (rebound > 0) {
      softBand(p,0,1,16+32*smooth(.76,1.03,t),sy,2,rebound*.6,C.slice(1,6));
      pool(p,0,1,38,10,C[3],rebound*.3);
    }
  }

  return {
    update(dt) {
      elapsed += dt;
      t = Math.round(elapsed * 1e9) / 1e9;
      F = flowAt(t);
    },
    drawBack(p) {
      if (!alive()) return;
      floor(p,true);
      droplets(p,true);
    },
    draw(p) {
      if (!alive()) return;
      shoulders(p);
      impactSheets(p, true);
      fountain(p);
      impactSheets(p, false);
      fallingSheets(p);
      fineSpray(p);
      droplets(p,false);
      floor(p,false);
      vent(p);
    },
  };
}
