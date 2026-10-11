import test from 'node:test';
import assert from 'node:assert/strict';
import {Simulation} from '../src/simulation.js';
import {SPECIES} from '../src/data.js';
import {riskStatus,validRiskCue} from '../src/risk-cues.js';
import {safetyZone,isProtectedActor,canPredate,storyNeedsHeld,steerAroundAdventure,releaseAdventureSafety,syncAdventureSafety} from '../src/adventure-safety.js';

function encounter(){
 const sim=new Simulation(9);sim.start('practice','s8');sim.current=0;sim.reefStories.active='lookout';sim.protected=false;
 sim.player.x=240;sim.player.y=370;
 const buddy=sim.section.entities.find(e=>!e.species.diet.includes('fish')&&e.species.playable);
 buddy.species=SPECIES[8];buddy.x=280;buddy.y=420;
 const predator=sim.section.entities.find(e=>e.species.diet.includes('fish'));predator.x=210;predator.y=370;
 const descriptor={reef:0,x:240,y:390,radius:220,participants:[{id:buddy.id,incarnation:buddy.incarnation||0,species:'s8'}],holdNeeds:true};
 return {sim,buddy,predator,descriptor};
}

test('real simulation ticks preserve held needs, prevent pursuit/contact bites, and decrement finite NPC release grace',()=>{
 const {sim,buddy,predator,descriptor}=encounter();
 Object.defineProperty(sim,'storySafety',{value:descriptor,writable:true});
 sim.player.health=77;sim.player.energy=72;buddy.health=84;buddy.energy=73;buddy.satiated=3;buddy.rest=2;
 predator.target=buddy.id;predator.satiated=0;predator.think=0;
 const before={health:buddy.health,energy:buddy.energy,satiated:buddy.satiated,rest:buddy.rest,playerHealth:sim.player.health,playerEnergy:sim.player.energy};
 for(let i=0;i<20;i++)sim.step(.05);
 assert.deepEqual({health:buddy.health,energy:buddy.energy,satiated:buddy.satiated,rest:buddy.rest,playerHealth:sim.player.health,playerEnergy:sim.player.energy},before);
 assert.ok(buddy.alive);assert.notEqual(predator.target,buddy.id);assert.notEqual(predator.target,'player');assert.equal(sim.storyProtected(buddy),true);
 releaseAdventureSafety(sim,descriptor);sim.storySafety=null;sim.reefStories.active=null;
 const released=buddy.hurtGrace;sim.step(.05);assert.ok(buddy.hurtGrace<released&&buddy.hurtGrace>0);assert.equal(sim.storyProtected(buddy),false);
});

test('peaceful protection is derived from current reef, exact living participant identity and bounded local area',()=>{
 const {sim,buddy,predator,descriptor}=encounter();
 assert.ok(safetyZone(sim,descriptor));assert.equal(isProtectedActor(sim,sim.player,descriptor),true);assert.equal(isProtectedActor(sim,buddy,descriptor),true);
 assert.equal(canPredate(sim,predator,sim.player,descriptor),false);assert.equal(canPredate(sim,predator,buddy,descriptor),false);
 buddy.incarnation=(buddy.incarnation||0)+1;assert.equal(isProtectedActor(sim,buddy,descriptor),false);
 buddy.incarnation=0;buddy.species=SPECIES[52];assert.equal(isProtectedActor(sim,buddy,descriptor),false);
 sim.player.x=1000;assert.equal(isProtectedActor(sim,sim.player,descriptor),false);
 const prey={...buddy,x:1250,y:400};predator.x=1200;assert.equal(canPredate(sim,predator,prey,descriptor),true);
 sim.current=4;assert.equal(safetyZone(sim,descriptor),null);sim.current=0;sim.reefStories.active=null;assert.equal(safetyZone(sim,descriptor),null);
});

test('held-pose needs leave hunger and injury values untouched and release when the actor swims away',()=>{
 const {sim,buddy,descriptor}=encounter(),before=JSON.stringify([sim.player.energy,sim.player.health,buddy.health,buddy.satiated]);
 assert.equal(storyNeedsHeld(sim,sim.player,descriptor),true);assert.equal(storyNeedsHeld(sim,buddy,descriptor),true);
 assert.equal(JSON.stringify([sim.player.energy,sim.player.health,buddy.health,buddy.satiated]),before);
 descriptor.holdNeeds=[descriptor.participants[0]];assert.equal(storyNeedsHeld(sim,sim.player,descriptor),false);assert.equal(storyNeedsHeld(sim,buddy,descriptor),true);
 buddy.x=1200;assert.equal(storyNeedsHeld(sim,buddy,descriptor),false);
});

test('a local hunter physically inspects the occupied area while outside hunters and real food targets keep ordinary routines',()=>{
 const {sim,buddy,predator,descriptor}=encounter();predator.target=buddy.id;
 const before={x:predator.x,y:predator.y};assert.equal(steerAroundAdventure(sim,predator,.1,40,descriptor),true);assert.equal(predator.target,null);assert.notDeepEqual({x:predator.x,y:predator.y},before);
 assert.match(predator.behavior,/occupied adventure/);assert.equal(predator.health>0,true);
 predator.target=sim.section.food[0].id;assert.equal(steerAroundAdventure(sim,predator,.1,40,descriptor),false);assert.equal(predator.target,sim.section.food[0].id);
 predator.target=null;predator.x=1400;const outside=structuredClone(predator);assert.equal(steerAroundAdventure(sim,predator,.1,40,descriptor),false);assert.deepEqual(predator,outside);
});

test('cancellation grants finite existing exit grace to released exact actors without replenishing needs',()=>{
 const {sim,buddy,predator,descriptor}=encounter();sim.player.health=57;sim.player.energy=61;buddy.health=76;buddy.satiated=19;
 assert.equal(releaseAdventureSafety(sim,descriptor),true);sim.reefStories.active=null;
 assert.equal(sim.protected,false);assert.equal(sim.player.hurtGrace,4);assert.equal(buddy.hurtGrace,4);assert.deepEqual([sim.player.health,sim.player.energy,buddy.health,buddy.satiated],[57,61,76,19]);
 assert.equal(validRiskCue(sim.riskCue),true);assert.equal(riskStatus(sim),'Free exploration · Swim when you are ready');
 assert.equal(sim.riskCue.until,sim.time+sim.player.hurtGrace,'the benign exit cue expires before another bite can land');
 assert.equal(isProtectedActor(sim,buddy,descriptor),false);assert.equal(canPredate(sim,predator,buddy,descriptor),false);
 buddy.hurtGrace=0;assert.equal(canPredate(sim,predator,buddy,descriptor),true);
});

test('invalid zone descriptors and non-Practice starts cannot create whole-world protection',()=>{
 const {sim,descriptor}=encounter();assert.equal(safetyZone(sim,{...descriptor,radius:1600}),null);
 sim.mode='challenge';assert.equal(safetyZone(sim,descriptor),null);sim.mode='practice';sim.trial=true;assert.equal(safetyZone(sim,descriptor),null);
});

test('crossing the local area releases protection with finite grace and does not protect a replacement incarnation',()=>{
 const {sim,buddy,descriptor}=encounter();syncAdventureSafety(sim,descriptor);buddy.x=1200;syncAdventureSafety(sim,descriptor);
 assert.equal(isProtectedActor(sim,buddy,descriptor),false);assert.equal(buddy.hurtGrace,4);
 buddy.hurtGrace=0;buddy.x=280;syncAdventureSafety(sim,descriptor);buddy.incarnation=1;syncAdventureSafety(sim,descriptor);assert.equal(buddy.hurtGrace,0);
});
