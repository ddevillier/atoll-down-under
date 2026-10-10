export function edible(predator,prey){
 const a=predator.species||predator,b=prey.species||prey;
 if(b.ability==='clean')return false;
 const food=prey.kind==='food'?prey.food:b.food||'fish';
 if(!a.diet.includes(food))return false;
 if(food==='fish' && b.size>=a.size*.77&&a.ability!=='mimic')return false;
 // A listed crab/snail diet includes smaller shells that the mouth can handle.
 // Larger shells, spiny urchins and armored fish retain the stronger-jaw gate.
 const smallShellfish=['crab','snail'].includes(food)&&b.size<a.size*.77;
 if(b.armor&&!smallShellfish&&a.ability!=='crush'&&a.size<100)return false;
 return true;
}
// Guidance must distinguish a diet match from a poisonous meal.
export function suitableMeal(predator,prey){const p=predator.species||predator,b=prey.species||prey;return edible(predator,prey)&&(!b.poison||['crush','poison'].includes(p.ability));}
