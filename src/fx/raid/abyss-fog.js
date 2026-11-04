// Reuses the Sprite Fusion-derived fog banks credited in weather/fog.js.
import * as fog from '../weather/fog.js';
import {TOXIC,surface,paint,stamp} from './_scale.js';
export const meta={name:'Abyss distant fog',desc:'Large poisonous green fog banks at three depths, derived from weather/fog; spans the full raid width with thick, readable lit crests.',tags:['raid','fog','poison','environment'],size:[640,360],origin:[320,180],duration:12,loop:true,fps:30,bg:'dark',options:{palette:TOXIC,seed:7,opacity:1.4,protectRects:[[-320,-180,640,55]],reducedMotion:false}};
const frame=surface(fog);
export function draw(p,t,o){if(t<0)return;paint(frame,fog,o.reducedMotion?0:t,{...fog.meta.options,...o});stamp(p,frame,-320,-52,640,232,o.opacity??1.4,o,[0,64,320,116]);}
