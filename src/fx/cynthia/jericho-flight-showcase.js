import {sequence,rocketFlight,FIRE,SILVER,RED,muzzle,target,flight} from '../../core/cynthia-reuse.js';
import * as rocket from '../projectiles/rocket.js';
import * as dirt from './jericho-impact-showcase.js';
export const meta={name:'Cynthia · Direct rockets',desc:'Short smokeless rockets fly forward then pitch into the ground, ending in Grenade blasts whose spreading smoke fades quickly.',tags:['cynthia','reuse'],size:[600,360],origin:[260,250],duration:4.4,loop:false,fps:30,bg:'ground',options:{seed:7,muzzleX:17,muzzleY:-24,targetX:180,targetY:0}};
export const preview={motion:'jericho',hitFrame:4,muzzle:[17,-24],fireTimes:[.25,.55,.85,1.15],target:true};
export function create(o){return sequence(o,preview.fireTimes.flatMap(start=>[
 {fx:rocket,start,end:start+.65,position:t=>rocketFlight(t,o),options:{palette:RED,speed:80,trail:false,bodyLength:.72},fadeOut:.025,light:.45},
 {fx:dirt,start:start+.65,end:start+.65+dirt.meta.duration,position:()=>target(o),options:{},light:.6},
]),meta.duration);}
