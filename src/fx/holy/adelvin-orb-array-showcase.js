import * as stored from './adelvin-orb-array.js';
import { missileCore, missileRibbon } from './_adelvin-missile.js';
import { fit, smooth, TAU, READY } from '../../core/index.js';
import { transform } from '../_showcase-transform.js';
export const meta = {...stored.meta, name:'Adelvin stored light missiles · violet volley',
  desc:'Stored violet missiles launch on shallow arcs, converging on the enemy with twisting Arcane-missile ribbons.',
  size:[340,160], origin:[64,116], duration:2.2, loop:false,
  options:{...stored.meta.options,targetX:210,palette:['#200c40','#3a1465','#60249b','#893bd0','#b365ec','#d5a2ff','#efdaff','#ffffff']}};
export const preview = {motion:"attack", fireTimes:[.65,.76,.87,.98,1.09],target:true};
export const act = {target:{x:210},poses:[[0,READY],[.65,{...READY,fx:16,fy:-24}],[1.8,READY]],hits:[{t:1.42,push:.6},{t:1.86,push:1}]};
export function drawBack(p,t,o) { if(t<.65) stored.drawBack(p,t,o); }
export function draw(p,t,o) {
  if(t>=meta.duration)return;
  if(t<.65) { stored.draw(p,t,o); return; }
  const C=fit(o.palette,8),n=Math.max(0,Math.floor(o.count));
  for(let i=0;i<n;i++) {
    const delay=.65+i*.44/Math.max(1,n-1), u=(t-delay)/.77, a=.65/2*TAU+o.phase+i*TAU/n;
    const start=[Math.cos(a)*o.radius,-o.height+Math.sin(a)*o.radius*.35];
    const point=q=>[start[0]+(o.targetX-start[0])*q,start[1]+(-24-start[1])*q-Math.sin(Math.PI*q)*(16+i%3*5)];
    if(u<0) {missileCore(p,...start,2.5,C,t*12+i);continue;}
    if(u>1) {const k=1-smooth(0,.18,(u-1)*.77); if(k>0)p.glow(o.targetX,-24,13,C[4],k*.6); continue;}
    const [x,y]=point(u), local=transform(p,1,1);
    local.toX=(xx,yy)=>p.toX(xx+x,yy+y); local.toY=(xx,yy)=>p.toY(xx+x,yy+y);
    local.fromX=(xx,yy)=>p.fromX(xx,yy)-x; local.fromY=(xx,yy)=>p.fromY(xx,yy)-y;
    missileRibbon(local,v=>{const q=point(Math.max(0,u-v*.27));return[q[0]-x,q[1]-y];},C,t*15+i,3);
    missileCore(p,x,y,3.5,C,t*18+i);
  }
}
