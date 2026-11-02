import { meta as lanceMeta, draw as drawLance } from "./adelvin-lance.js";
import { HEAL } from "./_adelvin.js";
export const meta = { ...lanceMeta, name: "Adelvin healing lance", desc: "A soft mint-ivory healing spear with a small cross on its collar. The host sends it toward one ally; the image does not decide healing timing.", options: {...lanceMeta.options, palette: HEAL, healing: true} };
export function draw(p,t,o) { drawLance(p,t,{...o,healing:true}); }
