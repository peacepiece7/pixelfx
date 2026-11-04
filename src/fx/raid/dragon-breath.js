// Reuses the Sprite Fusion-derived flame/smoke recipe credited in fire/fire-breath.js.
import * as fire from '../fire/fire-breath.js';
import {surface,paint,stamp} from './_scale.js';
const PURPLE=['#190b2e','#39104f','#65177c','#8d259f','#b63fca','#d563ef','#ef9aff','#f7ceff','#fff3ff'];
export const meta={name:'Dragon abyss breath',desc:'Screen-wide roaring purple fire: a huge sustained cone, boiling tongues, sparks and rolling smoke. Full-party attack, no ground warning.',tags:['raid','breath','fire','purple','screen-wide'],size:[640,360],origin:[12,220],duration:3.2,loop:false,fps:30,bg:'dark',options:{palette:PURPLE,seed:7,spread:.32,speed:460,reducedMotion:false}};
const frame=surface(fire);
export function draw(p,t,o){
 if(t<0||t>=meta.duration)return;
 const fade=Math.min(1,t/.14,(meta.duration-t)/.65);
 paint(frame,fire,o.reducedMotion ? .5 : t,{...fire.meta.options,...o});
 stamp(p,frame,0,-204,620,340,fade,o,[12,15,140,95]);
}
