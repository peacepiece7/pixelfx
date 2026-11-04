import {sequence,FIRE,SILVER,RED,muzzle,target,flight} from '../../core/cynthia-reuse.js';
import * as rocket from '../projectiles/rocket.js';
import * as dirt from '../explosions/dirt-explosion.js';
export const meta={name:'Cynthia · Homing rockets',desc:'Four stock rockets curve towards the target and end in stock dirt explosions.',tags:['cynthia','reuse'],size:[600,360],origin:[260,250],duration:5.4,loop:false,fps:30,bg:'ground',options:{seed:7,muzzleX:17,muzzleY:-24,targetX:180,targetY:0}};
export const preview={motion:'jericho',hitFrame:4,muzzle:[17,-24],fireTimes:[.25,.55,.85,1.15],target:true};
export function create(o){return sequence(o,preview.fireTimes.flatMap(start=>[
 {fx:rocket,start,end:start+.65,position:t=>flight(t,o,.65,38,true),options:{palette:FIRE,speed:80},fadeOut:.025,light:.45},
 {fx:dirt,start:start+.65,end:start+.65+dirt.meta.duration,position:()=>target(o),options:{fire:FIRE},light:.6},
]),meta.duration);}
