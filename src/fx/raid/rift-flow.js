import {fit,TAU,createFrame,clearFrame,painterFor} from '../../core/index.js';
import {ABYSS} from '../../core/raid-visuals.js';
import {stamp} from './_scale.js';
const frame=createFrame(384,300);
export const meta={name:'Distant rift flow',desc:'A large broken violet rift behind the ruins: thick luminous edges, drifting interior haze and light flowing along its circumference.',tags:['raid','rift','environment','large'],size:[640,360],origin:[320,180],duration:8,loop:true,fps:30,bg:'dark',options:{palette:ABYSS,seed:7,reducedMotion:false}};
export function draw(p,t,o){if(t<0)return;const target=p;p=painterFor(clearFrame(frame)).place(192,140);const C=fit(o.palette,6),q=(o.reducedMotion?0:t)/8*TAU,s=o.seed??7;
 for(let i=0;i<7;i++){const a=q+i*TAU/7;p.disc(Math.cos(a)*75,20+Math.sin(a)*50,32,C[2],.08);}
 for(let i=0;i<40;i++){
  if(i%7===2)continue;const a=i*TAU/40,b=(i+.85)*TAU/40,r=152+Math.sin(i*2+s)*7;
  const x=Math.cos(a)*r,y=20+Math.sin(a)*108,xx=Math.cos(b)*(r+Math.sin(i)*5),yy=20+Math.sin(b)*108;
  p.beam(x,y,xx,yy,18,C[2],.8);p.beam(x,y,xx,yy,6,C[4],.9);
  const pulse=.35+.65*(.5+.5*Math.sin(a*3-q));p.glow(x,y,13,C[3],pulse*.18);
 }
 for(let i=0;i<18;i++){const a=q+i*TAU/18,x=Math.cos(a)*154,y=20+Math.sin(a)*108;
  p.line(x,y,x-Math.sin(a)*12,y+Math.cos(a)*8,C[5],.85);
 }
 stamp(target,frame,-192,-140,384,300,1,o);
}
