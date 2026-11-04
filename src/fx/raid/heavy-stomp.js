// Reuses the Sprite Fusion-derived debris recipe credited in impacts/heavy-landing.js.
import * as landing from '../impacts/heavy-landing.js';
import {TOXIC,surface,stamp} from './_scale.js';
import {clearFrame,painterFor} from '../../core/index.js';
export const meta={name:'Dragon heavy stomp',desc:'Optional dragon ground-slam: massive Heavy landing-derived cracks, two dust rings and airborne rocks. No gameplay pattern is added by this effect.',tags:['raid','impact','stomp','ground','large'],size:[640,280],origin:[320,200],duration:2.4,loop:false,fps:30,bg:'ground',options:{palette:TOXIC,stone:'#51445f',seed:14,reducedMotion:false}};
export const act={...landing.act,poses:landing.act.poses.map(([t,p,e])=>[t*1.5,p,e]),hits:[{t:.005,stop:.13,shake:.4,amp:6}]};
export function create(o){const f=surface(landing),fx=landing.create({...landing.meta.options,...o});let t=0;return{update(dt){t+=dt;fx.update(dt/1.5);},draw(p){if(t<0||t>=meta.duration)return;clearFrame(f);const q=painterFor(f).place(...landing.meta.origin);fx.drawBack?.(q);fx.draw(q);stamp(p,f,-264,-180,528,240,1,o);}};}
