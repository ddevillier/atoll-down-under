import test from 'node:test';
import assert from 'node:assert/strict';
import {Simulation} from '../src/simulation.js';
import {SPECIES,REEFS} from '../src/data.js';
import {beginStory,storyAction,stopStory} from '../src/reef-stories.js';
import {reserveAdventureParticipants,admissionFor,initialAdventureSite,adventureParticipantReserved} from '../src/adventure-admission.js';

const fish=(id,species='s1',extra={})=>({id,species:SPECIES[Number(species.slice(1))],x:250,y:420,alive:true,health:83,energy:100,satiated:50,target:null,...extra});
const initial=(species,reef,foragers=5)=>{
 const entities=Array.from({length:foragers+2},(_,i)=>fish(i+1,i===foragers?'s39':'s1'));
 const sim={player:fish('player',species),period:species==='s8'?'day':'night',sections:[],random(){throw new Error('Reservation must not consume RNG');}};
 return {sim,entities,population:{foragers,hunters:1,companions:1},reef:REEFS[reef]};
};

test('guided entry changes only the initial player habitat while retaining population identities and RNG',()=>{
 for(const [id,key]of [['s8','lookout'],['s52','lookout'],['s12','shade'],['s53','lantern'],['s54','walker']]){
  const ordinary=new Simulation(19),guided=new Simulation(19);ordinary.start('practice',id);guided.start('practice',id,null,{adventureKey:key});
  const site=initialAdventureSite(key);assert.equal(guided.current,site.reef);assert.deepEqual(guided.pointer,{x:site.x,y:site.y});assert.equal(guided.seed,ordinary.seed);
  assert.deepEqual(guided.sections.map(s=>s.entities.map(e=>e.id)),ordinary.sections.map(s=>s.entities.map(e=>e.id)));
  assert.ok(admissionFor(guided,key).available);
  if(key==='lantern')assert.ok(admissionFor(guided,key).participants.every(r=>{const e=guided.section.entities.find(e=>e.id===r.id);return Math.hypot(e.x-800,e.y-360)>94;}));
 }
});

test('an initial lookout invitation prevents incidental feeding and pairing, then expires through normal active ticks',()=>{
 const sim=new Simulation(9);sim.start('practice','s8',null,{adventureKey:'lookout'});
 const buddy=sim.section.entities.find(e=>e.adventureReservation);assert.ok(buddy);const appetite=buddy.satiated,health=buddy.health;
 for(let i=0;i<60;i++)sim.step(.05);
 assert.ok(adventureParticipantReserved(sim,buddy));assert.equal(buddy.target,null);assert.equal(buddy.ecology?.partner,null);assert.ok(buddy.satiated<=appetite);assert.ok(buddy.health<=health);
 const raw=sim.serialize(),restored=Simulation.restore(raw),saved=restored.section.entities.find(e=>e.id===buddy.id);
 assert.deepEqual(saved.adventureReservation,buddy.adventureReservation);const remaining=saved.adventureReservation.remaining;restored.step(.05);assert.equal(saved.adventureReservation.remaining,remaining);
 // The invitation has a finite deadline even if the player never starts it.
 buddy.adventureReservation.remaining=.05;sim.step(.05);assert.equal(buddy.adventureReservation,undefined);
});

test('a guided lantern cohort stays eligible during route reading and hands off only to actual story movement',()=>{
 const ordinary=new Simulation(42);ordinary.start('practice','s53');assert.ok(ordinary.sections.flatMap(s=>s.entities).every(e=>!e.adventureReservation));
 const sim=new Simulation(42);sim.start('practice','s53',null,{adventureKey:'lantern'});assert.equal(beginStory(sim,'lantern'),true);
 const cohort=sim.section.entities.filter(e=>e.adventureReservation?.key==='lantern'),initial=cohort.map(e=>({id:e.id,health:e.health,satiated:e.satiated}));assert.ok(cohort.length>=2&&cohort.length<=3);
 for(let i=0;i<400;i++)sim.step(.05);
 assert.equal(sim.reefStories.lantern.stage,'gather');assert.ok(cohort.every(e=>adventureParticipantReserved(sim,e)&&e.alive&&!e.target&&!e.feeding&&!e.ecology?.partner&&e.activity!=='avoiding'));
 assert.ok(cohort.every((e,i)=>e.health<=initial[i].health&&e.satiated===Math.max(0,initial[i].satiated-20)));
 assert.equal(sim.storySafety.holdNeeds,false);assert.equal(sim.storySafety.participants.length,cohort.length);
 const restored=Simulation.restore(sim.serialize());assert.deepEqual(restored.section.entities.filter(e=>e.adventureReservation?.key==='lantern').map(e=>e.adventureReservation),cohort.map(e=>e.adventureReservation));
 assert.equal(storyAction(sim,'lantern-upper'),true);assert.equal(sim.reefStories.lantern.stage,'route');assert.ok(cohort.every(e=>e.adventureReservation));
 sim.step(.05);assert.ok(sim.reefStories.lantern.participants.every(ref=>!sim.section.entities.find(e=>e.id===ref.id).adventureReservation));
 assert.equal(stopStory(restored),true);assert.ok(restored.section.entities.every(e=>!e.adventureReservation));
});

test('an explicit ordinary browsing invitation releases the initial lookout opportunity for the legacy journey',()=>{
 const sim=new Simulation(9);sim.start('practice','s8',null,{adventureKey:'lookout'});
 const reserved=sim.section.entities.find(e=>e.adventureReservation),ids=sim.section.entities.map(e=>e.id);
 assert.equal(sim.reefStories.active,null);assert.equal(sim.useContext(),true);assert.equal(sim.adventure.buddy.id,reserved.id);assert.equal(reserved.ecology.partner,sim.player.id);
 sim.step(.05);assert.equal(reserved.adventureReservation,undefined);assert.equal(reserved.ecology.partner,sim.player.id);assert.deepEqual(sim.section.entities.map(e=>e.id),ids);
});

test('initial reservation uses the existing count, identity, and RNG draws, preserving established bonds',()=>{
 const {sim,entities,population,reef}=initial('s8',0);
 entities[0].ecology={partner:entities[1].id};entities[1].ecology={partner:entities[0].id};
 const pair=structuredClone(entities.slice(0,2)),ids=entities.map(e=>e.id),length=entities.length;
 const refs=reserveAdventureParticipants(sim,reef,entities,population,SPECIES.filter(s=>s.active==='day'||s.active==='both'));
 assert.equal(refs.length,1);assert.equal(entities.length,length);assert.deepEqual(entities.map(e=>e.id),ids);
 assert.deepEqual(entities.slice(0,2),pair);
 const chosen=entities.find(e=>e.id===refs[0].id);assert.equal(chosen.species.id,'s8');assert.ok(chosen.satiated<=4);assert.ok(chosen.health>=85);assert.equal(chosen.ecology?.partner,undefined);
 sim.sections=[{entities}];const saved=structuredClone(entities);
 assert.deepEqual(reserveAdventureParticipants(sim,reef,entities,population,SPECIES),[]);assert.deepEqual(entities,saved);
});

test('night initialization reserves squirrelfish and 2–3 flashlight actors without using hunters or residents',()=>{
 for(const [species,minimum] of [['s12',1],['s53',2]]){
  const {sim,entities,population,reef}=initial(species,8,1),hunter=structuredClone(entities[1]);
  entities.push(fish(40,'s46',{groundRoute:0}));const resident=structuredClone(entities.at(-1));
  const refs=reserveAdventureParticipants(sim,reef,entities,population,SPECIES.filter(s=>s.active==='night'||s.active==='both'));
  assert.ok(refs.length>=minimum&&refs.length<=3);assert.deepEqual(entities[1],hunter);assert.deepEqual(entities.at(-1),resident);
  assert.ok(refs.every(r=>r.species===species));
 }
});

test('admission refuses unavailable old dives with a finite explanation and never resets physiology or steals a bond',()=>{
 const s=new Simulation(9);s.start('practice','s8');
 for(const section of s.sections)for(const e of section.entities)if(e.species.id==='s8')e.ecology={reef:0,clock:0,point:0,wait:0,partner:'occupied',host:null};
 const snapshot=JSON.stringify(s.sections),result=admissionFor(s,'lookout');
 assert.equal(result.available,false);assert.equal(result.needsFreshDive,true);assert.match(result.reason,/paired|no eligible/i);assert.equal(JSON.stringify(s.sections),snapshot);
});

test('legacy save import retains every living animal, bond, and appetite instead of provisioning an encounter',()=>{
 const original=new Simulation(26);original.start('practice','s8');
 const raw=JSON.parse(original.serialize());delete raw.reefStories;
 for(const section of raw.sections)for(const e of section.entities)if(e.species.id==='s8'){e.satiated=52;e.ecology={reef:0,clock:0,point:0,wait:0,partner:'existing-bond',host:null};}
 const before=JSON.stringify(raw.sections.map(s=>s.entities)),restored=Simulation.restore(raw);
 assert.equal(JSON.stringify(restored.sections.map(s=>s.entities)),before);
 admissionFor(restored,'lookout');assert.equal(JSON.stringify(restored.sections.map(s=>s.entities)),before);
});

test('representative generated browser starts contain a hungry healthy singleton and a reachable real grazing patch',()=>{
 for(const [species,seeds] of [['s8',[9,11,26,28,33]],['s52',[1]]])for(const seed of seeds){
  const s=new Simulation(seed);s.start('practice',species);const before=JSON.stringify(s.sections),admission=admissionFor(s,'lookout');
  assert.equal(admission.available,true,`${species}, seed ${seed}: ${admission.reason}`);assert.equal(admission.reef,0);
  const ref=admission.participants[0],e=s.sections[0].entities.find(e=>e.id===ref.id);
  assert.equal(e.ecology?.partner??null,null);assert.ok(e.satiated<=4);assert.ok(e.health>=85);assert.ok(s.sections[0].food.some(f=>f.id===admission.food&&f.food==='algae'&&f.amount>0));
  assert.equal(JSON.stringify(s.sections),before);
 }
});

test('generated night starts admit existing flashlight cohorts and squirrelfish neighbors',()=>{
 for(const [species,key,count] of [['s12','shade',1],['s53','lantern',2]])for(const seed of [1,9,26,33]){
  const s=new Simulation(seed);s.start('practice',species);const result=admissionFor(s,key);
  assert.equal(result.available,true,`${species}, seed ${seed}: ${result.reason}`);assert.equal(result.reef,8);assert.ok(result.participants.length>=count&&result.participants.length<=3);
 }
});

test('lantern admission finds the real compact cohort despite an interleaved distant fish',()=>{
 for(const seed of [536,815]){
  const sim=new Simulation(seed);sim.start('practice','s53',null,{adventureKey:'lantern'});
  const before=JSON.stringify(sim.sections),result=admissionFor(sim,'lantern');
  const reserved=sim.section.entities.filter(e=>e.adventureReservation?.key==='lantern');
  assert.equal(reserved.length,3);assert.equal(result.available,true,`seed ${seed}: ${result.reason}`);
  assert.ok(result.participants.length>=2&&result.participants.length<=3);
  assert.ok(result.participants.every(ref=>reserved.some(e=>e.id===ref.id&&(e.incarnation||0)===ref.incarnation)));
  assert.equal(JSON.stringify(sim.sections),before,'admission must not move, spawn, or modify an actor');
  assert.equal(beginStory(sim,'lantern'),true);assert.equal(sim.reefStories.active,'lantern');
 }
});

test('lantern admission still refuses a dispersed population with no pair within sight-group distance',()=>{
 const sim=new Simulation(536);sim.start('practice','s53',null,{adventureKey:'lantern'});
 const fish=sim.section.entities.filter(e=>e.species.id==='s53');
 fish.forEach((e,i)=>{e.x=[50,1550,50,1550][i];e.y=i<2?50:700;});
 const before=JSON.stringify(sim.sections),result=admissionFor(sim,'lantern');
 assert.equal(result.available,false);assert.equal(JSON.stringify(sim.sections),before);
});

test('admission rejects digestive waiting and depleted/committed food rather than manufacturing meals',()=>{
 const s=new Simulation(11);s.start('practice','s8');
 for(const e of s.sections[0].entities)if(e.species.id==='s8')e.satiated=65;
 const before=JSON.stringify(s.sections);const result=admissionFor(s,'lookout');assert.equal(result.available,false);assert.match(result.reason,/digesting/);assert.equal(JSON.stringify(s.sections),before);
 for(const e of s.sections[0].entities)if(e.species.id==='s8')e.satiated=0;
 for(const f of s.sections[0].food)if(['algae','grass'].includes(f.food))f.amount=0;
 assert.equal(admissionFor(s,'lookout').available,false);
});
