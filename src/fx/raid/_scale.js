import { createFrame, clearFrame, painterFor } from '../../core/index.js';
export const TOXIC=['#102316','#1b3925','#2b5734','#467b43','#72a951','#a7cf70','#dcf2ac','#f2ffda'];
// Reuse existing recipes at their authored resolution, preserving translucent smoke and additive light.
export function surface(mod){return createFrame(...mod.meta.size);}
export function paint(frame,mod,t,options){clearFrame(frame);const p=painterFor(frame).place(...mod.meta.origin);mod.drawBack?.(p,t,options);mod.draw?.(p,t,options);return frame;}
export function stamp(p,f,x,y,w,h,alpha=1,o={},crop=[0,0,f.w,f.h]){
 const [cx,cy,cw,ch]=crop, masks=o.maskRects,protect=o.protectRects;
 const inside=(lx,ly,r)=>lx>=r[0]&&ly>=r[1]&&lx<r[0]+r[2]&&ly<r[1]+r[3];
 // Common unrotated draw: precompute horizontal sampling once, rather than invert the transform per pixel.
 if(p.cs===1&&p.sn===0){
  const left=Math.max(p.ox,Math.floor(p.tx+Math.min(x*p.fx,(x+w)*p.fx))),right=Math.min(p.ox+p.w-1,Math.ceil(p.tx+Math.max(x*p.fx,(x+w)*p.fx))),top=Math.max(p.oy,Math.floor(p.ty+y)),bottom=Math.min(p.oy+p.h-1,Math.ceil(p.ty+y+h));
  const columns=new Int32Array(Math.max(0,right-left+1));
  for(let sx=left;sx<=right;sx++){const u=((sx+.5-p.tx)*p.fx-x)/w;columns[sx-left]=u>=0&&u<1?cx+Math.floor(u*cw):-1;}
  for(let sy=top;sy<=bottom;sy++){
   const ly=sy+.5-p.ty,v=(ly-y)/h;if(v<0||v>=1)continue;const row=(cy+Math.floor(v*ch))*f.w;
   for(let sx=left;sx<=right;sx++){
    const col=columns[sx-left];if(col<0)continue;const i=row+col,c=f.color[i],light=f.light[i];if(!c&&!light)continue;
    const lx=(sx+.5-p.tx)*p.fx;if((masks&&!masks.some(r=>inside(lx,ly,r)))||(protect&&protect.some(r=>inside(lx,ly,r))))continue;
    const destination=(sy-p.oy)*p.w+sx-p.ox;
    if(c){
     const a=Math.min(1,(c>>>24)/255*alpha)*p.fade;
     if(!p.C[destination]){if(a>.004)p.C[destination]=((Math.floor(a*255)<<24)|(c&0xffffff))>>>0;}
     else p.blendPx(sx,sy,c|0xff000000,Math.min(1,(c>>>24)/255*alpha));
    }
    if(light){if(!p.L[destination]&&alpha*p.fade*p.lightK===1)p.L[destination]=light;else p.add(sx,sy,light,alpha);}
   }
  }return;
 }
 p.each(x,y,x+w,y+h,(lx,ly,sx,sy)=>{
  const u=(lx-x)/w,v=(ly-y)/h;if(u<0||v<0||u>=1||v>=1||(masks&&!masks.some(r=>inside(lx,ly,r)))||(protect&&protect.some(r=>inside(lx,ly,r))))return;
  const i=(cy+Math.floor(v*ch))*f.w+cx+Math.floor(u*cw),c=f.color[i],light=f.light[i];
  if(c)p.blendPx(sx,sy,c|0xff000000,Math.min(1,(c>>>24)/255*alpha));
  if(light)p.add(sx,sy,light,alpha);
 });
}
