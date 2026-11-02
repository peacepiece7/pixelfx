// Translucent pixel volumes: no canvas blur and no checkerboard alpha.
// Shared by the combat-request effects; hard cores still use the normal painter.
import { clamp } from '../core/index.js';

export function haze(p, x, y, r, c, a) {
  if (r <= 0 || a <= 0) return;
  p.disc(x, y, r, c, d => a * (1 - d * d) ** 2);
}

// Elliptical light pool stays on the floor instead of making a circular halo.
export function pool(p, x, y, rx, ry, c, k) {
  if (rx <= 0 || ry <= 0 || k <= 0) return;
  p.each(x-rx,y-ry,x+rx,y+ry,(px,py,sx,sy)=>{
    const d=((px-x)/rx)**2+((py-y)/ry)**2;
    if(d<1)p.add(sx,sy,c,k*(1-d)**2);
  });
}

// Same geometry as band(), but a translucent rim and feathered wake, not stippled dots.
export function softBand(p, cx, cy, r, sy, thick, alpha, C, keep = () => true) {
  if (r <= 0 || alpha <= 0) return;
  const w=Math.max(1,thick), ry=r*sy;
  const outer2=(r+1/sy)**2,inner2=Math.max(0,r-w-1/sy)**2;
  p.each(cx-r-1,cy-ry-1,cx+r+1,cy+ry+1,(x,y,sx,syPixel)=>{
    const dx=x-cx,dy=(y-cy)/sy,d2=dx*dx+dy*dy;
    if(d2<inner2||d2>outer2)return;
    const d=Math.sqrt(d2),q=clamp((r-d)/w);
    const normal=Math.hypot(dx/(d||1),dy/((d||1)*sy));
    const distance=(r-d)/(normal||1),width=Math.max(.65,w/(normal||1));
    const coverage=clamp(distance+.5)*clamp(width-distance+.5);
    if(!coverage||!keep(Math.atan2(dy,dx)))return;
    const c=C[Math.max(0,C.length-1-Math.floor(q*(C.length-1)))];
    p.blendPx(sx,syPixel,c,clamp(alpha)*coverage*(1-q*.5));
  });
}

export function softShade(p,x0,y0,x1,y1,fn) {
  const out={c:0,a:1,l:0,k:0};
  p.each(x0,y0,x1,y1,(x,y,sx,sy)=>{
    out.c=0;out.a=1;out.l=0;out.k=0;
    const c=fn(x,y,out)||out.c;
    if(c)p.blendPx(sx,sy,c,clamp(out.a));
    if(out.k>0)p.add(sx,sy,out.l||c,out.k);
  });
}
