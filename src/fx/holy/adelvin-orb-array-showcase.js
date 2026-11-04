import * as stored from './adelvin-orb-array.js';
import * as impact from './adelvin-impact.js';
import { missileCore, missileRibbon } from './_adelvin-missile.js';
import { fit, TAU } from '../../core/index.js';

export const meta = {...stored.meta, name:'Adelvin stored light missiles · violet',
  desc:'Violet missiles remain stored. Each pulse launches one on a shallow arc with the original impact burst. Reset to refill.',
  size:[340,160], origin:[64,116], duration:2, loop:true,
  options:{...stored.meta.options,targetX:210,pulse:0,palette:['#200c40','#3a1465','#60249b','#893bd0','#b365ec','#d5a2ff','#efdaff','#ffffff']}};
export const preview = {motion:'attack',fireTimes:[],target:true};
export const act = stored.act;
function at(p,x,y) {
  const q=Object.create(p);
  q.toX=(xx,yy)=>p.toX(xx+x,yy+y); q.toY=(xx,yy)=>p.toY(xx+x,yy+y);
  q.fromX=(xx,yy)=>p.fromX(xx,yy)-x; q.fromY=(xx,yy)=>p.fromY(xx,yy)-y;
  return q;
}
export function create(o) {
  let t=0,previousPulse=0,count=o.count,remaining=Math.max(0,Math.floor(count));
  const shots=[];
  return {
    update(dt) {
      t+=dt;
      if(o.count!==count) {count=o.count;remaining=Math.max(0,Math.floor(count));}
      const pulse=o.pulse??0;
      if(pulse>previousPulse+1e-6 && remaining>0) {
        const a=t/2*TAU+o.phase;
        shots.push({age:0,start:[Math.cos(a)*o.radius,-o.height+Math.sin(a)*o.radius*.35],x:o.targetX,burst:null});
        remaining--;
      }
      previousPulse=pulse;
      for(let i=shots.length-1;i>=0;i--) {
        const s=shots[i],old=s.age;s.age+=dt;
        if(s.age>=.77) {
          if(!s.burst)s.burst=impact.create({...impact.meta.options,palette:o.palette,seed:o.seed});
          s.burst.update(s.age-Math.max(.77,old));
        }
        if(s.age>=.77+impact.meta.duration)shots.splice(i,1);
      }
    },
    drawBack(p) {stored.drawBack(p,t,{...o,count:remaining});},
    draw(p) {
      stored.draw(p,t,{...o,count:remaining});
      const C=fit(o.palette,8);
      for(const s of shots) {
        if(s.burst) {s.burst.draw(at(p,s.x,-24));continue;}
        const u=s.age/.77,point=q=>[s.start[0]+(s.x-s.start[0])*q,s.start[1]+(-24-s.start[1])*q-Math.sin(Math.PI*q)*21];
        const [x,y]=point(u);
        missileRibbon(at(p,x,y),v=>{const q=point(Math.max(0,u-v*.27));return[q[0]-x,q[1]-y];},C,t*15,3);
        missileCore(p,x,y,3.5,C,t*18);
      }
    }
  };
}
