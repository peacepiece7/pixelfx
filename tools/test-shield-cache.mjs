import assert from 'node:assert/strict';
import { createFrame, clearFrame, createFx } from '../src/core/index.js';
import * as shield from '../src/fx/holy/divine-shield.js';
const a=createFrame(180,140),b=createFrame(180,140);
const options=[{x:70,y:95,seed:7},{x:85,y:100,seed:42,flip:true},{x:61.25,y:80.75,angle:.3,seed:3},{x:110,y:90,radius:40,palette:['#002','#126','#acf'],seed:2}];
const cached=options.map(o=>createFx(shield,o)),raw=options.map(o=>createFx(shield,{...o,cacheGeometry:false}));
for(let tick=0;tick<82;tick++){
  for(const f of [a,b]){clearFrame(f);f.color.fill(0x60402010);f.light.fill(0xff010203);}
  for(const layer of ['back','front']){
    cached.forEach(f=>f.draw(a,layer));raw.forEach(f=>f.draw(b,layer));
    assert.ok(Buffer.from(a.color.buffer).equals(Buffer.from(b.color.buffer)),`color ${tick}/${layer}`);
    assert.ok(Buffer.from(a.light.buffer).equals(Buffer.from(b.light.buffer)),`light ${tick}/${layer}`);
  }
  if(tick===72)[...cached,...raw].forEach(f=>f.stop());
  [...cached,...raw].forEach(f=>f.update(1/30));
}
shield.clearCache();console.log('ok: geometry cache preserves overlap, transforms, palettes, seed, alpha, light and stop fade');
