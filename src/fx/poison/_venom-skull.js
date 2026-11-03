// Same hand-authored skull silhouette as shadow/curse.js (the darkness status).
// Keep the reviewed darkness module untouched; only its pixel motif is reused.
const SKULL = [
  "......kkkkk......",
  "....kkhhhhlkk....",
  "...khhhhhhlllk...",
  "..khhhhhllllllk..",
  ".khhhhlllllllmmk.",
  ".khhhllllllllmmk.",
  "khhllllllllllmmdk",
  "khlldddllldddmmdk",
  "khleeeeelleeeeedk",
  "kleeeeeelleeeeedk",
  "kleeeeeemleeeeedk",
  "kmleeeelmmleeedkk",
  ".kmmlllmnnmlmddk.",
  "..kmmlmnnnnmddk..",
  "..kdmlllmmlmddk..",
  "...kgtgtgtgtgk...",
  "...kdgtgtgtgdk...",
  "....kkkkkkkkk....",
];
export function venomSkull(p,x,y,C,alpha=1,scale=1) {
  const source=p,soft=Object.create(source);
  soft.put=(x,y,c,a=1)=>source.blendPx(x,y,c,a);
  p=soft;
  p.sprite(SKULL,{k:C[0],d:C[1],m:C[2],l:C[4],h:C[6],e:C[0],n:C[0],t:C[5],g:C[0]},
    x-8.5*scale,y-9*scale,{scale,a:alpha});
  for(const side of [-1,1]) {
    p.blend(x+side*3.5*scale,y+1.5*scale,C[5],alpha);
    p.glow(x+side*3.5*scale,y+1.5*scale,4*scale,C[4],alpha*.3);
  }
}
