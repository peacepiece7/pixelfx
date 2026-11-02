import { TAU, WHITE } from "../../core/index.js";
import { AURORA, colors, shield, loopAct } from "./_adelvin.js";
export const meta = {
 name: "Adelvin orbiting shields", desc: "Independent beveled shields orbit an ally in front and back layers. Count and phase come from the host; the art never creates extra collision or shield HP.",
 tags:["holy","adelvin","shield","orbit","character","loop"], size:[168,128],origin:[84,90],duration:2,loop:true,fps:30,bg:"ground",actor:2,
 options:{palette:AURORA,count:3,radius:48,height:25,phase:0,pulse:0,seed:23}
};
export const act=loopAct;
function layer(p,t,o,back) {
 const C=colors(o), n=Math.max(0,Math.floor(o.count)), ph=t/meta.duration*TAU+o.phase;
 for(let i=0;i<n;i++) {
  const a=ph+i*TAU/n, depth=Math.sin(a);
  if((depth<0)!==back)continue;
  const x=Math.cos(a)*o.radius,y=-o.height+depth*o.radius*0.28, alpha=1;
  for(let k=1;k<5;k++) {const q=a-k*0.045; p.dot(Math.cos(q)*o.radius,-o.height+Math.sin(q)*o.radius*0.28,C[3],alpha*(1-k/5)*0.6);}
  shield(p,x,y,back?[C[0],C[0],C[1],C[2],C[3],C[3],C[4],C[5]]:C,alpha,a);
  if(o.pulse>0) {p.line(x-5,y-8,x+5,y-8,WHITE,o.pulse);p.glow(x,y,14,C[5],o.pulse*0.25);}
 }
}
export const drawBack=(p,t,o)=>layer(p,t,o,true);
export const draw=(p,t,o)=>layer(p,t,o,false);
