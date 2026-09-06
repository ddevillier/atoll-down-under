import {FEEDING_SITES,BOTTOM_ROUTES} from './feeding-sites.js';
// Independently authored game ecology. Values are gameplay abstractions, not zoological measurements.
const rows = [
['Silver sprat',30,150,'plankton','day','none','school','A little open-water schooling fish. Find drifting plankton and stay close to shelter.'],
['Neon damselfish',36,132,'plankton algae','day','dash','reef','A bright reef resident. Its small body can disappear among branching coral.'],
['Orange coral goby',26,105,'plankton','day','camouflage','reef','A tiny coral dweller that trades swimming power for excellent concealment.'],
['Royal gramma',42,126,'plankton shrimp','day','dash','reef','A violet and gold cave-side hunter. Pick small meals near cover.'],
['Moorish idol',74,121,'sponge algae','day','none','reef','Its narrow body and long dorsal streamer stand out among reef ledges.'],
['Palette surgeonfish',72,152,'plankton algae','day','spines','reef','An agile grazer whose sharp tail spines discourage a close attack.'],
['Longnose butterflyfish',58,117,'worm coral','day','none','reef','A slender snout reaches small food among the reef. Search coral shelves.'],
['Anemonefish',40,118,'plankton algae shrimp','day','camouflage','reef','A small, deliberate omnivore. Use the reef structure to break a pursuit.'],
['Foxface rabbitfish',75,132,'algae grass','day','spines','reef','An algae grazer with defensive spines. Grazing and shelter make a useful combination.'],
['Yellow goatfish',61,141,'worm shrimp','day','none','sand','A sand-foraging fish. Search the lower reef for small invertebrates.'],
['Sixbar wrasse',57,151,'shrimp worm snail','day','dash','reef','A quick reef forager. Small crustaceans and worms make suitable meals.'],
['Peach fairy basslet',31,133,'plankton','day','dash','school','A small plankton feeder. Open water offers food and exposes you to hunters.'],
['Squirrelfish',62,140,'shrimp crab','night','sonic','reef','Large eyes suit this nocturnal forager. Look for crustaceans near the reef base.'],
['Banggai cardinalfish',38,108,'plankton shrimp','night','none','reef','A slow, patterned hunter of tiny drifting prey. Staying close to cover saves energy.'],
['Oriental sweetlip',96,123,'worm shrimp snail','night','none','sand','A patterned bottom forager. Shellfish and worms offer reliable meals.'],
['Parrotfish',104,141,'algae coral','day','crush','reef','A strong grazing mouth makes reef surfaces a food source. Search algae and coral.'],
['Coral grouper',120,129,'fish shrimp crab','day','camouflage','reef','An ambush hunter that waits beside reef cover for a smaller meal.'],
['Blackfin barracuda',170,205,'fish','day','dash','open','A fast open-water hunter. Pursuit is effective but consumes precious energy.'],
['Crocodile needlefish',140,188,'fish shrimp','day','dash','open','A long narrow surface hunter. Small fish are easier meals than armored prey.'],
['Cuttlefish',85,113,'shrimp crab fish','night','ink','sand','A cephalopod with a rippling fin skirt. Ink can interrupt a predator pursuit.'],
['Lionfish',98,102,'fish shrimp crab','night','spines','reef','Long fin rays surround a slow hunter. Its defensive display creates escape space.'],
['Devil scorpionfish',102,83,'fish shrimp crab','night','camouflage','reef','A patient, mottled ambush predator. Concealment is more useful than a long chase.'],
['Spotted pufferfish',82,110,'snail crab sponge','day','puff','reef','A shell-crushing feeder that can inflate into a more difficult meal.'],
['Longhorn cowfish',76,102,'algae worm shrimp','day','poison','reef','A boxy reef forager. Its protective chemistry offers defense at an energy cost.'],
['Clown triggerfish',96,150,'urchin crab snail','day','crush','reef','A powerful jaw opens armored food that smaller fish cannot use.'],
['Regal angelfish',77,125,'sponge algae','day','spines','reef','A colorful specialist. Sponges are useful food for some species and harmful to others.'],
['Whitemouth moray',155,126,'fish shrimp crab','night','camouflage','reef','A flexible nocturnal hunter. Use a cave as a base for short feeding trips.'],
['Blue-spotted stingray',132,139,'crab shrimp worm','day','sting','sand','A sandy-bottom hunter with a defensive tail. Search the bottom habitats.'],
['Rainbow runner',148,202,'fish shrimp','day','dash','open','A streamlined schooling hunter. Balance its speed against the cost of pursuit.'],
['Humphead wrasse',165,128,'crab snail urchin fish','day','crush','reef','A substantial reef fish able to tackle hard-shelled prey.'],
['Humbug damselfish',35,136,'plankton algae','day','dash','reef','A striped small fish that benefits from the protection of branching coral.'],
['Whitespot hawkfish',60,124,'shrimp fish','day','camouflage','reef','A small ambush hunter. Wait near reef surfaces for a manageable target.'],
['Blacktip reef shark',190,185,'fish','day','dash','open','A mobile reef hunter. Cover distance efficiently and choose substantial prey.'],
['Whitetip reef shark',180,151,'fish crab','night','dash','reef','A reef-associated shark that hunts around ledges and crevices.'],
['Great white shark',270,168,'fish','day','dash','open','A very large visitor to the reef. Its energy demand makes tiny prey a poor investment.'],
['Tiger shark',245,157,'fish crab snail','night','crush','open','A large, broad-diet hunter. Bigger meals help support a costly body.'],
['Wobbegong',185,93,'fish crab','night','camouflage','sand','A patterned carpet shark. A short ambush is more efficient than pursuit.'],
['Electric ray',124,117,'fish shrimp','night','shock','sand','A round-bodied bottom hunter with an electric defense. A discharge needs recovery time.'],
['Giant grouper',220,121,'fish crab urchin','day','crush','reef','A massive ambush predator. Its broad mouth opens many feeding opportunities.'],
['Coral trout',131,158,'fish shrimp','day','dash','reef','A spotted reef predator. Smaller fish form the main part of its game diet.'],
['Longfin batfish',95,110,'algae plankton shrimp','day','none','reef','Tall fins make a striking silhouette. Its mixed diet gives several food options.'],
['Trumpetfish',123,132,'fish shrimp','day','camouflage','reef','A narrow hunter that blends into upright reef structure.'],
['Yellowtail fusilier',70,179,'plankton','day','dash','school','An open-water plankton feeder. Speed helps when cover is far away.'],
['Bluestreak cleaner wrasse',38,120,'parasite','day','clean','reef','The daytime cleaner. Wait nearby without biting to request parasite removal.'],
['Yellow seahorse',43,38,'plankton','day','none','sand','An upright swimmer among plants. It is part of the reef community, not a playable species.'],
['Banded coral shrimp',35,44,'parasite detritus','night','clean','reef','The nighttime cleaning partner. Approach gently and remain still to be cleaned.'],
['Reef crab',38,42,'detritus','both','none','sand','An armored scavenger on the sand. Only suitable hunters can break its shell.'],
['Red sea star',42,0,'detritus','both','none','sand','A slow bottom dweller. Some powerful feeders can make a meal of it.'],
['Orange-spotted filefish',78,108,'coral algae','day','spines','reef','A narrow reef browser with a specialized menu. Coral polyps are a useful food.'],
['Doublelined mackerel',155,202,'fish','day','dash','open','A fast pelagic hunter. Pursue decisively, then rest between meals.'],
['Yellowspot emperor',114,139,'fish crab snail','day','crush','sand','A sturdy forager that patrols sand and reef edges.'],
['Golden snapper',128,152,'fish shrimp crab','night','dash','reef','A robust nighttime hunter. The shrimp cleaner shares its active period.'],
['Pencilled rabbitfish',74,129,'algae grass','day','spines','reef','A plant feeder with defensive spines. Vegetation is a renewable food source.'],
['Flashlight fish',46,129,'plankton shrimp','night','flash','reef','A nocturnal small hunter. Its flash ability briefly startles nearby predators in this game.'],
['Painted frogfish',71,79,'fish shrimp','day','lure','reef','An ambush specialist. Its lure brings small fish within striking distance.'],
['Silver trevally',143,191,'fish shrimp','day','dash','open','A fast silver hunter that travels through open reef water.'],
['Longfin bannerfish',72,139,'plankton worm','day','dash','reef','A tall, striped reef fish. Small floating food and worms are suitable meals.'],
['Checkerboard hawkfish',59,116,'shrimp fish','day','camouflage','reef','A perch-like ambush forager. Short trips from cover reduce exposure.'],
['Purple anthias',39,147,'plankton','day','dash','school','A small schooling fish that feeds in the water above the reef.'],
['Longsnout flathead',138,98,'fish shrimp','night','camouflage','sand','A flattened ambush hunter. The sandy reef floor is its preferred habitat.'],
['Nudibranch',30,12,'sponge','both','poison','sand','A vivid sea slug. In this game its chemical defense makes it dangerous food.'],
['Spiral snail',28,7,'algae','both','none','sand','A shell protects this slow grazer. Hard-food specialists can eat it.'],
['Needle-spined urchin',45,0,'algae','night','spines','sand','Long spines protect this grazer. Only specialized crushing feeders can eat it.'],
['Sea anemone',55,0,'plankton shrimp','both','sting','reef','A stationary animal with stinging tentacles. Observe it carefully before approaching.']
];
const NPC = new Set([43,44,45,46,47,60,61,62,63]);
export const SPECIES = rows.map((r,i)=>({id:'s'+i,index:i,name:r[0],size:r[1],speed:r[2],diet:r[3].split(' '),active:r[4],ability:r[5],habitat:r[6],description:r[7],playable:!NPC.has(i),atlas:Math.floor(i/16),cell:i%16,agility:Math.max(1.3,5.2-r[1]/70),metabolism:.29+r[1]/460,parasites:![19,23,32,33,34,35,36,37].includes(i),food:i===45?'shrimp':i===46?'crab':i===47?'star':i===60?'slug':i===61?'snail':i===62?'urchin':i===63?'anemone':'fish',poison:[20,21,23,60,63].includes(i),armor:[23,46,61,62].includes(i)}));
export const BY_ID=Object.fromEntries(SPECIES.map(s=>[s.id,s]));
export const PLAYABLE=SPECIES.filter(s=>s.playable).sort((a,b)=>a.size-b.size||a.index-b.index);
export const ABILITIES={none:{name:'None',cost:0,description:'Rely on your swimming and shelter.'},dash:{name:'Burst swim',cost:100,description:'Swim faster for four seconds.'},spines:{name:'Raise spines',cost:180,description:'Deter nearby predators for four seconds.'},camouflage:{name:'Camouflage',cost:170,description:'Disappear while still for six seconds.'},ink:{name:'Ink cloud',cost:200,description:'Break nearby pursuits in a cloud of ink.'},puff:{name:'Inflate',cost:200,description:'Become too awkward to swallow for four seconds.'},poison:{name:'Chemical defense',cost:220,description:'Release a short defensive cloud.'},crush:{name:'Crushing jaws',cost:150,passive:true,description:'Always available when you eat. Opens armored foods in your diet; no activation or energy cost.'},sting:{name:'Tail sting',cost:180,description:'Stun nearby pursuers.'},shock:{name:'Electric pulse',cost:250,description:'Stun nearby fish for four seconds.'},sonic:{name:'Sonic pulse',cost:170,description:'Startle nearby predators.'},flash:{name:'Startling flash',cost:170,description:'Interrupt a predator’s pursuit.'},lure:{name:'Angler’s lure',cost:150,description:'Draw smaller fish closer for six seconds.'},clean:{name:'Cleaning',cost:0,description:'Remove parasites from a waiting fish.'}};
const names=['Sunlit Crest','Table Coral Terrace','Outer Blue','Sea Fan Garden','Coral Cathedral','The Old Wreck','Seagrass Meadow','Pearl Sands','Quiet Grotto'];
const shelters=[[[210,610,76],[1340,665,76]],[[920,350,65],[800,590,72]],[[980,380,65],[1330,605,70]],[[400,295,80],[740,470,73]],[[620,340,90],[1090,500,77]],[[390,370,100],[1090,510,74]],[[1370,620,68],[610,470,65]],[[1010,430,77],[650,600,65]],[[360,235,86],[1080,405,96],[420,610,82]]];
export const REEFS=names.map((name,id)=>({id,name,row:Math.floor(id/3),col:id%3,image:'assets/reefs/reef-'+id+'.png',habitat:id<3?'open':id<6?'reef':'sand',feedingSites:FEEDING_SITES[id],bottomRoutes:BOTTOM_ROUTES[id],shelters:shelters[id].map(([x,y,r])=>({x,y,r})),cleaner:{x:shelters[id][0][0]+120,y:shelters[id][0][1]-70}}));
export const FOODS={plankton:{name:'Plankton',color:'#e9d99b',nutrition:9,size:20,description:'Tiny drifting organisms. A renewable food for plankton feeders.'},algae:{name:'Algae',color:'#96bd4d',nutrition:15,size:28,description:'A renewable food for reef grazers.'},grass:{name:'Seagrass',color:'#77b868',nutrition:17,size:36,description:'A plant food for grazing species.'},coral:{name:'Coral polyps',color:'#ef956c',nutrition:14,size:26,description:'Living animals. Only specialized coral feeders can use them.'},sponge:{name:'Sponge',color:'#bc83ba',nutrition:20,size:34,description:'A food for specialist sponge feeders; harmful to many others.'},worm:{name:'Sand worm',color:'#d6a477',nutrition:18,size:20,description:'A soft-bodied meal for bottom foragers.'},shrimp:{name:'Small shrimp',color:'#ecc3b4',nutrition:21,size:22,description:'A small crustacean eaten by many reef hunters.'}};
export const GLOSSARY={Algae:'Photosynthetic organisms that provide food for many reef grazers.',Plankton:'Small organisms carried by water currents.',Parasites:'Organisms that live on or in a host; cleaning partners can remove some of them.',Symbiosis:'A close relationship between different species. Cleaning is a useful example.',Nocturnal:'Active at night. The night reef remains fully visible in this game.',Diurnal:'Active during the day.',Omnivore:'An animal that feeds on both plant and animal material.',Camouflage:'Color or shape that makes an animal harder to distinguish from its surroundings.',Atoll:'A ring-shaped coral reef surrounding a lagoon.',Food_web:'The interconnected feeding relationships of an ecological community.'};
export function createSpecies(config={}){
 config=config||{};
 const size=Number(config.size||75),speed=Number(config.speed||140),endurance=Number(config.endurance||150),agility=Number(config.agility||150),ability=config.ability||'none';
 const cost=Math.round(size*3+speed*2+endurance+agility+(ABILITIES[ability]?.cost||0));
 const diet=config.diet==='grazer'?['algae','grass','plankton']:config.diet==='hunter'?['fish','shrimp','worm']:['algae','shrimp','worm','plankton'];
 if(ability==='crush')diet.push(...(config.diet==='grazer'?['coral']:['crab','snail','urchin']));
 const template=agility>=speed&&agility>=endurance?SPECIES[5]:speed>=endurance?SPECIES[42]:SPECIES[16];
 return {...template,id:'custom',name:String(config.name||'Lagoon wanderer').slice(0,36),size,speed,agility:agility/45,metabolism:Math.max(.23,.9-endurance/500+size/500),ability,active:config.active||'day',diet,description:'Your own reef dweller. Its body, diet and abilities reflect the choices you made.',color:config.color||'#68d1c0',playable:true,parasites:true,cost,budget:1600,endurance};
}
