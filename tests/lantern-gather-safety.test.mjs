import test from 'node:test';
import assert from 'node:assert/strict';
import {Simulation} from '../src/simulation.js';
import {beginStory,storyAction} from '../src/reef-stories.js';
import {isProtectedActor} from '../src/adventure-safety.js';

function guided(){const sim=new Simulation(4);sim.start('practice','s53',null,{adventureKey:'lantern'});assert.equal(beginStory(sim,'lantern'),true);return sim;}
function dose(sim,seconds){for(let i=0;i<seconds*20;i++)sim.step(.05);assert.equal(sim.phase,'playing');}

test('abandoning generated lantern gathering releases empty courtesy after actual invitation expiry',()=>{
 const sim=guided(),ids=sim.section.entities.map(e=>e.id);
 sim.useAbility();sim.point(1400,650);dose(sim,20);
 assert.ok(Math.hypot(sim.player.x-800,sim.player.y-360)>430);
 const before=sim.storySafety;assert.ok(before.participants.length>=2,'finite live invitations still have their existing fish');
 for(const ref of before.participants){const e=sim.section.entities.find(e=>e.id===ref.id);assert.ok(isProtectedActor(sim,e));}
 dose(sim,45);assert.equal(sim.reefStories.lantern.stage,'gather');assert.equal(sim.reefStories.lantern.participants.length,0);
 assert.ok(sim.section.entities.every(e=>!e.adventureReservation||e.adventureReservation.remaining===0));
 for(let i=0;i<1100;i++){sim.step(.05);assert.equal(sim.storySafety,null,'empty, distant gathering must not own an ecological region');}
 assert.deepEqual(sim.section.entities.map(e=>e.id),ids,'no actor is removed to release the encounter');
 assert.equal(sim.reefStories.lantern.complete,false);
});

test('local return re-derives gathering courtesy without renewing expired invitations or moving fish',()=>{
 const sim=guided();sim.point(1400,650);dose(sim,70);assert.equal(sim.storySafety,null);
 sim.point(610,360);for(let i=0;i<1600&&Math.hypot(sim.player.x-610,sim.player.y-360)>20;i++)sim.step(.05);
 assert.ok(Math.hypot(sim.player.x-610,sim.player.y-360)<20,'player physically swims back');
 const before=sim.serialize(),zone=sim.storySafety;assert.ok(zone);assert.equal(zone.participants.length,0);
 assert.equal(isProtectedActor(sim,sim.player),true);assert.equal(sim.serialize(),before,'courtesy query does not replenish or teleport actors');
});

test('paused imports preserve invitation identities while expired distant imports remain unprotected',()=>{
 const initial=guided();initial.paused=true;const held=Simulation.restore(initial.serialize());
 assert.deepEqual(held.storySafety.participants,initial.storySafety.participants);assert.ok(held.storySafety.participants.length>=2);
 const distant=guided();distant.point(1400,650);dose(distant,70);distant.paused=true;
 const restored=Simulation.restore(distant.serialize()),before=restored.serialize();
 assert.equal(restored.storySafety,null);restored.step(.05);assert.equal(restored.serialize(),before);
 restored.paused=false;restored.current=7;assert.equal(restored.storySafety,null);
});

test('an enrolled actual route retains local participant courtesy after gathering reservations are claimed',()=>{
 const sim=guided();assert.equal(storyAction(sim,'lantern-upper'),true);assert.equal(storyAction(sim,'lantern-show'),true);dose(sim,1);
 assert.equal(sim.reefStories.lantern.stage,'route');assert.equal(sim.storySafety.holdNeeds,true);
 const refs=sim.reefStories.lantern.participants.map(({id,incarnation})=>({id,incarnation}));assert.ok(refs.length>=2);
 for(const ref of refs){const e=sim.section.entities.find(e=>e.id===ref.id);assert.equal(e.adventureReservation,undefined);assert.ok(isProtectedActor(sim,e));}
 const before=sim.serialize();assert.ok(sim.storySafety);assert.equal(sim.serialize(),before);
});
