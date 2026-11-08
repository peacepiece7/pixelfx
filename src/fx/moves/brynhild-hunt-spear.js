import {fit,Rng,TAU,smooth,ease,READY} from '../../core/index.js';

export const meta={name:'Brynhild hunt spear',desc:'A fixed-foot jump gathers a wing of gold light, then releases a narrow ivory spear toward the boss. The caster stays in place; impact is a separate effect.',tags:['holy','brynhild','spear','projectile','hunt','one-shot'],size:[192,160],origin:[40,132],duration:.9,loop:false,fps:30,bg:'ground',actor:2,options:{palette:['#30203b','#654055','#a86e42','#dfa85a','#ffe29a','#fff6d0','#ffffff'],targetX:110,targetY:-26,targetFootY:0,seed:37}};
const THROW=.28,ARRIVE=.56;
export const preview={motion:'leap',fireTimes:[THROW],target:true};
export function previewActorY(t){return t<.28?-26*ease.outCubic(Math.max(0,t/.28)):t<.64?-26*(1-smooth(.28,.64,t)):0;}
export const act={target:{x:110},poses:[[-.18,{...READY,weapon:'spear',sa:-1.1}],[0,{...READY,crouch:6,lean:-3,weapon:'spear',sa:-1.2}],[.15,{...READY,y:-20,fx:-4,fy:-37,bx:9,by:-24,weapon:'spear',sa:-.6}],[THROW,{...READY,y:-26,lean:4,fx:16,fy:-30,bx:-5,by:-28,weapon:'handle',sa:0},'snap'],[.46,{...READY,y:-14,lean:3,weapon:'handle'}],[.64,{...READY,crouch:6,weapon:'handle'}],[.9,{...READY,weapon:'spear',sa:-1.1}]],hits:[{t:ARRIVE,stop:.05,shake:.08,amp:1,push:0,y:-26}]};
export function draw(p,t,o){
 if(t<0||t>=meta.duration)return;
 const C=fit(o.palette,7),R=new Rng(o.seed);
 const lift=1-smooth(.24,.55,t);
 if(lift>0){
  const rise=ease.outCubic(Math.min(1,t/.24));
  for(const side of [-1,1])for(let i=0;i<5;i++){
   const q=i/4,x=side*(5+q*16)*rise,y=-12-rise*(12+q*19);
   p.poly([[x,y],[x-side*2,y+5],[x-side*(4+q*5),y+6+q*6],[x-side*3,y+2]],C[3+i%3],lift*(.8-q*.25));
   p.line(x,y,x-side*(4+q*5),y+6+q*6,C[5],lift*(.9-q*.25));
   p.dot(x,y,C[6],lift*.8);
  }
 }
 if(t>=THROW&&t<ARRIVE){
  const u=(t-THROW)/(ARRIVE-THROW),x=14+(o.targetX-14)*u,y=-56+(o.targetY+56)*u;
  const a=Math.atan2(o.targetY+56,o.targetX-14),dx=Math.cos(a),dy=Math.sin(a);
  for(let k=8;k>0;k--){const n=k*4;p.line(x-dx*n,y-dy*n,x-dx*(n+3),y-dy*(n+3),C[3+k%2],(1-k/9)*.7);}
  p.beam(x-dx*26,y-dy*26,x,y,1.2,C[5]);
  p.poly([[x+dx*7,y+dy*7],[x-dy*3-dx*5,y+dx*3-dy*5],[x-dx*13,y-dy*13],[x+dy*3-dx*5,y-dx*3-dy*5]],C[3]);
  p.line(x-dx*10,y-dy*10,x+dx*6,y+dy*6,C[6]);
  p.glowLine(x-dx*25,y-dy*25,x,y,5,C[4],.22);
 }
 if(t>=THROW&&t<THROW+.045)p.glow(14,-56,6,C[5],.22*(1-(t-THROW)/.045));
 for(let i=0;i<10;i++){
  const delay=R.range(0,.27),a=R.range(0,TAU),age=t-delay,life=R.range(.25,.5),r=R.range(6,16);
  if(age<0||age>=life)continue;
  const k=1-age/life,x=Math.cos(a)*(r+age*18),y=-12-Math.sin(a)*r-age*42;
  p.dot(x,y,C[4+i%3],k*.7);
 }
}
