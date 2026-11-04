import assert from 'node:assert/strict';
import { createFrame, createFx } from '../src/core/index.js';
import * as impact from '../src/fx/cynthia/jericho-impact-showcase.js';
import * as rockets from '../src/fx/cynthia/jericho-flight-showcase.js';
import * as oldImpact from '../src/fx/cynthia/jericho-impact.js';
import * as transferred from '../src/fx/cynthia/ignition-burst-showcase.js';
import * as marker from '../src/fx/cynthia/ignition-marker-showcase.js';
import * as zone from '../src/fx/cynthia/ignition-zone-showcase.js';
function frame(mod,t,options={}) {
 const f=createFrame(...mod.meta.size),fx=createFx(mod,{x:mod.meta.origin[0],y:mod.meta.origin[1],...options});
 for(let at=0;at<t-1e-9;at+=1/120)fx.update(Math.min(1/120,t-at));
 fx.draw(f,'back');fx.draw(f,'front');return f;
}
const coverage=f=>f.color.reduce((n,c)=>n+(c>>>24),0);
assert(coverage(frame(impact,.02))>0,'Grenade explodes immediately, without fuse delay');
assert(coverage(frame(impact,.9))<coverage(frame(impact,.9,{smokeDecay:1})),'smoke disappears faster than the original lifetime');
for(const t of [.1,.5,1,1.6])assert.deepEqual(frame(transferred,t),frame(oldImpact,t),'Laevateinn preserves previous Jericho impact');
for(const mod of [impact,rockets,transferred,marker,zone]){
 assert.deepEqual(frame(mod,.3),frame(mod,.3),'deterministic');
 const end=frame(mod,mod.meta.duration+.01);assert(end.color.every(c=>!c)&&end.light.every(c=>!c),'ends empty');
}
assert.equal(rockets.meta.duration,1.15+.65+impact.meta.duration,'last rocket impact has time to finish');
console.log('Cynthia swaps: immediate blast, faster smoke, exact transferred art and endpoints pass.');
