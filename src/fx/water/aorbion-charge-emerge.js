import { Rng, fit, smooth, clamp, TAU, band, sparkle } from "../../core/index.js";

export const meta = {"name": "Aorbion charge emerge", "desc": "A single narrow 100px forward surge breaks the surface with three claw tracks and a trailing spray; fixed to the chosen emergence direction.", "tags": ["water", "one-shot"], "size": [144, 88], "origin": [25, 61], "duration": 0.65, "loop": false, "fps": 30, "bg": "ground", options: { palette: ["#071e38", "#0c4169", "#147d9c", "#32b9d0", "#8de8ed", "#e3ffff"], seed: 17 } };

export function create(o){const C=fit(o.palette,6),R=new Rng(o.seed),drops=Array.from({length:24},()=>({x:R.range(0,85),vx:R.range(-12,14),vy:R.range(-50,-15)}));let e=0,t=0;
 return {update(dt){e+=dt;t=Math.round(e*1e9)/1e9;},draw(p){if(t>=meta.duration)return;
  const grow=smooth(0,.12,t),fade=1-smooth(.2,.65,t);
  for(let i=0;i<45;i++){const x=i*2.2*grow,w=Math.sin(i/45*Math.PI)*5;
   p.line(x,-4-w,x,-4+w,C[2],fade*.45);p.blend(x,-4-w,C[4],fade*.8);}
  for(let j=0;j<3;j++){const pts=[];for(let i=0;i<=40;i++){const x=i*2.5*grow,y=-4+(j-1)*7+Math.sin(i/40*Math.PI)*(-9-j*2);pts.push([x,y]);}
   p.polyline(pts,C[j===1?5:3],fade);if(j===1)p.glowLine(0,-4,95*grow,-4,5,C[3],fade*.17);}
  for(const d of drops){const y=d.vy*t+100*t*t;if(y>4)continue;p.line(d.x+d.vx*t,y-2,d.x+d.vx*t,y,C[3],fade);p.dot(d.x+d.vx*t,y,C[5],fade);}
  if(t<.12)sparkle(p,3,-3,8*(1-t/.12),C[5],C[3]);
 }};}

