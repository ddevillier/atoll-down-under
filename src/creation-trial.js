import {Simulation} from './simulation.js';
import {SPECIES} from './data.js';
import {edible} from './diet.js';
// A controlled fixture runs the production simulation. It never becomes a saved dive.
export function creationTrial(config){
 const sim=new Simulation(1729);sim.start('create','custom',config);sim.trial=true;sim.current=4;sim.visited=[4];
 const foods=sim.sections.flatMap(s=>s.food),animals=sim.sections.flatMap(s=>s.entities);
 const shells=sim.player.species.ability==='crush'?sim.section.entities.filter(e=>['crab','snail','urchin'].includes(e.species.food)&&edible(sim.player,e)):[];
 sim.sections.forEach((section,i)=>{section.entities=[];section.food=i===4?['algae','grass','plankton','worm','shrimp','coral'].map((kind,n)=>{
  const f=foods.find(f=>f.food===kind);return f?{...structuredClone(f),id:'trial-food-'+n,x:350+n*170,y:310,amount:100,regrow:0}:null;
 }).filter(Boolean):[];});
 // Use real prey eligibility. A small nocturnal lurer may need a daytime
 // species visiting this controlled fixture to demonstrate its ability.
 const safe=s=>s.food==='fish'&&!s.diet.includes('fish')&&!s.poison&&s.ability!=='clean';
 let visitors=animals.map(e=>e.species).filter(s=>safe(s)&&s.size<40&&(sim.player.species.ability!=='lure'||edible(sim.player,s))).slice(0,2);
 if(sim.player.species.ability==='lure'&&!visitors.length){const prey=SPECIES.find(s=>safe(s)&&edible(sim.player,s));if(prey)visitors=[prey,prey];}
 sim.section.entities=visitors.map((species,i)=>({...structuredClone(sim.player),species:structuredClone(species),id:'trial-visitor-'+i,x:800+i*160,y:480}));
 // Keep bottom residents on their authored ground routes for a real shell meal.
 sim.section.entities.push(...shells.map((e,i)=>({...structuredClone(e),id:'trial-shell-'+i})));
 sim.player.x=800;sim.player.y=210;sim.player.energy=55;sim.pointer={x:800,y:210};sim.protected=false;sim.events=[];
 return sim;
}
