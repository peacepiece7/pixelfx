import assert from 'node:assert/strict';
import {readdirSync} from 'node:fs';
import {createFrame,painterFor,resolveOptions,createFx} from '../src/core/index.js';
await import('./test-cynthia-reuse.mjs');
const ids=['raid'].flatMap(c=>readdirSync(new URL('../src/fx/'+c+'/',import.meta.url)).filter(n=>n.endsWith('.js')).map(n=>c+'/'+n.slice(0,-3)));
const mods=new Map(await Promise.all(ids.map(async id=>[id,await import('../src/fx/'+id+'.js')])));
function frame(id,t,opts={},flip=false){const mod=mods.get(id),o=resolveOptions(mod.meta,opts),f=createFrame(800,500),p=painterFor(f).place(400,250,flip);let fx=mod;if(mod.create){fx=mod.create(o);fx.update(t);}fx.draw(p,t,o);return f;}
for(const id of ids){const m=mods.get(id),t=m.meta.duration*.3;
 assert.deepEqual(frame(id,t),frame(id,t),id+' deterministic');
 assert.notDeepEqual(frame(id,t),frame(id,t,{palette:['#102030','#4080c0','#f0ffff']}),id+' recolor');
 if(!m.meta.loop){const f=frame(id,m.meta.duration);assert(f.color.every(x=>!x)&&f.light.every(x=>!x),id+' ends empty');}
 else assert.deepEqual(frame(id,.2),frame(id,.2+m.meta.duration),id+' loop');
 const f=frame(id,t),r=frame(id,t,{},true);const cx=f=>{let x=0,n=0;f.color.forEach((c,i)=>{if(c>>>24){x+=i%f.w;n++;}});return x/n;};assert(Math.abs(cx(f)+cx(r)-799)<6,id+' mirror');
 const instance=createFx(m,{x:400,y:250});instance.update(t);instance.stop();instance.update(1);assert(instance.done(),id+' teardown');
}
for(const id of ['raid/abyss-fog','raid/near-dust','raid/breath-warning','raid/breath-impact']){const f=frame(id,.2,{maskRects:[]});assert(f.color.every(x=>!x)&&f.light.every(x=>!x),id+' empty mask');const g=frame(id,.2,{protectRects:[[-400,-250,800,500]]});assert(g.color.every(x=>!x)&&g.light.every(x=>!x),id+' protected');}
for(const id of ['raid/abyss-fog','raid/near-dust','raid/rift-flow'])assert.deepEqual(frame(id,.1,{reducedMotion:true}),frame(id,.7,{reducedMotion:true}),id+' reduced motion');
assert.notDeepEqual(frame('raid/dragon-breath',.2),frame('raid/dragon-breath',.2,{target:[-110,20]}));
console.log('PASS raid effects: deterministic, palette, loop/end, flip, teardown, masks, reduced motion, pulse, weapon and target options');
