import * as blood from './blood-boom.js';
import { column } from '../ui/level-up.js';
import { storm } from '../water/aorbion-poseidon.js';
import { fit, smooth } from '../../core/index.js';
import { transform } from '../_showcase-transform.js';
export const meta = {...blood.meta, name:'Blood boom · rising blood storm', size:[320,360],origin:[160,246],
 desc:'Twice-sized blood eruption: red level-up ascent, curling Poseidon wave folds and returning heavy droplets.',
 options:{...blood.meta.options,palette:['#26030c','#510817','#870c23','#bd1935','#e53650','#ff6376','#ff9da5','#ffe0df']}};
export const act=blood.act;
export const preview={motion:"blood-boom",fireTimes:[.25],target:false};
export function create(o) {
 const base=blood.create(o), C=fit(o.palette,8);let t=0;
 function waves(p,front) {const k=smooth(.25,.34,t)*(1-smooth(.65,1.05,t));
  if(k>0)storm(transform(p,1.65,2.5,0,k),C,t*1.7,o.seed,front,0,false);}
 return {
  update(dt){t=Math.round((t+dt)*1e9)/1e9;base.update(dt);},
  drawBack(p){if(t>=meta.duration)return;waves(p,false);base.drawBack(transform(p,2));},
  draw(p){if(t>=meta.duration)return;base.draw(transform(p,2));
   // Reuse only the ascent, with no level-up lettering or UI rays.
   column(transform(p,2.4,2.15,0,.65*(1-smooth(.8,1.12,t))),C,t+.03);waves(p,true);},
 };
}
