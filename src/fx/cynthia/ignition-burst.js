import {visual,FIRE,sparks,flames,blast} from '../../core/cynthia-visuals.js';
export const meta={name:'Ignition burst',desc:'Radius-75 initial ignition blast, separate from sustained zone pulses.',tags:['cynthia','fire'],size:[192,192],origin:[96, 120],duration:0.5,loop:false,fps:30,bg:'ground',options:{palette:FIRE,seed:7,radius:75}};
export function create(o){return visual(o,0.5,false,(p,t,C,motes,o)=>{blast(p,t,.5,C,motes,Math.min(80,o.radius??75));});}
