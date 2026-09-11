import {Simulation} from './simulation.js';
// A controlled fixture runs the production simulation. It never becomes a saved dive.
export function creationTrial(config){
 const sim=new Simulation(1729);sim.start('create','custom',config);sim.trial=true;sim.current=4;sim.visited=[4];
 const foods=sim.sections.flatMap(s=>s.food),animals=sim.sections.flatMap(s=>s.entities);
 sim.sections.forEach((section,i)=>{section.entities=[];section.food=i===4?['algae','grass','plankton','worm','shrimp','coral'].map((kind,n)=>{
  const f=foods.find(f=>f.food===kind);return f?{...structuredClone(f),id:'trial-food-'+n,x:350+n*170,y:310,amount:100,regrow:0}:null;
 }).filter(Boolean):[];});
 // Non-predatory, edible visitors allow an actual lure trial without danger.
 sim.section.entities=animals.filter(e=>!e.species.diet.includes('fish')&&e.species.size<40).slice(0,2).map((e,i)=>({...structuredClone(e),id:'trial-visitor-'+i,x:800+i*160,y:480}));
 sim.player.x=800;sim.player.y=210;sim.player.energy=55;sim.pointer={x:800,y:210};sim.protected=false;sim.events=[];
 return sim;
}
