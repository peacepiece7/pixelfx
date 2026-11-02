import { Rng, fit, smooth, clamp, TAU, band, sparkle } from "../../core/index.js";

export const meta = {"name": "Rosilia infinite magazine", "desc": "Thin brass orbits and circulating bullet echoes surround the rifle; a restrained infinity mark sits clear of the muzzle. intro is a host-controlled refill flash.", "tags": ["status", "loop"], "size": [96, 80], "origin": [48, 66], "duration": 1, "loop": true, "fps": 30, "bg": "ground", "actor": 2, options: { palette: ["#251b19", "#564239", "#866a46", "#b59a63", "#ddc98a", "#f7e9bd", "#ffffff"], seed: 17, intro: 0 } };

function orbit(p,t,o,back){
 const C=fit(o.palette,7),R=new Rng(o.seed),phase=R.range(0,TAU),intro=clamp(o.intro??0);
 for(let i=0;i<100;i++){const a=i*TAU/100;if((Math.sin(a)<0)!==back)continue;
  p.blend(8+Math.cos(a)*27,-27+Math.sin(a)*9,C[3],.5);}
 for(let i=0;i<3;i++){const a=t*TAU+phase+i*TAU/3;if((Math.sin(a)<0)!==back)continue;
  const x=8+Math.cos(a)*27,y=-27+Math.sin(a)*9,dx=-Math.sin(a)*2,dy=Math.cos(a);
  p.line(x-dx,y-dy,x+dx,y+dy,C[4]);p.dot(x+dx,y+dy,C[6]);p.glow(x,y,4,C[3],.12+intro*.2);}
}
export function drawBack(p,t,o){orbit(p,t,o,true);}
export function draw(p,t,o){
 orbit(p,t,o,false);const C=fit(o.palette,7),pts=[];
 for(let i=0;i<=48;i++){const a=i*TAU/48;pts.push([-19+5*Math.cos(a),-43+2*Math.sin(2*a)]);}p.polyline(pts,C[4],.75);
 const k=clamp(o.intro??0);if(k){p.glow(-19,-43,10,C[5],k*.3);p.glowLine(-24,-43,-14,-43,3,C[6],k*.25);}
}
