import { Rng, fit, clamp, smooth, noise2, TAU } from "../../core/index.js";
import { bead, ring, billow } from "./_lib.js";
import { haze, pool, softShade } from "../_soft.js";

export const meta = {
  name: "Aorbion sea dragon",
  desc: "An abyssal sea dragon surges through tidal pressure crescents: sculpted water ribs, streaming fins, a fanged ivory jaw and a collapsing trail of foam.",
  tags: ["water", "dragon", "ultimate", "charge", "one-shot"],
  size: [752, 272],
  origin: [48, 182],
  duration: 1,
  loop: false,
  fps: 40,
  bg: "ground",
  options: {
    palette: ["#071e38", "#0c4169", "#147d9c", "#32b9d0", "#8de8ed", "#e3ffff"],
    seed: 17,
    travelDistance: 640,
  },
};

// 50ms keys: formation, heave, bend, lip fold, curl shear, wisp lift, light, foam, settling.
export const choreography = [
  [0.00, 0.000,  0, -.20, .00, -.30,  .10, .00, .00, .00],
  [0.05, 0.080,  5, -.35, .00, -.25,  .20, .12, .12, .00],
  [0.10, 0.220,  1, -.10, .10, -.15,  .55, .38, .35, .00],
  [0.15, 0.420, -4,  .25, .40,  .20,  .70, .72, .65, .00],
  [0.20, 0.630, -7,  .60, .85,  .65,  .40, 1.0, .90, .00],
  [0.25, 0.800, -5,  .85, 1.0,  .90,  .00, .82, .72, .00],
  [0.30, 0.920, -1,  .55, .70,  .30, -.30, .72, .62, .00],
  [0.35, 0.980,  3,  .05, .40, -.20, -.55, .62, .52, .00],
  [0.40, 1.000,  4, -.40, .25, -.40, -.15, .65, .65, .00],
  [0.45, 1.000,  1, -.65, .50, -.10,  .30, .82, .82, .00],
  [0.50, 0.980, -3, -.35, .72,  .40,  .60, .72, .67, .00],
  [0.55, 0.910, -5,  .10, .55,  .65,  .20, .58, .55, .00],
  [0.60, 0.800, -3,  .45, .35,  .20, -.30, .48, .45, .08],
  [0.65, 0.660,  0,  .60, .30, -.25, -.55, .40, .40, .24],
  [0.70, 0.510,  3,  .30, .20, -.50, -.20, .30, .35, .42],
  [0.75, 0.360,  5, -.10, .12, -.60,  .10, .22, .28, .58],
  [0.80, 0.230,  6, -.30, .08, -.70,  .20, .14, .20, .73],
  [0.85, 0.130,  7, -.15, .00, -.80,  .00, .08, .14, .88],
  [0.90, 0.060,  8,  .00, .00, -.80,  .00, .03, .08, 1.0],
  [0.95, 0.018,  8,  .00, .00, -.80,  .00, .01, .03, 1.0],
  [1.00, 0.000,  8,  .00, .00, -.80,  .00, .00, .00, 1.0],
];

function pose(t) {
  const f = clamp(t / .05, 0, choreography.length - 1);
  const i = Math.min(choreography.length - 2, Math.floor(f));
  const u = smooth(0, 1, f - i);
  return choreography[i].map((v, j) => v + (choreography[i + 1][j] - v) * u);
}

// The default gallery travels beyond a normal viewport. A host that already
// advances the effect anchor uses travelDistance:0 to avoid double movement.
export function travelPose(t, o) {
  const s = pose(t), distance = Math.max(0, Number.isFinite(o.travelDistance) ? o.travelDistance : 640);
  const growth = smooth(0, .48, t);
  const length = 310 * (.12 + .88 * growth) * (.32 + .68 * Math.sqrt(lift(s)));
  const width = distance > 0 ? Math.min(length, distance * t + 8) : length;
  const scale = Math.max(.012, width / 310);
  return { front: distance * t, scale, offset: distance * t - 310 * scale };
}

function movingPainter(p, t, o) {
  const m = travelPose(t, o), q = Object.create(p);
  const { tx, ty, fx, cs, sn } = p;
  const x0 = tx + m.offset * fx * cs, y0 = ty + m.offset * fx * sn;
  const ax = m.scale * fx * cs, ay = m.scale * fx * sn;
  q.toX = (x, y) => x0 + x * ax - y * sn;
  q.toY = (x, y) => y0 + x * ay + y * cs;
  q.fromX = (x, y) => ((x - x0) * cs + (y - y0) * sn) * fx / m.scale;
  q.fromY = (x, y) => -(x - x0) * sn + (y - y0) * cs;
  return q;
}

// The lower tidal surge rolls independently below the dragon. Its hollow
// barrel leaves a dark pocket between the upper lip and the foaming ground.
function spine(x, s) {
  return (-8 - 29 * (x / 300) ** 1.5 + Math.sin(x * .045 - s[3]) * 3) * lift(s);
}

// The whole 300px surge rises and settles together. No moving erase plane:
// both ends feather into shallow water, so a long attack never becomes a stump.
function cohesion(x, y, t, s, seed) {
  const shore = smooth(0, 27, x) * (1 - smooth(301, 321, x));
  return shore * smooth(0, .12, t) * (1 - smooth(.83, 1, t));
}

function lift(s) { return Math.max(.002, s[1]); }

function waveTop(x, t, s) {
  const u = clamp(x / 300);
  const surge = 12 + 48 * u ** 1.65;
  const rolling = Math.sin(x * .046 - t * 8) * (2 + u * 5);
  const shoulder = 14 * Math.exp(-(((x - 245) / 40) ** 2));
  return (-(surge + shoulder + rolling) + s[2] * .35) * lift(s) * smooth(0, 32, x);
}

function hollow(x, y, t, s) {
  const cx = 304 + Math.sin(t * 9) * 3 + s[5] * 2;
  const cy = (-23 + s[2] * .2) * lift(s);
  return ((x - cx) / 28) ** 2 + ((y - cy) / (23 * lift(s))) ** 2;
}

// Water is shaded in long curved ribbons. Quantized transverse noise keeps
// connected pixel clusters instead of a static granular fill or smooth gradient.
function body(p, C, t, s, seed) {
  const tops = Array.from({length: 321}, (_, x) => waveTop(x, t, s));
  const survival = Array.from({length: 81}, (_, x) => cohesion(x * 4, 0, t, s, seed));
  const fronts = Array.from({length: 96}, (_, y) => 311 + Math.sin((y - 90) * .08 + t * 6) * 3);
  const sample = (x, y, out) => {
    const top = tops[clamp(Math.floor(x), 0, 320)];
    const floor = (1 + Math.sin(x * .075 + t * 5) * 2) * lift(s);
    const tip = fronts[clamp(Math.floor(y + 90), 0, 95)] - 8 * smooth(.4, 1, -y / (72 * lift(s)));
    if (y < top || y > floor || x > tip || hollow(x, y, t, s) < 1) return;
    const k = survival[clamp(Math.floor(x / 4), 0, 80)];
    if (k < .02) return;
    const v = (y - top) / (floor - top);
    const bend = Math.atan2((y / lift(s) + 23) / 23, (x - 304) / 28);
    const curl = Math.sqrt(hollow(x, y, t, s));
    const turn = smooth(210, 290, x);
    const line = (curl * 17 + bend * 3) * turn + (v * 24 + Math.sin(x * .035 - t * 4) * 3) * (1 - turn);
    const flow = noise2(Math.floor(line / 1.5) * .65, Math.floor(x / 5) * .14 - t * 8, seed + 7);
    const channel = Math.sin(line * 1.1 + t * 12 + flow * 1.7);
    let level = channel > .82 ? 4 : channel > .25 ? 3 : channel > -.65 ? 2 : 1;
    if (v > .84) level = Math.max(1, level - 1);
    const strand = noise2(Math.floor(line * 2) * 1.37, Math.floor(x / 4) * .21 - t * 11, seed + 18);
    if (strand > .27) level = Math.min(5, level + 1);
    if (strand < -.4) level = Math.max(1, level - 1);
    const rim = y - top;
    if (rim < 1.5 && flow > -.3) level = 5;
    if (curl < 1.1) level = 3;
    out.c = C[level];
    out.a = k * (v > .94 ? .6 : .94) * (1 - smooth(tip - 6, tip, x));
  };
  // Broad water planes are authored on 2px clusters; 1px foam and caustics are
  // overlaid separately. Cache each cluster once instead of repeating its noise.
  const cells = new Array(160 * 48);
  for(let block=0;block<320;block+=8) {
    const top=Math.min(...tops.slice(block,block+9))-2;
    softShade(p, block, top, block+8, 5, (x, y, out) => {
    if(x<block||x>=block+8)return;
    const ix = Math.floor(x / 2), iy = Math.floor((y + 88) / 2);
    const index = iy * 160 + ix;
    let cell = cells[index];
    if (!cell) {
      cell = { c: 0, a: 1 };
      sample(ix * 2 + .5, iy * 2 - 87.5, cell);
      cells[index] = cell;
    }
    out.c = cell.c;
    out.a = cell.a;
    });
  }
}

// Foam follows several asynchronous rolling ridges, not an animal's dorsal fins.
// Each crest folds forward, breaks into beads, then leaves a dark trough behind it.
function crest(p, C, t, s, seed) {
  for (let lane = 0; lane < 4; lane++) {
    const start = 15 + lane * 19;
    let previous = null;
    for (let x = start; x < 303 - lane * 9; x += 2) {
      const top = waveTop(x, t, s);
      const v = lane / 5;
      const y = top * (1 - v) + Math.sin(x * .052 - t * (8 + lane) + lane) * (2 + lane) * lift(s);
      const flow = noise2(Math.floor(x / 3) * .43 - t * (4 + lane), lane * 3.7, seed + 33);
      const k = cohesion(x, y, t, s, seed) * (lane === 0 ? .95 : .62);
      if (k < .03 || hollow(x, y, t, s) < 1.05) { previous = null; continue; }
      if (previous && flow > -.48) {
        p.line(previous[0], previous[1] + 2, x, y + 2, C[3], k);
        p.line(previous[0], previous[1], x, y, C[flow > .25 ? 7 : 5], k);
      }
      if (flow > .2 && x % 6 < 2) {
        const radius = (1.5 + (flow + .2) * (lane === 0 ? 3.8 : 2.2)) * Math.sqrt(lift(s));
        billow(p, x, y - .5, radius, C, k);
        p.blend(x - 1, y - radius, C[7], k);
      }
      previous = [x, y];
    }
  }
}

// Broken curtains of foam slide down the face, branching into droplets.
// These broad patches bridge the fine flow ribbons and the foamy crest.
function fallingLace(p, C, t, s, seed) {
  for (let i = 0; i < 13; i++) {
    const x0 = 35 + i * 21;
    const phase = (t * (1.6 + i % 3 * .22) + i * .277) % 1;
    const top = waveTop(x0, t, s);
    const length = (9 + i % 4 * 5) * Math.sin(phase * Math.PI) * lift(s);
    const k = cohesion(x0, top, t, s, seed) * Math.sin(phase * Math.PI);
    for (let j = 0; j < length; j += 2) {
      const x = x0 - j * .48 + Math.sin(j * .25 + i) * 2;
      const y = top + j + phase * 8 * lift(s);
      if (hollow(x, y, t, s) < 1.05 || y > 0) continue;
      const n = noise2(i * 2 + j * .3, t * 7, seed + 108);
      if (n < -.32) continue;
      const r = (1 - j / (length + 2)) * (2.4 + Math.max(0, n) * 2);
      billow(p, x, y, r, C, k * .83);
    }
  }
  // The bow strikes the ground in several offset white foam tongues.
  for (let i = 0; i < 11; i++) {
    const x = 219 + i * 8 + Math.sin(i * 7) * 4;
    const phase = (t * 2.5 + i * .173) % 1;
    const k = cohesion(x, 0, t, s, seed) * Math.sin(phase * Math.PI);
    const xx = x + phase * 10, yy = -1 - Math.sin(phase * Math.PI) * (2 + i % 4);
    p.beam(xx - 4, yy + 2, xx + 3, yy, 2, C[4], k);
    billow(p, xx, yy, 1.2 + Math.sin(phase * Math.PI) * 1.4, C, k * .85);
  }
}

function breakingLip(p, C, t, s, seed) {
  const k = smooth(.23, .4, t) * (1 - smooth(.68, .9, t));
  for (let i = 0; i < 12; i++) {
    const phase = (t * (2.1 + i % 3 * .17) + i * .183) % 1;
    const x = 248 + i * 4.7 + Math.sin(i * 1.7) * 2;
    const top = waveTop(x, t, s);
    const drop = phase * phase * 17 * (1 - s[1] * .5);
    const y = top + drop;
    const radius = (1.3 + Math.sin(phase * Math.PI) * 2.4) * Math.sqrt(lift(s));
    const a = k * Math.sin(phase * Math.PI);
    billow(p, x + phase * 4, y, radius, C, a);
    if (phase > .6) bead(p, x + phase * 5, y + 2, 14, 25, 1, C, a * .7);
  }
}

// The current bends twice, with a fast traveling pulse and a slower tail whip.
function dragonPath(u, t, s) {
  const L = Math.sqrt(lift(s)), extension = smooth(.12, .55, t);
  const bend = Math.sin(u * TAU * 1.1 - t * 10) * Math.sin(u * Math.PI);
  return [18 + u * 258,
    (-8 - u * (48 + extension * 9) - Math.sin(u * Math.PI) * 35 + bend * 32) * L];
}

// Fill these solid water silhouettes by screen-space scanlines. Unlike the
// generic textured polygon painter this visits only covered spans; transforming
// vertices first preserves arbitrary host angle, flip and horizontal growth.
function solidWater(p, points, c, alpha) {
  if(alpha * p.fade < .025) return;
  const pts=points.map(([x,y])=>[p.toX(x,y),p.toY(x,y)]);
  const top=Math.max(p.oy,Math.ceil(Math.min(...pts.map(a=>a[1]))-.5));
  const bottom=Math.min(p.oy+p.h,Math.ceil(Math.max(...pts.map(a=>a[1]))-.5));
  for(let y=top;y<bottom;y++) {
    const crosses=[], yy=y+.5;
    for(let i=0,j=pts.length-1;i<pts.length;j=i++) {
      const a=pts[i],b=pts[j];
      if((a[1]>yy)!==(b[1]>yy)) crosses.push(a[0]+(b[0]-a[0])*(yy-a[1])/(b[1]-a[1]));
    }
    crosses.sort((a,b)=>a-b);
    for(let i=0;i+1<crosses.length;i+=2) {
      const left=Math.max(p.ox,Math.ceil(crosses[i]-.5));
      const right=Math.min(p.ox+p.w,Math.ceil(crosses[i+1]-.5));
      for(let x=left;x<right;x++) p.put(x,y,c,alpha);
    }
  }
}

// Curved water ribbons share one filled silhouette and one narrow rim.
function ribbon(p, points, width, C, k, hot = false) {
  if (k < .02) return;
  const upper=[], lower=[];
  for (let j=0;j<points.length;j++) {
    const a=points[j], b=points[Math.min(j+1,points.length-1)];
    const prev=points[Math.max(0,j-1)], dx=b[0]-prev[0], dy=b[1]-prev[1];
    const len=Math.hypot(dx,dy)||1;
    const w=Math.max(.15,width*(1-j/(points.length-1))**.8)*.5;
    const nx=dy/len*w, ny=-dx/len*w;
    upper.push([a[0]+nx,a[1]+ny]);
    lower.push([a[0]-nx,a[1]-ny]);
  }
  solidWater(p,[...upper,...lower.slice().reverse()],C[4],k);
  p.polyline(lower,C[2],k*.7);
  p.polyline(upper,C[hot?7:6],k);
}

function dragonCurrent(p, C, t, s, seed) {
  const k = smooth(.035, .14, t) * (1 - smooth(.7, .97, t));
  if (k < .008) return;
  const L = Math.sqrt(lift(s)), nodes = [], columns = [];
  const dissolve = smooth(.68, .96, t);
  for (let i = 0; i <= 100; i++) {
    const u = i / 100, [x, y] = dragonPath(u, t, s);
    const [xx, yy] = dragonPath(Math.min(1, u + .005), t, s);
    const len = Math.hypot(xx - x, yy - y) || 1;
    nodes.push({ x, y, u, nx: -(yy - y) / len, ny: (xx - x) / len,
      w: (2 + 25 * Math.sin(u * Math.PI * .88) ** .9) * L });
  }
  for (let i = 1; i < nodes.length; i++) {
    const a = nodes[i - 1], b = nodes[i];
    for (let x = Math.ceil(a.x); x <= b.x; x++) {
      const v = (x - a.x) / (b.x - a.x);
      columns[x] = { y: a.y + (b.y - a.y) * v, u: a.u + (b.u - a.u) * v,
        w: Math.min(38 * L, (a.w + (b.w - a.w) * v) / Math.max(.4, Math.abs(a.ny))) };
    }
  }
  // Ribbon-aligned caustics ride the surface; broad shadows preserve volume.
  // Two-pixel cells are coherent clusters, with no per-pixel random speckle.
  const cells = new Map();
  for (let block = 16; block < 280; block += 8) {
    let top = Infinity, bottom = -Infinity;
    for (let x = block; x < block + 8; x++) if (columns[x]) {
      top = Math.min(top, columns[x].y - columns[x].w);
      bottom = Math.max(bottom, columns[x].y + columns[x].w);
    }
    if (top === Infinity) continue;
    softShade(p, block, top - 1, block + 8, bottom + 1, (x, y, out) => {
      if (x < block || x >= block + 8) return;
      const c = columns[Math.floor(x)];
      if (!c) return;
      const v = (y - c.y) / c.w;
      if (Math.abs(v) > 1) return;
      const ix = Math.floor(x / 3), iy = Math.floor(y / 2), key = ix * 256 + iy;
      let cell = cells.get(key);
      if (!cell) {
        cell = [Math.sin(c.u * 42 - t * 27 + v * 10 + Math.sin(c.u * 19 - t * 8) * 2),
          noise2(ix * .31 - t * 4, iy * .24, seed + 801)];
        cells.set(key, cell);
      }
      if (dissolve > 0 && cell[1] < dissolve * 1.5 - .8) return;
      let level = v < -.86 ? 6 : v < -.62 ? 5 : v < -.1 ? 4 : v < .43 ? 3 : v < .8 ? 2 : 1;
      if (cell[0] > .83 && v > -.7 && v < .6) level += 2;
      if (cell[0] < -.85 && v > -.5) level = Math.max(1, level - 1);
      out.c = C[level];
      out.a = k * clamp((1 - Math.abs(v)) * c.w + .5);
    });
  }
  // Segmented, swept-back crest; every root follows the water's bend.
  for (let i = 16; i < 98; i += 5) {
    const a = nodes[i], w = a.w;
    const length = (12 + i % 13 + Math.sin(t * 23 - i * .6) * 5) * L;
    const x = a.x + a.nx * -w * .85, y = a.y - a.ny * w * .85;
    const pts = [];
    for (let j = 0; j <= 8; j++) {
      const v = j / 8;
      pts.push([x - v * length * 1.1,
        y - Math.sin(v * Math.PI * .55) * length * .7 - v * v * 2 * L]);
    }
    ribbon(p, pts, 7 * L, C, k * .88, i % 3 === 0);
  }
  // Fine currents run along the belly, giving the ribs a wet reflected edge.
  for (let lane = 0; lane < 3; lane++) {
    let last;
    for (let i = 18; i < 98; i++) {
      const a = nodes[i], v = .46 + lane * .18;
      const pt = [a.x, a.y + a.w * v + Math.sin(i * .24 - t * 23 + lane)];
      if (last && Math.sin(i * .32 - t * 17 + lane * 2) > -.4)
        p.line(...last, ...pt, C[lane === 0 ? 5 : 3], k * .7);
      last = pt;
    }
  }
  // Thin branch-like caustics sweep across the shaded flank in coherent bands.
  for (let i = 24; i < 96; i += 7) {
    const a = nodes[i], progress = (t * 3 + i * .037) % 1;
    const alpha = k * Math.sin(progress * Math.PI) * .65;
    const x = a.x, y = a.y - a.w * .25;
    p.polyline([[x-6,y-4*L],[x-1,y-7*L],[x+6,y-4*L],[x+9,y+2*L]],C[5],alpha);
    p.line(x-1,y-7*L,x+1,y-12*L,C[6],alpha*.6);
  }
  // Two huge translucent pectoral fins sweep behind the neck. Dark slots
  // between their rays keep them legible against the foaming wave below.
  for (let fin = 0; fin < 2; fin++) {
    const a = nodes[fin === 0 ? 72 : 87], pts = [];
    const sway = Math.sin(t * 17 + fin * 2) * 7;
    for (let ray = 0; ray < 6; ray++) {
      pts.length = 0;
      for (let j = 0; j <= 10; j++) {
        const u = j / 10;
        pts.push([a.x - u * (42 + ray * 6) + u * u * 13,
          a.y + (8 + u * (21 + ray * 3) + Math.sin(u * 4 + t * 12) * u * sway) * L]);
      }
      ribbon(p, pts, (7 - ray * .5) * L, C, k * (fin ? .85 : .52), ray === 0);
    }
  }
  const [hx, hy] = dragonPath(1, t, s);
  const gape = .85 + .28 * Math.sin(Math.PI * smooth(.08,.7,t));
  const head = (pts, c, alpha = k) => solidWater(p,pts.map(([x, y]) =>
    [hx + x, hy + (y > 4 ? 4 + (y-4)*gape : y) * L]), c, alpha);
  // Hollow open jaw, brow, layered cheek and a long beveled snout.
  head([[-22,-9],[-12,-25],[3,-24],[17,-15],[33,-10],[40,-2],[34,4],[12,2],[3,14],[-19,15]], C[3]);
  head([[-18,-11],[-10,-22],[3,-24],[17,-15],[34,-10],[38,-5],[13,-6],[1,-12]], C[6]);
  head([[-10,-22],[3,-24],[15,-16],[6,-16],[-2,-18]], C[7]);
  head([[10,-6],[36,-5],[34,0],[15,-1],[6,7]], C[5]);
  head([[4,4],[31,4],[21,13],[7,20],[-7,18],[-1,10]], C[0]);
  head([[-9,17],[7,19],[26,9],[23,16],[10,25],[-8,24],[-21,15]], C[4]);
  head([[-8,23],[9,23],[22,16],[17,23],[8,27],[-8,26]], C[6]);
  head([[-19,-5],[-5,0],[1,9],[-10,17],[-21,12]], C[2]);
  head([[-18,-7],[-7,-4],[-2,3],[-10,12],[-8,2]], C[5]);
  // Horns grow as curved blades with a blue shadow plane, not white spikes.
  head([[-11,-20],[-31,-45],[-35,-55],[-21,-44],[-9,-31],[2,-21]], C[3]);
  head([[-11,-22],[-30,-47],[-35,-55],[-22,-46],[-5,-24]], C[6]);
  head([[0,-22],[-8,-38],[-7,-48],[1,-38],[9,-20]], C[5]);
  head([[0,-24],[-7,-45],[-1,-38],[9,-20]], C[7]);
  // A dark brow isolates the white eye at game scale.
  head([[0,-13],[14,-10],[8,-3],[0,-4],[-4,-8]], C[1]);
  p.beam(hx + 1, hy - 8 * L, hx + 9, hy - 7 * L, 1.5 * L, C[7], k);
  p.glow(hx + 5, hy - 8 * L, 6, C[5], k * .38);
  head([[27,-4],[32,-4],[30,-1],[27,-1]], C[1]);
  for (let i = 0; i < 4; i++) {
    const x = 10 + i * 5;
    head([[x,3],[x+3,3],[x+1,8+i%2*2]], C[6]);
  }
  // Four independently lagging whiskers; their white core peels into spray.
  for (let lane = 0; lane < 4; lane++) {
    const pts = [];
    for (let j = 0; j <= 28; j++) {
      const u = j / 28;
      pts.push([hx + 23 - u * (61 + lane * 13),
        hy + ((lane - 1) * 4 + Math.sin(u * 5 - t * 18 + lane) * u * (10 + lane * 3) + u * u * 12) * L]);
    }
    ribbon(p, pts, 1.5 * L, C, k * .88, lane === 0);
  }
  // Shedding follows the body's surface, then falls with gravity into the surf.
  const R = new Rng(seed + 904);
  for (let i = 0; i < 54; i++) {
    const u = R.range(.1, .98), phase = (t * 2.3 + R.next()) % 1;
    const [x, y] = dragonPath(u, t, s), speed = R.range(15, 62);
    const xx = x - phase * speed, yy = y + (phase * phase * 55 - Math.sin(phase * Math.PI) * 13) * L;
    const alpha = k * Math.sin(phase * Math.PI) * (.35 + dissolve * .6);
    bead(p, xx, yy, -speed, phase * 110, 1 + i % 3 * .5, C, alpha);
  }
}

// Traveling, tilted pressure crescents pass behind and in front of the neck.
// Open arcs and trailing droplets read as compressed water, not magic circles.
function pressure(p, C, t, s, front) {
  const L = Math.sqrt(lift(s));
  for (let lane = 0; lane < 3; lane++) {
    const phase = (t * 2.6 + lane / 3) % 1;
    const cx = 284 - phase * 200, cy = (-38 - Math.sin(phase * Math.PI) * 24) * L;
    const rx = 8 + phase * 14, ry = (27 + phase * 23) * L;
    const k = smooth(.06,.18,t) * (1-smooth(.65,.94,t)) * Math.sin(phase*Math.PI) * .8;
    let last;
    for (let j = 0; j <= 64; j++) {
      const a = j / 64 * TAU, near = Math.cos(a) > 0;
      if (near !== front || Math.sin(a * 3 + phase * 7) < -.65) { last = null; continue; }
      const y = Math.sin(a) * ry;
      const pt = [cx + Math.cos(a) * rx - y * .27, cy + y];
      if (last) {
        p.line(last[0]-1,last[1],pt[0]-1,pt[1],C[3],k*.7);
        p.line(...last,...pt,C[front?6:4],k);
      }
      last = pt;
    }
  }
}

// A bow burst tears off in discrete sheets. Positions remember their emission
// time, so the spray lags behind the accelerating silhouette instead of sticking.
function bowBurst(p, C, t, o, front) {
  const R = new Rng(o.seed + 1771);
  for (let i = 0; i < 62; i++) {
    const birth = R.range(.1,.68), age = t - birth;
    const life = R.range(.15,.29), side = R.next() > .5;
    const speed = R.range(40,150), angle = R.range(-1.7,.5);
    const height = R.range(20,64), size = R.range(1,2.8);
    if (side !== front || age < 0 || age > life) continue;
    const m = travelPose(birth,o), L = Math.sqrt(lift(pose(birth)));
    const x = m.front + 5 * m.scale + Math.cos(angle) * speed * age;
    const y = -height * L + Math.sin(angle) * speed * age + 240 * age * age;
    const fade = Math.sin(Math.PI * age/life) * (1-smooth(.88,1,t));
    bead(p,x,y,Math.cos(angle)*speed,Math.sin(angle)*speed+480*age,size,C,fade);
    if (size > 2.2) p.glow(x,y,4,C[4],fade*.12);
  }
}

// Launch compresses the sea into an ivory core, then throws out foamy petals.
// This is local to the effect: no screen-wide flash or host-side camera change.
function launch(p,C,t) {
  if(t < .025 || t > .28) return;
  const u = (t-.025)/.255, k = Math.sin(u*Math.PI);
  for(let lane=0;lane<7;lane++) {
    const a = -Math.PI + lane*Math.PI/7;
    const length = (20+lane%3*9)*Math.sin(u*Math.PI*.8);
    const pts=[];
    for(let j=0;j<=12;j++) {
      const v=j/12;
      pts.push([8+Math.cos(a)*length*v+u*14,
        -4+Math.sin(a)*length*v+v*v*u*14]);
    }
    ribbon(p,pts,(7-lane%3)*k,C,k*.85,lane%2===0);
  }
  p.glow(12,-8,24,C[4],k*.3);
  const flash = Math.max(0,1-Math.abs(t-.115)/.04);
  if(flash>0) {
    p.ellipse(14,-6,11*flash,3*flash,C[7],flash);
    p.glow(14,-6,30,C[5],flash*.5);
  }
}

function droplets(seed, o) {
  const R = new Rng(seed), list = [];
  for (let i = 0; i < 76; i++) {
    const birth = .09 + R.range(0, .65), bow = i < 32;
    const x = bow ? R.range(270, 303) : R.range(22, 270);
    const s = pose(birth), m = travelPose(birth, o);
    list.push({
      birth, x: m.offset + x * m.scale,
      z: R.range(-14, 14),
      h: Math.max(3, -waveTop(x, birth, s) + R.range(-3, 4)),
      vx: (bow ? R.range(-75, -20) : R.range(-26, 12)) * m.scale + (o.travelDistance || 0) * .14,
      vz: R.range(-20, 20),
      vh: R.range(10, 65),
      size: R.next() < .24 ? 2 : 1,
      life: Math.min(.42, .99 - birth),
      seed: R.int(0, 10000),
    });
  }
  return list;
}

function spray(p, C, d, t, front) {
  const u = t - d.birth;
  if (u < 0 || u > d.life || (d.z >= 0) !== front) return;
  const land = (d.vh + Math.sqrt(d.vh * d.vh + 1320 * d.h)) / 660;
  const k = 1 - smooth(d.life - .12, d.life, u);
  if (u < land) {
    const x = d.x + d.vx * u, y = (d.z + d.vz * u) * .32 - d.h - d.vh * u + 330 * u * u;
    bead(p, x, y, d.vx, d.vz * .32 - d.vh + 660 * u, d.size, C, k);
    if (d.size > 1) p.glow(x, y, 3, C[4], k * .08);
  } else {
    const age = u - land, x = d.x + d.vx * land, z = (d.z + d.vz * land) * .32;
    ring(p, x, z, 1 + age * 25, .3, k * (1 - smooth(.02, .13, age)) * .45, C, {
      n: 1, half: front ? 1 : -1, seed: d.seed, hot: false,
    });
  }
}

// Staggered sheets roll out under the body. Each row has a different birth and curl.
function waterSheets(p, C, t, s, seed, front) {
  const sites = [[27, .05, 22], [71, .12, 27], [123, .19, 23], [174, .27, 29], [226, .34, 24], [278, .42, 20]];
  for (let i = 0; i < sites.length; i++) {
    const [x, birth, radius] = sites[i], age = t - birth;
    if (age < 0 || age > .42) continue;
    const u = age / .42, k = Math.sin(u * Math.PI) * (1 - smooth(.84, 1, t));
    const side = front ? 1 : -1, drift = side * (3 + 11 * u);
    softShade(p, x - radius, drift - 3, x + radius, drift + 3, (px, py, out) => {
      const q = (px - x) / radius;
      const crest = drift + Math.sin(q * Math.PI + i * .8) * 1.4;
      const d = Math.abs(py - crest);
      if (Math.abs(q) > 1 || d > 2) return;
      out.c = C[d < .55 ? 5 : d < 1.2 ? 3 : 2];
      out.a = k * (1 - Math.abs(q)) * (front ? .6 : .35);
    });
    for (let j = 0; j < 3; j++) {
      const xx = x + (j - 1) * 7 - age * (5 + j * 4);
      const yy = drift - 1 + Math.sin(i + j * 2 + u * 3);
      const size = (1.1 + j * .35) * k;
      if (size > .2) billow(p, xx, yy, size, C, front ? .65 : .4);
    }
  }
}

function bowFoam(p, C, t, s, seed, front) {
  for (let i = 0; i < 9; i++) {
    const side = i % 2 ? 1 : -1;
    if ((side > 0) !== front) continue;
    const born = .1 + i * .025, age = t - born;
    if (age < 0 || age > .35) continue;
    const k = Math.sin(age / .35 * Math.PI) * s[8];
    const x = 300 - age * (30 + i * 3);
    const y = side * (3 + age * 18) - Math.sin(age / .35 * Math.PI) * (5 + i % 3 * 2);
    billow(p, x, y, (1.3 + i % 3 * .45) * k, C, .75);
    haze(p, x - 2, y + 2, 5, C[3], k * .12);
  }
}

// Each water deposit remembers the wave position at birth. It expands at that
// world position rather than sliding along with the traveling crest.
function depositedWake(p, C, t, o, front) {
  for (let i = 0; i < 20; i++) {
    const birth = .035 + i * .039, age = t - birth;
    if (age <= 0 || age > .34) continue;
    const m = travelPose(birth, o), s = pose(birth);
    const x = m.front - 16 * m.scale;
    const u = age / .34, k = Math.sin(u * Math.PI) * (1 - smooth(.88, 1, t));
    const width = 7 + age * (40 + i % 4 * 6);
    const side = front ? 1 : -1;
    ring(p, x, 0, width, .32, k * .35, C,
      { n: 1, half: side, seed: o.seed + i * 17, hot: false, wob: .8 });
    for (let j = 0; j < 4; j++) {
      const xx = x + (j - 1.5) * width * .35;
      const y = side * (3 + u * 12) + Math.sin(i * 1.9 + j) * 2;
      const size = (1.1 + j % 2 * .7) * k * (.5 + s[1]);
      billow(p, xx, y - 1, size, C, k * .65);
      p.line(xx - 3, y, xx + 3, y, C[3], k * .4);
    }
    if (!front) pool(p, x, 0, width * 1.3, width * .27, C[3], k * .07);
  }
}

export function drawBack(p, t, o) {
  t = Math.round(t * 1e9) / 1e9;
  if (t <= 0 || t >= meta.duration) return;
  const C = fit(o.palette, 8), s = pose(t), q = movingPainter(p, t, o);
  depositedWake(p, C, t, o, false);
  bowBurst(p, C, t, o, false);
  waterSheets(q, C, t, s, o.seed, false);
  pressure(q, C, t, s, false);
  for (const d of droplets(o.seed, o)) spray(p, C, d, t, false);
  bowFoam(q, C, t, s, o.seed, false);
}

export function draw(p, t, o) {
  t = Math.round(t * 1e9) / 1e9;
  if (t <= 0 || t >= meta.duration) return;
  const C = fit(o.palette, 8), s = pose(t), q = movingPainter(p, t, o);
  launch(p, C, t);
  body(q, C, t, s, o.seed);
  crest(q, C, t, s, o.seed);
  // The sculpted upper current leads; the lower current breaks into foam.
  dragonCurrent(q, C, t, s, o.seed);
  pressure(q, C, t, s, true);
  fallingLace(q, C, t, s, o.seed);
  breakingLip(q, C, t, s, o.seed);
  for (const x of [48, 108, 172, 232]) {
    const y = spine(x, s), k = cohesion(x, y, t, s, o.seed);
    haze(q, x, y + 7, 10, C[3], k * .12);
    q.glow(x, y - 4, 15, C[3], k * s[7] * .06);
  }
  bowFoam(q, C, t, s, o.seed, true);
  waterSheets(q, C, t, s, o.seed, true);
  depositedWake(p, C, t, o, true);
  bowBurst(p, C, t, o, true);
  for (const d of droplets(o.seed, o)) spray(p, C, d, t, true);
}
