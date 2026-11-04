import {sequence,ORANGE} from '../../core/cynthia-reuse.js';
import * as ring from '../fire/fire-ring.js';
import * as explosion from '../explosions/big-explosion.js';
export const meta={...explosion.meta,name:'Cynthia · Burning explosion aftermath',desc:'Big explosion aftermath: cooling fire, smoke, scorched ground and lingering burning fragments.',duration:8.7,options:{seed:7}};
export const create=o=>sequence(o,[{fx:explosion,offset:1.5,speed:(7.2-1.5)/8.7,options:{palette:ORANGE,groundOnly:true},light:.35},{fx:ring,start:5,end:8.7,offset:.7,speed:.3,options:{palette:ORANGE,reach:55},light:.25}],meta.duration);
