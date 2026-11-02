import { Rng, ease, TAU, sparkle, fit, clamp } from '../../core/index.js';
import { AURORA, colors, envelope } from './_adelvin.js';
import { oval } from './_lib.js';
export const IMPACT=.3;
export const meta={name:'Gabriel golden meteor',desc:'A gold-white comet strikes at 0.3s: a radiant crown, folding light curtains, two ground waves and drifting star fragments. One fixed impact; no fire or smoke.',tags:['holy','adelvin','gabriel','meteor','impact','one-shot'],size:[272,224],origin:[136,166],duration:1.15,loop:false,fps:30,bg:'ground',options:{palette:AURORA,radius:70,seed:53}};
export function create(o){
 const input=colors(o);
 // Aurora's warm upper ramp now dominates; the cool dark endpoint supplies depth.
 // Derive all tones from the supplied palette so recoloring remains supported.
 const C=fit([input[0],input[5],input[6],input[7]],8),R=new Rng(o.seed);
 const bits=Array.from({length:42},(_,i)=>({a:R.range(0,TAU),d:R.range(.35,1),h:R.range(12,48),delay:R.range(0,.07),star:i%5===0}));
 const veils=Array.from({length:15},(_,i)=>({x:(i-7)*7,h:R.range(30,65),phase:R.range(0,TAU),delay:R.range(0,.045)}));
 let t=0,elapsed=0;
 function ground(p,back){
  const alpha=envelope(t,meta.duration);if(!alpha)return;
  const age=t-IMPACT,keep=g=>(Math.sin(g)<0)===back;
  if(age<0){
   const u=t/IMPACT,r=o.radius*(.88+.12*u);
   oval(p,0,0,r,r*.27,C[3],alpha*.65,keep);
   oval(p,0,0,r*.82,r*.22,C[2],alpha*.35,keep);
   for(let i=0;i<12;i++){
    const a=i*TAU/12;if(!keep(a))continue;
    const d=r-5+u*4;p.line(Math.cos(a)*d,Math.sin(a)*d*.27,Math.cos(a)*(d+3),Math.sin(a)*(d+3)*.27,C[5],alpha*.8);
   }
  }else for(let echo=0;echo<2;echo++){
   const u=(age-echo*.08)/.52;if(u<0||u>=1)continue;
   const r=o.radius*ease.outCubic(u),k=alpha*(1-u);
   oval(p,0,0,r,r*.27,C[echo?3:5],k,keep);
   oval(p,0,1,r-2,(r-2)*.27,C[2],k*.5,keep);
   for(let i=0;i<16;i++){
    const a=i*TAU/16+echo*.13;if(!keep(a))continue;
    const x=Math.cos(a)*r,y=Math.sin(a)*r*.27;
    p.line(x,y,x+Math.cos(a)*4*(1-u),y+Math.sin(a)*2*(1-u),C[6],k);
   }
  }
 }
 function descent(p,alpha){
  if(t<=.065)return;
  const u=clamp((t-.065)/(IMPACT-.065)),y=-118*(1-ease.inCubic(u)),r=7+u*7;
  // A tapered luminous wake, edged with separated corkscrew strands.
  for(let j=0;j<25;j++){
   const v=j/25,yy=y-v*30,k=alpha*(1-v),w=(1-v)*r*.55;
   p.line(-w,yy,w,yy,C[v<.3?5:2],k);
   p.dot(Math.sin(t*30-v*8)*r*(.5+v*.4),yy,C[5],k);
  }
  p.circle(0,y,r+1,C[2],alpha);p.circle(0,y,r,C[4],alpha);
  p.circle(-1,y-1,r*.68,C[6],alpha);p.circle(-2,y-2,r*.35,C[7],alpha);
  for(let i=0;i<4;i++){
   const a=t*18+i*TAU/4,xx=Math.cos(a)*(r+4),yy=y+Math.sin(a)*(r+4)*.6;
   p.line(xx,yy,xx,yy-5-u*4,C[4],alpha*.8);
   p.dot(xx,yy,C[6],alpha);
  }
  p.glow(0,y,23,C[4],alpha*.23);
 }
 function burst(p,age,alpha){
  if(age<.13){
   const k=1-age/.13;
   sparkle(p,0,-3,29*k,C[7],C[4],alpha);
   p.circle(0,-3,10*k,C[6],alpha*k);
   p.glow(0,-4,42,C[4],k*.45);
  }
  if(age<.28){
   const q=age/.28,k=alpha*(1-q),r=o.radius*ease.outCubic(q);
   for(let i=0;i<10;i++){
    const a=i*TAU/10-.2,ca=Math.cos(a),sa=Math.sin(a);
    p.line(ca*r*.45,sa*r*.3-3,ca*r,sa*r*.3-3,C[5],k);
    p.glowLine(ca*r*.6,sa*r*.3-3,ca*r,sa*r*.3-3,3,C[3],k*.1);
   }
  }
  // The crown opens rapidly, then curls down; gaps keep it from becoming a wall.
  for(const v of veils){
   const u=clamp((age-v.delay)/.59);if(u<=0||u>=1)continue;
   const k=Math.sin(u*Math.PI)**.75*alpha,h=v.h*ease.outCubic(Math.min(1,u*3))*(1-u*.65);
   let prev=null;
   for(let j=0;j<=15;j++){
    const q=j/15,x=v.x*(.3+.7*ease.outCubic(u)) + Math.sin(q*3+v.phase+u*4)*q*8,y=-h*q;
    if(prev){
     p.beam(prev[0]+1,prev[1],x+1,y,(1-q)*4.5+.7,C[2],k);
     p.line(prev[0],prev[1],x,y,C[q>.75?6:4],Math.min(1,k*1.6));
    }
    if(j===15)p.dot(x,y,C[6],k);
    prev=[x,y];
   }
  }
  for(const b of bits){
   const age2=age-b.delay;if(age2<0)continue;
   const q=clamp(age2/.77),k=alpha*(1-q),d=o.radius*b.d*ease.outCubic(q);
   const x=Math.cos(b.a)*d,y=Math.sin(b.a)*d*.25-Math.sin(q*Math.PI)*b.h;
   p.line(x,y,x-Math.cos(b.a)*5*(1-q),y+4*(1-q),C[q<.3?6:3],k);
   if(b.star){sparkle(p,x,y,1.3+Math.sin(q*Math.PI)*1.5,C[6],C[3],k*.45);}
   else p.dot(x,y,C[5],k);
  }
 }
 return {update(dt){elapsed+=dt;t=Math.round(elapsed*1e9)/1e9;},drawBack(p){ground(p,true);},draw(p){
  const alpha=envelope(t,meta.duration);if(!alpha)return;
  ground(p,false);
  if(t<IMPACT)descent(p,alpha);else burst(p,t-IMPACT,alpha);
 }};
}
