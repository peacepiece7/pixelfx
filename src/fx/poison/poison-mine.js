import { smooth, TAU, clamp } from '../../core/index.js';
import { pool } from '../_soft.js';
import { VENOM, clock, colors, lifecycle, liquid, ripple, rounded } from './_lib.js';

export const ARM_TIME=.5;
export const meta={
 name:'Venom contact mine',
 desc:'A small barbed venom capsule settles into the ground; three olive pips charge for 0.5 seconds, then a green core breathes in a ready ring. Host-owned lifetime and contact.',
 tags:['poison','hilding','mine','trap','armed','ground','loop'],size:[64,64],origin:[32,43],duration:12,loop:true,fps:30,bg:'ground',
 options:{palette:VENOM,seed:79},
};
export function create(o){
 const time=clock(),C=colors(o);
 const age=()=>Number.isFinite(o.elapsed)?Math.max(0,o.elapsed):time.t;
 const ready=()=>Number(age()>=ARM_TIME);
 return {update:dt=>time.update(dt),
  drawBack(p){const a=lifecycle(o);if(!a)return;
   const k=ready(),pulse=.5+.5*Math.sin(rounded(time.t%1.2)*TAU/1.2+o.seed);
   pool(p,0,0,20,6,C[3],a*(.12+k*pulse*.12));
   ripple(p,15,.3,C,a*(.22+k*.3),false,o.seed);
  },
  draw(p){const a=lifecycle(o);if(!a)return;
   const k=ready(),pulse=.5+.5*Math.sin(rounded(time.t%1.2)*TAU/1.2+o.seed),settle=smooth(0,.12,age());
   p.ellipse(0,1,13,4,C[0],a*.8);
   p.poly([[-13,-3],[-8,-7],[7,-7],[13,-3],[9,3],[-8,3]],C[1],a);
   p.poly([[-13,-3],[-8,-7],[7,-7],[13,-3],[7,-2],[-7,-1]],C[3],a);
   p.line(-7,-6,6,-6,C[5],a*.7);
   p.ellipse(0,-4,7,3,C[0],a);
   for(const side of [-1,1]){
    p.poly([[side*6,-3],[side*13,-12*settle],[side*10,-3],[side*12,1]],C[2],a);
    p.line(side*7,-3,side*13,-12*settle,C[5],a*.8);
    p.line(side*12,1,side*16,3,C[1],a);
   }
   // A physical capsule with a toxic liquid meniscus, not a damage marker.
   liquid(p,0,-7,3.7,C,a*(.55+k*.45));
   p.ellipse(0,-7,2.7,1.1,C[5],a*(.5+k*pulse*.4));
   for(let i=0;i<3;i++){
    const filled=i===2?ready():clamp(age()/ARM_TIME*3-i),x=(i-1)*4;
    p.line(x,-1,x,1,C[2],a);
    p.blend(x,0,C[filled>.9?5:3],a*(.45+filled*.55));
   }
   const n=36,progress=clamp(age()/ARM_TIME);
   for(let i=0;i<n*progress;i++){
    const g=i/n*TAU;
    p.blend(Math.cos(g)*15,Math.sin(g)*4.5,C[k>.99?4:3],a*.7);
   }
   ripple(p,15,.3,C,a*(.2+k*.3),true,o.seed);
   p.glow(0,-7,9,C[4],a*k*(.08+pulse*.13));
  }};
}
