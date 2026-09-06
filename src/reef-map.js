import {REEFS,FOODS} from './data.js';
import {edible} from './simulation.js';

// The illustrated map extends the existing nine-square locator. It describes
// the same connected reef; choosing a route never moves or steers the player.
export function routeBetween(from,to){
 if(!Number.isInteger(from)||!Number.isInteger(to)||!REEFS[from]||!REEFS[to])return [];
 const route=[];let current=from;
 const column=(to%3-current%3+3)%3;
 if(column){const dx=column===1?1:-1,next=Math.floor(current/3)*3+(current%3+dx+3)%3;route.push({from:current,to:next,dx,dy:0,direction:dx>0?'right':'left'});current=next;}
 while(Math.floor(current/3)!==Math.floor(to/3)){
  const dy=to>current?1:-1,next=current+dy*3;route.push({from:current,to:next,dx:0,dy,direction:dy>0?'down':'up'});current=next;
 }
 return route;
}

export function availableMeals(species,section){
 const tags=new Set();
 for(const f of section.food)if(f.regrow<=0&&edible(species,f))tags.add(f.food);
 for(const e of section.entities){
  if(!e.alive||e.species.ability==='clean'||!edible(species,e))continue;
  if(e.species.poison&&!['crush','poison'].includes(species.ability))continue;
  tags.add(e.species.food||'fish');
 }
 const names={fish:'Smaller fish',crab:'Crabs',snail:'Snails',urchin:'Urchins',star:'Sea stars',slug:'Sea slugs',anemone:'Anemones'};
 return species.diet.filter(tag=>tags.has(tag)).map(tag=>FOODS[tag]?.name||names[tag]||tag);
}
