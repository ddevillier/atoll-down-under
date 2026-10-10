import test from 'node:test';
import assert from 'node:assert/strict';
import {Simulation,distance} from '../src/simulation.js';
import {SPECIES} from '../src/data.js';
import {feedingApproach} from '../src/feeding-contact.js';
import {schoolMeal,startNpcSchoolWave,tickNpcSchoolWave,sharedSchoolFood,SCHOOL_WAVE_SECONDS} from '../src/school-activity.js';
import {exportDive,importDive} from '../src/save-files.js';
import {requestPlayerService} from '../src/player-cleaner.js';
import {animalProfile} from '../src/animal-profiles.js';

function scene(species=SPECIES[42]){
 const s=new Simulation(42);s.start('practice','s1');s.current=1;s.player.x=1450;s.player.y=650;s.point(1450,650);s.difficulty=0;
 const food={id:'wave-plankton',kind:'food',food:'plankton',name:'Plankton',size:24,x:800,y:300,amount:100,regrow:0,phase:0};
 s.section.food=[food];
 const group=Array.from({length:5},(_,i)=>({...structuredClone(s.player),id:900+i,incarnation:0,species,x:590-i*9,y:280+i*12,angle:0,facing:1,health:100,satiated:0,rest:0,target:null,feeding:null,cleanTime:0,stun:0,think:100,behavior:'Swimming with a school',activity:'schooling'}));
 const leader=group[0];Object.assign(leader,feedingApproach(leader,food));leader.target=food.id;s.section.entities=group;
 return {s,food,leader,group};
}
function commit({s,leader,food}){
 for(let i=0;i<60&&!s.section.schoolWave;i++)s.stepNpc(leader,1/60);
 assert.equal(food.amount,88,'one ordinary NPC meal subtracts its real amount');
 assert.ok(leader.feeding?.committed);assert.ok(s.section.schoolWave);
 return s.section.schoolWave;
}
const ticks=(s,seconds)=>{for(let i=0;i<seconds*60;i++)s.step(1/60);};

test('every schooling plankton feeder can initiate the real-meal response with its own contact mechanics',()=>{
 const species=SPECIES.filter(s=>animalProfile(s).social==='school'&&s.diet.includes('plankton'));
 assert.equal(species.length,5);
 for(const fish of species){
  const f=scene(fish),wave=commit(f);assert.equal(wave.species,fish.id);
  ticks(f.s,12);assert.equal(f.food.amount,64,fish.name+' and two neighbors take exactly one actual meal each');
  assert.equal(f.s.section.schoolWave,null);assert.equal(f.s.adventure.complete,false);
 }
});

test('an actual NPC plankton meal recruits at most two hungry schoolmates without player journey credit',()=>{
 const fixture=scene(),{s,food,leader,group}=fixture,seed=s.seed,population=s.section.entities.length;
 assert.equal(startNpcSchoolWave(s,leader,food),false,'a target or an uncommitted reach is not a meal');
 assert.equal(s.section.schoolWave,null);assert.equal(food.amount,100);
 const wave=commit(fixture);
 assert.equal(wave.followers.length,2);assert.ok(wave.followers.every(m=>m.id!==leader.id));
 assert.ok(wave.followers.every(m=>distance(group.find(e=>e.id===m.id),food)>165),'followers notice a meal beyond their ordinary search radius');
 const selected=wave.followers.map(m=>group.find(e=>e.id===m.id));
 for(const e of selected){assert.equal(e.satiated,0);assert.equal(e.target,null);assert.equal(sharedSchoolFood(s,e),food);}
 assert.equal(s.adventure.school,undefined);assert.equal(s.adventure.complete,false);assert.equal(s.score,0);assert.equal(s.section.entities.length,population);
 assert.notEqual(s.seed,seed,'ordinary meal digestion retains its existing RNG draw');
 const consumed=new Set([leader.id]);let largestParty=0;
 for(let i=0;i<12*60;i++){
  s.step(1/60);largestParty=Math.max(largestParty,group.filter(e=>e.target===food.id).length);
  for(const e of group)if(e.feeding?.committed)consumed.add(e.id);
 }
 assert.equal(consumed.size,3,'one leader and two invited followers actually feed');assert.equal(food.amount,64);
 assert.ok(largestParty<=2);assert.equal(s.section.schoolWave,null);assert.equal(s.section.entities.length,population);
 assert.equal(s.events.filter(e=>['discovery','progress'].includes(e.type)).length,0);
 ticks(s,8);assert.ok(selected.every(e=>e.activity==='schooling'),'fed followers rejoin through ordinary movement');
});

test('NPC waves do not replace or complete an existing player trip',()=>{
 const fixture=scene(),{s,food}=fixture;s.player.species=SPECIES[42];s.adventure.school={reef:s.current,patch:'another-plankton-patch',neighborMeal:false,joined:0};
 // Even a matching player species receives no progress for another patch.
 const trip=structuredClone(s.adventure.school);commit(fixture);assert.deepEqual(s.adventure.school,trip);
 const wave=structuredClone(s.section.schoolWave);schoolMeal(s,s.player,food);assert.deepEqual(s.section.schoolWave,wave);
});

test('only an available patch and eligible idle neighbors can receive an NPC invitation',()=>{
 for(const field of ['satiated','rest','stun','cleanTime','hidden','target','feeding','service']){
  const {s,food,leader,group}=scene();leader.feeding={target:food.id,committed:true};
  for(const e of group.slice(1))e[field]=['hidden'].includes(field)?true:field==='target'?'other':['feeding','service'].includes(field)?{}:1;
  assert.equal(startNpcSchoolWave(s,leader,food),false,field);assert.equal(s.section.schoolWave,null);assert.equal(food.amount,100);
 }
 const {s,food,leader}=scene();leader.feeding={target:food.id,committed:true};food.regrow=8;
 assert.equal(startNpcSchoolWave(s,leader,food),false);food.regrow=0;food.amount=0;assert.equal(startNpcSchoolWave(s,leader,food),false);
});

test('food loss, danger, origin death, incarnation replacement, travel, player death and expiry cancel invitations',()=>{
 const changes=[
  f=>{f.food.regrow=8;},f=>{f.s.section.food=[];},f=>{f.leader.alive=false;},f=>{f.leader.incarnation++;},
  f=>{const prey=f.group[1];f.s.section.entities.push({...structuredClone(prey),id:999,species:SPECIES[16],x:prey.x+30,y:prey.y,satiated:0,target:prey.id});},
  f=>{f.s.transition(1,0);},f=>{f.s.die('Test interruption');},f=>{tickNpcSchoolWave(f.s,SCHOOL_WAVE_SECONDS);}
 ];
 for(const change of changes){
  const f=scene(),section=f.s.section,wave=commit(f),member=f.group.find(e=>e.id===wave.followers[0].id);member.target=f.food.id;member.feeding={target:f.food.id,committed:false};
  const amount=f.food.amount;change(f);if(f.s.section===section)tickNpcSchoolWave(f.s,0);
  assert.equal(section.schoolWave,null);assert.equal(member.target,null);assert.equal(member.feeding,null);assert.equal(f.food.amount,amount);
 }
});

test('service interrupts an invitation and danger interrupts a free swimmer before treatment or feeding',()=>{
 const f=scene(),wave=commit(f),client=f.group.find(e=>e.id===wave.followers[0].id);
 f.s.player.species=SPECIES[43];client.health=70;assert.equal(requestPlayerService(f.s,client),true);tickNpcSchoolWave(f.s,0);
 assert.ok(!f.s.section.schoolWave?.followers.some(m=>m.id===client.id));assert.equal(sharedSchoolFood(f.s,client),null);
 const hunter={...structuredClone(client),id:999,species:SPECIES[16],x:client.x+60,y:client.y,satiated:0,target:client.id};
 f.s.section.entities.push(hunter);client.health=40;client.target=f.food.id;client.feeding={target:f.food.id,committed:false};
 f.s.stepNpc(client,1/60);assert.equal(client.activity,'avoiding');assert.equal(client.target,null);assert.equal(client.feeding,null);assert.equal(client.cleanTime,0);assert.equal(f.s.player.service,null,'active danger releases the real service reservation');
 client.satiated=1;client.rest=1;const health=client.health;f.s.stepNpc(client,.05);
 assert.equal(client.satiated,.95);assert.equal(client.rest,.95);assert.ok(Math.abs(client.health-(health-.045*.05))<1e-9,'escape does not freeze natural timers');
});

test('live NPC wave saves resume deterministically, old saves initialize inactive, and damaged references reject before use',()=>{
 const f=scene();commit(f);ticks(f.s,.5);
 const saved=f.s.serialize(),restored=importDive(exportDive(f.s,'School feeding')).simulation;
 assert.deepEqual(restored.section.schoolWave,f.s.section.schoolWave);restored.step(10);assert.equal(restored.serialize(),saved,'pause freezes invitation and movement');
 restored.paused=false;ticks(f.s,5);ticks(restored,5);assert.equal(restored.serialize(),f.s.serialize());
 const old=JSON.parse(saved);for(const section of old.sections)delete section.schoolWave;
 assert.ok(Simulation.restore(old).sections.every(section=>section.schoolWave===null));
 for(const mutate of [w=>{w.elapsed=11;},w=>{w.elapsed=-1;},w=>{w.followers.push({...w.followers[0]});},w=>{w.followers[0].incarnation++;},w=>{w.origin.id='player';},w=>{w.patch='missing';},w=>{w.species='s1';}]){
  const bad=JSON.parse(saved);mutate(bad.sections[bad.current].schoolWave);assert.throws(()=>Simulation.restore(bad),/school activity/);
  const file=JSON.parse(exportDive(Simulation.restore(saved),'Bad reference'));file.state=bad;assert.throws(()=>importDive(JSON.stringify(file)));
 }
});
