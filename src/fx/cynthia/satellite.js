import {sequence,FIRE,SILVER,RED,muzzle,target,flight} from '../../core/cynthia-reuse.js';
import * as circle from '../arcane/magic-circle-cast.js';
import * as floor from './satellite-trail.js';
export const meta={name:'Cynthia · Satellite beam',desc:'Meteor call caster circle and sustained column, Lightning call floor, lingering fire rings.',tags:['cynthia','reuse'],size:[520,300],origin:[120,250],duration:9,loop:false,fps:30,bg:'ground',options:{seed:7,targetX:180,targetY:0}};
export const preview={motion:'satellite',fireTimes:[.3],target:true};
export function create(o){return sequence(o,[
 {fx:circle,end:6.6,time:t=>t<.6?t*1.3/.6:1.3+(t-.6)*.12,options:{part:'circle',palette:FIRE},light:.5},
 {fx:circle,start:.6,end:6.6,offset:1.6,speed:.12,position:()=>target(o),options:{part:'column',palette:FIRE},light:.45},
 {fx:floor,start:.6,end:9,position:()=>target(o),light:.7},
],meta.duration);}
