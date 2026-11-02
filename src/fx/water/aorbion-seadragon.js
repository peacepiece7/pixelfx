import { Rng, fit, smooth, clamp, TAU, band, sparkle } from "../../core/index.js";

export const meta = {"name": "Aorbion sea dragon", "desc": "A translucent 300px water dragon faces right along a 50px travel lane; the host owns its position, direction and stored speed.", "tags": ["water", "one-shot"], "size": [336, 104], "origin": [16, 66], "duration": 1, "loop": false, "fps": 30, "bg": "ground", options: { palette: ["#071e38", "#0c4169", "#147d9c", "#32b9d0", "#8de8ed", "#e3ffff"], seed: 17 } };

export function draw(p,t,o){if(t<0||t>=meta.duration)return;const C=fit(o.palette,6),R=new Rng(o.seed),phase=R.range(0,TAU),fade=smooth(0,.06,t)*(1-smooth(.8,1,t));
 const spine=[];for(let i=0;i<=120;i++){const x=i*2.5,q=x/300,y=-20+Math.sin(q*TAU*2-t*TAU*2+phase)*(3+8*(1-q)),w=(2+12*Math.sin(q*Math.PI))*fade;
  if(i>0){const a=spine.at(-1);p.beam(a[0],a[1],x,y,w,C[2],fade*.5);p.line(a[0],a[1]-w*.3,x,y-w*.3,C[4],fade*.85);}spine.push([x,y]);}
 const [x,y]=spine.at(-1);p.poly([[x-20,y-7],[x-8,y-11],[x+1,y-4],[x+2,y+3],[x-14,y+7]],C[3],fade);
 p.polyline([[x-20,y-7],[x-8,y-11],[x+1,y-4]],C[5],fade);p.line(x-15,y-8,x-21,y-17,C[4],fade);p.line(x-9,y-10,x-12,y-20,C[5],fade);
 p.poly([[x-20,y+4],[x-9,y+10],[x-1,y+8],[x+2,y+3],[x-8,y+5]],C[1],fade);
 p.polyline([[x-7,y+3],[x+2,y+3],[x+3,y+1]],C[5],fade);
 p.tri(x-2,y+3,x-4,y+7,x-5,y+3,C[5],fade);p.line(x-18,y+4,x-26,y+10,C[3],fade);
 p.dot(x-5,y-4,C[5],fade);p.glow(x-5,y-4,5,C[4],fade*.25);
 for(let j=0;j<16;j++){const q=R.next(),xx=q*280,yy=-20+Math.sin(q*TAU*2-t*TAU*2+phase)*(3+8*(1-q));p.line(xx,yy,xx-6,yy-7,C[3],fade*.7);}
}

