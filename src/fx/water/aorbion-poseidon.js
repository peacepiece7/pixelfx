import { Rng, fit, smooth, clamp, TAU, band, sparkle } from "../../core/index.js";

export const meta = {"name": "Aorbion Poseidon", "desc": "Three water pillars orbit an attached radius-70 zone; pulse is brightness only and never adds visual hits. The host retains or removes the zone.", "tags": ["water", "loop"], "size": [168, 144], "origin": [84, 105], "duration": 6, "loop": true, "fps": 30, "bg": "ground", "actor": 2, options: { palette: ["#071e38", "#0c4169", "#147d9c", "#32b9d0", "#8de8ed", "#e3ffff"], seed: 17, pulse: null } };

function layer(p,t,o,back){const C=fit(o.palette,6),R=new Rng(o.seed),phase=R.range(0,TAU),pulse=Number.isFinite(o.pulse)?clamp(o.pulse):(.5+.5*Math.cos(t*TAU*2));
 band(p,0,0,70,.26,.7,.35,[C[0],C[1],C[2],C[3]],a=>(Math.sin(a)<0)===back);
 for(let i=0;i<3;i++){const a=t*TAU/6+i*TAU/3+phase;if((Math.sin(a)<0)!==back)continue;
  const x=Math.cos(a)*60,y=Math.sin(a)*60*.26,h=29+3*Math.sin(t*TAU+i);
  for(let yy=0;yy<h;yy++){const w=4-yy/h,cx=x+Math.sin(yy*.2+t*TAU*2+i)*1.5;p.line(cx-w,y-yy,cx+w,y-yy,C[2],.5);}
  for(let j=0;j<3;j++){const dx=(j-1)*3+Math.sin(t*TAU*2+i+j);p.beam(x+dx,y,x+dx*.5,y-h,1.8,C[j===1?4:2],.7);}
  p.ellipse(x,y-h,6,2,C[4],.6);
  for(let j=0;j<5;j++){const q=((t*2+j/5)%1+1)%1;p.dot(x+Math.sin(j*2+q*6)*8,y-h+q*15,C[4],Math.sin(q*Math.PI)*.7);}
  p.glow(x,y-h*.5,11,C[3],.12+pulse*.12);
  band(p,x,y,11,.22,.8,.7,[C[1],C[2],C[3],C[4]]);
 }
}
export function drawBack(p,t,o){layer(p,t,o,true);}
export function draw(p,t,o){layer(p,t,o,false);}

