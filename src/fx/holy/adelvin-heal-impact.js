import { ease, TAU } from "../../core/index.js";
import { plus } from "./_lib.js";
import { HEAL, colors, envelope, PRAY } from "./_adelvin.js";
export const meta={name:"Adelvin healing arrival",desc:"A brief mint hoop climbs the ally with five staggered ivory healing crosses. Compact 0.6-second feedback supports frequent heals without a full-body wash.",tags:["holy","adelvin","heal","character","one-shot"],size:[104,112],origin:[52,91],duration:0.6,loop:false,fps:30,bg:"ground",actor:2,options:{palette:HEAL,seed:41}};
export const act={onBody:true,poses:[[0,PRAY],[0.2,{...PRAY,hy:-1}],[0.6,PRAY]]};
function layer(p,t,o,back){
 const a=envelope(t,meta.duration);if(!a)return;const C=colors(o),u=t/meta.duration,y=-38*ease.outCubic(u),r=16-3*u;
 for(let i=0;i<84;i++){const g=i*TAU/84;if((Math.sin(g)<0)!==back)continue;p.dot(Math.cos(g)*r,y+Math.sin(g)*r*0.25,C[back?3:5],a*(back?0.55:0.95));}
 if(!back)for(let i=0;i<5;i++){
  const q=Math.max(0,Math.min(1,(u-i*0.09)/0.64));if(!q||q>=1)continue;
  const x=[-12,10,-1,17,-18][i], y=-9-q*(i<3?29:23);
  plus(p,x,y,i<3?3:2,1,C,a*Math.sin(q*Math.PI));
 }
 // Two brief ivory catches travel with the rising hoop, not extra particles.
 if(!back)for(const side of [-1,1]){
  const k=a*Math.sin(Math.PI*u);p.dot(side*r,y,C[7],k);
  p.glow(side*r,y,4,C[4],k*0.16);
 }
 if(!back)p.glow(0,y,20,C[3],a*0.15);
}
export const drawBack=(p,t,o)=>layer(p,t,o,true);
export const draw=(p,t,o)=>layer(p,t,o,false);
