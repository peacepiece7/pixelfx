import {fit,Rng,TAU,ease,smooth} from '../../core/index.js';
export const meta={name:'Brynhild spear hit',desc:'A short directional ivory puncture opens two broken gold arcs and sheds small shards. No floor slam, smoke cloud or character.',tags:['holy','brynhild','spear','impact','hunt','one-shot'],size:[96,96],origin:[48,48],duration:.4,loop:false,fps:30,bg:'dark',options:{palette:['#30203b','#654055','#a86e42','#dfa85a','#ffe29a','#fff6d0','#ffffff'],seed:37}};
export function draw(p,t,o){
 if(t<0||t>=meta.duration)return;
 const C=fit(o.palette,7),R=new Rng(o.seed),u=t/meta.duration,k=1-smooth(.04,.38,t),r=4+19*ease.outCubic(u);
 for(const side of [-1,1]){
  const a=side<0?Math.PI:0;
  p.arc(0,0,r,1.2,a-.7,a+.7,C[4],k*.7);
  p.arc(0,0,r+3,1,a+.15,a+.55,C[3],k*.5);
 }
 if(t<.12){const L=25*(1-t/.12);p.beam(-L,0,L,0,1.5,C[5],k);p.line(0,-L*.32,0,L*.32,C[6],k);p.glow(0,0,15,C[4],.3*k);}
 for(let i=0;i<13;i++){
  const a=R.range(0,TAU),speed=R.range(40,100),life=R.range(.17,.36);if(t>=life)continue;
  const x=Math.cos(a)*(4+speed*t),y=Math.sin(a)*(3+speed*t*.7),fade=1-t/life;
  p.line(x,y,x-Math.cos(a)*3,y-Math.sin(a)*3,C[3+i%3],fade);
  if(i%4===0)p.tri(x,y,x-Math.cos(a)*6,y-Math.sin(a)*6,x+Math.sin(a)*2,y-Math.cos(a)*2,C[4],fade*.8);
  if(i%3===0)p.dot(x,y,C[6],fade);
 }
}
