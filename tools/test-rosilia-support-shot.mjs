import assert from 'node:assert/strict';
import {createFrame,painterFor,resolveOptions} from '../src/core/index.js';
import * as fx from '../src/fx/projectiles/rosilia-support-shot.js';
const render=seconds=>{
 const f=createFrame(...fx.meta.size),p=painterFor(f).place(...fx.meta.origin);
 fx.draw(p,.2,resolveOptions(fx.meta,{pulse:Math.max(0,1-seconds/.35)}));return f;
};
// All test rectangles are relative to the impact, independent of preview padding.
const mass=(f,x0,y0,x1,y1)=>{
 let n=0;for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++)
 n+=f.color[(y+fx.meta.origin[1])*f.w+x+fx.meta.origin[0]]>>>24;return n;
};
assert(mass(render(.05),-80,-95,-60,-72)>1000,'solid bullet visible during flight');
assert.equal(mass(render(.29),-107,-129,-90,-110),0,'old upstream tail erased first');
assert(mass(render(.29),-42,-50,-25,-30)>0,'new downstream tail survives');
assert(render(.35).color.every(c=>!c),'no front particles after pulse ends');
for(let i=0;i<7;i++)assert.notDeepEqual(render(i*.05),render((i+1)*.05),'each 50ms beat changes');
assert.equal(mass(render(.09),-15,-2,15,11),0,'impact stays absent until contact');
assert(mass(render(.10),-25,-22,25,3)>10000,'ultimate contact has a bright blast');
const rim=createFrame(...fx.meta.size);
fx.drawBack(painterFor(rim).place(...fx.meta.origin),0,resolveOptions(fx.meta));
assert.equal(mass(rim,15,-9,25,-5),0,'sight interior remains hollow between cross and rim');
assert(mass(rim,-35,-1,35,2)>10000,'large central cross is clearly inked');
for(const seed of [1,7,17,31])for(let step=0;step<=21;step++) {
 const [w,h]=fx.meta.size,f=createFrame(w+40,h+40),p=painterFor(f).place(fx.meta.origin[0]+20,fx.meta.origin[1]+20);
 const o=resolveOptions(fx.meta,{seed,pulse:Math.max(0,1-(step/60)/.35)});
 fx.drawBack(p,.2,o);fx.draw(p,.2,o);
 for(let y=0;y<f.h;y++)for(let x=0;x<f.w;x++)if(x<20||x>=w+20||y<20||y>=h+20)
  assert.equal(f.color[y*f.w+x],0,`canvas bounds: seed ${seed}, frame ${step}`);
}
console.log('Flight, sequential wake, hollow scope, impact timing and four-seed bounds pass.');
