import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createFx, createFrame } from '../src/core/index.js';
import * as shield from '../src/fx/holy/divine-shield.js';
const hash=fx=>{
  const frame=createFrame(88,84);fx.draw(frame,'back');fx.draw(frame,'front');
  return createHash('sha256').update(new Uint8Array(frame.color.buffer)).update(new Uint8Array(frame.light.buffer)).digest('hex');
};
const a=createFx(shield,{seed:7,x:44,y:68}), b=createFx(shield,{seed:7,x:44,y:68});
const first=hash(a);
for(let tick=1;tick<=144;tick++){
  a.update(1/30);b.update(1/60);b.update(1/60);
  assert.equal(a.t,b.t,`time ${tick}`);assert.equal(hash(a),hash(b),`pixels ${tick}`);
  if(tick%72===0)assert.equal(hash(a),first,`loop ${tick}`);
}
a.stop();b.stop();for(let i=0;i<10;i++){a.update(1/30);b.update(1/60);b.update(1/60);}
assert.ok(a.done() && b.done());
console.log('ok: 30/60Hz elapsed time, shield pixels, two loop seams and stop');
