import {ABYSS,colors,allowed,masked} from '../../core/raid-visuals.js';
export const meta={"name": "Breath ground impact", "desc": "Brief violet fragments confined to supplied platform surface.", "tags": ["raid", "abyss"], "size": [192, 128], "origin": [96, 80], "duration": 0.6, "loop": false, "fps": 30, "bg": "ground", "options": {"seed": 7, "maskRects": [[-80, -25, 160, 40]], "reducedMotion": false}};
meta.options.palette=ABYSS;
export function draw(p,t,o){if(t<0||t>=meta.duration)return;const C=colors(o);const u=t/.6,k=(1-u)**2;masked(p,o,[-90,-70,90,45],[[-80,-25,160,40]],(x,y,out)=>{const r=Math.hypot(x,y*2),ring=Math.abs(r-65*(1-(1-u)**3))<2;const chips=Math.sin(x*.7+(o.seed??7))*Math.cos(y*.8)>.8&&r<70*u;if(ring||chips){out.c=C[ring?4:3];out.a=k;}});}
