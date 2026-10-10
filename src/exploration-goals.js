import {ADVENTURES,adventureInstruction} from './adventures.js';
import {RESIDENT_JOURNEYS,residentInstruction,watchedResident} from './resident-journeys.js';

// Presentation reads the real journey state. It never starts a mission, changes
// a target, awards progress, or turns a prior journal discovery into a finished dive.
function currentStep(sim){
 const a=sim.adventure||{},id=sim.player?.species?.id,d=ADVENTURES[id];
 if(a.complete)return 'Discovered';
 if(a.homeJourney){const j=a.homeJourney;return j.reef!==sim.current?'Return to your home habitat':j.finished?'Home again':j.stage===2?'Return home':j.stage===1?'Take your feeding trip':'Settle at home';}
 if(a.watchJourney){const j=a.watchJourney;return j.reef!==sim.current?'Return to your lookout habitat':j.finished?'Discovered':j.stage===2?(d.relocate?'Try another lookout':'Return to your lookout'):j.hunt?'Approach your watched meal':j.settled>=d.settle?'Watch a nearby meal':'Settle at your lookout';}
 if(a.patrolJourney){const j=a.patrolJourney;return j.reef!==sim.current?'Return to your route habitat':j.finished?'Discovered':j.stage===2?'Return to your route':j.stage===1?'Take your feeding trip':'Survey your route';}
 if(a.escortJourney){const j=a.escortJourney;return j.finished?'Together again':j.meal?'Rejoin your neighbor':j.joined<3?'Follow your neighbor':id==='s53'&&!j.flashed?'Try your flash':'Take a nearby meal';}
 if(a.foragingJourney){const j=a.foragingJourney;return j.finished?'Discovered':j.meals.length===2?(id==='s4'?'Rejoin your group':id==='s25'?'Rest in cover':'Finish your trip'):'Find '+d.foods[j.meals.length];}
 if(sim.player?.species?.ability==='clean')return 'Help different visitors';
 if(a.buddy){const j=a.buddy;return j.rejoined>=3?'Together again':!j.playerMeal?'Take a nearby meal':!j.partnerMeal?'Let your neighbor feed':'Meet again';}
 if(a.school){const j=a.school;return j.joined>=3?'Together again':!j.neighborMeal?'Let a schoolmate feed':'Rejoin your school';}
 if(a.grazing)return a.grazing.visitedOther?'Revisit your first patch':'Feed at another patch';
 if(id==='s42')return a.stage===2?'Rejoin your school':a.stage===1?'Take a suitable meal':'Swim with your school';
 if(id==='s2'&&a.home)return a.homecomingLogged?'Home again':a.stage===2?'Return home':a.departed?'Take a nearby meal':'Settle at home';
 if(id==='s19')return a.patterns?.length?'Blend into another background':'Blend into the reef';
 if(id==='s23')return 'Find meals beneath the sand';
 if(id==='s9'&&a.meals?.length)return 'Share another sand discovery';
 if(sim.player?.ambush)return sim.player.ambush.settled<2?'Become still':'Wait for a nearby meal';
 // First steps are short invitations. Controls and conditions remain in the
 // opt-in instructions rather than repeating them in the compact card.
 return ['s0','s11','s58'].includes(id)?'Feed near your school':id==='s42'?'Swim with your school':['s5','s15'].includes(id)?'Browse an algae patch':d.action||'Explore';
}
function counter(sim){
 const a=sim.adventure||{},id=sim.player?.species?.id;
 if(sim.player?.species?.ability==='clean')return {current:Math.min(3,new Set(a.clients||[]).size),target:3,unit:'kinds of visitor'};
 if(id==='s19')return {current:Math.min(2,new Set(a.patterns||[]).size),target:2,unit:'backgrounds'};
 if(id==='s23')return {current:Math.min(2,new Set(a.meals||[]).size),target:2,unit:'sand sites'};
 if(a.foragingJourney)return {current:Math.min(2,a.foragingJourney.meals.length),target:2,unit:'meal types'};
 const d=ADVENTURES[id];
 if(a.patrolJourney)return {current:Math.min(d.foods.length,a.patrolJourney.meals.length),target:d.foods.length,unit:'meal types'};
 if(a.homeJourney&&d.ordered)return {current:Math.min(d.foods.length,a.homeJourney.meals.length),target:d.foods.length,unit:'meal types'};
 return null;
}
export function optionalJourney(sim,journal){
 const id=sim?.player?.species?.id,d=ADVENTURES[id];
 if(!d||sim.mode!=='practice'||sim.trial)return null;
 const complete=!!sim.adventure?.complete,recorded=!!journal?.discoveries?.includes(d.id);
 return {id:d.id,species:id,title:d.name,optional:true,recorded,complete,status:complete?'complete':recorded?'recorded':'exploring',step:currentStep(sim),counter:counter(sim),instruction:adventureInstruction(sim),description:d.description};
}
export function optionalObservation(sim,journal){
 const id=sim?.residentFocus,d=RESIDENT_JOURNEYS[id],j=sim?.residentJourneys?.[id];
 if(!d||!j||sim.mode!=='practice'||sim.trial)return null;
 const complete=!!j.complete,recorded=!!journal?.discoveries?.includes(d.id);
 const step=complete?'Discovered':j.reef!==sim.current?'Return to this resident’s habitat':!watchedResident(sim)?'Find another resident':j.meal?(d.after==='walk'?'Watch it carry on':'Watch it settle'):'Watch a meal';
 return {id:d.id,species:id,title:d.name,optional:true,recorded,complete,status:complete?'complete':recorded?'recorded':'exploring',step,counter:null,instruction:residentInstruction(sim),description:d.description};
}
export function explorationGoals(sim,journal){return [optionalJourney(sim,journal),optionalObservation(sim,journal)].filter(Boolean);}
