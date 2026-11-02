// Review real transitions at 60 fps; event pulses are a preview driver only.
import { loadEffect,renderFrames,contactSheet,writeVideo,save } from './lib/fxlib.mjs';
export const ids=['blood/blood-boom','blood/bleeding','blood/roar-wave','blood/thorn-reflect','nature/pull-vortex','ice/freeze-slam','shadow/dark-shroud','shadow/dark-wave','shadow/vampire-awaken','shadow/kings-decree','projectiles/rosilia-target-reticle','status/rosilia-reload-ready','status/rosilia-infinite-magazine','projectiles/rosilia-support-shot','water/aorbion-submerge','water/aorbion-charge-emerge','water/aorbion-tail-pillars','water/aorbion-seadragon','water/aorbion-poseidon','water/aorbion-sea-response'];
const round=process.argv[2]??'final';
for(const id of ids){
 const fx=await loadEffect(id),mod=fx.mod;
 if(id.includes('support-shot')||id.includes('target-reticle')){
  const options=(t,o)=>({...o,pulse:Math.max(0,1-(t%.5)/.35)});
  fx.mod={...mod,draw:(p,t,o)=>mod.draw(p,t,options(t,o)),...(mod.drawBack?{drawBack:(p,t,o)=>mod.drawBack(p,t,options(t,o))}:{})};
 }
 const frames=renderFrames(fx,{fps:60});
 const dir=`records/quality-${round}/${id}`;
 // Early consecutive frames expose attack/hold/decay rather than skipping the hit.
 const steps=mod.meta.loop?[0,.05,.1,.18,.28,.4,.65,.9]:[0,.03,.09,.18,.32,.5,.72,.94].map(t=>t*mod.meta.duration);
 const sampled={...frames,frames:steps.map(t=>frames.frames[Math.min(frames.n-1,Math.round(t*60))]),n:steps.length};
 save(`${dir}/contact.png`,contactSheet(fx,sampled,{max:8,zoom:2}));
 writeVideo(`${dir}/anim.gif`,frames,2,{loops:2});
 console.log(id);
}

save(`records/quality-${round}/index.html`, `<!doctype html><meta charset="utf-8"><title>VFX transition review</title><style>body{background:#15131d;color:#eee;font:14px system-ui;padding:24px}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(380px,1fr));gap:20px}article{background:#211f29;padding:16px}img{max-width:100%;image-rendering:pixelated}a{color:#bde}</style><h1>VFX transition review</h1><p>60 fps source / nearest-neighbour 2× GIF. Shot pulses are preview events only.</p><main>${ids.map(id=>`<article><h2>${id}</h2><a href="${id}/anim.gif"><img src="${id}/anim.gif"></a></article>`).join('')}</main>`);
