// Visual-only event driver: pulse schedules belong here, never in the effects.
// Run: node tools/render-vfx-request-options.mjs
import { loadEffect, renderFrames, contactSheet, writeVideo, save } from './lib/fxlib.mjs';
const cases=[
 ['projectiles/rosilia-support-shot',{}],['projectiles/rosilia-target-reticle',{}],
 ['status/rosilia-infinite-magazine',{}],['water/aorbion-sea-response',{mode:'claw'}],
 ['water/aorbion-tail-pillars',{count:5}],['shadow/kings-decree',{targets:[-100,40]}],
];
for(const [id,options] of cases){
 const fx=await loadEffect(id),original=fx.mod;
 if(!original.create)fx.mod={...original,
  draw:(p,t,o)=>original.draw(p,t,{...o,pulse:Math.max(0,1-((t+.1)%.5)/.25),intro:Math.max(0,1-t/.2)}),
  ...(original.drawBack?{drawBack:(p,t,o)=>original.drawBack(p,t,{...o,pulse:Math.max(0,1-((t+.1)%.5)/.25)})}:{}),
 };
 const frames=renderFrames(fx,{options});
 const dir=`records/options/${id}`;
 save(`${dir}/contact.png`,contactSheet(fx,frames,{max:8,zoom:2}));
 writeVideo(`${dir}/anim.gif`,frames,2,{loops:2});
 console.log(id,'options preview');
}
