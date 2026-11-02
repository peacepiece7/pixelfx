import { Rng, fit, clamp, smooth, noise2, TAU } from "../../core/index.js";
import { bead, ring, billow } from "./_lib.js";
import { haze, pool, softShade } from "../_soft.js";

export const meta = {
  name: "Aorbion sea dragon",
  desc: "A huge ivory-crested sea dragon uncoils above a surging tidal wall, lunges with a swept mane and open water jaw, then tears into streaming spray and a foamy wake.",
  tags: ["water", "dragon", "ultimate", "charge", "one-shot"],
  size: [736, 208],
  origin: [48, 144],
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

// The silhouette is a grounded surge, not an articulated animal. The leading
// hollow is cut from the water volume; a short rolled lip suggests a snout.
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

// A serpentine water body uncoils above the lower tidal wall. The two cubic
// sections leave a large dark hollow under the neck so the dragon reads at 1x.
function dragonPath(u, t, s) {
  const stretch = smooth(.22, .7, t), L = Math.sqrt(lift(s));
  const cubic = (a,b,c,d,v) => (1-v)**3*a+3*(1-v)**2*v*b+3*(1-v)*v*v*c+v**3*d;
  let x,y;
  if(u<.55) {
    const v=u/.55;
    x=cubic(20, -5+stretch*65, 55+stretch*25, 153,v);
    y=cubic(-6,-46,-132+stretch*72,-111+stretch*57,v);
  } else {
    const v=(u-.55)/.45;
    x=cubic(153,207,224,278,v);
    y=cubic(-111+stretch*57,-122+stretch*65,-64+stretch*16,-67+stretch*25,v);
  }
  y+=Math.sin(u*10-t*13)*2*Math.sin(u*Math.PI);
  return [x,y*L];
}

function dragonCurrent(p, C, t, s, seed) {
  const k=smooth(.055,.19,t)*(1-smooth(.71,.97,t));
  if(k<.01)return;
  const L=Math.sqrt(lift(s)), nodes=[];
  const dissolve=smooth(.66,.96,t);
  // Broad flowing ribbons are shaded across the body, with broken ivory veins
  // travelling lengthwise. The underside remains cyan, not a solid white rod.
  for(let i=0;i<=100;i++) {
    const u=i/100,[x,y]=dragonPath(u,t,s);
    const [xx,yy]=dragonPath(Math.min(1,u+.004),t,s);
    const len=Math.hypot(xx-x,yy-y)||1;
    nodes.push({x,y,u,nx:-(yy-y)/len,ny:(xx-x)/len,
      w:(2+Math.sin(u*Math.PI*.85)*15)*L});
  }
  const columns=new Array(321);
  for(let i=1;i<nodes.length;i++) {
    const a=nodes[i-1],b=nodes[i];
    for(let x=Math.ceil(a.x);x<=b.x;x++) {
      const v=(x-a.x)/(b.x-a.x||1);
      columns[x]={y:a.y+(b.y-a.y)*v,u:a.u+(b.u-a.u)*v,
        w:Math.min(32*L,(a.w+(b.w-a.w)*v)/Math.max(.25,Math.abs(a.ny)))};
    }
  }
  const flowCells=new Map();
  // Clip each eight-pixel strip to occupied water instead of shading the large
  // hollow beneath the dragon. This also bounds CPU cost for traveling previews.
  for(let block=0;block<280;block+=8) {
    let top=Infinity,bottom=-Infinity;
    for(let i=block;i<block+8;i++)if(columns[i]) {
      top=Math.min(top,columns[i].y-columns[i].w);
      bottom=Math.max(bottom,columns[i].y+columns[i].w);
    }
    if(top===Infinity)continue;
    softShade(p,block,top,block+8,bottom,(x,y,out)=>{
    if(x<block||x>=block+8)return;
    const c=columns[Math.floor(x)];
    if(!c)return;
    const across=(y-c.y)/c.w;
    if(Math.abs(across)>1)return;
    const cellX=Math.floor(x/3),cellY=Math.floor(y/2),key=cellX*256+cellY;
    let cell=flowCells.get(key);
    if(!cell) {
      cell=[Math.sin(c.u*35-t*24+across*9+Math.sin(c.u*13)*2),
        dissolve>0?noise2(cellX*.22,cellY*.27-t*7,seed+801):1];
      flowCells.set(key,cell);
    }
    const [flow,tear]=cell;
    if(dissolve>0&&tear<dissolve*1.25-.7)return;
    let level=across<-.72?7:across<-.4?5:across<.25?4:across<.72?3:2;
    if(flow>.72&&across>-.6&&across<.6)level+=2;
    out.c=C[level];out.a=k;
    out.l=C[4];out.k=across<-.7?k*.12:0;
    });
  }
  for(let i=15;i<95;i+=12) {
    const a=nodes[i];p.glow(a.x,a.y,16*L,C[4],k*.1);
  }
  // Thin curtains pulled from the belly join the dragon to its bow wave.
  for(let i=0;i<7;i++) {
    const u=.35+i*.085,[x,y]=dragonPath(u,t,s);
    const phase=(t*2.5+i*.19)%1,alpha=k*Math.sin(phase*Math.PI)*.52;
    const end=waveTop(x+15,t,s),length=Math.max(0,end-y);
    for(let dy=phase*length;dy<Math.min(length,phase*length+18*L);dy++) {
      const v=dy/(length||1),xx=x+v*22+Math.sin(v*5-t*12+i)*v*4;
      const yy=y+dy,fade=alpha*(1-v*.7)*(1-(dy-phase*length)/(18*L));
      p.blend(xx-1,yy,C[3],fade*.55);
      p.blend(xx,yy,C[5],fade);
      p.blend(xx+1,yy,C[6],fade*.45);
    }
  }
  // Long swept-back mane fins are fluid tongues: curved roots, tapered tips,
  // asynchronous bending, and white leading edges over darker turquoise folds.
  for(let i=0;i<19;i++) {
    const u=.28+i*.034,[x,y]=dragonPath(u,t,s);
    const wave=.5+.5*Math.sin(t*22+i*1.8);
    const length=(9+i%4*4+wave*8)*L;
    const root=3.5*L, tipX=x-length*(.65+u*.6),tipY=y-length*.85;
    p.poly([[x-5,y+2],[x+root,y-5*L],[tipX+5,tipY+6*L],[tipX,tipY],[x-9,y-3]],C[4],k);
    p.poly([[x,y-3*L],[x+root,y-5*L],[tipX,tipY],[tipX+6,tipY+8*L]],C[6],k);
    p.line(x+root,y-5*L,tipX,tipY,C[7],k*.8);
  }
  const [hx,hy]=dragonPath(1,t,s);
  // Distinct forehead, nose, open jaw and swept horn distinguish the head from
  // the rolling sea below. All geometry is water, with a dark mouth cutout.
  const head=(pts,c,alpha=k)=>p.poly(pts.map(([x,y])=>[hx+x,hy+y*L]),c,alpha);
  head([[-17,-10],[-5,-20],[8,-15],[17,-5],[33,-2],[36,5],[27,9],[12,6],[0,16],[-17,9]],C[4]);
  head([[-16,-10],[-5,-20],[8,-15],[17,-5],[32,-2],[33,2],[12,0],[0,-7]],C[7]);
  head([[-12,-12],[-28,-37],[-12,-25],[0,-15]],C[6]);
  head([[-12,-12],[-28,-37],[-20,-20]],C[3]);
  head([[1,5],[27,9],[18,12],[10,18],[-3,17]],C[2]);
  head([[-3,17],[10,18],[23,10],[18,18],[5,23],[-12,18]],C[5]);
  head([[2,-7],[12,-4],[7,0],[0,-1]],C[1]);
  p.beam(hx+3,hy-4*L,hx+10,hy-3*L,1,C[7],k);
  p.glow(hx+7,hy-4*L,7,C[5],k*.4);
  // Whiskers lag far behind the head and lash downward during the surge.
  for(let lane=0;lane<3;lane++) {
    let last=[hx+10,hy+(6+lane*3)*L];
    for(let j=1;j<=24;j++) {
      const v=j/24,x=hx+10-v*(48+lane*12);
      const y=hy+(6+lane*3+Math.sin(v*4-t*15+lane)*v*12)*L;
      p.line(last[0],last[1],x,y,C[lane===0?7:5],k*(1-v*.85));
      last=[x,y];
    }
  }
  // Water sheds from the moving dragon into the wall underneath; late breakup
  // preserves forward momentum instead of shrinking the animal in place.
  const R=new Rng(seed+904);
  for(let i=0;i<35;i++) {
    const u=R.range(.14,.94),phase=(t*2+R.next())%1;
    const [x,y]=dragonPath(u,t,s),speed=R.range(10,35);
    const xx=x+phase*speed,yy=y+phase*phase*45*L;
    const a=k*Math.sin(phase*Math.PI)*(.3+dissolve*.7);
    bead(p,xx,yy,speed,90*phase,1+i%3*.4,C,a);
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
  waterSheets(q, C, t, s, o.seed, false);
  for (const d of droplets(o.seed, o)) spray(p, C, d, t, false);
  bowFoam(q, C, t, s, o.seed, false);
}

export function draw(p, t, o) {
  t = Math.round(t * 1e9) / 1e9;
  if (t <= 0 || t >= meta.duration) return;
  const C = fit(o.palette, 8), s = pose(t), q = movingPainter(p, t, o);
  body(q, C, t, s, o.seed);
  crest(q, C, t, s, o.seed);
  // The dragon head now leads the upper current; the lower lip stays a wave.
  dragonCurrent(q, C, t, s, o.seed);
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
  for (const d of droplets(o.seed, o)) spray(p, C, d, t, true);
}
