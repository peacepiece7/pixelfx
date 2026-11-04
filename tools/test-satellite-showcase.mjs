import assert from 'node:assert/strict';
import * as satellite from '../src/fx/cynthia/satellite-showcase.js';
import * as burn from '../src/fx/cynthia/satellite-trail-showcase.js';
import { createFrame, createFx, painterFor, resolveOptions } from '../src/core/index.js';
const o=satellite.meta.options;
assert.equal(satellite.trailPoints(satellite.HIT-.001,o).length,0,'no fire before impact');
assert.equal(satellite.trailPoints(satellite.HIT,o).length,1,'fire begins at impact');
assert(satellite.trailPoints(3,o).length>satellite.trailPoints(1,o).length,'trail accumulates while moving');
const points=satellite.trailPoints(6,o);
assert(points.at(-1).position[0]-points[0].position[0]>180,'burning ground spans the traveled path');
assert(satellite.trailPoints(satellite.END+1,o).length>0,'trail remains after beam stops');
assert.equal(satellite.trailPoints(satellite.END+burn.meta.duration,o).length,0,'all patches expire');
function frame(t,opts={},w=700,h=320){
 const f=createFrame(w,h),fx=createFx(satellite,{...opts,x:100,y:h-50});fx.update(t);fx.draw(f,'back');fx.draw(f,'front');return f;
}
for(const h of [320,420]){
 const f=frame(2,{},700,h);
 assert(f.color.slice(0,f.w).some(c=>c>>>24),'beam reaches viewport top without a floating cap');
}
const patch=createFrame(256,128),p=painterFor(patch).place(128,94),opts=resolveOptions(burn.meta);
burn.drawBack(p,0,opts);burn.draw(p,0,opts);
assert(patch.color.some(c=>c>>>24),'burn visible on first frame');
assert.deepEqual(frame(2),frame(2),'deterministic');
assert.notDeepEqual(frame(2),frame(2,{palette:['#102','#83b','#edf']}),'palette recolors');
const ground=frame(8);
assert(ground.color.slice(240*ground.w,290*ground.w).some(c=>c>>>24),'persistent flames remain at ground height');
assert(ground.color.slice(0,200*ground.w).every(c=>!c),'ground trail never wraps into sky rows');
const end=frame(satellite.meta.duration);assert(end.color.every(c=>!c)&&end.light.every(c=>!c),'ends empty');
console.log('Satellite: sky coverage, immediate ignition, growing trail, persistence and expiry pass.');

// The sky portion must be the ORIGINAL Warp in, not a look-alike shader.
const warp=await import('../src/fx/scifi/warp-in.js');
for(const time of [.72,1.23,3.17,5.9]){
 const w=700,h=320,actual=frame(time),expected=createFrame(w,h),start=satellite.HIT-.34;
 const impl=warp.create(resolveOptions(warp.meta,{palette:o.palette,seed:o.seed,beamOnly:true,width:o.width,height:270,skyConnected:true,hold:satellite.END-start-1.9}));
 const steps=Math.ceil(time*120-1e-9);let clock=0;
 for(let i=0;i<steps;i++){const prev=clock;clock=Math.round((clock+time/steps)*1e9)/1e9;const dt=Math.max(0,clock-start)-Math.max(0,prev-start);if(dt>0)impl.update(dt);}
 const [x,y]=satellite.beamPosition(clock,o),p=painterFor(expected).place(100+x,270+y);
 impl.drawBack(p);impl.draw(p);
 assert.deepEqual(actual.color.slice(0,w*180),expected.color.slice(0,w*180),'native Warp in pixels '+time);
 assert.deepEqual(actual.light.slice(0,w*180),expected.light.slice(0,w*180),'native Warp in light '+time);
}
const layered=createFrame(700,320),live=createFx(satellite,{x:100,y:270});live.update(2);
live.draw(layered,'back');
assert(layered.color.slice(0,700*180).every(v=>!v),'beam is not behind enemies');
const [cx]=satellite.beamPosition(2,o),enemyX=Math.round(100+cx),enemy=0xff20ff20;
for(let y=215;y<265;y++)layered.color.fill(enemy,y*700+enemyX-15,y*700+enemyX+15);
live.draw(layered,'front');
let covered=0;for(let y=215;y<265;y++)for(let x=enemyX-15;x<enemyX+15;x++)if(layered.color[y*700+x]!==enemy)covered++;
assert(covered>500,'Warp in visibly overlays the enemy');
console.log('Satellite: exact native Warp in sky pixels/light and foreground enemy occlusion pass.');
