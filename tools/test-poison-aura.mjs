import assert from 'node:assert/strict';
import {createFx,createFrame,clearFrame} from '../src/core/index.js';
import * as aura from '../src/fx/poison/poison-aura.js';
import {stockActor} from '../src/core/index.js';
import {shape} from '../src/fx/status/_lib.js';
import * as transfer from '../src/fx/poison/poison-transfer.js';
const frame=()=>createFrame(360,220);
function render(t,options={},hz=60){
 const f=frame(),fx=createFx(aura,{x:180,y:150,...options});
 const n=Math.round(t*hz);for(let i=0;i<n;i++)fx.update(1/hz);
 fx.draw(f,'back');fx.draw(f,'front');return f;
}
const empty=f=>f.color.every(c=>!c)&&f.light.every(c=>!c);
const light=f=>f.light.reduce((sum,c)=>sum+(c&255)+(c>>>8&255)+(c>>>16&255),0);
for(const stacks of [0,-1])assert(empty(render(.3,{stacks})),'No poison means no aura');
assert(light(render(.3,{stacks:6}))>light(render(.3,{stacks:1})),'Stacks deepen the same aura');
assert(light(render(.3,{stacks:1,pulse:1}))>light(render(.3,{stacks:1,pulse:0})),'Real application pulse is visible');
assert.deepEqual(render(0),render(2),'Aura loop seam');
for(let i=0;i<=20;i++)assert.deepEqual(render(i/30,{},30),render(i/30,{},60),'30/60Hz matches');
assert(!empty(render(.3,{stacks:10000,flip:true,angle:.2})),'Large counts and facing remain supported');
assert.notDeepEqual(render(.3).color,render(.3,{palette:['#180b20','#b284d1','#ffffff']}).color,'Palette supported');
const actor=(w,h)=>({x:-w/2,y:-h,w,h,mask:{w,h,data:new Uint8Array(w*h).fill(255)},pixels:new Uint32Array(w*h).fill(0xff888888)});
assert.notDeepEqual(render(.3,{actor:actor(14,48)}).color,render(.3,{actor:actor(40,24)}).color,'Uses supplied monster silhouette');
for(const options of [{elapsed:0},{remaining:0}])assert(empty(render(.3,options)),'Host lifecycle ends aura');
const fx=createFx(aura,{x:180,y:150,stacks:1}),f=frame();fx.update(.3);fx.draw(f);const first=f.color.slice();
fx.options.stacks=6;clearFrame(f);fx.draw(f);assert.notDeepEqual(f.color,first,'Live stacks update the same instance');
fx.options.stacks=0;clearFrame(f);fx.draw(f);assert(empty(f),'Live removal empties both layers');
fx.stop();fx.update(.31);assert(fx.done(),'Host stop ends status');
for(const t of [0,.5,.7]){const g=frame(),q=createFx(transfer,{x:100,y:150});q.update(t);q.draw(g);assert(empty(g),'Skull transfer ends empty');}
// Wetness calls the bleeding torso emitter, so reserve a different source
// region for poison on the stock actor and differently proportioned monsters.
for(const body of [stockActor(2),actor(14,48),actor(40,24)]){
 const S=shape(body),sites=aura.dripSites(body);
 assert.equal(sites.length,2);
 for(const site of sites){
  assert(Math.abs(site.x-body.x-S.w/2)>=S.w*.22+4.49,'Poison is outside the shared bleed/wet strip');
  assert(site.y-body.y>=S.h*.64,'Poison starts below the bleed/wet torso');
  assert.equal(Math.sign(site.x-body.x-S.w/2),site.side,'Drops drift away from torso lanes');
 }
}
console.log('Poison aura: zero/live stacks, density/pulse, seams, 30/60Hz, monster masks, palette/facing, lifecycle; skull transfer endpoints passed');
