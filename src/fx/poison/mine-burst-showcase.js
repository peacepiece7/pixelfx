import * as portal from '../spawn/spawn-portal.js';
import * as fog from '../nature/poison-cloud.js';
import { smooth } from '../../core/index.js';
import { transform } from '../_showcase-transform.js';
export const meta={...portal.meta,name:'Venom mine burst · green spawn portal',size:[320,240],origin:[160,190],
 desc:'An enlarged green spawn portal vents venom wisps and a low green fog before closing.',
 options:{...portal.meta.options,palette:['#071708','#12351a','#20582a','#398b36','#62bf48','#a3e979','#d9ffb0','#f2ffe0']}};
export function create(o){
 const fx=portal.create(o);let t=0;
 const gas={...fog.meta.options,palette:o.palette,seed:o.seed,spread:1};
 function mist(p,back){const k=smooth(.12,.55,t)*(1-smooth(2.1,3.65,t));if(k<=0)return;
  const q=transform(p,1,1,0,k*.75); (back?fog.drawBack:fog.draw)(q,t,gas);}
 return {update(dt){t+=dt;fx.update(dt);},
 drawBack(p){if(t>=meta.duration)return;mist(p,true);fx.drawBack(transform(p,1.4));},
 draw(p){if(t>=meta.duration)return;fx.draw(transform(p,1.4));mist(p,false);}};
}
