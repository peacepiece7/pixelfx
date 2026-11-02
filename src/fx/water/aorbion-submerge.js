import { Rng, fit, smooth, clamp, TAU, band, sparkle } from "../../core/index.js";

export const meta = {"name": "Aorbion submerge", "desc": "The actor vanishes under thin surface ripples and bubbles at the host position. Removing the effect restores the actor immediately.", "tags": ["water", "loop"], "size": [80, 64], "origin": [40, 47], "duration": 0.5, "loop": true, "fps": 30, "bg": "ground", "actor": 2, options: { palette: ["#071e38", "#0c4169", "#147d9c", "#32b9d0", "#8de8ed", "#e3ffff"], seed: 17 } };

export const actorAlpha=()=>0;
// Preview-only host motion. Combat continues to supply the real position.
export const previewMotion = { distance: 120, duration: 0.5, rest: 0.65 };
export function draw(p,t,o){const C=fit(o.palette,6),R=new Rng(o.seed),u=((t/.5)%1+1)%1;
 for(let i=0;i<3;i++){const q=(u+i/3)%1;band(p,0,0,7+q*20,.2,.7,Math.sin(q*Math.PI)*.65,[C[1],C[2],C[3],C[4]]);}
 for(let i=0;i<7;i++){const phase=R.next(),x=R.range(-18,18),q=(u+phase)%1,y=-2-q*10;
  p.ring(x,y,1+q,.7,C[4],Math.sin(q*Math.PI)*.65);}
 p.glow(0,0,16,C[2],.08);
}
