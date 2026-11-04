// Silhouette compression adapted from local arcane/blink-out (Sprite Fusion movement,
// MIT, Copyright (c) 2026 Hugo Duprez). No floor ring or teleport destination.
import { fit, smooth, clamp, Rng, TAU, stockActor, READY } from '../../core/index.js';
import { shades, squeezed } from '../arcane/_lib.js';
import { transform } from '../_showcase-transform.js';
export const meta={name:'Vampire awaken · dark blink transformation',desc:'Darkness gathers into the body, compresses it into a violet slit and releases an enlarged shadow silhouette; reverse plays the exact untransform sequence.',
 tags:['shadow','vampire','transform','character','one-shot'],size:[192,160],origin:[96,132],duration:1.6,loop:false,fps:30,bg:'ground',actor:2,
 options:{palette:['#090312','#160724','#2d0b46','#511078','#822db1','#b875dc','#e3c2fa','#ffffff'],seed:11,reverse:false}};
export const act={onBody:true,poses:[[0,READY],[.3,{...READY,crouch:4,fx:-2,fy:-25,bx:2,by:-25}],[.8,{...READY,fx:-13,fy:-25,bx:13,by:-25}],[1.6,READY]]};
const clock=(t,o)=>Math.round((o.reverse?meta.duration-t:t)*1e9)/1e9;
export const actorAlpha=(time,o)=>{const t=clock(time,o);return 1-smooth(.24,.34,t)+smooth(.92,1.3,t);};
export function draw(p,time,o){
 if(time<=0||time>=meta.duration)return;
 const t=clock(time,o),C=fit(o.palette,8),A=o.actor??stockActor(2),sh=shades(A),R=new Rng(o.seed);
 const mx=A.x+A.w/2,my=A.y+A.h*.55;
 const gather=smooth(0,.3,t),out=1-smooth(.95,1.5,t);
 const compress=1-smooth(.32,.52,t),reform=smooth(.64,.94,t);
 const width=t<.56?compress:reform;
 const strength=gather*out;
 if(width>.02) squeezed(transform(p,1,1+(t>.56?.14*reform:0)),A,sh,width,C[2],C[5],strength*.9);
 if(t>.3&&t<.94){
  const k=Math.sin(clamp((t-.3)/.64)*Math.PI);
  p.beam(mx,my-24*k,mx,my+18*k,1.2,C[6],k);
  p.glow(mx,my,24,C[4],k*.65);
 }
 // Streaks gather, then peel away as shadow fragments; their path reverses too.
 for(let i=0;i<48;i++){
  const a=R.range(0,TAU),reach=R.range(24,62),phase=R.range(0,.16);
  const u=clamp((t-phase)/1.25),k=Math.sin(u*Math.PI)**2;
  const d=t<.56?reach*(1-smooth(0,.56,t)):reach*smooth(.56,1.4,t);
  const x=mx+Math.cos(a)*d,y=my+Math.sin(a)*d*.65-t*9;
  if(k<=0)continue;
  p.line(x-Math.cos(a)*4,y-Math.sin(a)*3,x,y,C[i%5?4:6],k*.8);
  p.glow(x,y,3,C[3],k*.18);
 }
}
