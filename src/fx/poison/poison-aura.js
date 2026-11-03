import { clamp, smooth, Rng, TAU } from '../../core/index.js';
import { shape } from '../status/_lib.js';
import { pool, softShade } from '../_soft.js';
import { VENOM, colors, lifecycle, rounded } from './_lib.js';

export const meta={
 name:'Poisoned venom drips',
 desc:'Sticky green venom gathers beside the lower body and drips into small toxic stains, away from the central torso lanes used by bleeding and wetness. A faint body aura remains.',
 tags:['poison','hilding','status','aura','drip','stacks','body','loop'],size:[104,112],origin:[52,91],duration:2,loop:true,fps:30,bg:'ground',actor:2,
 options:{palette:VENOM,stacks:1,pulse:0,seed:83},
};
const POSE={turn:.9,crouch:1,fx:4,fy:-17,bx:7,by:-16};
export const act={onBody:true,poses:[[0,POSE],[1,{...POSE,crouch:2}],[2,POSE]]};

function layer(p,t,o,back){
 const stacks=Math.max(0,Number.isFinite(o.stacks)?o.stacks:1);
 const alpha=lifecycle(o);if(!stacks||alpha<=0)return;
 const C=colors(o),a=o.actor,S=shape(a),D=meta.duration;
 const phase=rounded((t%D)/D),density=1-Math.exp(-stacks/4),pulse=clamp(Number.isFinite(o.pulse)?o.pulse:0);
 const visible=S.rows.map((row,y)=>({row,y})).filter(q=>q.row[0]>=0);
 if(!visible.length)return;
 const top=visible[0].y,bottom=visible.at(-1).y,H=bottom-top+1;
 const minX=Math.min(...visible.map(q=>q.row[0])),maxX=Math.max(...visible.map(q=>q.row[1]));
 const width=5+density*3;
 if(back)pool(p,a.x+(minX+maxX)/2,0,(maxX-minX)/2+8,4,C[3],alpha*(.04+density*.035));
 // Follow the actual row silhouette. Broad mist fades across the outer edge;
 // the front tint stays transparent so the monster's own art remains legible.
 softShade(p,a.x+minX-width,a.y+top-3,a.x+maxX+width,a.y+bottom+2,(x,y,out)=>{
  const iy=Math.floor(y-a.y),row=S.rows[clamp(iy,top,bottom)];
  if(!row||row[0]<0)return;
  const lx=x-a.x,l=row[0],r=row[1]+1;
  const outside=lx<l?l-lx:lx>r?lx-r:0;
  if(outside>width)return;
  const v=clamp((iy-top)/H),wave=.65+.35*Math.sin(v*TAU*1.3-phase*TAU*2+o.seed);
  const halo=(1-smooth(0,width,outside))*(back?1:.8);
  const edge=outside>0?halo:back?.38:.24;
  const vertical=smooth(top-3,top+3,iy)*(1-smooth(bottom,bottom+2,iy));
  const energy=alpha*edge*vertical*(.65+density*.35)*wave;
  out.c=C[wave>.9?5:outside>1?4:3];out.a=energy*(.14+density*.1+pulse*.15);
  out.l=C[4];out.k=energy*(.035+density*.035+pulse*.09);
 });
 if(!back)drips(p,t,o,alpha);

}
export const drawBack=(p,t,o)=>layer(p,t,o,true);
export const draw=(p,t,o)=>layer(p,t,o,false);

// Wet status reuses bleeding.js: both emit at occupied torso pixels in
// y=.36..52h and |x-w/2|<.22w, with +/-5px/s drift. Poison reserves outboard
// lower-body lanes beyond that central strip and always drifts farther outward.
// Keep the source calculation exported so the separation can be checked on
// different monster masks rather than only on the stock preview character.
export function dripSites(actor){
 const S=shape(actor),occupied=S.rows.map((row,y)=>({row,y})).filter(q=>q.row[0]>=0);
 if(!occupied.length)return [];
 const lower=occupied.filter(q=>q.y>=S.h*.64&&q.y<=S.h*.84);
 const candidates=lower.length?lower:occupied.slice(Math.floor(occupied.length*.65));
 const center=S.w/2,reserved=S.w*.22+4.5;
 return [-1,1].map((side,i)=>{
  const q=candidates[Math.min(candidates.length-1,Math.floor((i+.25)*candidates.length/2))];
  const edge=side<0?q.row[0]-3:q.row[1]+3;
  const x=side<0?Math.min(edge,center-reserved):Math.max(edge,center+reserved);
  return {x:actor.x+x,y:actor.y+q.y,rootX:actor.x+(side<0?q.row[0]-1:q.row[1]+1),side};
 });
}

function drips(p,t,o,alpha){
 const sites=dripSites(o.actor);if(!sites.length)return;
 const stacks=Math.max(0,Number.isFinite(o.stacks)?o.stacks:1);
 const n=2+Math.floor(6*(1-Math.exp(-stacks/5))),C=colors(o),R=new Rng(o.seed+1049);
 const D=meta.duration,G=400,gather=.25;
 for(let i=0;i<n;i++){
  const site=sites[i%2],speed=R.range(3,6)*site.side,size=R.range(1.05,1.55);
  const born=(i+R.range(.15,.45))*D/n;
  const age=rounded(((t-born)%D+D)%D),ground=R.range(1,3);
  const fall=Math.sqrt(2*Math.max(1,ground-site.y-2)/G),land=gather+fall;
  if(age<gather){
   const u=age/gather,drop=size*smooth(0,.9,u);
   p.line(site.rootX,site.y-.5,site.x,site.y+1,C[2],alpha*.45);
   p.line(site.x,site.y,site.x,site.y+2+u,C[3],alpha*.7);
   p.disc(site.x,site.y+1+u*2,drop,C[4],alpha*.9);
   if(u>.5)p.blend(site.x-.4,site.y+u*2,C[6],alpha*.8);
  }else if(age<land){
   const f=age-gather,x=site.x+speed*f,y=site.y+2+G*f*f/2;
   const length=Math.min(3,G*f*.012);
   p.line(x,y-length,x,y,C[2],alpha*.85);
   p.disc(x,y,size,C[4],alpha);
   p.blend(x-.4,y-.7,C[6],alpha*.9);
   p.blend(x,y+.8,C[1],alpha*.8);
  }else{
   const hit=age-land,k=alpha*(1-smooth(.25,.65,hit));
   if(k<=.01)continue;
   const x=site.x+speed*fall,width=size*(1.5+smooth(0,.08,hit));
   p.ellipse(x,ground,width,.8,C[1],k*.65);
   p.line(x-width*.5,ground-.5,x+width*.5,ground-.5,C[3],k*.6);
   // One small toxic blister pops at impact, not water rings or blood crowns.
   if(hit<.16){
    const u=hit/.16,r=(1+Math.sin(u*Math.PI))*.7;
    p.disc(x+site.side*u*2,ground-Math.sin(u*Math.PI)*2.5,r,C[4],k*(1-u)*.65);
    p.glow(x,ground,4,C[3],k*(1-u)*.09);
   }
  }
 }
}
