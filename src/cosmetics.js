// Earned recipes use the existing, freely editable colors and patterns. A saved
// fish stores its appearance, so keeping or importing a fish never needs a badge.
export const COSMETIC_PALETTES=Object.freeze([
 {id:'sunlit',name:'Sunlit',badge:'meal',criterion:'Take a needed meal worth 10 energy.',colors:{color:'#e8b64b',finColor:'#b94f35',markingColor:'#285c70',marking:'stripes'}},
 {id:'sea-glass',name:'Sea glass',badge:'clean',criterion:'Remove 10 parasite damage in one cleaner visit.',colors:{color:'#77cbbd',finColor:'#e2eee0',markingColor:'#236c76',marking:'spots'}},
 {id:'coral-glow',name:'Coral glow',badge:'helper',criterion:'Remove 10 parasite damage while helping a fish.',colors:{color:'#dd797e',finColor:'#edc75f',markingColor:'#733e65',marking:'saddle'}},
 {id:'twilight',name:'Twilight',badge:'shelter',criterion:'Stay hidden in a suitable shelter for five seconds.',colors:{color:'#6470a8',finColor:'#b9a3d2',markingColor:'#ead8a2',marking:'bands'}},
 {id:'pearl',name:'Pearl',badge:'care3',criterion:'Earn care stamps for three species.',colors:{color:'#e4dfc9',finColor:'#bb775f',markingColor:'#496e79',marking:'saddle'}},
 {id:'tidepool',name:'Tidepool',badge:'visit3',criterion:'Visit three habitats.',colors:{color:'#328d9e',finColor:'#e6a74d',markingColor:'#173e63',marking:'bands'}},
 {id:'moonbeam',name:'Moonbeam',badge:'night',criterion:'Take a needed meal at night.',colors:{color:'#947cbe',finColor:'#aad5d8',markingColor:'#e4e9be',marking:'stripes'}},
 {id:'lagoon',name:'Lagoon',badge:'discovery1',criterion:'Discover one way of living.',colors:{color:'#a6ce62',finColor:'#528aaf',markingColor:'#446650',marking:'spots'}},
 {id:'copper-reef',name:'Copper reef',badge:'discovery5',criterion:'Discover five ways of living.',colors:{color:'#c67c48',finColor:'#648b82',markingColor:'#f0d6a2',marking:'bands'}},
 {id:'deep-current',name:'Deep current',badge:'discovery15',criterion:'Discover fifteen ways of living.',colors:{color:'#324873',finColor:'#d18dba',markingColor:'#88ccde',marking:'stripes'}}
].map(p=>Object.freeze({...p,colors:Object.freeze(p.colors)})));

export function cosmeticsForJournal(journal={}){
 return COSMETIC_PALETTES.filter(p=>typeof journal?.earned?.[p.badge]==='string'&&Number.isFinite(Date.parse(journal.earned[p.badge])));
}
export function matchingCosmetic(config,journal){
 return cosmeticsForJournal(journal).find(p=>Object.entries(p.colors).every(([key,value])=>String(config[key]).toLowerCase()===value))?.id||'';
}
export function applyCosmetic(config,id,journal){
 if(!id)return {...config};
 const palette=cosmeticsForJournal(journal).find(p=>p.id===id);
 if(!palette)throw new Error('This color palette has not been earned yet.');
 return {...config,...palette.colors,appearanceVersion:1};
}
export function cosmeticPicker(config,journal,escape){
 const earned=cosmeticsForJournal(journal),chosen=matchingCosmetic(config,journal),locked=COSMETIC_PALETTES.filter(p=>!earned.includes(p));
 return `<label class="field">Colors<select data-cosmetic aria-label="Colors"><option value="">Custom</option>${earned.map(p=>`<option value="${p.id}" ${chosen===p.id?'selected':''}>${escape(p.name)}</option>`).join('')}</select></label>${locked.length?`<details class="cosmetic-criteria"><summary>Earn more colors</summary>${locked.map(p=>`<p class="subtle"><strong>${escape(p.name)}</strong> · ${escape(p.criterion)}</p>`).join('')}</details>`:''}`;
}
