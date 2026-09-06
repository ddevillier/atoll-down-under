import test from 'node:test';
import assert from 'node:assert/strict';
import {Simulation,edible} from '../src/simulation.js';
import {SPECIES,PLAYABLE,FOODS,createSpecies} from '../src/data.js';
import {foodWeb} from '../src/learning.js';
const ticks=(s,seconds)=>{for(let i=0;i<seconds*60;i++)s.step(1/60);};

for(const [fish,prey] of [[10,61],[12,46],[22,61],[22,46],[19,46],[14,61]]){
 test(`${SPECIES[fish].name} can approach and eat its listed ${SPECIES[prey].name} meal`,()=>{
  const s=new Simulation(42);s.start('practice','s'+fish);
  const meal=s.section.entities.find(e=>e.species.id==='s'+prey);
  s.section.entities=[meal];s.section.food=[];
  Object.assign(s.player,{x:meal.x-160,y:meal.y,angle:0,energy:40});s.point(s.player.x,s.player.y);
  assert.equal(s.eatAt(meal.x,meal.y),true);ticks(s,4);
  assert.equal(meal.alive,false);assert.ok(s.player.energy>48);
  assert.ok(s.events.some(e=>e.type==='eat'));assert.ok(!s.events.some(e=>e.type==='reject'));
  assert.ok(foodWeb(SPECIES[fish]).prey.some(p=>p.id===meal.species.id));
 });
}

test('every listed playable diet category has at least one usable model food',()=>{
 for(const s of PLAYABLE)for(const tag of s.diet){
  assert.ok(FOODS[tag]||SPECIES.some(p=>p.food===tag&&!p.poison&&edible(s,p)),`${s.name}: ${tag}`);
 }
});

test('shellfish feeding retains diet, large-shell, spiny-prey and armored-fish restrictions',()=>{
 assert.equal(edible(SPECIES[1],SPECIES[46]),false);
 assert.equal(edible(SPECIES[22],{...SPECIES[46],size:85}),false);
 assert.equal(edible({...SPECIES[22],diet:['urchin']},SPECIES[62]),false);
 assert.equal(edible({...SPECIES[22],diet:['fish']},{...SPECIES[23],size:35}),false);
 assert.equal(edible(SPECIES[24],SPECIES[62]),true);
});

test('rejected meals explain whether diet, size or armor prevented feeding',()=>{
 const s=new Simulation(42);s.start('practice','s1');
 const crab=s.section.entities.find(e=>e.species.id==='s46');s.consume(crab);
 assert.match(s.events.at(-1).text,/not part of your diet/);
 s.player.species=SPECIES[31];s.player.biteCooldown=0;
 s.consume({species:SPECIES[34]});assert.match(s.events.at(-1).text,/too large/);
 s.player.species=SPECIES[22];s.player.biteCooldown=0;
 s.consume({...crab,species:{...crab.species,size:85}});assert.match(s.events.at(-1).text,/too well armored/);
 assert.equal(s.events.some(e=>e.type==='eat'),false);
});

test('a non-player small shellfish feeder uses the same rule without eating cleaners',()=>{
 const s=new Simulation(42);s.start('practice','s12');
 const crab=s.section.entities.find(e=>e.species.id==='s46'),cleaner=s.section.entities.find(e=>e.species.ability==='clean');
 const npc=structuredClone(s.player);Object.assign(npc,{id:'forager',x:crab.x-22,y:crab.y,angle:0,satiated:0,think:0});
 s.section.entities=[npc,crab,cleaner];s.section.food=[];ticks(s,1);
 assert.equal(crab.alive,false);assert.equal(cleaner.alive,true);assert.ok(npc.satiated>40);
});

test('crushing jaws are always available without an activation cost or lost arrival protection',()=>{
 for(const species of PLAYABLE.filter(s=>s.ability==='crush')){
  const s=new Simulation(42);s.start('practice',species.id);const before=s.serialize();
  assert.equal(s.useAbility(),false);assert.equal(s.serialize(),before);
  assert.match(s.events.at(-1).text,/always available/i);
 }
});

test('created crushing jaws open suitable food choices while preserving diet type and budget cost',()=>{
 for(const diet of ['grazer','hunter','omnivore']){
  const plain=createSpecies({diet}),jaws=createSpecies({diet,ability:'crush'});
  assert.equal(jaws.cost-plain.cost,150);
  if(diet==='grazer'){
   assert.ok(jaws.diet.includes('coral'));assert.ok(!jaws.diet.includes('crab'));
   assert.equal(edible(jaws,{kind:'food',food:'coral'}),true);
  }else for(const prey of [46,61,62])assert.equal(edible(jaws,SPECIES[prey]),true);
  if(diet==='omnivore')assert.ok(!jaws.diet.includes('fish'));
 }
});

test('old saved crushing jaws gain passive feeding without replacing the dive',()=>{
 const s=new Simulation(42);s.start('create','s1',{name:'Saved shell feeder',diet:'hunter',ability:'crush'});
 const old=JSON.parse(s.serialize());old.player.species.diet=['fish','shrimp','worm'];
 Object.assign(old.player,{energy:47,cooldown:8,abilityTime:2,x:460,y:370});
 old.sections[4].food[0].amount=30;
 const loaded=Simulation.restore(old);
 assert.equal(loaded.paused,true);assert.equal(loaded.player.energy,47);assert.equal(loaded.player.x,460);
 assert.equal(loaded.player.cooldown,0);assert.equal(loaded.player.abilityTime,0);
 assert.ok(loaded.player.species.diet.includes('crab'));assert.equal(loaded.section.food[0].amount,30);
 const again=Simulation.restore(loaded.serialize());assert.equal(again.serialize(),loaded.serialize());
});
