import { Rng, fit, smooth, clamp, TAU, band, sparkle } from "../../core/index.js";

export const meta = {"name": "Rosilia target reticle", "desc": "A small brass crosshair tracks a marked target; only an external pulse brightens the current shot target.", "tags": ["projectiles", "loop"], "size": [48, 56], "origin": [24, 52], "duration": 1, "loop": true, "fps": 30, "bg": "ground", "actor": 2, options: { palette: ["#251b19", "#564239", "#866a46", "#b59a63", "#ddc98a", "#f7e9bd", "#ffffff"], seed: 17, pulse: 0 } };

export function draw(p,t,o){
 const C=fit(o.palette,7),R=new Rng(o.seed),pulse=clamp(o.pulse??0),a=t*TAU+R.range(0,TAU),y=-26;
 for(let i=0;i<4;i++){const angle=i*TAU/4;p.arc(0,y,19.5,1,angle+.17,angle+1.1,C[3],.7+pulse*.3);
  const x=Math.cos(angle),s=Math.sin(angle);p.line(x*15,y+s*15,x*21,y+s*21,C[4]);}
 p.arc(0,y,17,1,a,a+.5,C[5],.45+pulse*.5);
 if(pulse>0){p.glowRing(0,y,19,3,C[4],pulse*.35);p.line(-3,y,3,y,C[6],pulse);p.line(0,y-3,0,y+3,C[6],pulse);}
}

