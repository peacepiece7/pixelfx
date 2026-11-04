import {sequence,ORANGE,FIRE,SILVER,RED,muzzle,target,flight} from '../../core/cynthia-reuse.js';
import * as circle from '../arcane/magic-circle-cast.js';
import * as warp from '../scifi/warp-in.js';
import * as floor from './satellite-trail.js';
export const meta={name:'Cynthia · Satellite beam',desc:'Pale orange Warp in beam with the caster circle and Big explosion burning aftermath.',tags:['cynthia','reuse'],size:[560,340],origin:[120,290],duration:9,loop:false,fps:30,bg:'ground',options:{seed:7,targetX:180,targetY:0}};
export const preview={motion:'satellite',fireTimes:[.3],target:true};
export function create(o){return sequence(o,[
 {fx:circle,end:6.9,time:t=>t<.3?t*1.3/.3:t<6?1.3+(t-.3)*.12:2.42+(t-6)*1.65,options:{part:'circle',palette:ORANGE},light:.5},
 {fx:warp,start:.3,end:7.8,position:()=>target(o),options:{beamOnly:true,hold:4.5,palette:ORANGE,width:15},light:.4},
 {fx:floor,start:.3,end:9,position:()=>target(o),light:.7},
],meta.duration);}
