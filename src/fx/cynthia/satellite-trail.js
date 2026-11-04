import {visual,FIRE,sparks,flames,blast} from '../../core/cynthia-visuals.js';
export const meta={name:'Satellite trail',desc:'One residual radius-65 patch. Host handles sampling, refresh and per-beam pulse deduplication.',tags:['cynthia','fire'],size:[192,192],origin:[96, 120],duration:1,loop:true,fps:30,bg:'ground',options:{palette:FIRE,seed:7,radius:65,pulse:0}};
export function create(o){return visual(o,1,true,(p,t,C,motes,o)=>{const r=Math.min(75,o.radius??65);p.ellipse(0,0,r,r*.2,C[1],.2);flames(p,t,C,motes.slice(0,20),r,14,o.pulse);});}
