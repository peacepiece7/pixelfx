import { TAU } from "../../core/index.js";
import { AURORA, colors, orb } from "./_adelvin.js";
export const meta = {
 name: "Adelvin aurora bolt", desc: "A small pearly head pulls three cyan ribbons and spaced gold motes. Its nose follows host projectile coordinates; size can distinguish wand, rod and stored orbs.",
 tags: ["holy","adelvin","projectile","orb","directional","loop"], size: [112,72], origin: [83,36], duration: 1.2, loop: true, fps: 30, bg: "dark", options: {palette:AURORA,radius:4,length:46,seed:19}
};
export function draw(p,t,o) {
 const C=colors(o), ph=t/meta.duration*TAU, L=Math.max(8,o.length), r=Math.max(1,o.radius);
 for(let band=0;band<3;band++) for(let k=1;k<18;k++) {
  const u=k/18, x=-u*L, y=(band-1)*r*u+Math.sin(ph*2-u*5+band)*r*u*0.6;
  p.line(x,y,x-3,y,C[band+2],(1-u)*0.7);
 }
 orb(p,0,0,r,C,1,ph);
 for(let k=0;k<5;k++) { const u=(t/meta.duration+k/5)%1; p.dot(-u*L,Math.sin(ph+k)*r,C[5],(1-u)*0.75); }
}
