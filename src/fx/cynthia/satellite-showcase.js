// Warp-in's hollow column, falling bands and lit walls are recomposed for a
// sky-connected moving satellite; fire/fire-ring supplies the ground flames.
import { sequence, ORANGE } from '../../core/cynthia-reuse.js';
import { fit, smooth, clamp, ease, band, TAU } from '../../core/index.js';
import * as circle from '../arcane/magic-circle-cast.js';
import * as burn from './satellite-trail-showcase.js';
import { softShade } from '../_soft.js';
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
function beam(p,t,o){
 if(t<.3||t>=END+.25)return;
 const C=fit(o.palette,8),[x,y]=beamPosition(t,o),q=placed(p,x,y);
 // Follow the actual viewport top, so there is no floating horizontal cap.
 const top=Math.min(...[[p.ox,p.oy],[p.ox+p.w,p.oy]].map(([sx,sy])=>q.fromY(sx,sy)))-8;
 const fade=1-smooth(END,END+.25,t),w=(o.width??42)*fade;
 const bottom=t<HIT?top*(1-ease.inCubic(clamp((t-.3)/(HIT-.3)))):0;
 softShade(q,-w*1.3,top,w*1.3,bottom,(xx,yy,out)=>{
  const d=Math.abs(xx)/Math.max(1,w);if(d>1.3)return;
  const pulse=((yy*.025-t*2.6)%1+1)%1<.08;
  const strand=Math.sin(xx*.55+t*4)>.94;
  out.c=d>.88&&d<1?C[7]:pulse||strand?C[6]:d>.72?C[5]:C[4];
  out.a=(d<.72?(pulse?.5:.2):d<1?1:(1.3-d)/.3)*fade;
 });
 for(let yy=Math.ceil(top/16)*16;yy<bottom;yy+=16)
  for(const side of [-1,1])q.glow(side*w,yy,12,C[4],.12*fade);
 if(t>=HIT){
  q.ellipse(0,0,(o.radius??110)*.8,10,C[5],.3*fade);
  q.glow(0,-4,62,C[5],.35*fade);
  const age=t-HIT;
  if(age<.5)band(q,0,0,(o.radius??110)*ease.outCubic(age/.5),.2,3,1-age/.5,C);
  for(let i=0;i<3;i++){
   const u=((t-HIT)*1.5+i/3)%1,yy=top*(1-u);
   band(q,0,yy,w*1.12,.07,1.5,.5*fade,C);
  }
 }
}
export function create(o){
 let t=0;
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

 return {update(dt){t=Math.round((t+dt)*1e9)/1e9;casting.update(dt);},
 drawBack(p){if(t>=meta.duration)return;casting.drawBack(p);floor(p,false);beam(p,t,o);},
 draw(p){if(t>=meta.duration)return;casting.draw(p);floor(p,true);}};
}
