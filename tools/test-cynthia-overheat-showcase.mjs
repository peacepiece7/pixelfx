import assert from 'node:assert/strict';
import * as effect from '../src/fx/cynthia/overheat-showcase.js';
import { createFrame, painterFor, resolveOptions, stockActor } from '../src/core/index.js';
function frame(t,options={},layer='both') {
 const f=createFrame(...effect.meta.size),p=painterFor(f).place(...effect.meta.origin);
 const o=resolveOptions(effect.meta,{actor:stockActor(2),...options});
 if(layer!=='front')effect.drawBack(p,t,o);
 if(layer!=='back')effect.draw(p,t,o);
 return f;
}
assert.equal(effect.actorAlpha(),1,'hero remains visible');
assert.deepEqual(frame(0),frame(effect.meta.duration),'loop closes seamlessly');
assert.deepEqual(frame(.4),frame(.4),'deterministic');
assert.notDeepEqual(frame(.4),frame(.4,{seed:19}),'seed varies rising heat');
assert.notDeepEqual(frame(.4),frame(.4,{palette:['#04200a','#229952','#99eeab']}),'supports recoloring');
for(const t of [.1,.4,1.2,1.9])for(const c of frame(t).color) {
 if(c>>>24)assert((c&255)>(c>>>8&255)&&(c&255)>(c>>>16&255),'only red effect pixels, no cyan or white');
}
const a=frame(.25,{},'back'),b=frame(.5,{},'back');
assert.notDeepEqual(a,b,'heat keeps moving between glitch bursts');
assert(a.color.some((c,i)=>(c>>>24)>0&&Math.floor(i/a.w)<effect.meta.origin[1]-38),'heat rises above the hero');
const off=frame(.4,{strength:0});assert(off.color.every(c=>!c)&&off.light.every(c=>!c),'zero strength is empty');
console.log('Overheat: red-only tint, rising heat, visible hero, recolor and seamless loop pass.');
