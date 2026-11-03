import { ease, clamp, smooth, Rng } from '../../core/index.js';
import { pool } from '../_soft.js';
import { VENOM, clock, colors, distance } from './_lib.js';
import { venomSkull } from './_venom-skull.js';

export const ARRIVE=.39;
export const meta={
 name:'Residual poison skull transfer',
 desc:'A venom-green darkness skull rises from a dead body, flies to the host-selected recipient and dissolves into a brief body-wrap aura. No copied stacks or refreshed lifetimes.',
 tags:['poison','hilding','transfer','skull','projectile','one-shot'],size:[160,96],origin:[28,65],duration:.5,loop:false,fps:40,bg:'ground',
 options:{palette:VENOM,travelDistance:94,seed:71},
};
export function create(o){
 const time=clock(),C=colors(o),R=new Rng(o.seed),travel=distance(o,94);
 const tail=Array.from({length:11},(_,i)=>({lag:.012+i*.009,sway:R.range(-1.8,1.8),size:R.range(2,3.5)}));
 const point=t=>{const u=clamp(t/ARRIVE);return [travel*ease.inOutCubic(u),-24-Math.sin(u*Math.PI)*13];};
 return {update:dt=>time.update(dt),draw(p){
  const t=time.t;
  if(t<=0||t>=meta.duration)return;
  const a=smooth(0,.025,t)*(1-smooth(.44,.5,t));
  const [x,y]=point(t),fold=1-smooth(ARRIVE,.49,t);
  for(const d of tail){
   if(t<d.lag)continue;
   const [xx,yy]=point(t-d.lag),alpha=a*fold*(1-d.lag/.13)*.2;
   p.disc(xx,yy+d.sway,d.size,C[3],alpha);
   p.disc(xx-.4,yy+d.sway-.6,d.size*.55,C[5],alpha*.6);
  }
  const scale=(.6+.4*smooth(0,.05,t))*(.7+.3*fold);
  venomSkull(p,x,y,C,a*fold,scale);
  p.glow(x,y,13,C[4],a*fold*.19);
  // A visual arrival catch only. The host updates the recipient's persistent
  // aura stacks/pulse from the actual transfer event, never from this clock.
  if(t>=ARRIVE){
   const u=clamp((t-ARRIVE)/(.5-ARRIVE)),k=a*Math.sin(u*Math.PI);
   pool(p,travel,-22,10+u*9,19,C[4],k*.35);
   for(let j=0;j<30;j++){
    const g=j/29*Math.PI,rx=9+u*10;
    p.blend(travel+Math.cos(g)*rx,-22+Math.sin(g)*5-u*9,C[5],k*.7);
   }
  }
 }};
}
