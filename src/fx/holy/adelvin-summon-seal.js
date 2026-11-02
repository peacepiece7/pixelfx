import { ease, TAU, Rng, smooth, clamp, sparkle } from '../../core/index.js';
import { AURORA, colors, PRAY } from './_adelvin.js';
import { oval } from './_lib.js';
// Rotating glyphs and the open compass reuse the local Valhalla seal technique.
// This is a short arrival flash, not a persistent zone or the summoned body's wings.
export const meta={name:'Adelvin radiant summon seal',desc:'A layered cyan-gold rune seal opens beneath the summon. Counter-rotating compass rays, rising ivory halos and star motes unfold once and dissolve.',tags:['holy','adelvin','summon','seal','one-shot'],size:[192,152],origin:[96,117],duration:.85,loop:false,fps:30,bg:'ground',actor:2,options:{palette:AURORA,radius:46,seed:47}};
export const act={onBody:true,poses:[[-.25,PRAY],[.12,{...PRAY,fx:-10,fy:-37,bx:11,by:-37}],[.45,{...PRAY,fx:-10,fy:-32,bx:11,by:-32}],[.85,PRAY]]};
function state(t,o){
 const open=ease.outCubic(clamp(t/.2)),fade=1-smooth(.55,.85,t);
 return {open,fade,r:o.radius*open*(1-.18*smooth(.63,.85,t)),flash:1-smooth(.15,.32,t)};
}
function floor(p,t,o){
 if(t<=0||t>=meta.duration)return;
 const C=colors(o),s=state(t,o),k=s.open*s.fade,r=s.r,spin=t*.9;
 const point=(a,d)=>[Math.cos(a)*r*d,Math.sin(a)*r*d*.32];
 const line=(points,c=C[5],a=k*smooth(.035,.16,t))=>p.polyline(points,c,a);
 // Every floor mark stays below the summoned body, even on the near rim.
 for(const [d,c] of [[1,5],[.93,3],[.69,5],[.61,3]])oval(p,0,0,r*d,r*d*.32,C[c],k);
 for(let i=0;i<12;i++){
  const a=spin+i*TAU/12;
  line([point(a-.05,.76),point(a,.87),point(a+.05,.76)],C[i%2?4:6]);
  line([point(a-.06,.8),point(a+.06,.8)],C[5]);
  if(i%2===0)line([point(a,.87),point(a+.07,.85)],C[6]);
  const [x,y]=point(a+TAU/24,.97);
  p.glow(x,y,9,C[5],k*(.16+s.flash*.16));
  if(i%3===0)sparkle(p,x,y,(1.2+s.flash*1.8)*s.open,C[6],C[4],k*.4);
 }
 for(let i=0;i<8;i++){
  const a=-spin+i*TAU/8;
  line([point(a-.15,.17),point(a,i%2?.4:.56),point(a+.15,.17)],C[i%2?3:6]);
 }
 line(Array.from({length:5},(_,i)=>point(-spin+i*TAU/4,.17)),C[6]);
 // A separate release echo runs out of the seal and thins before the hold ends.
 const u=(t-.12)/.36;
 if(u>0&&u<1)oval(p,0,0,r*(.7+.5*u),r*(.7+.5*u)*.32,C[6],k*(1-u));
 p.glow(0,0,24,C[3],k*.16);
}
function rising(p,t,o,back){
 if(t<=0||t>=meta.duration)return;
 const C=colors(o),s=state(t,o),R=new Rng(o.seed);
 // Two tilted, broken hoops peel off the seal in sequence; their backs remain
 // behind the actor and the near arcs pass in front without a filled light tube.
 for(let i=0;i<2;i++){
  const age=t-.09-i*.085,u=age/.5;if(u<=0||u>=1)continue;
  const k=Math.sin(u*Math.PI)*s.fade,r=s.r*(.96-u*.35),y=-ease.outCubic(u)*(31+i*10);
  for(let j=0;j<128;j++){
   const a=j*TAU/128,near=Math.sin(a)>=0;if(near===back)continue;
   if(Math.sin(a*3-t*9+i)<-.6)continue;
   const x=Math.cos(a)*r,yy=y+Math.sin(a)*r*.28;
   p.dot(x,yy,C[i?4:6],k*(back?.55:.85));
   if(j%32===0)p.glow(x,yy,5,C[4],k*.17);
  }
 }
 for(let i=0;i<32;i++){
  const a=R.range(0,TAU),delay=R.range(.06,.27),life=R.range(.3,.55),rise=R.range(19,61),d=R.range(.68,1.02);
  if((Math.sin(a)<0)!==back)continue;
  const u=(t-delay)/life;if(u<=0||u>=1)continue;
  const k=Math.sin(u*Math.PI)*s.fade*(back?.65:1),x=Math.cos(a)*o.radius*d+Math.sin(a+u*4)*u*3;
  const y=Math.sin(a)*o.radius*d*.32-ease.outCubic(u)*rise;
  p.line(x,y+3+u*3,x,y,C[3],k*.7);p.dot(x,y,C[6],k);
  p.glow(x,y,3,C[5],k*.15);
  if(i%6===0)sparkle(p,x,y,1+Math.sin(u*Math.PI)*1.2,C[6],C[4],k*.35);
 }
 // Paired fans of curved light open rapidly and fold away after the arrival.
 if(!back){
  const q=clamp((t-.08)/.5),k=Math.sin(q*Math.PI)*s.fade;
  for(const side of [-1,1])for(let i=0;i<5;i++){
   let prev=null;
   for(let j=0;j<=15;j++){
    const v=j/15,x=side*(5+v*(19+i*4)*ease.outCubic(q));
    const y=-5-Math.sin(v*Math.PI*.7)*(17+i*4)*Math.sin(q*Math.PI);
    if(prev)p.line(prev[0],prev[1],x,y,C[i%2?4:6],Math.min(1,k*1.35)*(1-v*.35));
    prev=[x,y];
   }
  }
 }
}
export function drawBack(p,t,o){floor(p,t,o);rising(p,t,o,true);}
export function draw(p,t,o){rising(p,t,o,false);}
