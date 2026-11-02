import { Rng, TAU, clamp } from '../../core/index.js';
import { pool } from '../_soft.js';
import { VENOM, clock, colors, gas, lifecycle, liquid, rounded, ripple } from './_lib.js';

export const meta={
 name:'Poison fog field',
 desc:'A fixed olive-green miasma rolls in low translucent banks with violet crowns, oily beads and one local light pulse per second. Every area has its own clock.',
 tags:['poison','hilding','fog','gas','area','ground','loop'],size:[160,96],origin:[80,73],duration:5,loop:true,fps:30,bg:'ground',
 options:{palette:VENOM,radius:65,pulse:null,seed:73},
};
export function create(o){
 const time=clock(),C=colors(o),R=new Rng(o.seed);
 const sites=Array.from({length:22},(_,i)=>{
  const angle=R.range(0,TAU),radius=Math.sqrt(R.next())*.72;
  return {x:Math.cos(angle)*radius,z:Math.sin(angle)*radius,phase:i/22+R.range(0,.02),
   size:R.range(8,14),rise:R.range(5,18),drift:R.range(2,5),angle:R.range(0,TAU)};
 });
 function layer(p,back){
  const t=rounded(time.t%5),a=lifecycle(o);if(a<=0)return;
  const radius=Math.max(0,Number.isFinite(o.radius)?o.radius:65);if(!radius)return;
  const scale=radius/65,phase=t/5;
  const pulse=Number.isFinite(o.pulse)?clamp(o.pulse):Math.exp(-(t%1)*8);
  if(back)pool(p,0,0,radius*1.03,radius*.24,C[3],a*(.08+pulse*.06));
  const list=[];
  for(const s of sites){
   if((s.z<0)!==back)continue;
   const q=rounded((phase+s.phase)%1),life=Math.sin(q*Math.PI);
   list.push({x:s.x*radius+Math.sin(q*TAU+s.angle)*s.drift*scale,
    y:s.z*radius*.24-4-q*s.rise*scale,r:s.size*scale*(.75+life*.42),
    a:life*life*.68,b:.68+.2*Math.sin(q*Math.PI),w:(s.z<0?.68:.16)+q*.18});
  }
  gas(p,list,C,a,.58);
  ripple(p,radius*.9,.23,C,a*.12,!back,o.seed);
  // Dew beads rise slowly through the low gas. No target/status icons appear.
  for(let i=0;i<9;i++){
   const s=sites[i],q=rounded((phase*2+i/9)%1);
   if((s.z<0)!==back)continue;
   const alpha=a*Math.sin(q*Math.PI)*.55;
   liquid(p,s.x*radius,s.z*radius*.24-2-q*16*scale,(.7+i%3*.25)*scale,C,alpha);
  }
  if(back)for(const x of [-radius*.4,0,radius*.4])p.glow(x,-6,10,C[4],a*pulse*.065);
 }
 return {update:dt=>time.update(dt),drawBack:p=>layer(p,true),draw:p=>layer(p,false)};
}
