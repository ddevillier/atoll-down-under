// Shared visual blueprint. Appearance never silently changes diet or survival rules.
export const APPEARANCE_OPTIONS={
 shapeMode:[['adapted','Follow swimming traits'],['free','Choose my proportions']],
 tail:[['fan','Rounded fan'],['fork','Forked'],['lyre','Lyretail'],['point','Tapered']],
 dorsal:[['low','Low fin'],['sail','Tall sail'],['spiny','Spiny crest'],['ribbon','Flowing ribbon']],
 pectoral:[['paddle','Paddles'],['wing','Broad wings'],['point','Pointed fins']],
 mouth:[['small','Small mouth'],['wide','Wide jaws'],['beak','Beak'],['tube','Long snout']],
 marking:[['plain','Plain'],['spots','Spots'],['stripes','Lengthwise stripes'],['bands','Vertical bands'],['saddle','Dark back']]
};
export const APPEARANCE_DEFAULTS={appearanceVersion:1,shapeMode:'adapted',bodyLength:100,bodyDepth:100,tail:'fork',dorsal:'low',pectoral:'paddle',mouth:'small',marking:'spots',finColor:'#e9bc59',markingColor:'#214f62'};
export function appearance(config={}){
 const a={...APPEARANCE_DEFAULTS,...config,appearanceVersion:config.appearanceVersion??0};
 if(![0,1].includes(a.appearanceVersion))throw Error('This fish uses an unsupported appearance version.');
 for(const [k,options] of Object.entries(APPEARANCE_OPTIONS))if(!options.some(([v])=>v===a[k]))throw Error('This fish has an invalid '+k+'.');
 for(const k of ['bodyLength','bodyDepth'])if(!Number.isFinite(a[k])||a[k]<70||a[k]>135)throw Error('This fish has invalid body proportions.');
 for(const k of ['finColor','markingColor'])if(!/^#[0-9a-f]{6}$/i.test(a[k]))throw Error('This fish has an invalid color.');
 return Object.fromEntries(Object.keys(APPEARANCE_DEFAULTS).map(k=>[k,a[k]]));
}
export function anatomy(s){
 const a=s.appearance||appearance(s),base={rounded:.225,slender:.115,sturdy:.185}[s.body||'rounded'];
 const speed=((s.speed||140)-70)/150,agility=((s.agility>10?s.agility:s.agility*45)||150)/250,endurance=(s.endurance||150)/250;
 const depth=a.shapeMode==='adapted'?base*(1.14+agility*.35-speed*.35-endurance*.10):base*a.bodyDepth/100;
 const length=a.shapeMode==='adapted'?.96+speed*.13+endurance*.04-agility*.07:a.bodyLength/100;
 const d=Math.max(.085,Math.min(.35,depth)),dorsalHeight={low:.14,sail:.30,spiny:.23,ribbon:.23}[a.dorsal];
 return {a,depth:d,length,mouthX:a.mouth==='tube'?.495:.45,height:2*Math.max(d*1.11+dorsalHeight,d*.64+.14,d*.1+.27,.25)};
}
