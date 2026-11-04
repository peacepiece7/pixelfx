import assert from 'node:assert/strict';
import {createFrame,createFx} from '../src/core/index.js';
import {flight,rocketFlight} from '../src/core/cynthia-reuse.js';
const names=['gunfire','ignition-burst','ignition-marker','ignition-zone','jericho-flight','jericho-impact','overheat','satellite-trail','satellite'];
async function render(name,time,options={}){
 const mod=await import('../src/fx/cynthia/'+name+'.js'),f=createFrame(800,500),fx=createFx(mod,{x:300,y:270,seed:7,...options});
 for(let t=0;t<time;){const dt=Math.min(1/60,time-t);fx.update(dt);t+=dt;}
 fx.draw(f);return {f,fx,mod};
}
for(const name of names){
 const a=await render(name,.8),b=await render(name,.8);assert.deepEqual(a.f,b.f,name+' deterministic');
 const colored=await render(name,.8,{palette:['#021c34','#107fbb','#a1ffff']});assert.notDeepEqual(a.f,colored.f,name+' palette');
 const end=await render(name,a.mod.meta.duration);if(!a.mod.meta.loop)assert(end.f.color.every(v=>!v)&&end.f.light.every(v=>!v),name+' ends empty');
 a.fx.stop();a.fx.update(.31);assert(a.fx.done(),name+' stops');
}
assert.deepEqual(flight(0,{muzzleX:31,muzzleY:-28},.65,38,true).slice(0,2),[31,-28]);
assert.deepEqual(flight(.65,{targetX:210,targetY:12},.65,38,true).slice(0,2),[210,12]);
assert.equal(rocketFlight(.3,{muzzleY:-24})[1],-24);
assert.deepEqual(rocketFlight(.65,{targetX:180,targetY:0}).slice(0,2),[180,0]);
assert.notDeepEqual((await render('gunfire',.64,{weapon:'gatling'})).f,(await render('gunfire',.64,{weapon:'rifle'})).f);
for(const t of [1,3,5.9,6.5]){const {f}=await render('ignition-burst',t);assert(f.color.some(v=>v>>>24),'plasma remains visible '+t);}
const {f:floor}=await render('satellite-trail',3);assert(floor.color.some(v=>v>>>24),'persistent fire floor');
console.log('PASS Cynthia: 9 reusable effects, palette, lifetime, teardown, muzzle/target endpoints, burst cadence, slow plasma and persistent floor');

assert.notDeepEqual((await render('ignition-burst',2)).f,(await render('ignition-burst',5)).f,'held plasma keeps animating');
