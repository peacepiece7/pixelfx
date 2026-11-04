import * as roar from '../blood/roar-wave.js';
import {READY} from '../../core/index.js';
import {surface,stamp} from './_scale.js';
import {clearFrame,painterFor} from '../../core/index.js';
export const meta={name:'Dragon phase surge',desc:'Long poisonous dragon roar: eight huge rolling pressure waves and green dust, trembling for several seconds. A phase-strengthening cue, never a damage or difficulty calculation.',tags:['raid','poison','roar','phase','large'],size:[640,360],origin:[320,260],duration:5.8,loop:false,fps:30,bg:'ground',actor:2,options:{palette:['#19351c','#2e5929','#569047','#83bd52','#b5ed74','#e4ffad','#f4ffdc'],seed:7,shake:1,reducedMotion:false}};
export const act={poses:[[-.25,READY],[0,{turn:1,crouch:4,lean:-3,fx:-10,fy:-23,bx:10,by:-23}],[.1,{turn:1,lean:3,fx:-14,fy:-18,bx:14,by:-18},'snap'],[4.7,{turn:1,lean:2,fx:-14,fy:-18,bx:14,by:-18}],[5.8,READY]],hits:[{t:.1,stop:.08,shake:.3,amp:4,target:false}]};
export function create(o){
 let t=0,signalled=false;const f=surface(roar),waves=Array.from({length:8},(_,i)=>({start:i*.7,fx:roar.create({...roar.meta.options,...o,seed:o.seed+i,shake:0}),elapsed:0}));
 return {update(dt){const next=t+dt;for(const w of waves){const age=Math.min(roar.meta.duration,Math.max(0,next-w.start));if(age>w.elapsed){w.fx.update(age-w.elapsed);w.elapsed=age;}}t=next;if(!signalled&&t>=.1){signalled=true;if(!o.reducedMotion&&o.shake>0)o.onShake?.({duration:4.7,amplitude:7*o.shake});}},draw(p){
  if(t<0||t>=meta.duration)return;
  clearFrame(f);const q=painterFor(f).place(...roar.meta.origin);
  for(const w of waves)if(t>=w.start&&t<w.start+roar.meta.duration){w.fx.drawBack?.(q);w.fx.draw(q);}
  const tremor=o.reducedMotion?0:Math.sin(t*35)*3*Math.min(1,(meta.duration-t)/.8);
  stamp(p,f,-308+tremor,-229,616,308,1.15,o);
 }};
}
