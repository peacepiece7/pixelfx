import { Rng, fit, smooth, clamp, TAU, band, sparkle } from "../../core/index.js";

export const meta = {"name": "King's decree", "desc": "A cracked bone crown rises above the field; five or fewer curse chains strike supplied target x coordinates, leaving dark seals and bone dust.", "tags": ["shadow", "one-shot"], "size": [320, 160], "origin": [160, 44], "duration": 1.8, "loop": false, "fps": 30, "bg": "ground", options: { palette: ["#140c06", "#3a2a14", "#7a5a26", "#b8902e", "#e0cc8a", "#f4ecd2"], seed: 17, targets: null, curse: ["#160919","#431430","#8c275c","#c95c99","#f0b3da"] } };

// targets are local x coordinates; floor impacts lie 100px below the airborne anchor.
export function create(o) {
 const C=fit(o.palette,6), K=fit(o.curse,5), R=new Rng(o.seed);
 const targets=(Array.isArray(o.targets)?o.targets:[-112,-56,0,56,112]).filter(Number.isFinite).slice(0,5).map(x=>clamp(x,-136,136));
 const dust=targets.map(()=>Array.from({length:10},()=>({vx:R.range(-18,18),vy:R.range(-24,-8),life:R.range(.25,.5)})));
 let elapsed=0,t=0;
 const crown=(p)=>{
  const fade=smooth(0,.18,t)*(1-smooth(.92,1.42,t)), lift=10*smooth(0,.3,t);
  if(!fade)return;
  for(const side of [-1,1]) {
   const split=side*9*smooth(.42,.8,t), y=-lift;
   const pts=side<0?[[-39,10],[-44,-16],[-28,-6],[-23,-27],[-10,-8],[0,-31],[0,13]]:[[0,13],[0,-31],[10,-8],[23,-27],[28,-6],[44,-16],[39,10]];
   p.poly(pts.map(([x,yy])=>[x+split,yy+y]),C[1],fade*.72);
   p.polyline(pts.map(([x,yy])=>[x+split,yy+y]),C[3],fade);
   p.line(side*2+split,8+y,side*38+split,6+y,C[4],fade);
   for(const dx of [side*10,side*23,side*38])p.polyline([[dx+split,6+y],[dx*.9+split,-10+y],[dx+split,-16+y]],C[2],fade);
   p.glow(side*22+split,-5+y,15,C[3],fade*.1);
   p.line(side*3+split,12+y,side*38+split,10+y,C[2],fade);
   for(const x of [side*12,side*29]) {p.ellipse(x+split,3+y,2,3,C[4],fade);p.dot(x+split,2+y,C[5],fade);}
  }
  if(t>.28)p.polyline([[-2,-26-lift],[3,-17-lift],[-3,-8-lift],[2,0-lift],[-1,12-lift]],C[5],fade*smooth(.28,.52,t));
  p.glow(0,-12-lift,37,C[3],fade*.16);
 };
 return {update(dt){elapsed+=dt;t=Math.round(elapsed*1e9)/1e9;},drawBack(p){
  if(t>=meta.duration)return;
  for(const x of targets){const k=smooth(.55,.72,t)*(1-smooth(1.2,1.8,t));
   band(p,x,100,12,.32,1,k,K);p.polyline([[x-7,100],[x,96],[x+7,100],[x,104],[x-7,100]],K[2],k);}
 },draw(p){
  if(t>=meta.duration)return;crown(p);
  targets.forEach((x,i)=>{const age=t-(.52+i*.035), end=clamp(age/.12), fade=1-smooth(.22,.57,age);
   if(age<0||fade<=0)return;
   const sx=(i-(targets.length-1)/2)*9, sy=-8, ex=sx+(x-sx)*end, ey=sy+108*end;
   p.glowLine(sx,sy,ex,ey,4,K[2],fade*.22);
   const dx=ex-sx,dy=ey-sy,L=Math.hypot(dx,dy),nx=-dy/(L||1),ny=dx/(L||1);
   for(let d=0;d<L;d+=7){const q=d/(L||1),cx=sx+dx*q,cy=sy+dy*q;
    const w=(Math.floor(d/7)%2?1:2);p.polyline([[cx+nx*w,cy+ny*w],[cx+dx/L*5+nx*w,cy+dy/L*5+ny*w],[cx+dx/L*5-nx*w,cy+dy/L*5-ny*w],[cx-nx*w,cy-ny*w],[cx+nx*w,cy+ny*w]],K[3],fade);}
   if(age>.12){const u=age-.12;sparkle(p,x,100,5*Math.max(0,1-u/.12),K[4],C[4],fade);
    for(const d of dust[i])if(u<d.life){const a=1-smooth(.12,d.life,u);p.dot(x+d.vx*u,100+d.vy*u+40*u*u,C[4],a);}}
  });
 }};
}
