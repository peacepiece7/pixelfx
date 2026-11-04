// Shared visual vocabulary only; no combat timing, target selection or damage.
import {fit,Rng,TAU} from './index.js';
import { firePuff } from '../fx/fire/_lib.js';
import { lobe } from '../fx/explosions/_lib.js';
const SMOKE=fit(['#88808b','#635968','#423946','#29222e','#17121d'],5);
export const FIRE=['#22151b','#652a24','#a64725','#e67527','#ffb645','#ffe29a','#fff6df'];
export function visual(o,duration,loop,paint){let t=0;const C=fit(o.palette??FIRE,7),R=new Rng(o.seed??7);const motes=Array.from({length:30},()=>({a:R.range(0,TAU),r:R.range(.25,1),phase:R.range(0,1),size:R.range(1,3)}));return {update(dt){t+=Math.max(0,dt);},draw(p){if(!loop&&t>=duration)return;paint(p,loop?t%duration:t,C,motes,o);}};}
export function sparks(p,u,C,motes,radius,alpha=1){for(const q of motes){const r=radius*q.r*(1-Math.pow(1-u,3)),x=Math.cos(q.a)*r,y=Math.sin(q.a)*r*.6-u*12;const k=Math.max(0,1-u)*alpha;p.line(x,y,x-Math.cos(q.a)*(2+5*(1-u)),y-Math.sin(q.a)*3,C[4],k);p.glow(x,y,4,C[3],k*.16);}}
export function flames(p,t,C,motes,radius,height,pulse=0){for(const q of motes){const u=(t+q.phase)%1,x=Math.cos(q.a)*radius*q.r,y=Math.sin(q.a)*radius*.22-u*height;const k=Math.sin(Math.PI*u);firePuff(p,x,y,1-u,(4+q.size*1.5)*k,q.r,[...C].reverse(),.06);}p.glow(0,-5,radius*.8,C[3],.08+Math.max(0,pulse)*.15);}
export function blast(p,t,d,C,motes,radius){const u=t/d,k=Math.pow(1-u,2),r=radius*(1-Math.pow(1-u,3));p.ellipse(0,0,r,r*.25,C[1],k*.2);p.ring(0,-8,r*.7,Math.max(1,3*(1-u)),C[3],k*.4);p.glow(0,-12,30,C[3],k*.28);for(let i=0;i<8;i++){const a=i*Math.PI/4,x=Math.cos(a)*r*.4,y=-12+Math.sin(a)*r*.3;lobe(p,x,y,3+14*Math.sin(Math.PI*u),fit([...C].reverse(),9),SMOKE,Math.max(0,1-u*1.5),k*.5,Math.min(1,k*1.6),Math.sin(a),0,1);}if(u<.18){p.circle(0,-10,9*(1-u/.18),C[6]);p.glow(0,-10,35,C[5],.5*(1-u/.18));}sparks(p,u,C,motes,radius,k);}
