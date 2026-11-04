import {visual,FIRE,sparks} from '../../core/cynthia-visuals.js';
export const meta={name:'Gunfire',desc:'Compact muzzle star, short pressure ring and hot sparks. weapon selects shotgun/gatling/rifle silhouette.',tags:['cynthia','fire'],size:[192,192],origin:[55, 96],duration:0.25,loop:false,fps:30,bg:'ground',options:{palette:FIRE,seed:7,weapon:'shotgun'}};
// Reuse the library's ragged muzzle lobes; one event remains one shot.
import { Rng } from '../../core/index.js';
import { flash, flashShape } from '../projectiles/_lib.js';
export function create(o) {
  return visual(o, .25, false, (p,t,C,motes,o) => {
    const u=t/.25, k=(1-u)**2, shotgun=o.weapon==='shotgun';
    if(t<.1) {
      const f=t<1/30?1:2;
      const lobes=flashShape(new Rng(o.seed??7),f,{
        spike:o.weapon==='rifle'?[32,45]:[20,30],
        diag:shotgun?[18,27]:[5,10], cross:shotgun?[7,12]:[3,6],
      });
      flash(p,0,0,0,lobes,f===1?[C[6],C[5],C[4],C[2]]:[C[5],C[4],C[3],C[1]],o.seed??7);
    }
    p.glow(4,0,24,C[4],k*.3);
    sparks(p,u,C,motes.slice(0,10),24,k);
  });
}
