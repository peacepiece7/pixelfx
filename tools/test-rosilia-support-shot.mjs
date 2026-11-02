import assert from 'node:assert/strict';
import {createFrame,painterFor,resolveOptions} from '../src/core/index.js';
import * as fx from '../src/fx/projectiles/rosilia-support-shot.js';
const render=seconds=>{
 const f=createFrame(200,120),p=painterFor(f).place(100,87);
 fx.draw(p,.2,resolveOptions(fx.meta,{pulse:Math.max(0,1-seconds/.35)}));return f;
};
const mass=(f,x0,y0,x1,y1)=>{
 let n=0;for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++)n+=f.color[y*200+x]>>>24;return n;
};
const flight=render(.05),late=render(.20);
assert(mass(flight,45,35,65,55)>1000,'solid bullet body visible halfway through flight');
assert.equal(mass(late,23,12,39,29),0,'old upstream trail erased first');
assert(mass(late,68,54,87,74)>0,'new downstream trail still survives');
assert(render(.35).color.every(c=>!c),'no front particles after the pulse ends');
for(let i=0;i<7;i++)assert.notDeepEqual(render(i*.05),render((i+1)*.05),'each 50ms beat changes');
console.log('Solid round, oldest-first wake erasure, 50ms transitions and pulse end pass.');
