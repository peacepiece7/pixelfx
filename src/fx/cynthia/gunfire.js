import {sequence,FIRE,SILVER,RED,muzzle,target,flight} from '../../core/cynthia-reuse.js';
import * as muzzleFx from '../projectiles/muzzle-pistol.js';
import * as smg from '../projectiles/muzzle-smg.js';
import * as tracer from '../projectiles/bullet-tracer.js';
import * as hit from '../impacts/hit-spark.js';
export const meta={name:'Cynthia · Gatling burst',desc:'SMG burst at the muzzle, synchronized with six traveling bullet tracers.',tags:['cynthia','reuse'],size:[460,180],origin:[130,130],duration:2.4,loop:false,fps:30,bg:'ground',options:{seed:7,weapon:'gatling',muzzleX:25,muzzleY:-22,targetX:180,targetY:0}};
export const preview={motion:'attack-gatling',fireTimes:[.25,.25+1/12,.25+2/12,.5,.25+4/12,.25+5/12],target:true};
export function create(o){
 const shots=o.weapon==='rifle'?[.25]:o.weapon==='shotgun'?[.25,.28,.31]:preview.fireTimes;
 return sequence(o,[...(o.weapon==='gatling'?[{fx:smg,start:.25,end:.75,position:()=>{const [x,y]=muzzle(o);return [x+2,y];},options:{height:0,palette:FIRE},light:.4,fadeOut:.025}]:[]),...shots.flatMap(start=>[
  ...(o.weapon==='gatling'?[]:[{fx:muzzleFx,start,end:start+.7,position:()=>[...muzzle(o),0],options:{height:0,palette:FIRE},light:.4}]),
  {fx:tracer,start,end:start+.22,position:t=>flight(t,o,.22),options:{length:o.weapon==='rifle'?42:19,thickness:.8,palette:FIRE},fadeOut:.015},
  {fx:hit,start:start+.22,end:start+.65,position:()=>target(o),options:{height:24,palette:FIRE},light:.45},
 ])],meta.duration);
}
