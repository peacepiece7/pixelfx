import {sequence,FIRE,SILVER,RED,muzzle,target,flight} from '../../core/cynthia-reuse.js';
import * as dirt from '../explosions/dirt-explosion.js';
export const meta={...dirt.meta,name:'Cynthia · Dirt impact',tags:['cynthia','reuse']};
export const create=o=>sequence(o,[{fx:dirt,options:{fire:FIRE}}],meta.duration);
