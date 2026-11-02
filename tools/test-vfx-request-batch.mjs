// Run: node tools/test-vfx-request-batch.mjs
import assert from 'node:assert/strict';
import { createFrame, painterFor, resolveOptions, actorAlphaOf } from '../src/core/index.js';
const ids=['shadow/kings-decree','projectiles/rosilia-target-reticle','status/rosilia-reload-ready','status/rosilia-infinite-magazine','projectiles/rosilia-support-shot','water/aorbion-submerge','water/aorbion-charge-emerge','water/aorbion-tail-pillars','water/aorbion-seadragon','water/aorbion-poseidon','water/aorbion-sea-response'];
const modules=new Map(await Promise.all(ids.map(async id=>[id,await import(`../src/fx/${id}.js`)])));
function frame(id,time,options={},flip=false,layer){
 const mod=modules.get(id),o=resolveOptions(mod.meta,options),[w,h]=mod.meta.size,[ox,oy]=mod.meta.origin;
 const f=createFrame(w,h),p=painterFor(f).place(ox,oy,flip);
 let fx=mod;if(mod.create){fx=mod.create(o);const n=Math.ceil(time*120);for(let i=0;i<n;i++)fx.update(time/n);}
 if(layer!=='front'&&fx.drawBack)fx.drawBack(p,time,o);if(layer!=='back')fx.draw(p,time,o);return f;
}
for(const id of ids){const m=modules.get(id),time=m.meta.duration*.35;
 assert.deepEqual(frame(id,time),frame(id,time),`${id}: deterministic`);
 const pal={palette:['#220a08','#aa4433','#ffe0bb']};assert.notDeepEqual(frame(id,time),frame(id,time,pal),`${id}: palette`);
 if(m.meta.loop)assert.deepEqual(frame(id,0),frame(id,m.meta.duration),`${id}: loop seam`);
 else for(const t of [m.meta.duration,m.meta.duration+.1]){const f=frame(id,t);assert(f.color.every(c=>!c)&&f.light.every(c=>!c),`${id}: empty ending`);}
 // Dithered thin rings can shift centroid by a few pixels; asymmetric markers must still mirror.
 const centroid=f=>{let sum=0,n=0;f.color.forEach((c,i)=>{if(c>>>24){sum+=i%f.w;n++;}});assert(n);return sum/n;};
 // Directional canvases have deliberately offset origins; use the same large frame for both directions.
 const wide=flip=>{const f=createFrame(1000,500),p=painterFor(f).place(500,250,flip),o=resolveOptions(m.meta);let fx=m;if(m.create){fx=m.create(o);fx.update(time);}fx.drawBack?.(p,time,o);fx.draw(p,time,o);return f;};
 assert(Math.abs(centroid(wide(false))+centroid(wide(true))-999)<5,`${id}: mirror`);
 console.log('ok',id);
}
const changed=(id,a,b,t=.3)=>assert.notDeepEqual(frame(id,t,a),frame(id,t,b),`${id}: option`);
changed('projectiles/rosilia-target-reticle',{pulse:0},{pulse:1});
changed('projectiles/rosilia-support-shot',{pulse:0},{pulse:.7});
changed('status/rosilia-infinite-magazine',{intro:0},{intro:1});
changed('water/aorbion-tail-pillars',{count:3},{count:5});
changed('water/aorbion-poseidon',{pulse:0},{pulse:1});
changed('water/aorbion-sea-response',{mode:'travel'},{mode:'claw'});
changed('shadow/kings-decree',{targets:[]},{targets:[-50,50]},.75);
assert.deepEqual(frame('shadow/kings-decree',.7,{targets:[1,2,3,4,5,6]}),frame('shadow/kings-decree',.7,{targets:[1,2,3,4,5]}));
assert.equal(actorAlphaOf(modules.get('water/aorbion-submerge'),.2,{}),0);
// A support reticle without a real pulse never invents impact pixels in the front layer.
assert(frame('projectiles/rosilia-support-shot',.3,{pulse:0},false,'front').color.every(c=>!c));
console.log('All 11 effects and host-driven options pass.');
