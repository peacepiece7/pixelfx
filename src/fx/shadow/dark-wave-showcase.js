import * as wave from './dark-wave.js';
import { transform } from '../_showcase-transform.js';
export const meta={...wave.meta,name:'Dark wave · white violet ellipse',size:[352,144],origin:[176,104],
 desc:'A 30% longer elliptical dark-purple wave with a white luminous rim.',options:{...wave.meta.options,palette:['#080311','#17052e','#300952','#531184','#ae80eb','#ffffff']}};
export const act=wave.act;
export function create(o){const fx=wave.create(o);return{update:dt=>fx.update(dt),drawBack:p=>fx.drawBack(transform(p,1.3,1)),draw:p=>fx.draw(transform(p,1.3,1))};}
