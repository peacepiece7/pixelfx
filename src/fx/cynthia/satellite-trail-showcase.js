import { fit, smooth, noise, rand } from '../../core/index.js';
import { flameTongue, hotFirst, BACK_LAYERS } from '../fire/_lib.js';
import { softShade, pool } from '../_soft.js';
import { ORANGE } from '../../core/cynthia-reuse.js';
export const meta={name:'Cynthia · Immediate satellite burn trail',desc:'Ground ignites immediately on contact. Overlapping scorch patches remain behind a moving beam, with low flames and cooling embers.',tags:['cynthia','fire','ground','trail','one-shot'],size:[256,128],origin:[128,94],duration:6,loop:false,fps:30,bg:'ground',options:{palette:ORANGE,seed:7,radius:110}};
export function drawPatch(p,time,o,front){
 if(time<0||time>=meta.duration)return;
 const C=fit(o.palette,9),H=hotFirst(C),r=o.radius??110;
 const k=1-smooth(4.6,6,time),seed=o.seed;
 const q=Object.create(p);q.fade=p.fade*k;
 if(!front){
  softShade(q,-r,-r*.18,r,r*.18,(x,y,out)=>{
   const d=(x/r)**2+(y/(r*.18))**2;if(d>1)return;
   const n=rand(Math.floor(x/3),Math.floor(y/2),seed);
   out.c=n>.85?C[3]:C[0];out.a=(1-d)*.65;
  });
  pool(q,0,0,r,r*.18,C[3],.16);
 }
 // No delayed ring: hot ground and flames are present on the very first hit frame.
 const N=(rate,s=0,off=0)=>noise(time*rate+off,s);
 for(let i=0;i<19;i++){
  const x=(i/18*2-1)*r*.92,y=(rand(seed,i,2)-.5)*r*.24;
  if((y>=0)!==front)continue;
  const screenX=q.toX(x,y);
  if(screenX<(q.clipMinX??q.ox)-8||screenX>=(q.clipMaxX??(q.ox+q.w))+8)continue;
  const height=(7+rand(seed,i,3)*13)*(.7+.3*Math.sin(time*8+i)**2)*k;
  flameTongue(q,x,y,height,1.8+rand(seed,i,4)*1.5,Math.sin(time*3+i)*2,N,seed+i*17,H,BACK_LAYERS);
  q.glow(x,y-3,8,C[4],.08*k);
 }
}
export const drawBack=(p,t,o)=>drawPatch(p,t,o,false);
export const draw=(p,t,o)=>drawPatch(p,t,o,true);
