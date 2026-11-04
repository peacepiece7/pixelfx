// Use the original Warp in renderer, including both of its layers, in front of enemies.
import { sequence, ORANGE } from '../../core/cynthia-reuse.js';
import { clamp, resolveOptions } from '../../core/index.js';
import * as circle from '../arcane/magic-circle-cast.js';
import * as burn from './satellite-trail-showcase.js';
import * as warp from '../scifi/warp-in.js';
export const HIT=.65, END=5.65;
export const meta={name:'Cynthia · Wide sweeping satellite',desc:'A wide sky-connected beam ignites the floor on impact and sweeps forward, accumulating a broad burning trail that remains after the beam ends.',tags:['cynthia','beam','fire','trail','one-shot'],size:[700,320],origin:[100,270],duration:12,loop:false,fps:30,bg:'ground',options:{palette:ORANGE,seed:7,targetX:180,targetY:0,travel:220,width:42,radius:110}};
export const preview={motion:'satellite',fireTimes:[.3],target:true};
export function beamPosition(t,o){return[(o.targetX??180)+(o.travel??220)*clamp((t-HIT)/(END-HIT)),o.targetY??0];}
export function trailPoints(t,o){
 const points=[];
 for(let at=HIT;at<=Math.min(t,END)+1e-8;at+=.5){
  const age=t-at;if(age<burn.meta.duration)points.push({at,age,position:beamPosition(at,o)});
 }
 return points;
}
function placed(p,x,y){return Object.create(p).place(p.toX(x,y),p.toY(x,y),p.fx<0,Math.atan2(p.sn,p.cs));}
export function create(o){
 let t=0;
 // Warp in slams at .34 seconds. Align that exact beat to the existing .65s hit.
 const start=HIT-.34, hold=END-start-1.9;
 const beam=warp.create(resolveOptions(warp.meta,{palette:o.palette,seed:o.seed,beamOnly:true,
  width:o.width??42,height:meta.origin[1],skyConnected:true,hold}));
 const casting=sequence(o,[{fx:circle,end:6.9,time:a=>a<.3?a*1.3/.3:a<6?1.3+(a-.3)*.12:2.42+(a-6)*1.65,options:{part:'circle',palette:ORANGE},light:.5}],meta.duration);
 function floor(p,front){
  const points=trailPoints(t,o),r=o.radius??110;
  for(let i=0;i<points.length;i++){
   const point=points[i],[x,y]=point.position;
   // Adjacent burns share a boundary, avoiding repeated overdraw and white-hot stacking.
   const left=i?(points[i-1].position[0]+x)/2:x-r;
   const right=i+1<points.length?(points[i+1].position[0]+x)/2:x+r;
   const a=p.toX(left,y),b=p.toX(right,y),q=placed(p,x,y);
   const minX=Math.max(p.ox,Math.floor(Math.min(a,b))),maxX=Math.min(p.ox+p.w,Math.ceil(Math.max(a,b)));
   if(maxX<=minX)continue;
   q.clipMinX=minX;q.clipMaxX=maxX;
   // Keep painter.w intact: it is also the framebuffer row stride.
   for(const method of ['put','blendPx','add'])q[method]=function(sx,sy,...args){
    if(sx>=minX&&sx<maxX)return p[method].call(this,sx,sy,...args);
   };
   q.each=function(x0,y0,x1,y1,fn){return p.each.call(this,Math.max(x0,left-x),y0,Math.min(x1,right-x),y1,fn);};
   burn.drawPatch(q,point.age,{...o,seed:o.seed+Math.round(point.at*100)},front);
  }
 }

 return {update(dt){
  const previous=t;t=Math.round((t+dt)*1e9)/1e9;casting.update(dt);
  const elapsed=Math.max(0,t-start)-Math.max(0,previous-start);
  if(elapsed>0)beam.update(elapsed);
 },
 drawBack(p){if(t>=meta.duration)return;casting.drawBack(p);floor(p,false);},
 draw(p){
  if(t>=meta.duration)return;
  casting.draw(p);floor(p,true);
  if(t>=start&&t<start+warp.meta.duration+hold){
   const [x,y]=beamPosition(t,o),q=placed(p,x,y);
   // Deliberately render the complete original effect after the enemy sprite.
   beam.drawBack(q);beam.draw(q);
  }
 }};
}
