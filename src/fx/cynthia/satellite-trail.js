import {sequence,FIRE,SILVER,RED,muzzle,target,flight} from '../../core/cynthia-reuse.js';
import * as ring from '../fire/fire-ring.js';
import * as lightning from '../lightning/lightning-strike.js';
export const meta={name:'Cynthia · Burning lightning floor',desc:'Lightning call ground layer and overlapping stock fire rings keep the ground burning.',tags:['cynthia','reuse'],size:[280,200],origin:[140,150],duration:6,loop:true,fps:30,bg:'ground',options:{seed:7}};
export function create(o){return sequence(o,[
 {fx:lightning,offset:.8,repeat:.6,speed:.6,options:{groundOnly:true,palette:FIRE,sparks:FIRE},light:.35},
 ...[.8,2.3].map(offset=>({fx:ring,offset,end:6,speed:.25,options:{palette:FIRE,reach:55},light:.3})),
],6,true);}
