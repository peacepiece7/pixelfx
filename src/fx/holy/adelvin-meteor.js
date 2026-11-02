import { Rng, ease, TAU, WHITE, sparkle } from "../../core/index.js";
import { AURORA, colors, envelope, orb } from "./_adelvin.js";
export const IMPACT=0.3;
export const meta={name:"Gabriel ivory meteor",desc:"A fixed cyan warning ellipse precedes one falling ivory sphere at 0.3s. A compact white contact, aurora curtain and two low ripples fade without fire or smoke.",tags:["holy","adelvin","gabriel","meteor","impact","one-shot"],size:[272,224],origin:[136,166],duration:1.15,loop:false,fps:30,bg:"ground",options:{palette:AURORA,radius:70,seed:53}};
export function create(o){
 const C=colors(o),R=new Rng(o.seed),bits=Array.from({length:24},()=>({a:R.range(0,TAU),d:R.range(0.45,1),h:R.range(8,33)}));let t=0;
 function ground(p,back){
  const alpha=envelope(t,meta.duration);if(!alpha)return;
  const age=t-IMPACT,r=age<0?o.radius*(0.88+0.12*t/IMPACT):o.radius;
  for(let i=0;i<180;i++){const g=i*TAU/180;if((Math.sin(g)<0)!==back)continue;
   p.dot(Math.cos(g)*r,Math.sin(g)*r*0.27,C[age<0?3:5],alpha*(age<0?0.55:Math.max(0,1-age/0.65))*0.8);}
  if(age>=0)for(let echo=0;echo<2;echo++){const u=(age-echo*0.08)/0.52;if(u<0||u>=1)continue;const rr=o.radius*ease.outCubic(u);
   for(let k=0;k<120;k++){const g=k*TAU/120;if((Math.sin(g)<0)!==back)continue;p.dot(Math.cos(g)*rr,Math.sin(g)*rr*0.27,C[echo?3:5],alpha*(1-u)*0.8);}}
 }
 return {update(dt){t+=dt;},drawBack(p){ground(p,true);},draw(p){
  const alpha=envelope(t,meta.duration);if(!alpha)return;ground(p,false);
  if(t<IMPACT){
   if(t>0.08){const u=(t-0.08)/(IMPACT-0.08),y=-118*(1-ease.inCubic(u));
    p.beam(0,y-24,0,y,7,C[3],alpha*0.6);p.glowLine(0,y-27,0,y,10,C[4],alpha*0.12);orb(p,0,y,12+u*6,C,alpha,t*12);}
   return;
  }
  const age=t-IMPACT,u=Math.min(1,age/0.7);
  if(age<0.14){const k=1-age/0.14;sparkle(p,0,-3,24*k,WHITE,C[5],alpha);p.glow(0,-4,37,C[4],k*0.35);}
  if(age<0.23){const k=1-age/0.23;orb(p,0,-4,12*k,C,alpha*k,age*8);}
  for(let k=0;k<7;k++){const x=(k-3)*12,h=(36+9*Math.cos(k*1.7))*Math.sin(Math.PI*u);
   p.beam(x,0,x+Math.sin(k+u*TAU)*5,-h,2,C[2+k%3],alpha*(1-u)*0.42);}
  for(const b of bits){const q=Math.min(1,age/0.74),d=o.radius*b.d*ease.outCubic(q),x=Math.cos(b.a)*d,y=Math.sin(b.a)*d*0.25-Math.sin(q*Math.PI)*b.h;
   p.line(x,y,x-2*Math.cos(b.a),y+3,C[q<0.35?6:3],alpha*(1-q));}
 }};
}
