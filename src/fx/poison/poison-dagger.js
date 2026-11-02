import { VENOM, projectile } from './_lib.js';
export const meta={name:'Poison dagger',desc:'A beveled physical throwing dagger with a wrapped handle, crossguard and a few venom drops. A visual delivery cue without ammunition, return or impact logic.',tags:['poison','hilding','dagger','projectile','one-shot'],size:[128,64],origin:[32,44],duration:.4,loop:false,fps:40,bg:'ground',options:{palette:VENOM,travelDistance:72,seed:59}};
export const create=o=>projectile(o,true);
