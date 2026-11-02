import { oval } from "./_lib.js";
import { TAU, WHITE, ease } from "../../core/index.js";
import { AURORA, colors, envelope } from "./_adelvin.js";
export const meta={name:"Adelvin aurora bloom",desc:"An airy cyan veil lifts behind a compact ivory impact, then folds into gold flecks. A wide rod hit stays translucent so crowds remain readable.",tags:["holy","adelvin","aurora","impact","one-shot"],size:[160,128],origin:[80,86],duration:0.65,loop:false,fps:30,bg:"ground",options:{palette:AURORA,radius:36,seed:37}};
export function draw(p,t,o){
 const a=envelope(t,meta.duration);if(!a)return;const C=colors(o),u=t/meta.duration,r=o.radius*ease.outCubic(Math.min(1,u*2));
 for(let k=0;k<5;k++){const x=(k-2)*r*0.4,h=(24+9*Math.cos(k*1.6))*Math.sin(Math.PI*u);
  p.beam(x,1,x+Math.sin(u*TAU+k)*4,-h,2,C[2+k%3],a*0.42);
  p.line(x,-h,x+2,-h-3,C[5],a*0.7);
  p.line(x+2,-h+2,x+Math.sin(u*TAU+k)*4,0,C[3],a*0.45);}
 oval(p,0,0,r,r*0.3,C[4],a*(1-u));
 if(u<0.2){p.line(-8,0,8,0,WHITE,a*(1-u*5));p.line(0,-8,0,5,C[6],a*(1-u*5));}
 p.glow(0,-6,22,C[3],a*(1-u)*0.22);
}
