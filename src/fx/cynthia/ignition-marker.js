import {visual,FIRE,sparks,flames,blast} from '../../core/cynthia-visuals.js';
export const meta={name:'Ignition marker',desc:'Embedded bolt with a one-second closing ignition outline. No impact damage.',tags:['cynthia','fire'],size:[192,192],origin:[96, 120],duration:1,loop:false,fps:30,bg:'ground',options:{palette:FIRE,seed:7,radius:30}};
export function create(o){return visual(o,1,false,(p,t,C,motes,o)=>{const k=Math.min(1,t*12,(1-t)*15);p.line(-3,0,2,-16,C[4],k);p.tri(0,-19,4,-13,-2,-13,C[5],k);p.arc(0,0,(o.radius??30)*(1-t*.6),1,0,Math.PI*2*t,C[4],k*.8);p.glow(0,-3,10+8*t,C[3],k*.2);});}
