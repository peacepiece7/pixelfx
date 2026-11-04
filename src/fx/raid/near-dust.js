import {Rng,fit,TAU} from '../../core/index.js';
import {ABYSS,allowed} from '../../core/raid-visuals.js';
export const meta={name:'Near cliff dust',desc:'Readable foreground stone shards, ash and wisps along the cliff edges; larger and faster than the distant fog while keeping the center free.',tags:['raid','dust','foreground','large'],size:[640,360],origin:[320,180],duration:8,loop:true,fps:30,bg:'dark',options:{palette:ABYSS,seed:7,protectRects:[[-215,-180,430,310]],reducedMotion:false}};
export function draw(p,t,o){if(t<0)return;const C=fit(o.palette,6),R=new Rng(o.seed),time=o.reducedMotion?0:t;
 for(let i=0;i<32;i++){
  const side=i%2?1:-1,u=(time/8+R.next())%1,base=R.range(240,285),size=R.range(5,10),x=side*base+Math.sin(u*TAU+i)*10,y=-70+u*230,a=Math.sin(u*Math.PI)**2;
  if(!allowed(x,y,o,[[-320,-100,640,280]]))continue;
  p.poly([[x-size,y],[x-2,y-size*.6],[x+size,y-2],[x+size*.5,y+size*.5],[x-size,y]],C[3],a*.9);
  p.line(x-2,y-size*.6,x+size,y-2,C[5],a*.9);p.disc(x-side*4,y+4,size*1.8,C[2],a*.12);
 }
}
