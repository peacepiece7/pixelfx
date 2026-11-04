import {sequence,FIRE,SILVER,RED,muzzle,target,flight} from '../../core/cynthia-reuse.js';
import * as muzzleFx from '../projectiles/muzzle-pistol.js';
import * as tracer from '../projectiles/bullet-tracer.js';
import * as charge from '../arcane/spell-charge.js';
import * as plasma from './ignition-burst.js';
export const meta={name:'Cynthia · Laevateinn sequence',desc:'Silver pistol tracer bolt, embedded charge from Ice lance throw, then an eight-second red Plasma explosion.',tags:['cynthia','reuse'],size:[540,300],origin:[150,190],duration:9.5,loop:false,fps:30,bg:'ground',options:{seed:7,muzzleX:18,muzzleY:-23,targetX:180,targetY:0}};
export const preview={motion:'laevateinn',hitFrame:4,muzzle:[18,-23],fireTimes:[.25],target:true};
export function create(o){return sequence(o,[
 {fx:muzzleFx,start:.25,end:1,position:()=>muzzle(o),options:{height:0,palette:SILVER},light:.25},
 {fx:tracer,start:.25,end:.6,position:t=>flight(t,o,.35,0,true),options:{palette:SILVER,length:85,thickness:1.4,sparkCount:0},fadeOut:.015,light:.2},
 {fx:tracer,start:.6,end:1.5,position:()=>{const [x,y]=target(o);return [x,y,Math.PI/2];},options:{palette:SILVER,length:45,thickness:1.1,sparkCount:0},light:.15},
 {fx:charge,start:.6,end:1.5,position:()=>{const [x,y]=target(o);return [x-15,y+4];},options:{palette:RED},light:.4},
 {fx:plasma,start:1.5,end:9.5,position:()=>target(o),light:1},
],meta.duration);}
