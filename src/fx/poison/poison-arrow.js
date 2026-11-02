import { VENOM, projectile } from './_lib.js';
export const meta={name:'Poison arrow',desc:'A thin physical arrow flies from the bow with a wet venom tip, dark fletching and a sparse trail of falling poison beads. No impact or damage cue.',tags:['poison','hilding','arrow','projectile','one-shot'],size:[128,64],origin:[32,44],duration:.4,loop:false,fps:40,bg:'ground',options:{palette:VENOM,travelDistance:72,seed:53}};
export const create=o=>projectile(o);
