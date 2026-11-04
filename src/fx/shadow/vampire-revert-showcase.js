import * as awaken from './vampire-awaken-showcase.js';
export const meta={...awaken.meta,name:'Vampire revert · reverse dark blink',options:{...awaken.meta.options,reverse:true}};
export const {draw,actorAlpha}=awaken;
export const act={...awaken.act,poses:[...awaken.act.poses].reverse().map(([t,p])=>[meta.duration-t,p])};
