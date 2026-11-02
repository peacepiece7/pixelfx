import { VENOM, burst } from './_lib.js';
export const meta={name:'Venom mine burst',desc:'One consumed mine erupts into a low liquid crown, falling venom beads, a spreading floor ripple and olive-violet gas. No fire, chain reaction or extra hits.',tags:['poison','hilding','mine','burst','ground','one-shot'],size:[128,96],origin:[64,70],duration:.5,loop:false,fps:40,bg:'ground',options:{palette:VENOM,seed:61}};
export const create=o=>burst(o,meta.duration);
