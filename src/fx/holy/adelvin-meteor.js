// Crater, angular debris and shock-front staging follow the local fire/meteor and
// impacts/ground-slam recipes (Sprite Fusion explosion, MIT, Copyright 2026 Hugo Duprez).
import { Rng, ease, TAU, sparkle, fit, clamp, smooth } from '../../core/index.js';
import { AURORA, colors, envelope } from './_adelvin.js';
import { oval } from './_lib.js';
export const IMPACT=.3;
export const meta={name:'Gabriel shattering light meteor',desc:'A massive gold-white meteor slams into a fractured crater at 0.3s. Broken floor slabs, tumbling rocks, grit and two low shock fronts replace the light curtains.',tags:['holy','adelvin','gabriel','meteor','impact','debris','one-shot'],size:[288,256],origin:[144,196],duration:1.15,loop:false,fps:30,bg:'ground',options:{palette:AURORA,radius:70,seed:53}};
export function create(o){
 const input=colors(o),C=fit([input[0],input[5],input[6],input[7]],8),R=new Rng(o.seed);
 const slabs=Array.from({length:13},(_,i)=>({a:i*TAU/13+R.range(-.07,.07),d:R.range(.45,.9),lift:R.range(3,9)}));
 const rocks=Array.from({length:28},(_,i)=>({x:R.range(-16,16),z:R.range(-8,8),vx:R.range(-130,130),vz:R.range(-18,18),vy:-R.range(100,225),size:i<8?R.range(4,7):R.range(1.5,3.5),a:R.range(0,TAU),spin:R.range(-12,12),delay:R.range(0,.035)}));
 const grit=Array.from({length:52},()=>({vx:R.range(-155,155),vy:-R.range(35,190),z:R.range(-9,9),delay:R.range(0,.045)}));
 const dust=Array.from({length:16},(_,i)=>({a:i*TAU/16,r:R.range(4,9),speed:R.range(45,95),h:R.range(2,9)}));
 let t=0,elapsed=0;
 function stone(p,x,y,size,angle,k,hot=0){
  const points=Array.from({length:5},(_,i)=>{const a=angle+i*TAU/5;return [x+Math.cos(a)*size*(i%2?.85:1),y+Math.sin(a)*size*.75];});
  p.poly(points,C[0],k);
  p.poly([points[0],points[1],points[2],[x,y]],C[hot>.4?4:2],k);
  p.poly([points[2],points[3],points[4],[x,y]],C[1],k);
  p.line(...points[0],...points[1],C[hot>.4?6:3],k);
 }
 function floor(p){
  const alpha=envelope(t,meta.duration);if(!alpha)return;
  const age=t-IMPACT;
  if(age<0){
   const q=t/IMPACT,r=o.radius*(.88+.12*q);
   oval(p,0,0,r,r*.27,C[3],alpha*.65);
   oval(p,0,0,r*.78,r*.21,C[2],alpha*.4);
   p.glow(0,0,30,C[4],q*q*.2);return;
  }
  const spread=ease.outCubic(clamp(age/.08)),k=1-smooth(.53,.85,age),hot=1-smooth(.02,.28,age);
  // A wide dark broken dish, not a persistent map edit. All floor ink is behind actors.
  p.ellipse(0,2,o.radius*.68*spread,o.radius*.19*spread,C[0],k*.85);
  for(const s of slabs){
   const a=s.a,r=o.radius*s.d*spread;
   const point=(g,d,h=0)=>[Math.cos(g)*r*d,Math.sin(g)*r*d*.29-h];
   const lip=s.lift*Math.sin(clamp(age/.42)*Math.PI);
   const pts=[point(a-.15,.43),point(a-.14,.95,lip),point(a+.15,1,lip*.7),point(a+.17,.46)];
   p.poly(pts,C[1],k);p.poly([pts[0],pts[1],point(a,.7,lip*.8)],C[2],k);
   p.line(...pts[1],...pts[2],C[hot>.3?5:3],k);
   const crack=[point(a,.2),point(a+.05,.52),point(a-.04,.77),point(a+.04,1.12)];
   p.polyline(crack,C[0],k);p.polyline(crack.map(([x,y])=>[x,y-1]),C[hot>.2?4:1],k);
  }
 }
 function wave(p,back){
  const age=t-IMPACT;if(age<0)return;
  for(let echo=0;echo<2;echo++){
   const u=(age-echo*.065)/.37;if(u<0||u>=1)continue;
   const r=o.radius*ease.outCubic(u),k=(1-u)*(1-u),keep=a=>(Math.sin(a)<0)===back;
   oval(p,0,1,r,r*.27,C[5],k,keep);
   oval(p,0,2,r-2,(r-2)*.27,C[2],k,keep);
   for(const s of [-1,1])if(!back){
    const x=s*r,h=15*(1-u);
    p.poly([[x-s*8,0],[x,-h],[x+s*3,-h*.35],[x+s*5,1]],C[3],k);
    p.line(x,-h,x+s*3,-h*.35,C[6],k);
   }
  }
 }
 function descent(p){
  if(t<=.035)return;
  const u=clamp((t-.035)/(IMPACT-.035)),r=22+5*u,y=-136+110*ease.inQuad(u),x=-22*(1-u);
  const k=smooth(.035,.08,t);
  // Broad straight comet wake and a faceted luminous mass: no curled tendrils.
  for(let j=0;j<38;j++){
   const v=j/38,w=r*.7*(1-v),yy=y-v*44;
   p.line(x-w-v*8,yy,x+w-v*8,yy,C[v<.25?4:2],k*(1-v));
   if(j%3===0)p.line(x-w-v*8,yy,x-w-v*8-3,yy-4,C[5],k*(1-v));
  }
  stone(p,x,y,r,t*2,k,1);
  p.circle(x,y+3,r*.62,C[4],k);p.circle(x-2,y+6,r*.37,C[6],k);
  p.circle(x-3,y+8,r*.18,C[7],k);
  p.glow(x,y+4,34,C[4],k*.28);
 }
 function impactShards(p){
  const age=t-IMPACT;if(age<0||age>=.2)return;
  const u=age/.2,k=1-smooth(.06,.2,age),expand=ease.outCubic(u);
  // Short, rigid triangular splinters burst apart; they never curl into ribbons.
  for(let i=0;i<9;i++){
   const a=Math.PI+(i+.5)*Math.PI/9,reach=(28+(i%3)*10)*expand;
   const x=Math.cos(a)*reach,y=Math.sin(a)*reach*.85-2;
   const rootX=x*.48,rootY=y*.38,w=(3+i%2)*(1-u);
   p.poly([[rootX-w,rootY],[x,y],[rootX+w,rootY+2]],C[4],k);
   p.line(rootX,rootY,x,y,C[6],k);
  }
 }
 function debris(p,back){
  const age=t-IMPACT;if(age<0)return;
  const end=1-smooth(.6,.85,age);
  for(const d of dust){
   if((Math.sin(d.a)<0)!==back)continue;
   const u=clamp(age/.7),dist=d.speed*(1-Math.exp(-age*5))/5;
   const x=Math.cos(d.a)*(14+dist),y=Math.sin(d.a)*(14+dist)*.27-d.h*Math.sin(u*Math.PI);
   p.disc(x,y,d.r*(.5+u),C[1],v=>Math.sin(u*Math.PI)*.3*(1-v)*end);
  }
  for(const b of rocks){
   if((b.z<0)!==back)continue;
   const u=age-b.delay;if(u<0)continue;
   const land=-2*b.vy/820,air=Math.min(u,land),x=b.x+b.vx*air,y=b.z+b.vz*air+b.vy*air+410*air*air;
   const bounce=u>land?Math.max(0,Math.sin(Math.min(1,(u-land)/.16)*Math.PI))*3:0;
   stone(p,x,y-bounce,b.size,b.a+b.spin*air,end,1-smooth(0,.16,u));
   if(u>land&&u<land+.08)oval(p,x,y,2+(u-land)*25,1,C[2],end*.5);
  }
  if(!back)for(const b of grit){
   const u=age-b.delay;if(u<0)continue;
   const land=-2*b.vy/760,air=Math.min(u,land),x=b.vx*air,y=b.z+b.vy*air+380*air*air;
   const k=(1-smooth(.36,.75,u))*end;
   p.line(x,y,x-b.vx*.015,y-(b.vy+760*air)*.015,C[u<.15?6:3],k);
  }
 }
 return {update(dt){elapsed+=dt;t=Math.round(elapsed*1e9)/1e9;},drawBack(p){if(t<=0||t>=meta.duration)return;floor(p);wave(p,true);debris(p,true);},draw(p){
  if(t<=0||t>=meta.duration)return;
  if(t<IMPACT){descent(p);return;}
  const age=t-IMPACT;
  wave(p,false);impactShards(p);debris(p,false);
  if(age<.12){const k=1-age/.12;p.ellipse(0,-3,32*k,15*k,C[6],k);sparkle(p,0,-6,40*k,C[7],C[4],k);p.glow(0,-5,60,C[4],k*.4);}
 }};
}
