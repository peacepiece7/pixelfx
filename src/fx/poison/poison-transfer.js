import { ease, clamp, Rng } from '../../core/index.js';
import { VENOM, clock, colors, fade, distance, liquid } from './_lib.js';
export const meta={name:'Residual poison transfer',desc:'A wet venom bead pulls free of a dead target and follows a shallow arc to the host-selected recipient, trailing smaller droplets. No new stacks or lifetime refresh.',tags:['poison','hilding','transfer','projectile','one-shot'],size:[160,96],origin:[28,65],duration:.5,loop:false,fps:40,bg:'ground',options:{palette:VENOM,travelDistance:94,seed:71}};
export function create(o){
 const time=clock(),C=colors(o),R=new Rng(o.seed),travel=distance(o,94);
 const trail=Array.from({length:8},(_,i)=>({lag:.015+i*.009,size:R.range(.6,1.3),offset:R.range(-2,2)}));
 const point=t=>{const u=clamp(t/.43);return [travel*ease.inOutCubic(u),-16-Math.sin(u*Math.PI)*19];};
 return {update:dt=>time.update(dt),draw(p){
  const t=time.t,a=fade(t,.5);if(!a)return;
  for(const d of trail){if(t<d.lag)continue;const [x,y]=point(t-d.lag);liquid(p,x,y+d.offset,d.size,C,a*.7);}
  const [x,y]=point(t);liquid(p,x,y,3,C,a);
  p.glow(x,y,9,C[4],a*.2);
 }};
}
