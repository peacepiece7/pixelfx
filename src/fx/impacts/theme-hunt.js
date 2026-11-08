import {fit,Rng,TAU,ease,smooth,READY} from '../../core/index.js';
// Impact anchors are target feet. Gameplay and the three-second telegraph live in the combat engine.
export const meta={name:'Theme hunt impact',desc:'Three target impacts: a hard crescent cleave, converging shard volley, or ground eruption. Seven materials change debris silhouettes; palette identifies the fourteen themes.',tags:['impact','hunt','boss','material','one-shot'],size:[192,160],origin:[96,128],duration:.9,loop:false,fps:30,bg:'ground',options:{palette:['#202334','#384456','#647c83','#93bdc2','#c2e7db','#efffe7','#ffffff'],form:0,material:0,rise:53,seed:19}};
export const act={target:{x:0},poses:[[-.25,{...READY,x:-48,crouch:1}],[-.05,{...READY,x:-48,crouch:3,fx:12,fy:-29}],[.06,{...READY,x:-48,fx:15,fy:-24},'snap'],[.3,{...READY,x:-48}],[.8,{...READY,x:-48}]],hits:[{t:.06,stop:.06,shake:.12,amp:1.5,push:1.2,y:-16}]};
export function draw(p,t,o){
 if(t<0||t>=meta.duration)return;
 const C=fit(o.palette,7),R=new Rng(o.seed),form=Math.max(0,Math.min(2,Math.floor(o.form??0))),material=Math.max(0,Math.min(6,Math.floor(o.material??0))),fade=1-smooth(.24,.83,t),u=Math.min(1,t/.18);
 if(form===0){
  const head=-2.3+3.9*ease.outCubic(u),tail=head-(1-u*.65)*1.5;
  const slashFade=1-smooth(.1,.36,t);
  p.arc(0,-22,29,7,tail-.7,head,C[3],slashFade);p.arc(0,-22,32,2,tail-.4,head,C[5],slashFade);
  p.arc(0,-22,26,2,tail-.3,head-.08,C[4],slashFade);
  if(t<.1){p.line(-17,-38,17,-7,C[6],1-t/.1);p.glow(0,-22,18,C[4],.35*fade);}
 }else if(form===1){
  for(let i=0;i<3;i++){
   const delay=i*.035,q=Math.max(0,Math.min(1,(t-delay)/.16)),x=(1-q)*(32+i*9)-8+i*8,y=-21-(1-q)*Math.max(0,(o.rise??53)-i*4),k=1-smooth(.2,.43,t-delay);
   if(t<delay)continue;
   p.beam(x+9,y-18,x,y,3,C[4],k);p.line(x+9,y-18,x+2,y-3,C[6],k*.8);p.tri(x-3,y-3,x,y+3,x+3,y-2,C[5],k);
   if(q===1)p.arc(-8+i*8,-21,4+(t-delay)*12,1,0,TAU,C[3],k);
  }
 }else{
  const reach=42*ease.outCubic(Math.min(1,t/.25)),k=1-smooth(.16,.55,t);
  p.ellipse(0,0,reach,reach*.23,C[3],k*.24);
  for(let i=0;i<48;i++){const a=i*TAU/48,b=(i+1)*TAU/48;p.line(Math.cos(a)*reach,Math.sin(a)*reach*.23,Math.cos(b)*reach,Math.sin(b)*reach*.23,C[4],k*.8);}
  for(let i=0;i<7;i++){
   const x=(i-3)*11,delay=Math.abs(i-3)*.025,q=Math.max(0,t-delay),height=(12+R.range(0,14))*Math.sin(Math.min(1,q/.4)*Math.PI),a=1-smooth(.28,.62,q);
   if(q>0){p.tri(x-4,0,x+1,-height,x+5,0,C[3],a);p.line(x+1,-height,x+5,0,C[5],a);}
  }
 }
 if(t>=.04&&t<.18){const q=(t-.04)/.14,k=1-q;for(let i=0;i<6;i++){const a=i*TAU/6+.3;const r=3+q*14;p.line(Math.cos(a)*3,-21+Math.sin(a)*3,Math.cos(a)*r,-21+Math.sin(a)*r,C[i%2?5:6],k);}p.glow(0,-21,15,C[4],.35*k);}
 for(let i=0;i<22;i++){
  // Sample the whole particle before its lifetime guard: skipping RNG draws made later debris jump between frames.
  const delay=R.range(0,.07),life=R.range(.3,.72),a=R.range(-Math.PI,0),speed=R.range(28,83),s=R.range(1.3,3.4),q=t-delay;if(q<0||q>=life)continue;
  const x=Math.cos(a)*speed*q,y=-19+Math.sin(a)*speed*q+q*q*60,k=(1-q/life)*fade,col=C[2+i%4];
  if(material===1||material===3){p.disc(x,y,s*(1-q/life),col,k);p.dot(x-1,y-1,C[5],k*.6);}
  else if(material===0){p.line(x-s,y-s*.4,x+s,y+s*.4,col,k);p.dot(x-s,y-s*.4-1,C[4],k);}
  else if(material===2){p.rect(x-s,y-s,s*2,s*1.5,col,k);p.line(x-s,y-s,x+s,y-s,C[4],k);}
  else if(material===4){p.tri(x-s,y,x,y-s*3,x+s,y,C[3],k);p.dot(x,y-s,C[5],k);}
  else if(material===5){p.tri(x-s,y+s,x,y-s*2,x+s,y+s,col,k);p.line(x,y-s*2,x+s,y+s,C[5],k);}
  else {const spin=a+q*4;p.arc(x,y,s,1,spin,spin+2.8,col,k);}
 }
}
