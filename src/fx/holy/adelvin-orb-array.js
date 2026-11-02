import { TAU } from "../../core/index.js";
import { AURORA, colors, orb, loopAct } from "./_adelvin.js";
export const meta={name:"Adelvin stored orbs",desc:"Pearl-like orbs circle the caster with cool outer shells and warm cores. Host remaining count controls the array; zero is empty, with no fixed five-orb cap.",tags:["holy","adelvin","orb","stored","character","loop"],size:[144,128],origin:[72,92],duration:2,loop:true,fps:30,bg:"ground",actor:2,options:{palette:AURORA,count:5,radius:36,height:27,phase:0,seed:29}};
export const act=loopAct;
function layer(p,t,o,back) {
 const C=colors(o),n=Math.max(0,Math.floor(o.count)),ph=t/meta.duration*TAU+o.phase;
 for(let i=0;i<n;i++) {
  const a=ph+i*TAU/n,z=Math.sin(a);if((z<0)!==back)continue;
  const x=Math.cos(a)*o.radius,y=-o.height+z*o.radius*0.35;
  orb(p,x,y,3.4,back?[C[0],C[0],C[1],C[2],C[3],C[4],C[5],C[6]]:C,1,a*2);
  p.dot(x-3*Math.cos(a-0.3),y-2*Math.sin(a),C[5],0.5);
 }
}
export const drawBack=(p,t,o)=>layer(p,t,o,true);
export const draw=(p,t,o)=>layer(p,t,o,false);
