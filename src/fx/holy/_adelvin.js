// Shared pixel motifs for Adelvin; all motion is host-owned or deterministic time.
import { fit, WHITE } from "../../core/index.js";
export const AURORA = ["#162c48", "#27536e", "#3c879b", "#68bfce", "#b8e3df", "#e9ce8d", "#fff4d8", "#ffffff"];
export const HEAL = ["#173d42", "#287477", "#57b3af", "#94d5c0", "#cfebbc", "#e5dfa1", "#fff7dc", "#ffffff"];
export const colors = (o) => fit(o.palette, 8);
export const envelope = (t, D) => t < 0 || t >= D ? 0 : Math.min(1, t / 0.035, (D - t) / 0.18);
export function orb(p, x, y, r, C, alpha = 1, phase = 0) {
  p.disc(x, y, r + 1, C[0], alpha * 0.9);
  p.disc(x, y, r, C[2], alpha);
  p.disc(x - 0.5, y - 0.5, r * 0.72, C[4], alpha);
  p.disc(x - r * 0.23, y - r * 0.25, r * 0.4, C[6], alpha);
  p.dot(x - 1, y - 1, WHITE, alpha);
  p.arc(x, y, r + 2, 1, phase, phase + Math.PI * 0.75, C[5], alpha * 0.8);
  p.glow(x, y, r * 2.8, C[3], alpha * 0.2);
}
export function shield(p, x, y, C, alpha, phase) {
  // Dark bevel, cool enamel, warm central rib. No filled bubble over the actor.
  const w = 5 + Math.round(Math.cos(phase) * 1.5);
  p.poly([[x-w,y-8],[x+w,y-8],[x+w-1,y+2],[x,y+8],[x-w+1,y+2]],C[0],alpha);
  p.poly([[x-w+1,y-7],[x+w-1,y-7],[x+w-2,y+1],[x,y+6],[x-w+2,y+1]],C[5],alpha);
  p.poly([[x-w+2,y-5],[x+w-2,y-5],[x+w-3,y],[x,y+4],[x-w+3,y]],C[2],alpha);
  p.line(x,y-5,x,y+3,C[6],alpha);
  p.line(x-2,y-2,x+2,y-2,C[4],alpha);
  p.dot(x-2,y-6,WHITE,alpha);
  p.glow(x,y,11,C[3],alpha*0.12);
}
export const PRAY = { turn: 1.05, fx: -4, fy: -27, bx: 5, by: -27, armsFront: true, ffx: -3, fbx: 4 };
export const loopAct = { onBody: true, poses: [[0, PRAY], [0.5, {...PRAY, crouch: 1}], [1, {...PRAY, hy: 1}], [1.5, {...PRAY, crouch: 1}], [2, PRAY]] };
