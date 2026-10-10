import {REEFS} from './data.js';
const elapsed=time=>{const seconds=Math.floor(time);return seconds===0?'At dive start':(seconds<60?seconds+'s':Math.floor(seconds/60)+'m '+seconds%60+'s')+' into the dive';};
export function memoryList(entries,escape,limit=8){
 const memories=[...(entries||[])].slice(-limit).reverse();
 return memories.length?`<ol class="reef-memories">${memories.map(m=>`<li><strong>${escape(m.name)}</strong><p>${escape(m.text)}</p><small>${escape(REEFS[m.reef].name)} · ${elapsed(m.time)}${m.recordedAt?' · '+escape(new Date(m.recordedAt).toLocaleDateString()):''}</small></li>`).join('')}</ol>`:'<p class="subtle">No memories yet.</p>';
}
