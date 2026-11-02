import assert from 'node:assert/strict';
import {createFrame,createFx} from '../src/core/index.js';
import * as array from '../src/fx/holy/adelvin-orb-array.js';
import * as flight from '../src/fx/holy/adelvin-orb-flight.js';
import * as impact from '../src/fx/holy/adelvin-impact.js';
function render(mod,t,options={},steps=1){
 const f=createFrame(240,200),fx=createFx(mod,{x:120,y:110,...options});
 for(let i=0;i<steps;i++)fx.update(t/steps);
 fx.draw(f,'back');fx.draw(f,'front');return f;
}
const empty=f=>f.color.every(v=>!v)&&f.light.every(v=>!v);
for(const t of [0,.3,1,2])assert(empty(render(array,t,{count:0})));
for(const count of [1,5,12,24]){
 assert(!empty(render(array,.3,{count})));
 assert.deepEqual(render(array,0,{count}).color,render(array,2,{count}).color);
}
assert.notDeepEqual(render(array,.3,{count:5}).color,render(array,.3,{count:12}).color);
for(const mod of [array,flight]){
 const a=render(mod,0),b=render(mod,mod.meta.duration);
 assert.deepEqual(a.color,b.color);assert.deepEqual(a.light,b.light);
 assert(!empty(render(mod,.3,{flip:true,angle:.3})));
 assert.notDeepEqual(render(mod,.3).color,render(mod,.3,{palette:['#110a22','#542277','#be66df','#ffffff']}).color);
}
assert(empty(render(impact,.55)));assert(empty(render(impact,.7)));
assert.deepEqual(render(impact,.3).color,render(impact,.3,{},30).color);
console.log('Orb count0/1/5/12/24, loops, facing, palette and impact ending passed');
