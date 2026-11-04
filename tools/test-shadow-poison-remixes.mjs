import assert from 'node:assert/strict';
import { createFrame, createFx, stockActor } from '../src/core/index.js';
import * as awaken from '../src/fx/shadow/vampire-awaken-showcase.js';
import * as revert from '../src/fx/shadow/vampire-revert-showcase.js';
import * as shroud from '../src/fx/shadow/dark-shroud-showcase.js';
import * as wave from '../src/fx/shadow/dark-wave-showcase.js';
import * as oldWave from '../src/fx/shadow/dark-wave.js';
import * as mine from '../src/fx/poison/mine-burst-showcase.js';
import * as detonation from '../src/fx/poison/poison-detonation-showcase.js';
import * as armor from '../src/fx/status/blood-armor-showcase.js';
import * as cloud from '../src/fx/nature/poison-cloud.js';
function frame(mod,t,opts={}) {
 const f=createFrame(480,320),fx=createFx(mod,{x:240,y:250,actor:stockActor(2),...opts});
 for(let at=0;at<t-1e-9;at+=1/120)fx.update(Math.min(1/120,t-at));
 fx.draw(f,'back');fx.draw(f,'front');return f;
}
for(const mod of [awaken,revert,shroud,wave,mine,detonation,armor,cloud]) {
 assert.deepEqual(frame(mod,.4),frame(mod,.4),'deterministic');
 assert.notDeepEqual(frame(mod,.4),frame(mod,.4,{palette:['#031122','#2377bb','#cceeff']}),'recolor');
 if(!mod.meta.loop) {
  const end=frame(mod,mod.meta.duration+.01);
  assert(end.color.every(c=>!c)&&end.light.every(c=>!c),'ends empty');
 }
}
for(const t of [.2,.4,.7,1,1.4]) {
 assert.deepEqual(frame(awaken,t),frame(revert,1.6-t),'release exactly reverses transformation');
 assert.equal(awaken.actorAlpha(t,awaken.meta.options),revert.actorAlpha(1.6-t,revert.meta.options),'actor visibility also reverses');
}
assert.notDeepEqual(frame(awaken,.5),frame(awaken,.5,{bats:0}),'original bat flock remains visible');
assert.notDeepEqual(frame(revert,1.1),frame(revert,1.1,{bats:0}),'reverse transformation retains the flock');
const span=f=>{let lo=f.w,hi=0;f.color.forEach((c,i)=>{if(c>>>24>100){lo=Math.min(lo,i%f.w);hi=Math.max(hi,i%f.w);}});return hi-lo;};
assert(span(frame(wave,.5))>=span(frame(oldWave,.5))*1.25,'ellipse is about 30% longer');
assert.notDeepEqual(frame(detonation,.25),frame(detonation,1.3),'smoke and burst dissipate');
assert.notDeepEqual(frame(armor,.1),frame(armor,.5),'single shadow aura breathes');
console.log('Shadow/poison remixes: reverse transformation, arc extension, recolor, motion and endpoints pass.');
