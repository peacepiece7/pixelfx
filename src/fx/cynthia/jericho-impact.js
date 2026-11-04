import {sequence,RED} from '../../core/cynthia-reuse.js';
import * as plasma from '../explosions/plasma-explosion.js';
export const meta={...plasma.meta,name:'Cynthia · Smokeless rocket impact',tags:['cynthia','reuse'],options:{seed:7}};
export const create=o=>sequence(o,[{fx:plasma,options:{palette:RED,accent:RED},light:.4}],meta.duration);
