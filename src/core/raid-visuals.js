import {fit} from './index.js';
export const ABYSS=['#111126','#24203f','#45316b','#7844a4','#b66ce0','#e4bcff'];
export const colors=o=>fit(o.palette??ABYSS,6);
// Local rectangles [x,y,width,height]. Geometry is supplied by the host; never a hit test.
export function allowed(x,y,o,fallback){const inside=r=>x>=r[0]&&y>=r[1]&&x<r[0]+r[2]&&y<r[1]+r[3];return (o.maskRects??fallback).some(inside)&&!(o.protectRects??[]).some(inside);}
export function masked(p,o,rect,fallback,shader){p.shade(...rect,(x,y,out)=>{if(!allowed(x,y,o,fallback))return;shader(x,y,out);});}
