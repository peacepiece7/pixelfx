import { TAU } from '../../core/index.js';
import { AURORA, colors } from './_adelvin.js';
import { missileCore, missileRibbon } from './_adelvin-missile.js';
export const meta={name:'Adelvin light missile',desc:'A white-hot magic core pulls a twisting cyan ribbon and warm star motes. Host owns homing, position and lifetime; this loop never travels or applies damage.',tags:['holy','adelvin','orb','missile','directional','loop'],size:[112,72],origin:[83,36],duration:1.2,loop:true,fps:30,bg:'dark',options:{palette:AURORA,radius:3.5,length:48,seed:29}};
export function draw(p,t,o){
 const C=colors(o),ph=t/meta.duration*TAU+(o.seed%31)*.13,r=Math.max(1,o.radius),L=Math.max(8,o.length);
 missileRibbon(p,u=>[-L*u,Math.sin(ph*2-u*7)*u*r*1.4],C,ph*2,r*1.2);
 for(let i=0;i<7;i++){
  const u=((t/meta.duration+i/7)%1+1)%1,k=Math.sin(Math.PI*u)*(1-u);
  const x=-L*u,y=Math.sin(ph*2+i*2.1)*r*(1+u*1.5);
  p.dot(x,y,C[i%3?5:7],k);
  if(i%3===0){p.line(x-1,y,x+1,y,C[6],k);p.line(x,y-1,x,y+1,C[6],k);}
 }
 missileCore(p,0,0,r,C,ph*3);
}
