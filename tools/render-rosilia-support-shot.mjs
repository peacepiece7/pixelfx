import {loadEffect,renderFrames,contactSheet,writeVideo,save} from './lib/fxlib.mjs';
const fx=await loadEffect('projectiles/rosilia-support-shot');
const original=fx.mod;
// Demo pulses only: combat owns event timing. Keep the actual module stateless.
fx.mod={...original,create:undefined,
 draw:(p,t,o)=>original.draw(p,t,{...o,pulse:t<.3?0:Math.max(0,1-((t-.3)%.6)/.35),age:t<.3?t:((t-.3)%.6)>.35?((t-.3)%.6)-.35:1}),
 drawBack:(p,t,o)=>original.drawBack(p,t,{...o,pulse:t<.3?0:Math.max(0,1-((t-.3)%.6)/.35),age:t<.3?t:((t-.3)%.6)>.35?((t-.3)%.6)-.35:1}),
};
const frames=renderFrames(fx,{fps:60});
const beats={...frames,frames:frames.frames.filter((_,i)=>i%3===0&&i<=42),n:15,fps:20};
const dir=`records/projectiles/rosilia-support-shot/${process.argv[2]??'final'}`;
save(`${dir}/contact-50ms.png`,contactSheet(fx,beats,{max:15,zoom:3,width:2400}));
writeVideo(`${dir}/anim.gif`,frames,4,{loops:2});
const sightFx={...fx,mod:original};
const sightFrames=renderFrames(sightFx,{fps:20});
save(`${dir}/sight-loop.png`,contactSheet(sightFx,sightFrames,{max:8,zoom:3,width:1600}));
console.log(dir);
