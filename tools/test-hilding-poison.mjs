// Run: node tools/test-hilding-poison.mjs
import assert from 'node:assert/strict';
import {createFx,createFrame,clearFrame} from '../src/core/index.js';
import {effects,categories} from '../src/fx/index.js';
const names=['poison-arrow','poison-dagger','poison-fog','poison-mine','mine-burst','poison-detonation','poison-transfer'];
const make=(mod,options={})=>createFx(mod,{x:200,y:150,...options});
function render(mod,t,options={},hz=120){
 const f=createFrame(400,260),fx=make(mod,options),n=Math.round(t*hz);
 for(let i=0;i<n;i++)fx.update(1/hz);
 if(t>n/hz+1e-9)fx.update(t-n/hz);
 fx.draw(f,'back');fx.draw(f,'front');return f;
}
const empty=f=>f.color.every(c=>!c)&&f.light.every(c=>!c);
assert(categories.some(c=>c.id==='poison'),'Gallery category registered');
for(const name of names){
 const mod=effects[`poison/${name}`];assert(mod&&typeof mod.create==='function',`${name}: simulated module registered`);
 const a=render(mod,.2),b=render(mod,.2);
 assert(!empty(a),`${name}: visible`);assert.deepEqual(a,b,`${name}: seeded repeatability`);
 assert(!empty(render(mod,.2,{flip:true,angle:.3})),`${name}: transformed`);
 assert.notDeepEqual(a.color,render(mod,.2,{palette:['#160a30','#8a6aa0','#ffffff']}).color,`${name}: palette`);
 assert(render(mod,.2,{light:0}).light.every(c=>!c),`${name}: lighting control`);
 for(const t of [.1,.2,.4]){
  const low=render(mod,t,{},30),high=render(mod,t,{},60);
  assert.deepEqual(low,high,`${name}: 30/60Hz at ${t}`);
 }
 if(!mod.meta.loop){
  for(const t of [0,mod.meta.duration,mod.meta.duration+.1])assert(empty(render(mod,t)),`${name}: clean lifecycle at ${t}`);
 }else{
  const fx=make(mod);fx.update(.6);fx.stop();fx.update(.31);
  const f=createFrame(400,260);fx.draw(f);assert(empty(f)&&fx.done(),`${name}: host stop ends both layers`);
  for(const option of [{remaining:0},{elapsed:0}])assert(empty(render(mod,.4,option)),`${name}: host lifecycle endpoint`);
 }
}
const fog=effects['poison/poison-fog'],mine=effects['poison/poison-mine'];
assert.deepEqual(render(fog,0),render(fog,5),'Fog color/light seam across five seconds');
const dim=render(fog,.2,{pulse:0}),bright=render(fog,.2,{pulse:1});
assert.deepEqual(dim.color,bright.color,'Pulse changes lighting, not poison geometry');
assert.notDeepEqual(dim.light,bright.light,'Pulse is visible');
assert.notDeepEqual(render(mine,.3).color,render(mine,.5).color,'Preparation becomes ready at 0.5 seconds');
assert.deepEqual(render(mine,12),render(mine,24),'Ready mine loops without re-arming');
assert.deepEqual(render(mine,1,{elapsed:.3}),render(mine,.3,{elapsed:.3}),'Installation age overrides the animation clock');
assert.notDeepEqual(render(mine,1,{elapsed:.49}).color,render(mine,1,{elapsed:.5}).color,'Host installation age arms exactly at 0.5 seconds');
const old=make(mine),young=make(mine);old.update(.7);young.update(.2);
const f=createFrame(400,260);young.draw(f);const before=f.color.slice();
old.update(1);clearFrame(f);young.draw(f);assert.deepEqual(f.color,before,'One area cannot advance another');
const det=effects['poison/poison-detonation'];
assert.notDeepEqual(render(det,.2,{stacks:1}).color,render(det,.2,{stacks:30}).color,'Snapshot stacks change visual scale');
assert(!empty(render(det,.2,{stacks:10000})),'Large stack count remains renderable');
for(const name of ['poison-arrow','poison-dagger','poison-transfer']){
 const mod=effects[`poison/${name}`];
 assert(!empty(render(mod,.2,{travelDistance:0})),'Host-driven projectile origin remains visible');
 assert.notDeepEqual(render(mod,.2).color,render(mod,.2,{travelDistance:0}).color,'Preview travel can be disabled');
}
console.log('Hilding 7 VFX: registry, determinism, 30/60Hz, palette/facing, independent lifetimes, host stop, fog pulse/seam, mine arming, snapshot scale and projectile modes passed');
