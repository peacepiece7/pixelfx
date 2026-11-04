import {sequence,FIRE,SILVER,RED,muzzle,target,flight} from '../../core/cynthia-reuse.js';
import * as charge from '../arcane/spell-charge.js';
export const meta={...charge.meta,name:'Cynthia · Overheat charge',actor:undefined,size:[160,110],origin:[80,90],options:{seed:7}};
export const create=o=>sequence(o,[{fx:charge,x:-15,y:0,options:{palette:FIRE},light:.2}],meta.duration,true);
