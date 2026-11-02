import { Rng, fit, smooth, clamp, TAU, band, sparkle } from "../../core/index.js";

export const meta = {"name": "Aorbion tail pillars", "desc": "Three or count supplied water geysers rise 35px apart along the target vertical line, each with a radius-30 foaming footprint.", "tags": ["water", "one-shot"], "size": [92, 260], "origin": [46, 177], "duration": 0.8, "loop": false, "fps": 30, "bg": "ground", options: { palette: ["#071e38", "#0c4169", "#147d9c", "#32b9d0", "#8de8ed", "#e3ffff"], seed: 17, count: 3 } };

// Metadata fits count <= 5; larger hosts may render up to 12 pillars in a taller viewport.
export function create(o){const C=fit(o.palette,6),R=new Rng(o.seed),n=clamp(Math.floor(Number.isFinite(o.count)?o.count:3),1,12),phases=Array.from({length:n},()=>R.range(0,TAU));let e=0,t=0;
 return {update(dt){e+=dt;t=Math.round(e*1e9)/1e9;},drawBack(p){if(t>=meta.duration)return;
  for(let i=0;i<n;i++){const y=(i-(n-1)/2)*35,k=smooth(i*.025,i*.025+.08,t)*(1-smooth(.4,.8,t));band(p,0,y,30,.23,1,k,[C[1],C[2],C[3],C[4]]);}},draw(p){if(t>=meta.duration)return;
  for(let i=0;i<n;i++){const y=(i-(n-1)/2)*35,u=t-i*.025;if(u<0)continue;const k=smooth(0,.08,u)*(1-smooth(.28,.65,u)),h=36*k;
   for(let yy=0;yy<h;yy++){const w=(7-yy/Math.max(1,h)*2),cx=Math.sin(yy*.2-u*15+phases[i])*2;
    p.line(cx-w,y-yy,cx+w,y-yy,C[2],k*.55);p.line(cx-w*.3,y-yy,cx+w*.2,y-yy,C[4],k*.6);}
   for(let j=0;j<3;j++){const x=(j-1)*5+Math.sin(u*17+phases[i]+j)*2;p.beam(x,y,x*.6,y-h,2.5,C[j===1?4:2],k);p.glowLine(x,y,x*.6,y-h,5,C[3],k*.1);}
   p.ellipse(0,y-h,9*k,2,C[5],k*.8);p.glow(0,y-h/2,15,C[3],k*.15);
   for(let j=0;j<8;j++){const a=j*TAU/8,x=Math.cos(a)*(8+u*18),dy=y-h-13*u+40*u*u;p.line(x,dy,x,dy+2,C[4],k);}
   for(let j=0;j<6;j++){const a=j*TAU/6+phases[i],x=Math.cos(a)*u*25,dy=-32*u+70*u*u;p.dot(x,y-h*.4+dy,C[4],k);}
  }
 }};}
