import { ease, TAU, WHITE } from "../../core/index.js";
import { AURORA, colors, envelope, PRAY } from "./_adelvin.js";
export const meta={name:"Adelvin summon seal",desc:"A thin cyan floor seal opens into ivory wing-like arcs, with twelve rising gold motes. Only arrival magic; Gabriel and Michael bodies are separate sprites.",tags:["holy","adelvin","summon","seal","one-shot"],size:[192,152],origin:[96,117],duration:0.85,loop:false,fps:30,bg:"ground",actor:2,options:{palette:AURORA,radius:38,seed:47}};
export const act={onBody:true,poses:[[-0.25,PRAY],[0.12,{...PRAY,fx:-10,fy:-37,bx:11,by:-37}],[0.45,{...PRAY,fx:-10,fy:-32,bx:11,by:-32}],[0.85,PRAY]]};
function layer(p,t,o,back){
 const a=envelope(t,meta.duration);if(!a)return;const C=colors(o),u=t/meta.duration,r=o.radius*ease.outCubic(Math.min(1,u*3));
 for(let k=0;k<120;k++){const g=k*TAU/120;if((Math.sin(g)<0)!==back)continue;
  p.dot(Math.cos(g)*r,Math.sin(g)*r*0.27,C[4],a*(back?0.45:0.85));
  if(k%15===0)p.line(Math.cos(g)*(r-3),Math.sin(g)*(r-3)*0.27,Math.cos(g)*(r+3),Math.sin(g)*(r+3)*0.27,C[6],a);}
 for(let k=0;k<12;k++){const g=k*TAU/12;if((Math.sin(g)<0)!==back)continue;const age=Math.max(0,u-k%3*0.04),y=Math.sin(g)*r*0.27-age*44;
  p.line(Math.cos(g)*r*0.72,y,Math.cos(g)*r*0.72,y+3,C[5],a*(1-u));}
 if(!back){for(const side of [-1,1])for(let k=0;k<4;k++){const q=Math.sin(Math.PI*u),x=side*(9+k*5)*q,y=-6-(4-k)*5*q;
  p.line(side*4,-4,x,y,C[k%2?4:6],a*0.6);}
 p.glow(0,-8,32,C[3],a*(1-u)*0.2);}
}
export const drawBack=(p,t,o)=>layer(p,t,o,true);
export const draw=(p,t,o)=>layer(p,t,o,false);
