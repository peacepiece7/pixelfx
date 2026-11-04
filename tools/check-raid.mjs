import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {createFrame,createFx} from '../src/core/index.js';
const cases=[['abyss-fog',2,620,100],['dragon-breath',1.1,530,100],['phase-surge',2,450,90],['rift-flow',2,300,200],['near-dust',2,500,100],['heavy-stomp',.8,260,20]];
function sample(mod,t,options={}){
 const f=createFrame(...mod.meta.size),fx=createFx(mod,{...options,x:mod.meta.origin[0],y:mod.meta.origin[1]});
 for(let elapsed=0;elapsed<t;){const dt=Math.min(1/60,t-elapsed);fx.update(dt);elapsed+=dt;}
 fx.draw(f,'back');fx.draw(f,'front');
 let left=f.w,top=f.h,right=-1,bottom=-1,count=0;
 for(let i=0;i<f.color.length;i++)if(f.color[i]||f.light[i]){const x=i%f.w,y=Math.floor(i/f.w);left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);count++;}
 return {f,width:right-left+1,height:bottom-top+1,count};
}
for(const [id,t,width,height] of cases){
 const mod=await import(`../src/fx/raid/${id}.js`),a=sample(mod,t),b=sample(mod,t);
 assert.deepEqual(a.f.color,b.f.color,`${id}: seeded color`);assert.deepEqual(a.f.light,b.f.light,`${id}: seeded light`);
 assert.ok(a.width>=width&&a.height>=height,`${id}: too small ${a.width}x${a.height}`);
 if(!mod.meta.loop)assert.equal(sample(mod,mod.meta.duration+.1).count,0,`${id}: does not end empty`);
 assert.equal(sample(mod,t,{protectRects:[[-1000,-1000,2000,2000]]}).count,0,`${id}: protected region`);
 if(id==='phase-surge'){
  let signals=0;const fx=createFx(mod,{onShake:()=>signals++,reducedMotion:true});fx.update(1);assert.equal(signals,0);
 }
 console.log(`PASS ${id}: visible ${a.width}x${a.height}, ${a.count} pixels; seeded, masks, end`);
}
for(const id of ['breath-warning','breath-impact'])assert.equal(existsSync(new URL(`../src/fx/raid/${id}.js`,import.meta.url)),false);
// The fast blit must match the library painter, including existing layers, alpha and flip.
const {Painter}=await import('../src/core/index.js'),{stamp}=await import('../src/fx/raid/_scale.js');
for(const alpha of [1,1.4,.2])for(const flip of [false,true]){
 const src=createFrame(2,2);src.color.set([0x8044bb22,0xff2255cc,0x09224466,0]);src.light.set([0xff020305,0,0xff0a0101,0]);
 const a=createFrame(16,16),b=createFrame(16,16);a.color[120]=b.color[120]=0x60402010;
 const pa=new Painter(a).place(8,8,flip),pb=new Painter(b).place(8,8,flip);stamp(pa,src,-4,-4,8,8,alpha);
 pb.each(-4,-4,4,4,(x,y,sx,sy)=>{const u=(x+4)/8,v=(y+4)/8;if(u<0||u>=1||v<0||v>=1)return;const i=Math.floor(v*2)*2+Math.floor(u*2),c=src.color[i],l=src.light[i];if(c)pb.blendPx(sx,sy,c|0xff000000,Math.min(1,(c>>>24)/255*alpha));if(l)pb.add(sx,sy,l,alpha);});
 assert.deepEqual(a.color,b.color);assert.deepEqual(a.light,b.light);
}
console.log('PASS scaled painter: transparency, layered color/light and mirrored placement');
