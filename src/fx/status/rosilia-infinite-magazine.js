import { Rng, fit, clamp, TAU, stockActor } from "../../core/index.js";
import { pool, softBand, softShade } from "../_soft.js";
import { shape } from "./_lib.js";

export const meta = {
  name: "Rosilia infinite magazine",
  desc: "Brass energy rises around the body and rifle: soft silhouette echoes peel outward, layered light ribbons surge upward, and motes lift from a breathing floor reflection.",
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
    time: t, sweep: (t + phase) % 1, intro: clamp(o.intro ?? 0) };
}

// Reference: status/haste's actual-mask echoes and dark-shroud's layered veil.
// These echoes stay behind the live actor; the host owns buff lifetime and removal.
function echoes(p, t, a, C, seed) {
  const S = shape(a), R = new Rng(seed + 93);
  for (let layer = 0; layer < 3; layer++) {
    const offset = R.next(), u = (t + offset) % 1;
    const strength = Math.sin(u * Math.PI) ** 2;
    const distance = 2 + u * (8 + layer * 2);
    for (const side of [-1, 1]) {
      const dx = side * distance, dy = -u * 3;
      for (const [x, y] of S.body) {
        // Interior bands travel upward while the outline retains the rifle shape.
        if ((y + Math.floor(t * 24)) % 4 !== layer % 4) continue;
        p.blend(a.x + x + dx, a.y + y + dy, C[3], strength * .075);
      }
      for (const [x, y] of S.outline) {
        p.blend(a.x + x + dx, a.y + y + dy, C[layer === 0 ? 5 : 4], strength * (.24 - layer * .045));
      }
    }
  }
}

function energy(p, t, a, C, seed, front) {
  const R = new Rng(seed + 151), cx = a.x + a.w / 2;
  const floor = a.y + a.h, height = Math.min(55, a.h + 12);
  if (!front) {
    // A continuous rising envelope ties the individual ribbons together. Its
    // narrow crown flickers above the head while the middle opens off the body.
    for (const side of [-1, 1]) {
      softShade(p,cx-35,a.y-12,cx+35,floor,(x,y,out)=>{
        const v=(floor-y)/height;
        if(v<0||v>1)return;
        const sway=Math.sin(v*17-t*TAU*2+side)*1.7;
        const axis=cx+side*(7+Math.sin(v*Math.PI)*15+sway);
        const width=2+Math.sin(v*Math.PI)*5;
        const edge=Math.max(0,1-Math.abs(x-axis)/width);
        const lift=.65+.35*Math.sin(v*12-t*TAU*2+side);
        const strength=Math.sin(v*Math.PI)*edge*edge*lift;
        out.c=C[4]; out.a=strength*.18;
        out.l=C[3]; out.k=strength*.23;
      });
    }
  }
  // Staggered tapered curtains climb the sides; no opaque screen over the face.
  for (let i = 0; i < 12; i++) {
    const side = i % 2 ? 1 : -1, offset = R.next();
    const lane = R.range(a.w * .36 + 3, a.w * .5 + 10);
    const length = R.range(14, 27), bend = R.range(2, 6);
    if ((i % 4 === 0) !== front) continue;
    const u = (t * 2 + offset) % 1;
    const fade = Math.sin(u * Math.PI) ** 2 * (front ? .45 : 1);
    const head = floor - u * height;
    // Shade every pixel of the tapered curtain: a bright leading lip, warm
    // translucent shoulder and a trailing skirt, rather than disconnected dots.
    const center = cx + side * (lane + Math.sin(u * Math.PI) * bend);
    softShade(p, center - 9, Math.max(a.y - 12, head), center + 9,
      Math.min(floor, head + length), (x, y, out) => {
        const q = (y - head) / length;
        const axis = center - side * (q * 4 + Math.sin(q * Math.PI) * 2);
        const width = .7 + Math.sin(q * Math.PI) * 2.4;
        const distance = Math.abs(x - axis);
        const feather = Math.max(0, 1 - distance / (width + 2));
        const life = fade * Math.sin(Math.PI * Math.min(1, q * 3)) * (1 - q);
        out.c = C[distance < .8 ? 5 : distance < width ? 4 : 3];
        out.a = life * feather * (distance < .8 ? .8 : .3);
        out.l = C[4]; out.k = life * feather * .13;
      });
    const hx = cx + side * (lane + Math.sin(u*Math.PI)*bend);
    p.glow(hx,head,6,C[4],fade*.16);
  }
  // Small bright beads lift in curved paths through the outside of the veil.
  for (let i = 0; i < 14; i++) {
    const offset=R.next(),side=i%2?1:-1,extent=R.range(9,23);
    if ((i%3===0)!==front) continue;
    const u=(t+offset)%1,fade=Math.sin(u*Math.PI)**2;
    const x=cx+side*(extent+u*4),y=floor-u*height;
    p.blend(x,y,C[5],fade*.75);
    p.blend(x-side*.3,y+2,C[3],fade*.45);
    p.glow(x,y,3,C[4],fade*.2);
  }
}

export function drawBack(p, t, o) {
  const { actor: a, C, breath, intro, time } = state(t, o);
  echoes(p,time,a,C,o.seed);
  energy(p,time,a,C,o.seed,false);
  const [cx, cy] = a.chest ?? [0, a.y + a.h * 0.45];
  // Light sits behind the silhouette, leaving the face and muzzle readable.
  p.glow(cx, cy, 28, C[3], 0.18 + breath * 0.3 + intro * 0.28);
  p.glow(cx, cy + a.h * 0.22, 16, C[4], 0.07 + breath * 0.08);
  const floor=a.y+a.h;
  pool(p,cx,floor,29,6,C[4],.12+breath*.12+intro*.2);
  for(let i=0;i<2;i++) {
    const u=(time+i*.5)%1;
    softBand(p,cx,floor,12+u*18,.20,1.7,Math.sin(u*Math.PI)*.25,C.slice(2,6));
  }
}

export function draw(p, t, o) {
  const { actor: a, C, breath, sweep, intro, time } = state(t, o), S = shape(a);
  energy(p,time,a,C,o.seed,true);
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
