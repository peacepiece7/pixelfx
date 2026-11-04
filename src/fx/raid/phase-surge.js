import {ABYSS,colors,allowed,masked} from '../../core/raid-visuals.js';
export const meta={"name": "Dragon phase surge", "desc": "One restrained neck/chest outline surge; host coalesces skipped phases into one cue.", "tags": ["raid", "abyss"], "size": [192, 192], "origin": [96, 130], "duration": 1.2, "loop": false, "fps": 30, "bg": "ground", "options": {"seed": 7, "reducedMotion": false}};
meta.options.palette=ABYSS;
export function draw(p,t,o){if(t<0||t>=meta.duration)return;const C=colors(o);const u=t/1.2,k=Math.sin(Math.PI*u)**2;for(let i=0;i<12;i++){const a=i*Math.PI*2/12,r=24+u*14,x=Math.cos(a)*r,y=-30+Math.sin(a)*r*1.4;p.line(x,y,x+Math.cos(a)*5*k,y+Math.sin(a)*8*k,C[4],k*.8);p.glow(x,y,7,C[3],k*.13);}p.arc(0,-30,28+u*8,1,-Math.PI*.8,Math.PI*.8,C[3],k*.55);}
