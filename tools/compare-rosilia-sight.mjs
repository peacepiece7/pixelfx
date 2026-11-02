import {loadEffect,renderFrames,canvas,save} from './lib/fxlib.mjs';
const image=canvas(1000,560);
const effects=[['holy/valhalla-zone',90],['projectiles/rosilia-support-shot',62]];
for(let col=0;col<effects.length;col++) {
 const [id,radius]=effects[col],fx=await loadEffect(id);
 const frames=renderFrames(fx,{fps:20,actor:false,options:{pulse:0}});
 for(let row=0;row<2;row++) {
  const frame=frames.frames[Math.round([.5,1.2][row]*20)];
  const tile=new Uint8ClampedArray(500*250*4),scale=210/radius;
  for(let y=0;y<250;y++)for(let x=0;x<500;x++) {
   const sx=Math.floor((x-250)/scale+fx.meta.origin[0]);
   const sy=Math.floor((y-130)/scale+fx.meta.origin[1]);
   if(sx>=0&&sx<frames.w&&sy>=0&&sy<frames.h)
    tile.set(frame.clear.subarray((sy*frames.w+sx)*4,(sy*frames.w+sx)*4+4),(y*500+x)*4);
  }
  image.paste(tile,500,250,col*500,30+row*270);
  image.text(`${id} ${[.5,1.2][row]}s`,col*500+15,row*270+12,1);
 }
}
save('records/projectiles/rosilia-support-shot/reference-comparison.png',image.png());
