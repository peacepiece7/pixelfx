import { TAU } from '../../core/index.js';
import { AURORA, colors, loopAct } from './_adelvin.js';
import { missileCore } from './_adelvin-missile.js';
export const meta={name:'Adelvin stored light missiles',desc:'Charged white cores orbit on short twisting cyan wakes, ready to launch. Host remaining count controls every light; zero is empty and there is no five-orb cap.',tags:['holy','adelvin','orb','stored','character','loop'],size:[144,128],origin:[72,92],duration:2,loop:true,fps:30,bg:'ground',actor:2,options:{palette:AURORA,count:5,radius:36,height:27,phase:0,seed:29}};
export const act=loopAct;
function layer(p,t,o,back){
 const C=colors(o),n=Math.max(0,Math.floor(o.count)),ph=t/meta.duration*TAU+o.phase;
 const shade=back?[C[0],C[0],C[1],C[2],C[3],C[4],C[5],C[6]]:C;
 for(let i=0;i<n;i++){
  const a=ph+i*TAU/n,point=u=>{
   const b=a-u*Math.min(.58,TAU/n*.65);
   return [Math.cos(b)*o.radius,-o.height+Math.sin(b)*o.radius*.35+Math.sin(u*6-ph*2+i)*u*1.4];
  };
  // Split the complete wake at the depth plane as well as the head.
  let prev=point(0);
  for(let j=1;j<=16;j++){
   const u=j/16,q=point(u),z=Math.sin(a-u*Math.min(.58,TAU/n*.65));
   if((z<0)===back){
    p.beam(prev[0],prev[1],q[0],q[1],1.5*(1-u)+.5,shade[3],1-u);
    p.line(prev[0],prev[1],q[0],q[1],shade[4],1-u);
    p.dot(q[0],q[1]+Math.sin(ph*3-u*9+i)*1.6,shade[4],(1-u)*.8);
   }
   prev=q;
  }
  if((Math.sin(a)<0)!==back)continue;
  const [x,y]=point(0);
  missileCore(p,x,y,2.5,shade,ph*3+i*2+(o.seed%31)*.13);
 }
}
export const drawBack=(p,t,o)=>layer(p,t,o,true);
export const draw=(p,t,o)=>layer(p,t,o,false);
