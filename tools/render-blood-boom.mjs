// Run from pixelfx: node tools/render-blood-boom.mjs [round]
// The contact sheet contains every 0.05s beat; the GIF plays interpolated 60fps motion.
import {loadEffect,renderFrames,contactSheet,writeVideo,save} from './lib/fxlib.mjs';
const fx=await loadEffect('blood/blood-boom'),frames=renderFrames(fx,{fps:60});
const beats={...frames,frames:frames.frames.filter((_,i)=>i%3===0),n:29,fps:20};
const dir=`records/blood/blood-boom/${process.argv[2]??'final'}`;
save(`${dir}/contact-50ms.png`,contactSheet(fx,beats,{max:29,zoom:3,width:2300}));
writeVideo(`${dir}/anim.gif`,frames,3,{loops:2});
console.log(`${dir}: 29 authored beats, 85 rendered frames`);
