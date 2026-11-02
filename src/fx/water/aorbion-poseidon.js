import { haze, pool, softBand } from "../_soft.js";
import { Rng, fit, smooth, clamp, TAU, sparkle } from "../../core/index.js";

export const meta = {"name": "Aorbion Poseidon", "desc": "Three water pillars orbit an attached radius-70 zone; pulse is brightness only and never adds visual hits. The host retains or removes the zone.", "tags": ["water", "loop"], "size": [168, 144], "origin": [84, 105], "duration": 6, "loop": true, "fps": 30, "bg": "ground", "actor": 2, options: { palette: ["#071e38", "#0c4169", "#147d9c", "#32b9d0", "#8de8ed", "#e3ffff"], seed: 17, pulse: null } };

function layer(p,t,o,back) {
 t=((t%6)+6)%6;
 const C=fit(o.palette,6),R=new Rng(o.seed),phase=R.range(0,TAU);
 const pulse=Number.isFinite(o.pulse)?clamp(o.pulse):(.5+.5*Math.cos(t*TAU*2));
 softBand(p,0,0,70,.26,1.4,.3,C.slice(0,4),a=>(Math.sin(a)<0)===back);
 for(let i=0;i<3;i++) {
  const a=t*TAU/6+i*TAU/3+phase;if((Math.sin(a)<0)!==back)continue;
  const x=Math.cos(a)*60,y=Math.sin(a)*60*.26,h=29+4*Math.sin(t*TAU+i);
  const depth=back?.7:1;
  pool(p,x,y,16,5,C[3],depth*(.15+pulse*.14));
  // A transparent moving volume, a pale winding ribbon and a spilling crown.
  for(let yy=0;yy<h;yy++) {
   const q=yy/h,cx=x+Math.sin(q*5-t*TAU*2+i)*2,w=4.5-q*1.5;
   for(let xx=-Math.ceil(w);xx<=Math.ceil(w);xx++) {
    const d=Math.abs(xx)/w;if(d>1)continue;
    p.blend(cx+xx,y-yy,C[d>.7?2:3],depth*(1-d*.7)*.45);
   }
   p.blend(cx+Math.sin(q*9-t*TAU*2)*2,y-yy,C[4],depth*.7);
  }
  haze(p,x,y-h,8,C[3],depth*.2);
  for(let j=0;j<7;j++) {
   const q=((t*2+j/7+i*.17)%1+1)%1,side=j%2?1:-1;
   const dx=side*(2+q*8),yy=y-h-10*Math.sin(q*Math.PI)+q*7;
   const fade=Math.sin(q*Math.PI)*depth;
   p.line(x+dx,yy,x+dx-side,yy-2,C[4],fade);
   p.blend(x+dx,yy,C[5],fade*.8);
  }
  p.glow(x,y-h*.6,15,C[3],depth*(.12+pulse*.15));
  const ripple=((t*2+i/3)%1+1)%1;
  softBand(p,x,y,7+ripple*10,.25,1.5,Math.sin(ripple*Math.PI)*.7,C.slice(1));
 }
}
export function drawBack(p,t,o){layer(p,t,o,true);}
export function draw(p,t,o){layer(p,t,o,false);}
