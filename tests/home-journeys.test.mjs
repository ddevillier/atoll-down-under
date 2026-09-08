import test from 'node:test';import assert from 'node:assert/strict';import {Simulation} from '../src/simulation.js';import {HOME_JOURNEYS,homeJourneySites,homeJourneyMeal,chosenHome,validHomeJourney} from '../src/home-journeys.js';import {exportDive,importDive} from '../src/save-files.js';
import {adventureInstruction} from '../src/adventures.js';
function setup(id='s3'){const s=new Simulation(42);s.start('practice',id);const site=homeJourneySites(s)[0];assert.ok(site,id+' has a site');s.player.x=site.x;s.player.y=site.y;s.point(site.x,site.y);s.useContext();return {s,site};}
function step(s,seconds){for(let i=0;i<seconds*60;i++)s.step(1/60);}
test('home journeys require settling, a real excursion, a suitable meal and a settled return',()=>{
 const {s,site}=setup();const j=s.adventure.homeJourney;
 homeJourneyMeal(s,{kind:'food',food:'shrimp'});assert.equal(j.stage,0);step(s,3);assert.equal(j.stage,1);
 homeJourneyMeal(s,{kind:'food',food:'shrimp'});assert.equal(j.stage,1,'meal at home is not an excursion');
 s.player.x=site.x+150;s.point(s.player.x,site.y);step(s,.1);homeJourneyMeal(s,{kind:'food',food:'algae'});assert.equal(j.stage,1);
 homeJourneyMeal(s,{kind:'food',food:'shrimp'});assert.equal(j.stage,2);step(s,3);assert.equal(s.adventure.complete,false);
 s.player.x=site.x;s.player.y=site.y;s.point(site.x,site.y);step(s,3);assert.equal(s.adventure.complete,true);assert.equal(s.events.filter(e=>e.type==='discovery').length,1);step(s,3);assert.equal(s.events.filter(e=>e.type==='discovery').length,1);
 s.useContext();assert.equal(s.adventure.complete,true,'journal discovery stays earned');assert.equal(s.adventure.homeJourney.stage,0,'E begins a fresh local trip');assert.deepEqual(s.adventure.homeJourney.meals,[]);
});
test('damsel mixed feeding counts the ordered food choices, not repeated bites',()=>{
 const {s,site}=setup('s1');step(s,3);s.player.x=site.x+150;s.point(s.player.x,site.y);step(s,.1);
 homeJourneyMeal(s,{kind:'food',food:'plankton'});assert.deepEqual(s.adventure.homeJourney.meals,[]);
 homeJourneyMeal(s,{kind:'food',food:'algae'});homeJourneyMeal(s,{kind:'food',food:'algae'});assert.deepEqual(s.adventure.homeJourney.meals,['algae']);assert.equal(s.adventure.homeJourney.stage,1);
 homeJourneyMeal(s,{kind:'food',food:'plankton'});assert.equal(s.adventure.homeJourney.stage,2);
});
test('anemone home tracks a living host incarnation, never its replacement',()=>{
 const {s}=setup('s7'),j=s.adventure.homeJourney,host=s.section.entities.find(e=>e.id===j.host);assert.ok(chosenHome(s));host.alive=false;assert.equal(chosenHome(s),null);host.alive=true;host.incarnation=(host.incarnation||0)+1;assert.equal(chosenHome(s),null);
 s.player.x=host.x+45;s.player.y=host.y-25;s.point(s.player.x,s.player.y);s.useContext();assert.equal(s.adventure.homeJourney.incarnation,host.incarnation);assert.equal(s.adventure.homeJourney.stage,0);
});
test('every added home state pauses and replays through portable saves; invalid progress is rejected',()=>{
 for(const id of Object.keys(HOME_JOURNEYS)){const {s}=setup(id);step(s,3);const r=importDive(exportDive(s,'Home')).simulation,before=r.serialize();r.step(1);assert.equal(r.serialize(),before);r.paused=false;const c=Simulation.restore(s.serialize());c.paused=false;step(r,1);step(c,1);assert.equal(r.serialize(),c.serialize(),id);}
 const {s}=setup(),state=JSON.parse(s.serialize());state.adventure.homeJourney.rest=Infinity;assert.equal(validHomeJourney(state.adventure.homeJourney),false);assert.throws(()=>Simulation.restore(JSON.stringify(state)),/adventure/);
});
test('home guidance follows real stage and travel; replay retains recognition without stale completed guidance',()=>{
 const {s,site}=setup('s3');assert.match(adventureInstruction(s),/Settle/);step(s,3);assert.match(adventureInstruction(s),/Leave/);s.player.x=site.x+150;s.point(s.player.x,site.y);step(s,.1);assert.match(adventureInstruction(s),/Find shrimp/);
 homeJourneyMeal(s,{kind:'food',food:'shrimp'});assert.match(adventureInstruction(s),/Return/);const reef=s.current;s.transition(1,0);assert.equal(s.adventure.homeJourney.reef,reef);assert.match(adventureInstruction(s),/is in/);step(s,3);assert.equal(s.adventure.complete,false);s.transition(-1,0);
 s.player.x=site.x;s.player.y=site.y;s.point(site.x,site.y);step(s,3);assert.match(adventureInstruction(s),/Discovered/);s.useContext();assert.match(adventureInstruction(s),/Settle/);assert.equal(s.adventure.complete,true);
});
