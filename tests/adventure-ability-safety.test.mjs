import test from 'node:test';
import assert from 'node:assert/strict';
import {Simulation} from '../src/simulation.js';
import {beginStory,storyAction,stopStory} from '../src/reef-stories.js';
import {triggerAbility} from '../src/ability-rules.js';
import {isProtectedActor} from '../src/adventure-safety.js';

function encounter(){
 const sim=new Simulation(4);sim.start('practice','s53',null,{adventureKey:'lantern'});
 assert.equal(beginStory(sim,'lantern'),true);assert.equal(storyAction(sim,'lantern-upper'),true);
 const ray=sim.section.entities.find(e=>e.species.id==='s37');
 const cohort=sim.reefStories.lantern.participants.map(ref=>sim.section.entities.find(e=>e.id===ref.id));
 const ordinary=sim.section.entities.find(e=>e.species.id==='s46');
 return {sim,ray,cohort,ordinary};
}

test('an outside generated ray cannot stun the protected lantern cohort through a partial range overlap',()=>{
 const {sim,ray,cohort,ordinary}=encounter();Object.assign(ray,{x:340,y:360});Object.assign(ordinary,{x:330,y:390});
 assert.equal(isProtectedActor(sim,ray),false);assert.equal(isProtectedActor(sim,ordinary),false);
 assert.ok(cohort.every(e=>isProtectedActor(sim,e)&&Math.hypot(e.x-ray.x,e.y-ray.y)<230));
 const before=cohort.map(e=>({id:e.id,target:e.target,angle:e.angle,health:e.health,energy:e.energy}));
 assert.equal(triggerAbility(sim,ray),true);assert.equal(ray.energy,92);assert.equal(ray.cooldown,12);
 assert.equal(ordinary.stun,4,'ordinary fish outside the adventure still receive the pulse');
 assert.deepEqual(cohort.map(e=>({id:e.id,target:e.target,angle:e.angle,health:e.health,energy:e.energy})),before);
 assert.ok(cohort.every(e=>e.stun===0));sim.step(1/60);
 assert.equal(sim.reefStories.lantern.stage,'route');assert.equal(sim.reefStories.lantern.participants.length,2);
 assert.equal(sim.events.some(e=>/neighbors continued their own routines/.test(e.text||'')),false);
 assert.equal(stopStory(sim),true);ray.cooldown=0;ray.stun=0;
 assert.equal(triggerAbility(sim,ray),true);assert.ok(cohort.every(e=>e.stun===4),'released fish return to ordinary defensive interactions');
});

for(const ability of ['shock','sting','sonic','flash','ink','poison','spines','puff'])test(ability+' respects exact local participants while affecting ordinary nearby pursuers',()=>{
 const {sim,ray,cohort,ordinary}=encounter();
 const descriptor={reef:sim.current,x:500,y:360,radius:80,participants:sim.storySafety.participants,holdNeeds:true};
 Object.defineProperty(sim,'storySafety',{value:descriptor,writable:true});
 Object.assign(sim.player,{x:500,y:360,target:ray.id});Object.assign(ray,{x:400,y:360,species:{...ray.species,ability}});
 for(const e of cohort)Object.assign(e,{x:500,y:350,target:ray.id});Object.assign(ordinary,{x:380,y:360,target:ray.id});
 assert.equal(isProtectedActor(sim,ray),false);assert.ok(cohort.every(e=>isProtectedActor(sim,e)));
 assert.equal(triggerAbility(sim,ray),true);assert.ok(ordinary.stun>0);assert.equal(ordinary.target,null);
 assert.equal(sim.player.stun,0);assert.equal(sim.player.target,ray.id);
 assert.ok(cohort.every(e=>e.stun===0&&e.target===ray.id));
});

for(const boundary of ['no active story','trial','challenge','outside area','replacement incarnation'])test('defensive pulses remain active with '+boundary,()=>{
 const {sim,ray,cohort}=encounter();Object.assign(ray,{x:340,y:360});
 if(boundary==='no active story')sim.reefStories.active=null;
 if(boundary==='trial')sim.trial=true;
 if(boundary==='challenge')sim.mode='challenge';
 if(boundary==='outside area'){ray.x=140;for(const e of cohort)Object.assign(e,{x:340,y:360});}
 if(boundary==='replacement incarnation')for(const e of cohort)e.incarnation=(e.incarnation||0)+1;
 assert.ok(cohort.every(e=>!isProtectedActor(sim,e)));assert.equal(triggerAbility(sim,ray),true);
 assert.ok(cohort.every(e=>e.stun===4));
});

test('a protected player still uses its ordinary defense against an outside pursuer',()=>{
 const {sim,ordinary}=encounter();Object.assign(sim.player,{x:550,y:340});Object.assign(ordinary,{x:350,y:340,target:'player'});
 assert.equal(isProtectedActor(sim,sim.player),true);assert.equal(isProtectedActor(sim,ordinary),false);
 assert.equal(sim.useAbility(),true);assert.equal(sim.player.abilityTime,4);assert.equal(sim.player.cooldown,12);
 assert.equal(ordinary.target,null);assert.equal(ordinary.stun,4);
 assert.equal(sim.reefStories.lantern.organShown,false,'the defensive flash remains distinct from the social organ');
});
