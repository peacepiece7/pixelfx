import { Rng, fit, smooth, clamp, TAU, band, sparkle } from "../../core/index.js";

export const meta = {"name": "Aorbion sea response", "desc": "mode travel shows a small sea-dragon crest; mode claw rims the actor claws with water light. Host-owned buff lifetime, not an extra attack.", "tags": ["water", "loop"], "size": [80, 80], "origin": [40, 66], "duration": 5, "loop": true, "fps": 30, "bg": "ground", "actor": 2, options: { palette: ["#071e38", "#0c4169", "#147d9c", "#32b9d0", "#8de8ed", "#e3ffff"], seed: 17, mode: "travel" } };

export function draw(p,t,o){const C=fit(o.palette,6),R=new Rng(o.seed),k=.7+.2*Math.sin(t*TAU/5+R.range(0,TAU));
 if(o.mode==='claw'){
  const a=o.actor,cy=a?.chest?.[1]??-30;
  for(const side of [-1,1])for(let j=0;j<3;j++){const x=side*(12+j*2),y=cy+9+j;p.polyline([[x,y],[x+side*2,y-4],[x+side*1.5,y-7]],C[4],k);p.glow(x,y-3,3,C[3],k*.12);}
 }else{
  const x=-22,y=-42;p.polyline([[x-5,y+5],[x+1,y+2],[x-2,y-1],[x+2,y-4],[x+6,y-2],[x+3,y+1],[x+2,y+6],[x-3,y+8]],C[4],k);
  p.line(x+1,y-4,x,y-7,C[3],k);p.dot(x+4,y-2,C[5],k);p.glow(x,y,7,C[3],k*.1);
 }
}

