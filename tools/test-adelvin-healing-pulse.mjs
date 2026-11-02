// Run: node tools/test-adelvin-healing-pulse.mjs
import assert from 'node:assert/strict';
import {createFrame, createFx} from '../src/core/index.js';
import * as pulse from '../src/fx/holy/adelvin-healing-pulse.js';

function render(t, options = {}, steps = 1) {
  const f = createFrame(400, 240), fx = createFx(pulse, {x:200,y:150,...options});
  for(let i=0;i<steps;i++) fx.update(t/steps);
  fx.draw(f,'back'); fx.draw(f,'front');
  return f;
}
const empty = f => f.color.every(c=>!c) && f.light.every(c=>!c);
function width(f) {
  let left=f.w,right=0;
  for(let i=0;i<f.color.length;i++) if((f.color[i]>>>24)>24) {
    left=Math.min(left,i%f.w); right=Math.max(right,i%f.w);
  }
  return right-left+1;
}
for(const t of [1/60,1/30,.1]) {
  assert(width(render(t))>=190,'First visible frames already show the full 100px-radius field');
}
assert(width(render(.2,{radius:45}))<110,'Radius follows host input');
for(const t of [0,.7,1]) assert(empty(render(t)),'No stale pulse at lifecycle endpoints');
assert(empty(render(.2,{radius:0})),'Zero radius is empty');
for(let i=1;i<21;i++) {
  const a=render(i/30,{},i),b=render(i/30,{},i*2);
  assert.deepEqual(a.color,b.color,'30/60Hz color agrees at common times');
  assert.deepEqual(a.light,b.light,'30/60Hz light agrees at common times');
}
const original=render(.2,{seed:43});
assert.notDeepEqual(original.color,render(.2,{seed:19}).color,'Seed varies the aura and crosses');
assert.deepEqual(original.color,render(.2,{seed:43}).color,'Instances do not share clocks or random state');
assert(!empty(render(.2,{flip:true,angle:.3})),'Host transforms remain visible');
assert(!empty(render(.2,{palette:['#130a22','#8053ab','#ffffff']})),'Short palettes resample');
assert(render(.2,{light:0}).light.every(c=>!c),'Host light switch is respected');
assert(original.color.some(c=>(c>>>24)>0&&(c>>>24)<255),'Aura and engraving use true alpha');
assert(!empty(render(.69)),'Final frame fades before the empty endpoint');
console.log('Healing pulse: immediate full radius, host options, 30/60Hz, deterministic independent instances, true alpha and clean ending passed');
