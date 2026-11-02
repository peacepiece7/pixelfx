// Shared liquid/gas rendering for Hilding. Combat events and lifetimes stay in
// the host; these helpers never select units, apply poison or deal damage.
import { Rng, fit, scale, smooth, clamp, TAU } from '../../core/index.js';
import { cloud, Smoke } from '../projectiles/_lib.js';
import { Drops, Ripples } from '../water/_lib.js';
import { pool } from '../_soft.js';

export const VENOM = ['#102514','#24422a','#466736','#75964a','#a3bf65','#d3df9a','#dfccf0'];
export const colors = o => fit(o.palette, 8);
export const rounded = t => Math.round(t * 1e9) / 1e9;
export const fade = (t, d) => t <= 0 || t >= d ? 0 : smooth(0,.018,t) * (1-smooth(d*.66,d,t));
export const distance = (o, fallback) => Math.max(0,Number.isFinite(o.travelDistance)?o.travelDistance:fallback);
export function clock() {
  let t=0,error=0;
  return {get t(){return rounded(t);},update(dt){const d=dt-error,next=t+d;error=(next-t)-d;t=next;}};
}
export function lifecycle(o) {
  return (Number.isFinite(o.elapsed)?smooth(0,.16,o.elapsed):1) *
    (Number.isFinite(o.remaining)?smooth(0,.2,o.remaining):1);
}
// Preserve crisp one-pixel geometry while fading as translucent liquid/metal,
// rather than turning the small silhouette into a checkerboard near its end.
function translucent(p) {
  const q=Object.create(p);
  q.put=(x,y,c,a=1)=>p.blendPx(x,y,c,a);
  return q;
}
export function liquid(p,x,y,r,C,a=1) {
  if(a<=.01||r<=.2)return;
  p.disc(x,y,r,C[1],a*.8);
  p.disc(x-.25,y-.4,r*.78,C[4],a*.9);
  p.blend(x-r*.25,y-r*.4,C[6],a);
  p.glow(x,y,r+2,C[4],a*.15);
}
export function gas(p,list,C,alpha=1,vertical=1) {
  const green=C.slice(0,7), violet=[.12,.2,.32,.46,.63,.8,1].map(k=>scale(C[7],k));
  const q=Object.create(p);
  q.toX=(x,y)=>p.toX(x,y*vertical);
  q.toY=(x,y)=>p.toY(x,y*vertical);
  q.fromX=(x,y)=>p.fromX(x,y);
  q.fromY=(x,y)=>p.fromY(x,y)/vertical;
  cloud(q,list.map(q=>({...q,a:q.a*alpha})),green,violet,{dens:1.5,max:.62,lit:1.1});
}
export function ripple(p,r,sy,C,a,front=true,seed=0) {
  if(a<.015||r<.5)return;
  p=translucent(p);
  const n=Math.max(36,Math.ceil(r*5)); let last;
  for(let i=0;i<=n;i++) {
    const g=i/n*TAU;
    if((Math.sin(g)>=0)!==front){last=null;continue;}
    const rr=r+Math.sin(g*7+seed)*.65;
    const pt=[Math.cos(g)*rr,Math.sin(g)*rr*sy];
    if(last){p.line(...last,...pt,C[4],a*.7);p.blend(pt[0],pt[1]-.6,C[6],a*.6);}
    last=pt;
  }
}

// Both physical projectiles use one instance clock, but keep their own shape.
// travelDistance:0 is the attachment mode for a host moving the projectile origin.
export function projectile(o, dagger=false) {
  const time=clock(),C=colors(o),R=new Rng(o.seed),travel=distance(o,72);
  const drops=Array.from({length:9},()=>({birth:R.range(.025,.27),offset:R.range(2,10),fall:R.range(13,32),size:R.range(.6,1.2)}));
  return {update:dt=>time.update(dt),draw(p){
    const t=time.t,a=fade(t,.4);if(!a)return;
    p=translucent(p);
    const x=8+travel*clamp(t/.35), y=-24+Math.sin(t*15)*.6;
    for(const d of drops){const age=t-d.birth;if(age<0||age>.13)continue;
      const xx=8+travel*clamp(d.birth/.35)-d.offset-age*12;
      liquid(p,xx,-23+age*d.fall,d.size,C,a*(1-age/.13));}
    if(dagger){
      p.poly([[x,y],[x-15,y-4],[x-21,y],[x-15,y+4]],C[2],a);
      p.poly([[x,y],[x-15,y-4],[x-18,y]],C[6],a);
      p.line(x-18,y,x-2,y,C[4],a);
      p.line(x-20,y-5,x-20,y+5,C[1],a);
      p.line(x-21,y-4,x-21,y+3,C[5],a);
      p.line(x-28,y,x-22,y,C[2],a);
      for(let i=23;i<29;i+=2)p.line(x-i,y-1,x-i,y+1,C[4],a);
      p.circle(x-29,y,1.3,C[7],a*.8);
      liquid(p,x-10,y+2,1.35,C,a);
    }else{
      p.line(x-23,y,x-4,y,C[2],a);
      p.line(x-22,y-.5,x-5,y-.5,C[5],a);
      p.poly([[x,y],[x-6,y-3],[x-5,y],[x-6,y+3]],C[4],a);
      p.line(x-5,y-2,x,y,C[6],a);
      p.poly([[x-23,y],[x-27,y-3],[x-20,y-2],[x-18,y]],C[3],a);
      p.poly([[x-23,y],[x-27,y+3],[x-20,y+2],[x-18,y]],C[1],a);
      liquid(p,x-3,y+1,1.2,C,a);
    }
    p.glow(x-4,y,5,C[4],a*.17);
  }};
}

// Short, curved sheets of venom open into a splash crown, then fall apart.
// They stay liquid: shaded belly, blunt droplet tip, no flame tongues or sparks.
function liquidCrown(p,t,reach,C,alpha,front,tall,seed) {
  const R=new Rng(seed+113),life=tall?.36:.26;
  if(t>life)return;
  p=translucent(p);
  for(let i=0;i<11;i++) {
    const g=i*TAU/11,spread=R.range(.65,1),h=R.range(12,tall?37:23);
    if((Math.sin(g)>=0)!==front)continue;
    const u=clamp(t/life),k=alpha*Math.sin(u*Math.PI),r=reach*spread*(1-Math.exp(-t*14));
    const x=Math.cos(g)*r,y=Math.sin(g)*r*.27;
    const tipY=y-h*Math.sin(u*Math.PI),tipX=x+Math.cos(g)*4;
    p.poly([[x*.45,y*.45-3],[tipX-2,tipY],[tipX,tipY-1],[tipX+2,tipY+3],[x*.6+2,y*.6]],C[2],k*.8);
    p.polyline([[x*.5,y*.5-4],[tipX-1,tipY+2],[tipX,tipY]],C[5],k*.9);
    liquid(p,tipX,tipY,1.3,C,k);
  }
}

// A liquid burst with real ballistic drops and expanding, drag-slowed gas.
// Snapshot stacks affect only visual scale, never a target list or damage radius.
export function burst(o,duration,detonation=false) {
  const time=clock(),C=colors(o),R=new Rng(o.seed),mist=new Smoke(R);
  const stacks=Math.max(0,Number.isFinite(o.stacks)?o.stacks:1);
  const reach=detonation?32+24*(1-Math.exp(-stacks/10)):55;
  const ripples=new Ripples({sy:.26}),drops=new Drops({sy:.28,g:800,
    onLand:d=>ripples.add(d.x,d.z,1,5,.14,{n:1,k:.5,hot:0})});
  for(let i=0;i<(detonation?40:30);i++) {
    const g=R.range(0,TAU),speed=R.range(reach*1.7,reach*3);
    drops.add({x:0,z:0,h:8,vx:Math.cos(g)*speed,vz:Math.sin(g)*speed,
      vh:R.range(20,detonation?100:55),s:R.next()<.22?2:1,life:duration-.035});
  }
  for(let i=0;i<(detonation?13:9);i++) {
    const g=i*TAU/(detonation?13:9),v=R.range(reach*1.8,reach*3.4);
    mist.add({x:Math.cos(g)*3,y:-9+Math.sin(g)*3,vx:Math.cos(g)*v,
      vy:Math.sin(g)*v*.3-(detonation?R.range(35,75):R.range(4,22)),
      r0:2,r1:R.range(6,detonation?12:9),life:duration*.87,
      a:.65,b:.95,warm:detonation?.9:.28,drag:4,rise:0,grow:14,delay:0,curl:R.range(-1.2,1.2)});
  }
  return {update(dt){time.update(dt);mist.update(dt);drops.update(dt);ripples.update(dt);},
    drawBack(p){const t=time.t,a=fade(t,duration);if(!a)return;
      pool(p,0,-1,reach,reach*.29,C[3],a*.32);
      const puffs=mist.puffs();
      if(detonation){
        gas(p,puffs.filter((_,i)=>i%3===0).map(q=>({...q,y:q.y-4,w:1})),C,a);
        gas(p,puffs.filter((_,i)=>i%3!==0),C,a);
      }else gas(p,puffs,C,a,.58);
      ripples.draw(p,C,-1);
      liquidCrown(p,t,reach,C,a,false,detonation,o.seed);
      ripple(p,reach*(1-Math.exp(-t*16)),.27,C,a*.65,false,o.seed);},
    draw(p){const t=time.t,a=fade(t,duration);if(!a)return;
      liquidCrown(p,t,reach,C,a,true,detonation,o.seed);
      drops.draw(p,C);ripples.draw(p,C,1);
      const rr=reach*(1-Math.exp(-t*16));ripple(p,rr,.27,C,a*.8,true,o.seed);
      const hit=1-smooth(.018,.085,t);
      if(hit>0){p.ellipse(0,-8,7*hit,4*hit,C[6],a*hit);p.glow(0,-8,reach*.55,C[detonation?7:5],a*hit*.6);}
    }};
}
