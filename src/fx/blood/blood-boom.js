import { haze, pool, softBand, softShade } from "../_soft.js";
import { Rng, fit, clamp, smooth, lerp, sparkle, TAU, READY } from "../../core/index.js";

export const meta = {
  name: "Blood boom",
  desc: "A traced crimson seal ruptures into a heavy rising fountain; torn liquid sheets, forty ballistic drops and rebounding splashes collapse into drying pools and fading runes.",
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
  [57, 29, .95, .00, .90, .00], // 0.30 broad vertical acceleration
  [88, 31, .88, .00, .76, .00], // 0.35 crest overtakes the hero
  [99, 32, .84, .00, .66, .00], // 0.40 full opaque foreground
  [96, 33, .76, .03, .58, .00], // 0.45 crown folds outwards
  [91, 32, .67, .10, .52, .02], // 0.50 first heavy sheets detach
  [84, 30, .56, .19, .47, .06], // 0.55 pressure falls, crest still hangs
  [74, 28, .43, .31, .42, .12], // 0.60 folds pull down
  [63, 26, .31, .44, .38, .20], // 0.65 holes open between sheets
  [51, 23, .23, .57, .34, .30], // 0.70 broken curtain drops
  [38, 20, .16, .70, .30, .43], // 0.75 lower body reappears
  [26, 17, .10, .81, .27, .59], // 0.80 low returning splash
  [16, 14, .06, .90, .24, .74], // 0.85 folds hit the floor
  [ 9, 11, .03, .96, .21, .86], // 0.90 rebound crowns
  [ 4,  8, .01, 1.0, .18, .96], // 0.95 small last spurts
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
  const lips = Array.from({ length: 5 }, (_, i) => ({
    x: -26 + i * 13, h: R.range(-11, 10), phase: R.range(0, TAU),
  }));
  // Detached pieces begin as wide membranes, fold edge-on, and become streaks near landing.
  const sheets = Array.from({ length: 12 }, (_, i) => ({
    side: i % 2 ? 1 : -1, start: .43 + (i >> 1) * .035,
    x: R.range(16, 26), h: R.range(48, 78), vx: R.range(17, 34),
    vy: R.range(-22, 12), w: R.range(5, 9), phase: R.range(0, TAU),
    floor: R.range(-5, 7),
  }));
  // Forty primary beads. Landing times precede the drying interval.
  const drops = Array.from({ length: 40 }, (_, i) => {
    const start = .26 + (i % 5) * .035 + R.range(0, .018);
    const vy = -R.range(210, 275), flight = -2 * vy / gravity;
    return { start, flight, vy, vx: R.range(-63, 63), x: R.range(-5, 5),
      floor: R.range(-7, 10), size: R.range(.8, 2), phase: R.range(0, TAU),
      back: i % 4 === 0, c: R.int(2, 4) };
  });
  const spray = Array.from({ length: 20 }, (_, i) => ({
    start: .3 + i * .017, side: i % 2 ? 1 : -1,
    x: R.range(18, 29), y: R.range(12, 65), vx: R.range(10, 32), vy: R.range(-35, 15),
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
      wetLine(p, pts.map(([x, y]) => [x, y - .7]), C[t < .3 ? 4 : 2], heat * fade);
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
    const rows = Array.from({ length: Math.ceil(height) + 2 }, (_, i) => {
      const q = i / height, drift = Math.sin(i * .06 - t * 9 + phase) * 2 * q;
      return { drift, w: width * (.72 + .28 * Math.sin(q * Math.PI * .85)) + Math.sin(i * .23 - t * 21) * (1 + q) };
    });
    // The crest is broad and scalloped, not pointed flames or separate tentacles.
    const caps = Array.from({ length: 87 }, (_, i) => {
      const x = i - 43, lip = lips[clamp(Math.round((x + 26) / 13), 0, 4)];
      return height * (.97 - .22 * (Math.abs(x) / Math.max(1,width)) ** 1.6) + lip.h * pressure + 3 * Math.cos((x-lip.x)*.2);
    });
    softShade(p, -43, -height - 9, 43, 1, (x, y, out) => {
      const h = -y, q = h / height;
      if (h < 0 || h > height + 8) return;
      const row = rows[Math.min(rows.length - 1, Math.floor(h))], edge = Math.abs(x - row.drift) / Math.max(1, row.w);
      const cap = caps[clamp(Math.floor(x + 43), 0, 86)];
      if (edge > 1 || h > cap) return;
      // A falling perforation front tears only the late curtain; the hero stays covered at peak.
      const cellX = Math.floor(x/2)*2, cellY = Math.floor((h+t*95)/2)*2;
      const tear = .5 + .5 * Math.sin(cellX*.31 + Math.sin(cellY*.13+phase)) * Math.cos(cellY*.21 + phase);
      if (broken > .25 && q > .22 && tear < (broken - .25) * .95) return;
      const flow = Math.sin(h * .21 + t * 38 + Math.sin(x * .18 + phase) * 1.4);
      const fold = Math.sin(x * .22 + Math.sin(h * .065 - t * 8) * 1.5);
      const ridge = flow > .9 && fold > -.4;
      out.c = edge > .91 ? C[1] : edge > .74 ? C[2] : ridge ? C[4] : fold > .15 ? C[3] : C[2];
      if (cap - h < 1.6 && edge < .9) out.c = C[5];
      const crease = Math.sin(x*.61 + Math.sin(h*.09-t*13)) * Math.cos(h*.37+t*26);
      if (crease > .88 && edge < .75) out.c = C[4];
      if (crease < -.91 && edge > .3) out.c = C[1];
      out.a = edge < .67 ? 1 : .8;
      out.a *= 1 - smooth(.88, 1, t);
      out.l = C[4]; out.k = (1 - edge) * pressure * (ridge ? .3 : .1);
    });
    // Short wet highlights travel upward; they reverse with the collapsing pressure front.
    for (let i = 0; i < 14; i++) {
      const q = ((t * 2.8 + i * .137) % 1 + 1) % 1;
      const h = height * (t < .55 ? q : 1 - q), x = (i % 7 - 3) * width * .22;
      const k = Math.sin(q * Math.PI) * pressure;
      wetLine(p, [[x, -h], [x + 1, -h - Math.min(6, height * .08)]], C[5], k * .5);
    }
    p.glowLine(0, -5, 0, -height * .8, 18, C[3], pressure * .22);
    p.glow(0, -height * .65, 24, C[4], pressure * .17);
  }

  function shoulders(p) {
    // Broad shallow sheets turn outward during release; never round globes or narrow tendrils.
    for (const side of [-1, 1]) {
      const age = t - (.28 + (side > 0 ? .025 : 0));
      if (age < 0 || age > .43) continue;
      const open = smooth(0, .1, age), fall = smooth(.1, .43, age);
      const x = side * (20 + 24 * open), y = -34 * open * (1 - fall);
      const k = 1 - smooth(.18, .43, age);
      const points = [[side*12,0],[side*18,-15*open],[x-side*9,y-4],
        [x,y],[x-side*4,y+6],[side*28,-6*(1-fall)],[side*23,1]];
      membrane(p,points,C[2],k);
      membrane(p,[points[0],points[1],points[2],points[4]],C[3],k);
      wetLine(p,[points[1],points[2],points[3]],C[5],k*.65);
      haze(p,x-side*5,y+4,8,C[3],k*.12);
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
      const w = s.w * opening * (.4 + thin * .6), h = (3 + age * 14) * landing;
      const tilt = Math.sin(s.phase + age * 8) * 2;
      const pts = [[x-w,y-h], [x+w*.2,y-h-2], [x+w,y-h*.5],
        [x+w*.7,y+h], [x+tilt,y+h+3], [x-w*.5,y+h*.2]];
      membrane(p,pts,C[2],ending());
      membrane(p,[pts[0],pts[1],pts[2],[x,y+h]],C[3],ending());
      wetLine(p, [pts[0],[x-w*.3,y],[x+tilt,y+h]], C[5], .65 * ending());
      haze(p,x,y,8,C[3],.1*thin*ending());
    }
  }

  function splash(p, d, age) {
    const x = d.x + d.vx * d.flight, y = d.floor, fade = ending();
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
      const x = d.x + d.vx * age, y = d.floor + d.vy * age + gravity * age * age * .5;
      const vy = d.vy + gravity * age, tail = clamp(Math.abs(vy)*.018,1,5);
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
      fountain(p);
      fallingSheets(p);
      fineSpray(p);
      droplets(p,false);
      floor(p,false);
      vent(p);
    },
  };
}
