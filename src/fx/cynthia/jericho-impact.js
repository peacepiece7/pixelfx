import {visual,FIRE,sparks,flames,blast} from '../../core/cynthia-visuals.js';
export const meta={name:'Jericho impact',desc:'Single radius-55 explosion, no secondary gameplay hit.',tags:['cynthia','fire'],size:[192,192],origin:[96, 120],duration:0.4,loop:false,fps:30,bg:'ground',options:{palette:FIRE,seed:7,radius:55}};
export function create(o){return visual(o,0.4,false,(p,t,C,motes,o)=>{blast(p,t,.4,C,motes,Math.min(75,o.radius??55));});}
