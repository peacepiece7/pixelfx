import assert from 'node:assert/strict';
import * as satellite from '../src/fx/cynthia/satellite-showcase.js';
import * as burn from '../src/fx/cynthia/satellite-trail-showcase.js';
import { createFrame, createFx, painterFor, resolveOptions } from '../src/core/index.js';
const o=satellite.meta.options;
assert.equal(satellite.trailPoints(satellite.HIT-.001,o).length,0,'no fire before impact');
assert.equal(satellite.trailPoints(satellite.HIT,o).length,1,'fire begins at impact');
assert(satellite.trailPoints(3,o).length>satellite.trailPoints(1,o).length,'trail accumulates while moving');
const points=satellite.trailPoints(6,o);
assert(points.at(-1).position[0]-points[0].position[0]>180,'burning ground spans the traveled path');
assert(satellite.trailPoints(satellite.END+1,o).length>0,'trail remains after beam stops');
assert.equal(satellite.trailPoints(satellite.END+burn.meta.duration,o).length,0,'all patches expire');
function frame(t,opts={},w=700,h=320){
 const f=createFrame(w,h),fx=createFx(satellite,{...opts,x:100,y:h-50});fx.update(t);fx.draw(f,'back');fx.draw(f,'front');return f;
}
for(const h of [320,420]){
 const f=frame(2,{},700,h);
 assert(f.color.slice(0,f.w).some(c=>c>>>24),'beam reaches viewport top without a floating cap');
}
const patch=createFrame(256,128),p=painterFor(patch).place(128,94),opts=resolveOptions(burn.meta);
burn.drawBack(p,0,opts);burn.draw(p,0,opts);
assert(patch.color.some(c=>c>>>24),'burn visible on first frame');
assert.deepEqual(frame(2),frame(2),'deterministic');
assert.notDeepEqual(frame(2),frame(2,{palette:['#102','#83b','#edf']}),'palette recolors');
const ground=frame(8);
assert(ground.color.slice(240*ground.w,290*ground.w).some(c=>c>>>24),'persistent flames remain at ground height');
assert(ground.color.slice(0,200*ground.w).every(c=>!c),'ground trail never wraps into sky rows');
const end=frame(satellite.meta.duration);assert(end.color.every(c=>!c)&&end.light.every(c=>!c),'ends empty');
console.log('Satellite: sky coverage, immediate ignition, growing trail, persistence and expiry pass.');
