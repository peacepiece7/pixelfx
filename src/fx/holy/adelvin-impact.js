// Burst choreography follows the local magic-missile recipe (Sprite Fusion energy,
// MIT License, Copyright 2026 Hugo Duprez), condensed into a host-owned impact.
import { Rng, TAU, ease, sparkle } from '../../core/index.js';
import { AURORA, colors, envelope } from './_adelvin.js';
export const meta={name:'Adelvin light missile impact',desc:'A white magic core snaps open into a broken cyan halo, twisting light streaks and fading ivory stars. Compact and fireless; one burst per actual impact.',tags:['holy','adelvin','impact','orb','one-shot'],size:[128,112],origin:[64,65],duration:.55,loop:false,fps:30,bg:'dark',options:{palette:AURORA,radius:30,seed:31}};
export function create(o){
 const C=colors(o),R=new Rng(o.seed);
 const bits=Array.from({length:24},(_,i)=>({a:R.range(0,TAU),r:R.range(.45,1),delay:R.range(0,.055),bend:R.range(-.6,.6),star:i%4===0}));
 let t=0;
 return {update(dt){t+=dt;},draw(p){
  const alpha=envelope(t,meta.duration);if(!alpha)return;
  if(t<.12){
   const k=1-t/.12;
   p.circle(0,0,2+5*k,C[6],alpha);p.circle(0,0,1+3*k,C[7],alpha);
   sparkle(p,0,0,15*k,C[7],C[4],alpha);
  }
  const u=Math.min(1,t/.34),radius=3+(o.radius-3)*ease.outCubic(u);
  // Expanding broken arcs, not a filled blast disc.
  for(let i=0;i<6;i++){
   const a=i*TAU/6+t*2;
   p.arc(0,0,radius,Math.max(.6,2*(1-u)),a,a+.65,C[u<.4?6:3],alpha*(1-u));
  }
  for(const b of bits){
   const age=t-b.delay;if(age<0)continue;
   const q=Math.min(1,age/.47),k=alpha*(1-q),a=b.a+b.bend*q;
   const d=o.radius*b.r*ease.outCubic(q),x=Math.cos(a)*d,y=Math.sin(a)*d*.8;
   const tail=2+5*(1-q),aa=a-b.bend*.18;
   p.line(x,y,x-Math.cos(aa)*tail,y-Math.sin(aa)*tail*.8,C[q<.3?6:3],k);
   p.dot(x,y,C[7],k);
   if(b.star){sparkle(p,x,y,1+Math.sin(q*Math.PI)*1.2,C[6],C[4],k*.55);p.glow(x,y,5,C[3],k*.18);}
  }
  p.glow(0,0,27,C[3],alpha*(1-u)*.35);
 }};
}
