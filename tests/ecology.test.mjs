import test from 'node:test';
import assert from 'node:assert/strict';
import {Simulation} from '../src/simulation.js';
import {SPECIES} from '../src/data.js';
function fixture(){
 const s=new Simulation(12);s.start('practice','s1');s.protected=false;
 const hunter=structuredClone(s.section.entities[0]);Object.assign(hunter,{species:SPECIES[16],x:600,y:300,target:null,think:0,satiated:0,rest:0,pursuit:0,angle:0,stun:0});
 s.player.x=735;s.player.y=300;s.section.entities=[hunter];s.section.food=[];
 return {s,hunter};
}
test('hunters choose nearby suitable food without prioritizing the player',()=>{
 const {s,hunter}=fixture();const prey=structuredClone(s.player);Object.assign(prey,{id:'nearby',x:680,y:300});s.section.entities.push(prey);
 s.stepNpc(hunter,.01);assert.equal(hunter.target,'nearby');
});
test('a satiated hunter cruises without attacking an adjacent small player',()=>{
 const {s,hunter}=fixture();hunter.satiated=30;hunter.x=s.player.x-20;
 for(let i=0;i<600;i++)s.stepNpc(hunter,1/60);
 assert.equal(s.player.health,100);assert.equal(hunter.target,null);
});
test('feeding satisfies a hunter instead of producing repeated bites',()=>{
 const {s,hunter}=fixture();hunter.x=s.player.x-10;s.stepNpc(hunter,.01);
 assert.equal(s.player.health,65);assert.ok(hunter.satiated>=45);assert.equal(hunter.target,null);
 for(let i=0;i<600;i++){hunter.x=s.player.x-10;hunter.y=s.player.y;s.stepNpc(hunter,1/60);}
 assert.equal(s.player.health,65);
});
test('an unsuccessful pursuit ends and is followed by a rest',()=>{
 const {s,hunter}=fixture();hunter.target='player';hunter.pursuit=5.99;hunter.think=0;s.stepNpc(hunter,.02);
 assert.equal(hunter.target,null);assert.ok(hunter.rest>14);assert.equal(hunter.behavior,'Resting between feeding trips');
});
test('grazers actually eat plant food in the same ecosystem',()=>{
 const {s,hunter}=fixture();hunter.species=SPECIES[1];s.section.food=[{id:'plant',kind:'food',food:'algae',name:'Algae',size:25,x:610,y:300,amount:100,regrow:0}];
 s.stepNpc(hunter,.01);assert.ok(s.section.food[0].amount<100);assert.ok(hunter.satiated>0);
});
test('new reef sections have mixed communities rather than mandatory large predators',()=>{
 for(let seed=1;seed<=10;seed++)for(const id of ['s1','s19']){
  const s=new Simulation(seed);s.start('practice',id);
  for(const section of s.sections){assert.ok(section.entities.filter(e=>e.species.diet.includes('fish')).length<=2);assert.ok(section.entities.filter(e=>!e.species.diet.includes('fish')).length>=16);}
 }
});
test('observations preserve behavior, habitat and relationship through saving',()=>{
 const {s,hunter}=fixture();hunter.behavior='Digesting a meal';s.paused=true;s.observe(hunter);s.observe(hunter);
 assert.equal(s.observations.length,1);assert.equal(s.observations[0].behavior,'Digesting a meal');assert.match(s.observations[0].relationship,/potential prey/);
 const loaded=Simulation.restore(s.serialize());assert.deepEqual(loaded.observations,s.observations);
 const old=JSON.parse(s.serialize());delete old.observations;assert.deepEqual(Simulation.restore(old).observations,[]);
});
