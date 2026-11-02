import { ease, TAU } from "../../core/index.js";
import { plus } from "./_lib.js";
import { HEAL, colors, envelope } from "./_adelvin.js";
export const meta={name:"Michael healing pulse",desc:"One shallow mint-and-ivory ripple expands from one Michael instance, lifting eight small crosses at its rim. The host emits it per actual heal event.",tags:["holy","adelvin","michael","heal","pulse","one-shot"],size:[272,136],origin:[136,91],duration:0.7,loop:false,fps:30,bg:"ground",options:{palette:HEAL,radius:100,seed:43}};
function layer(p,t,o,back){
 const a=envelope(t,meta.duration);if(!a)return;const C=colors(o),u=t/meta.duration,r=o.radius*ease.outCubic(u);
 for(let i=0;i<180;i++){const g=i*TAU/180;if((Math.sin(g)<0)!==back)continue;const x=Math.cos(g)*r,y=Math.sin(g)*r*0.27;
  p.dot(x,y,C[4],a*(1-u*0.7)*(back?0.45:0.85));p.dot(x,y+1,C[2],a*0.7); if(i%12===0)p.glow(x,y,5,C[3],a*(1-u)*0.12);}
 for(let k=0;k<8;k++){const g=k*TAU/8;if((Math.sin(g)<0)!==back)continue;const q=Math.max(0,(u-0.18)/0.82);
  plus(p,Math.cos(g)*r*0.85,Math.sin(g)*r*0.27-4-q*9,2,1,C,a*Math.sin(q*Math.PI)*(back?0.5:0.9));}
}
export const drawBack=(p,t,o)=>layer(p,t,o,true);
export const draw=(p,t,o)=>layer(p,t,o,false);
