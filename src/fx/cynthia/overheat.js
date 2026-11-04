import {visual,FIRE,sparks,flames,blast} from '../../core/cynthia-visuals.js';
export const meta={name:'Overheat vents',desc:'Low orange heat from two mechanical vents. Lifetime belongs to the host.',tags:['cynthia','fire'],size:[192,192],origin:[96, 120],duration:1,loop:true,fps:30,bg:'ground',options:{palette:FIRE,seed:7,pulse:0}};
export function create(o){return visual(o,1,true,(p,t,C,motes,o)=>{for(const x of [-9,9]){p.rect(x-2,-22,4,2,C[3],.6);p.glow(x,-22,9,C[3],.12);}flames(p,t,C,motes.slice(0,8),10,17,o.pulse);});}
