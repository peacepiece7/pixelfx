import {ABYSS,colors,allowed,masked} from '../../core/raid-visuals.js';
export const meta={"name": "Distant rift flow", "desc": "Local thin rift strands behind ruins; slow flow without screen flashes.", "tags": ["raid", "abyss"], "size": [192, 192], "origin": [96, 96], "duration": 8, "loop": true, "fps": 30, "bg": "ground", "options": {"seed": 7, "reducedMotion": false}};
meta.options.palette=ABYSS;
export function draw(p,t,o){if(t<0)return;if(o.reducedMotion)t=0;const C=colors(o);const q=o.reducedMotion?0:t/8*Math.PI*2;for(let j=0;j<3;j++){const pts=[];for(let y=-65;y<=65;y+=5)pts.push([Math.sin(y*.07+q+j)*4+j*5-5,y]);p.polyline(pts,C[2+j%2],.35);for(let i=0;i<7;i++){const u=((t/8+i/7)%1),y=-65+u*130,x=Math.sin(y*.07+q+j)*4+j*5-5;p.dot(x,y,C[4],Math.sin(u*Math.PI)*.5);}}}
