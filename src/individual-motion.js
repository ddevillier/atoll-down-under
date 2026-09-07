// A final avalanche matters here: adjacent numeric entity IDs otherwise produce
// almost identical phases and refuge offsets, despite technically unequal hashes.
export function individualSeed(id){
 let h=2166136261;for(const c of String(id)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}
 h^=h>>>16;h=Math.imul(h,0x85ebca6b);h^=h>>>13;h=Math.imul(h,0xc2b2ae35);h^=h>>>16;return h>>>0;
}
