import { haze, pool, softBand } from "../_soft.js";
import { Rng, fit, smooth, clamp, TAU, band, sparkle } from "../../core/index.js";

export const meta = {
  name: "Rosilia support shot",
  desc: "A falling ivory tracer snaps into a bright contact, then a low dust skirt expands over warm clustered impact marks and settles inside a quiet compact ground reticle.",
  tags: ["projectiles", "impact", "debris", "loop"],
  size: [200, 120], origin: [100, 87], duration: 2, loop: true, fps: 30, bg: "ground",
  options: {
    palette: ["#251b19", "#564239", "#866a46", "#b59a63", "#ddc98a", "#f7e9bd", "#ffffff"],
    radius: 62, seed: 17, pulse: 0,
  },
};

// pulse is an external 1 -> 0 event envelope. It never schedules another shot.
export function drawBack(p, t, o) {
  const C=fit(o.palette,7), k=clamp(o.pulse??0), u=1-k;
  const breath=.5+.5*Math.sin(t*TAU/meta.duration), r=o.radius;
  // Segmented perimeter and four inward brackets remain readable under the dust.
  softBand(p,0,0,r,.24,1.5,.32+breath*.12,C.slice(1,5),a=>Math.cos(a*4)<.94);
  pool(p,0,0,r,22,C[2],.045+breath*.025);
  for(const side of [-1,1]) {
    p.line(side*(r-8),0,side*(r-2),0,C[4],.8);
    p.line(0,side*17,0,side*21,C[4],.8);
  }
  if(!k)return;
  const hit=smooth(.04,.1,u), spread=1-(1-clamp((u-.06)/.72))**3;
  const heat=(1-smooth(.16,.68,u))*hit, fade=1-smooth(.55,1,u);
  pool(p,0,-1,20+spread*54,7+spread*12,C[4],heat*.65);
  softBand(p,0,1,5+spread*66,.24,5*(1-spread)+1,fade*.55*hit,C.slice(1,6));
  const R=new Rng(o.seed);
  for(let i=0;i<9;i++) {
    const a=R.range(0,TAU),d=R.range(3,19),x=Math.cos(a)*d,y=Math.sin(a)*d*.27;
    // Uneven overlapping contact shadows, then warm rims cooling into dust.
    haze(p,x,y, R.range(3,7)*( .5+spread*.5),C[0],hit*fade*.45);
    p.line(x-2,y,x+2,y-1,C[2],fade*hit*.65);
  }
}

export function draw(p,t,o) {
  const k=clamp(o.pulse??0); if(!k)return;
  const C=fit(o.palette,7), R=new Rng(o.seed), u=1-k;
  const hit=smooth(.035,.075,u), flash=hit*(1-smooth(.11,.27,u));
  const head=clamp(u/.065), tail=clamp((u-.045)/.14);
  // The tip arrives first; the stretched wake catches up and narrows behind it.
  if(head>tail) {
    const x0=-83*(1-tail),y0=-81*(1-tail),x1=-83*(1-head),y1=-81*(1-head);
    p.glowLine(x0,y0,x1,y1,9,C[4],.3*(1-tail));
    p.beam(x0,y0,x1,y1,4*(1-tail)+.5,C[4]);
    p.line(x0,y0,x1,y1,C[6]);
  }
  p.glow(0,-3,42,C[3],flash*.6);
  p.glow(0,-3,15,C[5],flash*.8);
  sparkle(p,0,-2,13*flash,C[6],C[4],flash);
  // A low pressure skirt rolls out, while the central dust lifts and thins.
  for(let i=0;i<18;i++) {
    const a=R.range(0,TAU),delay=R.range(.05,.15),q=clamp((u-delay)/(.95-delay));
    const drift=1-Math.exp(-q*3),d=R.range(32,64)*drift;
    const x=Math.cos(a)*d,y=Math.sin(a)*d*.22-q*R.range(3,14);
    const alpha=smooth(0,.13,q)*(1-smooth(.35,1,q));
    const size=R.range(4,8)*( .5+q*1.5);
    haze(p,x,y,size,C[2],alpha*.42);
    haze(p,x-1,y-size*.25,size*.7,C[4],alpha*.2);
  }
  // Few broad earth plates lift under the shot, then drop; avoid fine crack noise.
  for(let i=0;i<6;i++) {
    const a=R.range(0,TAU),age=Math.max(0,u-.06)*.35,sp=R.range(45,95);
    const x=Math.cos(a)*sp*age,y=Math.sin(a)*sp*age*.2-65*age+230*age*age;
    const f=hit*(1-smooth(.45,.9,u)),w=R.range(2.5,4.5)*(1-smooth(.55,.95,u));
    p.poly([[x-w,y],[x-w*.5,y-w*.6],[x+w,y-w*.3],[x+w*.7,y+w*.5]],C[1],f);
    p.line(x-w*.5,y-w*.6,x+w,y-w*.3,C[3],f);
  }
  for(let i=0;i<22;i++) {
    const a=R.range(-Math.PI,0),v=R.range(70,190),delay=R.range(.04,.12),age=Math.max(0,u-delay)*.35;
    const life=R.range(.2,.3),f=smooth(0,.015,age)*(1-smooth(life*.45,life,age));
    if(!f)continue;
    const x=Math.cos(a)*v*(1-Math.exp(-age*5))/5,y=Math.sin(a)*v*age+340*age*age;
    const brass=i%4===0;
    p.line(x-Math.cos(a)*3*f,y-Math.sin(a)*3*f,x,y,C[brass?4:2],f);
    p.dot(x,y,C[brass?5:3],f);
    if(brass)p.glow(x,y,3,C[4],f*.17);
  }
}
