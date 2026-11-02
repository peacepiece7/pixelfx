import { VENOM, burst } from './_lib.js';
export const meta={name:'Poison detonation',desc:'Stored venom detonates into green liquid and a violet-crowned gas bloom. Snapshot stacks enlarge only the visual silhouette; the host owns all damage.',tags:['poison','hilding','detonation','stacks','one-shot'],size:[160,128],origin:[80,98],duration:.7,loop:false,fps:40,bg:'ground',options:{palette:VENOM,stacks:6,seed:67}};
export const create=o=>burst(o,meta.duration,true);
