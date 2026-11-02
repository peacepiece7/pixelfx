import { oval } from "./_lib.js";
import { Rng, WHITE, TAU, ease, sparkle } from "../../core/index.js";
import { AURORA, colors, envelope } from "./_adelvin.js";
export const meta={name:"Adelvin orb impact",desc:"A compact ivory star cracks into cyan crystal-like light shards, with a thin gold echo. No fire, smoke, persistent zone or extra damage pulse.",tags:["holy","adelvin","impact","orb","one-shot"],size:[128,112],origin:[64,65],duration:0.55,loop:false,fps:30,bg:"dark",options:{palette:AURORA,radius:30,seed:31}};
export function create(o) {
 const C=colors(o),R=new Rng(o.seed),bits=Array.from({length:18},()=>({a:R.range(0,TAU),r:R.range(0.45,1),delay:R.range(0,0.05)}));let t=0;
 return {update(dt){t+=dt;},draw(p){
  const alpha=envelope(t,meta.duration);if(!alpha)return;
  if(t<0.14)sparkle(p,0,0,12*(1-t/0.14),WHITE,C[5],alpha);
  const u=Math.min(1,t/0.36),r=o.radius*ease.outCubic(u);
  oval(p,0,0,r,r*0.55,C[4],alpha*(1-u));
  for(const b of bits){const a=t-b.delay;if(a<0)continue;const q=Math.min(1,a/0.48),d=o.radius*b.r*ease.outCubic(q),x=Math.cos(b.a)*d,y=Math.sin(b.a)*d*0.75;
   p.line(x,y,x-Math.cos(b.a)*4*(1-q),y-Math.sin(b.a)*4*(1-q),q<0.3?C[6]:C[3],alpha*(1-q));}
  p.glow(0,0,24,C[3],alpha*(1-u)*0.3);
 }};
}
