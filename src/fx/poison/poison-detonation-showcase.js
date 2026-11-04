// Barrel-explosion's fireball and spark recipe adapted from Sprite Fusion explosion,
// MIT, Copyright (c) 2026 Hugo Duprez. Green magic only: no barrel prop or fuel fires.
import { Particles, P, PF, Rng, fit, band, flare, smooth, ease, TAU } from '../../core/index.js';
import { fireRamp, drawPs } from '../explosions/_lib.js';
import { transform } from '../_showcase-transform.js';
export const meta={name:'Poison detonation · green barrel blast',desc:'The barrel explosion fireball in green, immediate on impact; smoke clears early while green embers settle.',
 tags:['poison','detonation','explosion','one-shot'],size:[320,256],origin:[160,216],duration:1.65,loop:false,fps:40,bg:'ground',
 options:{palette:['#071b0c','#124020','#286c2b','#4d9f32','#82d945','#b4f374','#dcffae','#f6ffe5'],stacks:6,seed:67}};
export function create(o){
 const F=fit(o.palette,8),FR=fireRamp(F),R=new Rng(o.seed),SOOT=F[1],y=-11;
 const ps=new Particles({rng:R,ground:()=>0,sparks:[F[6],F[5],F[3],F[2]]});
 const stacks=Math.max(0,Number.isFinite(o.stacks)?o.stacks:1),scale=.8+.25*(1-Math.exp(-stacks/10));
 let t=0;
    // the fireball: bursting out, then a column of fire driven up out of the drum
    for (let i = 0; i < 5; i++) ps.spawn(P.FIRE, R.range(-3, 3), y + R.range(-3, 3), R.range(-20, 20), R.range(-40, -10), R.range(0.18, 0.28), 0, R.range(9, 12));
    for (let i = 0; i < 30; i++) {
      const a = R.range(-Math.PI - 0.15, 0.15), d = R.range(0, 8), sp = R.range(50, 190);
      ps.spawn(P.FIRE, Math.cos(a) * d, y + Math.sin(a) * d, Math.cos(a) * sp, Math.sin(a) * sp * 0.8 - 40, R.range(0.55, 1.05), 0, R.range(5, 10), 0, R.chance(0.5) ? PF.BIG : 0);
    }
    for (let i = 0; i < 12; i++) ps.spawn(P.FIRE, R.range(-6, 6), y - R.range(0, 10), R.range(-14, 14), -R.range(170, 300), R.range(0.7, 1.15), 0, R.range(6, 10), R.range(0, 0.12), R.chance(0.7) ? PF.BIG : 0);
    // oily black smoke
    for (let i = 0; i < 12; i++) {
      const a = R.range(-Math.PI, 0), d = R.range(4, 16);
      ps.spawn(P.SMOKE, Math.cos(a) * d, y + Math.sin(a) * d, Math.cos(a) * 30, -R.range(30, 90), R.range(.65, 1.05), SOOT, R.range(8, 13), R.range(0.1, 0.4), PF.BIG);
    }
    for (let i = 0; i < 90; i++) {
      const a = R.range(0, TAU), sp = R.range(160, 400);
      ps.spawn(P.SPARK, 0, y, Math.cos(a) * sp, Math.sin(a) * sp - 70, R.range(0.2, 0.6));
    }
    for (let i = 0; i < 40; i++) {
      const a = R.range(0, TAU), sp = R.range(30, 140);
      ps.spawn(P.EMBER, Math.cos(a) * 8, y + Math.sin(a) * 8, Math.cos(a) * sp, Math.sin(a) * sp - 70, R.range(.65, 1.3), F[3]);
    }

 function painter(p){return transform(p,scale,scale,0,1-smooth(1.2,meta.duration,t));}
 return {update(dt){t=Math.round((t+dt)*1e9)/1e9;ps.update(dt);},
 drawBack(p){if(t<=0||t>=meta.duration)return;drawPs(painter(p),ps,'back',FR);},
 draw(p){if(t<=0||t>=meta.duration)return;p=painter(p);drawPs(p,ps,'front',FR);
  if(t<.45){const k=t/.45;band(p,0,0,100*ease.outCubic(k),.16,Math.max(1,4.5*(1-k)),1-k,[F[1],F[2],F[3],F[6]]);}
  if(t<.22)flare(p,0,y,54*Math.pow(1-t/.22,1.4),1-t/.22,F);
  p.glow(0,y,65,F[4],.65*(1-smooth(0,.6,t)));
 }};
}
