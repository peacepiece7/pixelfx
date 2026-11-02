import { Rng, fit, smooth, clamp, TAU, band, sparkle } from "../../core/index.js";

export const meta = {"name": "Rosilia reload ready", "desc": "One small side-mounted brass magazine and paired exchange arrows pulse while a reload reservation is held.", "tags": ["status", "loop"], "size": [64, 64], "origin": [32, 56], "duration": 1, "loop": true, "fps": 30, "bg": "ground", "actor": 2, options: { palette: ["#251b19", "#564239", "#866a46", "#b59a63", "#ddc98a", "#f7e9bd", "#ffffff"], seed: 17 } };

export function draw(p,t,o){
 const C=fit(o.palette,7),R=new Rng(o.seed),k=.65+.25*Math.sin(t*TAU+R.range(0,TAU)),x=-22,y=-23+Math.sin(t*TAU)*.7;
 p.poly([[x-3,y-6],[x+2,y-6],[x+3,y+5],[x-2,y+6]],C[1],k);
 p.polyline([[x-3,y-6],[x+2,y-6],[x+3,y+5]],C[4],k);
 for(let i=0;i<3;i++)p.line(x-2,y-3+i*3,x+1,y-3+i*3,C[3],k);
 p.polyline([[x-5,y-5],[x-7,y-2],[x-7,y+3],[x-5,y+5]],C[3],k);
 p.polyline([[x+5,y+5],[x+7,y+2],[x+7,y-3],[x+5,y-5]],C[3],k);
 p.tri(x-5,y+5,x-8,y+3,x-5,y+2,C[4],k);p.tri(x+5,y-5,x+8,y-3,x+5,y-2,C[4],k);
 p.glow(x,y,11,C[3],k*.2);
 const scan=((t+R.next())%1+1)%1;
 p.line(x-2,y-5+scan*10,x+1,y-5+scan*10,C[5],Math.sin(scan*Math.PI)*.8);
 p.glow(x,y-5+scan*10,4,C[4],Math.sin(scan*Math.PI)*.18);
}
