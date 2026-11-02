// Run: node tools/test-rosilia-infinite-sheen.mjs
import assert from 'node:assert/strict';
import * as fx from '../src/fx/status/rosilia-infinite-magazine.js';
import { createFrame, painterFor, resolveOptions, stockActor } from '../src/core/index.js';
function front(t, options = {}) {
 const o = resolveOptions(fx.meta, options), f = createFrame(96,80), p = painterFor(f).place(48,66);
 fx.draw(p,t,o);return f;
}
assert.deepEqual(front(0),front(1));
assert.notDeepEqual(front(.25),front(.25,{intro:1}));
const actor=stockActor(2),f=front(.25);
for(let y=0;y<80;y++)for(let x=0;x<96;x++)if(f.color[y*96+x]>>>24){
 const mx=x-48-actor.x,my=y-66-actor.y;
 // Front ribbons may extend outside the body; occupied pixels remain readable.
 if(!(mx>=0&&my>=0&&mx<actor.mask.w&&my<actor.mask.h&&actor.mask.data[my*actor.mask.w+mx]))continue;
 assert((f.color[y*96+x]>>>24)<200,'sheen remains translucent');
}
const mask={w:20,h:48,data:new Uint8Array(20*48).fill(1)};
assert(front(.25,{actor:{mask,x:-10,y:-48,w:20,h:48,chest:[0,-30]}}).color.some(c=>c>>>24));
assert.notDeepEqual(front(.25),front(.6),'energy and sheen move through the loop');
console.log('Infinite aura: seamless, intro, moving ribbons, translucent occupied-pixel highlights and 48px actor pass.');
