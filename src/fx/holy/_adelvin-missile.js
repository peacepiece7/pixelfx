// Layered cores and twisting ribbons follow the local magic-missile / arcane-missiles
// recipes, adapted from Sprite Fusion energy (MIT, Copyright 2026 Hugo Duprez).
import { TAU } from '../../core/index.js';

export function missileCore(p,x,y,r,C,phase,k=1) {
  p.circle(x,y,r+1,C[2],k);
  p.circle(x,y,r,C[4],k);
  p.circle(x-.4,y-.4,r*.64,C[6],k);
  p.circle(x-.5,y-.5,Math.max(.7,r*.32),C[7],k);
  // Broken orbiting rays make this read as charged magic, not a glass pearl.
  for(let i=0;i<3;i++) {
    const a=phase+i*TAU/3, ca=Math.cos(a),sa=Math.sin(a);
    p.line(x+ca*(r+1),y+sa*(r+1)*.65,x+ca*(r+3),y+sa*(r+3)*.65,C[i===0?7:5],k);
  }
  p.glow(x,y,r*3.2,C[3],k*.22);
  p.glow(x,y,r*1.4,C[6],k*.18);
}

// A continuous tapered ribbon with alternating lit face/dark back, plus a helix.
export function missileRibbon(p,point,C,phase,width,k=1,steps=32) {
  let prev=point(0);
  for(let j=1;j<=steps;j++) {
    const u=j/steps, q=point(u),dx=q[0]-prev[0],dy=q[1]-prev[1];
    const length=Math.hypot(dx,dy)||1,nx=-dy/length,ny=dx/length;
    const fade=(1-u)**.65*k,twist=Math.sin(phase-u*9);
    const w=(.6+width*(1-u)*Math.abs(twist));
    p.beam(prev[0],prev[1],q[0],q[1],w, C[twist>0?4:2],Math.min(1,fade*1.4));
    p.line(prev[0],prev[1],q[0],q[1],C[u<.25?7:4],fade);
    const offset=Math.sin(phase*2-u*13)*(w*.6+1);
    p.dot(q[0]+nx*offset,q[1]+ny*offset,C[4],fade);
    if(j%8===0)p.glow(q[0],q[1],4,C[3],fade*.12);
    prev=q;
  }
}
