import { TAU, WHITE } from "../../core/index.js";
import { AURORA, colors } from "./_adelvin.js";
export const meta = {
 name: "Adelvin light lance", desc: "An ivory spearhead with a cyan bevel, gold collar and tapering split ribbons. The host moves the nose; it never selects targets or applies damage.",
 tags: ["holy","adelvin","projectile","lance","directional","loop"], size: [160,80], origin: [126,40], duration: 1.2, loop: true, fps: 30, bg: "dark",
 options: { palette: AURORA, length: 64, healing: false, seed: 17 }
};
export function draw(p,t,o) {
 const C=colors(o), L=Math.max(12,o.length), ph=t/meta.duration*TAU;
 for(let i=0;i<3;i++) {
  const y=(i-1)*4;
  for(let k=1;k<14;k++) {
   const u=k/14, x=-L*u, yy=y*u+Math.sin(ph*2-u*6+i)*2*u;
   p.line(x,yy,x-5,yy,C[3+i],(1-u)*0.65);
  }
 }
 p.poly([[-26,0],[-11,-5],[0,0],[-11,5]],C[0]);
 p.poly([[-24,0],[-11,-4],[-1,0],[-11,4]],C[3]);
 p.line(-21,0,-2,0,C[6]); p.line(-11,-2,-3,0,WHITE);
 p.beam(-L*0.6,0,-20,0,2,C[5],0.85);
 p.line(-25,-4,-25,4,C[5]); p.dot(-25,-4,WHITE);
 if(o.healing) { p.line(-33,-3,-33,3,C[6]);p.line(-36,0,-30,0,C[6]); }
 p.glowLine(-L*0.7,0,-6,0,7,C[3],0.14);
 for(let i=0;i<5;i++) { const u=(t/meta.duration+i/5)%1; p.dot(-16-u*L,Math.sin(i*2+ph)*3,C[5],(1-u)*0.7); }
}
