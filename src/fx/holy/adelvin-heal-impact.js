import { ease, WHITE, TAU } from "../../core/index.js";
import { plus } from "./_lib.js";
import { HEAL, colors, envelope, PRAY } from "./_adelvin.js";
export const meta={name:"Adelvin healing arrival",desc:"A brief mint hoop climbs the ally with three small ivory healing crosses. Compact half-second feedback supports frequent heals without a full-body wash.",tags:["holy","adelvin","heal","character","one-shot"],size:[104,112],origin:[52,91],duration:0.6,loop:false,fps:30,bg:"ground",actor:2,options:{palette:HEAL,seed:41}};
export const act={onBody:true,poses:[[0,PRAY],[0.2,{...PRAY,hy:-1}],[0.6,PRAY]]};
function layer(p,t,o,back){
 const a=envelope(t,meta.duration);if(!a)return;const C=colors(o),u=t/meta.duration,y=-38*ease.outCubic(u),r=14-3*u;
 for(let i=0;i<60;i++){const g=i*TAU/60;if((Math.sin(g)<0)!==back)continue;p.dot(Math.cos(g)*r,y+Math.sin(g)*r*0.25,C[5],a*(back?0.45:0.85));}
 if(!back)for(let i=0;i<3;i++){const q=Math.max(0,Math.min(1,(u-i*0.14)/0.72));if(!q||q>=1)continue;plus(p,(i-1)*11,-10-q*28,2,1,C,a*Math.sin(q*Math.PI));}
 if(!back)p.glow(0,y,18,C[3],a*0.12);
}
export const drawBack=(p,t,o)=>layer(p,t,o,true);
export const draw=(p,t,o)=>layer(p,t,o,false);
