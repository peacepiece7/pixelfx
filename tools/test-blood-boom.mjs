// Run: node tools/test-blood-boom.mjs
import assert from "node:assert/strict";
import * as fx from "../src/fx/blood/blood-boom.js";
import { createFrame, painterFor, resolveOptions } from "../src/core/index.js";

function frame({ seed = 8, palette, flip = false, fps = 120, time = 0.6 } = {}) {
  const sim = fx.create(resolveOptions(fx.meta, { seed, ...(palette ? { palette } : {}) }));
  for (let i = 0; i < Math.round(time * fps); i++) sim.update(1 / fps);
  const f = createFrame(120, 140), p = painterFor(f).place(60, 116, flip);
  sim.drawBack(p); sim.draw(p);
  return f;
}
const a = frame();
assert.deepEqual(a, frame(), "same seed reproduces color and light");
assert.notDeepEqual(a.color, frame({ seed: 2 }).color, "seed changes the droplet scatter");
assert.notDeepEqual(a.color, frame({ palette: ["#112244", "#3377bb", "#99ddff", "#ffffff"] }).color, "short palettes recolor the effect");
const centroid = (f) => {
  let sum = 0, n = 0;
  f.color.forEach((c, i) => { if (c >>> 24) { sum += i % f.w; n++; } });
  assert(n > 0);
  return sum / n;
};
assert(Math.abs(centroid(a) + centroid(frame({ flip: true })) - 119) < 2, "droplet scatter mirrors about the feet");
for (const time of [1.4, 1.5]) {
  const end = frame({ time });
  assert(end.color.every((c) => c === 0) && end.light.every((c) => c === 0), "direct simulation ends empty in both layers");
}
console.log("Blood boom: deterministic scatter, recolor, mirror and empty endpoint pass.");

// The opaque foreground must cover a 48px hero at the eruption peak.
const peak = frame({ time: .4 });
for (let y = -48; y < 0; y++) for (let x = -12; x <= 12; x++) {
  assert.equal(peak.color[(116 + y) * 120 + 60 + x] >>> 24, 255, `uncovered hero at ${x},${y}`);
}
console.log("Peak fountain covers the full 48px hero silhouette.");

// The 50ms choreography must change at every beat, including the long settling tail.
assert.equal(fx.FLOW_BEATS.length, 29);
for (let i = 1; i < 28; i++) {
  assert.notDeepEqual(frame({time:i*.05}),frame({time:(i-1)*.05}),`motion at beat ${i}`);
}
for (const time of [.1,.3,.4,.6,.8,1,1.2,1.4]) {
  assert.deepEqual(frame({time,fps:30}),frame({time,fps:120}),`rate independence at ${time}`);
}
const ground = time => {
  const sim=fx.create(resolveOptions(fx.meta));sim.update(time);
  const f=createFrame(120,140);sim.drawBack(painterFor(f).place(60,116));return f;
};
const light=f=>f.light.reduce((n,c)=>n+(c&255)+(c>>>8&255)+(c>>>16&255),0);
assert(light(ground(.2))>light(ground(.05)),'seal light builds before release');
assert(light(ground(.3))>light(ground(1.25))*5,'seal and floor light decay');
for(let seed=1;seed<=8;seed++)for(let step=0;step<=28;step++) {
  const time=step*.05,sim=fx.create(resolveOptions(fx.meta,{seed}));sim.update(time);
  const f=createFrame(160,180),p=painterFor(f).place(80,136);
  sim.drawBack(p);sim.draw(p);
  for(let y=0;y<180;y++)for(let x=0;x<160;x++) {
    if(x<20||x>=140||y<20||y>=160)assert.equal(f.color[y*160+x],0,`spill seed=${seed}, t=${time}`);
  }
}
console.log('All 29 beats, rate independence, seal lighting and eight-seed canvas bounds pass.');
