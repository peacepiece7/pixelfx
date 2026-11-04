// Cynthia contains no new particle artwork: place and retime existing PixelFX modules.
import { resolveOptions } from './fx.js';
export const FIRE=['#270b12','#651325','#b62528','#ed482d','#ff8c45','#ffd99c','#fff6e8'];
export const ORANGE=['#39252a','#744436','#ad6847','#db955c','#f8bb7b','#ffd6a2','#ffe9cb','#fff8ec'];
export const SILVER=['#161d29','#354153','#66768b','#96a6b7','#c1d0dc','#e5eff5','#ffffff'];
export const RED=['#230510','#620923','#ab1734','#e63945','#ff7864','#ffc5a2','#fff4df'];
export function sequence(o, cues, duration, loop=false) {
  let t=0;
  const list=cues.map(c=>({...c, start:c.start??0, end:c.end??duration, clock:-1, impl:null}));
  function sync(c) {
    const age=t-c.start;
    if(age<0 || t>=c.end) return;
    const local=c.time ? c.time(age) : (c.offset??0)+(c.repeat?age%c.repeat:age)*(c.speed??1);
    if(!c.impl || local<c.clock) {
      c.opts=resolveOptions(c.fx.meta,{seed:o.seed??7,...c.options,...(o.palette?{palette:o.palette}:{} )});
      c.impl=c.fx.create?c.fx.create(c.opts):c.fx; c.clock=0;
    }
    if(c.impl.update) {
      const dt=local-c.clock, n=Math.max(1,Math.ceil(dt*120));
      for(let i=0;i<n;i++) c.impl.update(dt/n,c.opts);
    }
    c.clock=local;
  }
  const draw=(p,layer)=>{
    if(!loop && t>=duration) return;
    const saved={tx:p.tx,ty:p.ty,fx:p.fx,cs:p.cs,sn:p.sn,fade:p.fade,lightK:p.lightK};
    for(const c of list) {
      if(t<c.start || t>=c.end) continue;
      sync(c);
      const pos=c.position?.(t-c.start,o)??[c.x??0,c.y??0,0];
      const x=p.toX(pos[0],pos[1]),y=p.toY(pos[0],pos[1]);
      p.place(x,y,saved.fx<0,Math.atan2(saved.sn,saved.cs)+(pos[2]??0)*saved.fx);
      p.fade=saved.fade*Math.min(1,(c.end-t)/(c.fadeOut??.12));
      p.lightK=saved.lightK*(c.light??.65)*(1+Math.max(0,o.pulse??0)*.15);
      const tt=c.fx.meta.loop?c.clock%c.fx.meta.duration:Math.min(c.clock,c.fx.meta.duration);
      if(layer==='back') c.impl.drawBack?.(p,tt,c.opts); else c.impl.draw(p,tt,c.opts);
      Object.assign(p,saved);
    }
  };
  return {update(dt){t+=dt;if(loop&&t>=duration){t%=duration;for(const c of list){c.impl=null;c.clock=-1;}}},drawBack:p=>draw(p,'back'),draw:p=>draw(p,'front')};
}
export const muzzle=o=>[o.muzzleX??25,o.muzzleY??-22];
export const target=o=>[o.targetX??180,o.targetY??0];
// A quadratic flight bends towards the current target; orientation follows its tangent.
export function flight(t,o,duration,arc=0,ground=false) {
  const [mx,my]=muzzle(o),[tx,ty]=target(o),ey=ty+(ground?0:-24),u=Math.min(1,t/duration);
  return [mx+(tx-mx)*u,my+(ey-my)*u-4*arc*u*(1-u),Math.atan2(ey-my-4*arc*(1-2*u),tx-mx)];
}

export function rocketFlight(t,o) {
 const [mx,my]=muzzle(o),[tx,ty]=target(o),u=Math.min(1,t/.65);
 // Fly forward at muzzle height, then pitch smoothly down without climbing first.
 const v=Math.max(0,(u-.65)/.35),drop=v*v;
 return [mx+(tx-mx)*u,my+(ty-my)*drop,Math.atan2(v>0?(ty-my)*2*v/.35:0,tx-mx)];
}
