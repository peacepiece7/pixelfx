import * as slam from './freeze-slam.js';
import * as frost from './frost-nova.js';
import { fit, smooth, READY } from '../../core/index.js';
import { transform } from '../_showcase-transform.js';
export const HIT = .42;
export const preview = {motion: "freeze-slam", fireTimes:[HIT], target:false};
export const previewActorY = t => -28 * smooth(0,.16,t) * (1-smooth(.30,HIT,t));
export const meta = { ...slam.meta, name: 'Freeze slam · frost charge', size: [224, 176], origin: [112, 140], duration: 2.02,
  desc: 'Airborne frost-nova charge and icy body light lead into the original landing crown.' };
export const act = {
  poses: [[-.2, READY], [0, {...READY, y:-18, fx:-7, fy:-36, bx:8, by:-36}],
    [.30, {...READY, y:-28, fx:-7, fy:-44, bx:8, by:-44}],
    ...slam.act.poses.filter(([t]) => t >= 0).map(([t,p,e]) => [t+HIT,p,e])],
  hits: slam.act.hits.map(h => ({...h,t:h.t+HIT})),
};
export function create(o) {
  const charge = frost.create({...frost.meta.options,...o}), impact = slam.create(o), C=fit(o.palette,8);
  let t=0;
  function airborne(p) { return transform(p,1,1,previewActorY(t)); }
  return {
    update(dt) { const prev=t; t=Math.round((t+dt)*1e9)/1e9;
      if(prev<HIT) charge.update(Math.max(0,Math.min(t,HIT-.000001)-prev));
      if(t>HIT) impact.update(t-Math.max(prev,HIT)); },
    drawBack(p) { if(t<HIT) charge.drawBack(airborne(p)); else impact.drawBack(p); },
    draw(p) {
      if(t<HIT) {
        const a=o.actor;
        if(a) for(let y=0;y<a.h;y++) for(let x=0;x<a.w;x++) if(a.mask.data[y*a.w+x])
          p.dot(a.x+x,a.y+y+previewActorY(t),C[4+(y%3)], .5*smooth(0,.10,t));
        charge.draw(airborne(p));
      } else impact.draw(p);
    },
  };
}
