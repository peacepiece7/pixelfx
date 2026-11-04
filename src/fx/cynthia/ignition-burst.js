import {sequence,plasmaTime,FIRE,SILVER,RED,muzzle,target,flight} from '../../core/cynthia-reuse.js';
import * as hit from '../impacts/hit-spark.js';
import * as plasma from '../explosions/plasma-explosion.js';
export const meta={...plasma.meta,name:'Cynthia · Slow red plasma',duration:8,options:{seed:7}};
export const create=o=>sequence(o,[{fx:plasma,time:plasmaTime,options:{palette:RED,accent:RED},light:.45},...Array.from({length:8},(_,i)=>({fx:hit,start:i,end:i+.5,options:{palette:RED,height:18},light:.2}))],8);
