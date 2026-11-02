// Run: node tools/test-vfx-soft-transitions.mjs
import assert from 'node:assert/strict';
import {createFrame,painterFor,resolveOptions} from '../src/core/index.js';
import {haze,pool,softBand} from '../src/fx/_soft.js';
import * as support from '../src/fx/projectiles/rosilia-support-shot.js';
const render=pulse=>{
 const f=createFrame(200,120),p=painterFor(f).place(100,87),o=resolveOptions(support.meta,{pulse});
 support.drawBack(p,.2,o);support.draw(p,.2,o);return f;
};
const light=f=>f.light.reduce((n,c)=>n+(c&255)+(c>>>8&255)+(c>>>16&255),0);
assert(light(render(1-.1/.35))>light(render(.3))*2,'contact flashes brighter than settling dust');
assert.notDeepEqual(render(.98),render(1-.1/.35),'travelling tracer is distinct from ground contact');
assert.notDeepEqual(render(.65),render(.25),'dust expands and settles instead of holding a sticker');
const f=createFrame(100,50),p=painterFor(f).place(50,25);
haze(p,0,0,9,0xffffffff,.6);
assert((f.color[25*100+50]>>>24)>(f.color[25*100+57]>>>24),'mist feathers toward its edge');
assert((f.color[25*100+50]>>>24)<255,'mist remains translucent');
pool(p,0,0,30,5,0xffffffff,.4);
assert(f.light[25*100+65] && !f.light[35*100+50],'light lies on the floor');
softBand(p,0,0,35,.24,1,.5,[0xff333333,0xff777777,0xffbbbbbb,0xffffffff]);
assert(f.color.some(c=>(c>>>24)>0&&(c>>>24)<255),'floor rim uses actual alpha');
console.log('Soft volumes, floor light and externally driven impact transitions pass.');
