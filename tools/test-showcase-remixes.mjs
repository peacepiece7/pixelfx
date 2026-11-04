import assert from 'node:assert/strict';
import { createFrame, createFx, stockActor } from '../src/core/index.js';
import * as ice from '../src/fx/ice/freeze-slam-showcase.js';
import * as wings from '../src/fx/holy/valkyrie-landing-showcase.js';
import * as missiles from '../src/fx/holy/adelvin-orb-array-showcase.js';
import * as blood from '../src/fx/blood/blood-boom-showcase.js';
function frame(mod,t,options={}) {
 const f=createFrame(...mod.meta.size), fx=createFx(mod,{x:mod.meta.origin[0],y:mod.meta.origin[1],actor:stockActor(2),...options});
 for(let elapsed=0;elapsed<t-1e-9;elapsed+=1/120)fx.update(Math.min(1/120,t-elapsed));
 fx.draw(f,'back');fx.draw(f,'front');return f;
}
for(const mod of [ice,wings,missiles,blood]) {
 assert.deepEqual(frame(mod,.3),frame(mod,.3),'seeded output is repeatable');
 const end=frame(mod,mod.meta.duration+.01);
 if(!mod.meta.loop)assert(end.color.every(c=>c===0)&&end.light.every(c=>c===0),'ends empty');
 assert.notDeepEqual(frame(mod,.3),frame(mod,.3,{palette:['#041a0c','#36a66d','#caffdf']}),'palette recolors');
}
assert(ice.previewActorY(.2)<-20 && ice.previewActorY(ice.HIT)===0,'jump ends on impact');
assert(wings.previewActorY(0)<0 && wings.previewActorY(.14)===0,'wings precede landing');
assert(frame(wings,.08).color.filter(c=>c>>>24).length>500,'large wings exist before hit');
assert.notDeepEqual(frame(missiles,.8),frame(missiles,1.3),'missiles travel');
const empty=frame(missiles,1,{count:0});assert(empty.color.every(c=>c===0),'zero stored missiles stays empty');
assert.notDeepEqual(frame(blood,.4),frame(blood,.85),'blood rises then falls');
// One pulse consumes one orb, never an automatic volley; impact has visible fragments.
const f=createFrame(...missiles.meta.size),fx=createFx(missiles,{x:64,y:116});
const targetPixels=()=>{f.color.fill(0);f.light.fill(0);fx.draw(f);let n=0;for(let y=0;y<f.h;y++)for(let x=220;x<f.w;x++)if(f.color[y*f.w+x]||f.light[y*f.w+x])n++;return n;};
fx.update(3);assert.equal(targetPixels(),0,'no automatic launch');
fx.options.pulse=1;fx.update(.8);assert(targetPixels()>60,'original impact restored');
fx.update(2);assert.equal(targetPixels(),0,'held pulse does not repeat');
const resting=createFx(missiles,{x:64,y:116,count:4});resting.update(5.8);
const expected=createFrame(...missiles.meta.size);resting.draw(expected);targetPixels();
assert.deepEqual(f,expected,'exactly one stored orb consumed');
fx.options.pulse=0;fx.update(.01);fx.options.pulse=1;fx.update(.8);assert(targetPixels()>60,'second pulse fires another');
console.log('Four showcase remixes: motion, palette, deterministic frames and empty endpoints pass.');
