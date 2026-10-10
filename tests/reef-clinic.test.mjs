import test from 'node:test';
import assert from 'node:assert/strict';
import {Simulation} from '../src/simulation.js';
import {BY_ID} from '../src/data.js';
import {tickPlayerService,parasiteDamage,cancelPlayerService} from '../src/player-cleaner.js';
import {initStory,tickStory,storyAction,storyNPC,storyView,validStory,storyMeal} from '../src/reef-clinic.js';

function scene(role='s43'){
 const sim=new Simulation(42);sim.start('practice',role);sim.current=role==='s45'?8:4;
 const template=sim.section.entities.find(e=>e.species.parasites&&e.species.speed>0&&!e.groundRoute&&!e.holdfast&&e.species.ability!=='clean');
 const clients=[900,901].map((id,i)=>({...structuredClone(template),id,species:BY_ID.s29,x:1120+i*70,y:350,angle:Math.PI,facing:-1,health:65,biteDamage:10,poisonDamage:5,stun:0,alive:true,target:null,feeding:null,cleanTime:0,rest:0,satiated:60,think:10,incarnation:0,activity:'exploring',behavior:'Exploring'}));
 sim.section.entities=clients;sim.section.food=[];Object.assign(sim.player,{x:700,y:350,energy:50});sim.pointer={x:700,y:350};
 sim.reefStories={version:1,active:'clinic',clinic:null,artist:null,engineer:null,detective:null,nursery:null};
 assert.equal(initStory(sim),true);return {sim,clients};
}
function frame(sim,dt=1/60){
 sim.time+=dt;
 if(sim.player.service)tickPlayerService(sim,dt);
 for(const e of sim.section.entities)storyNPC(sim,e,dt);
 tickStory(sim,dt);
}
function ready(sim,c){
 Object.assign(sim.player,sim.reefStories.clinic.station);sim.pointer={x:sim.player.x,y:sim.player.y};
 assert.equal(storyAction(sim,'clinic-choose',c.id),true);
 if(sim.reefStories.clinic.appointment.temperament==='nervous')assert.equal(storyAction(sim,'clinic-gentle'),true);
 for(let i=0;i<3600&&sim.reefStories.clinic.appointment.phase!=='ready';i++)frame(sim);
 assert.equal(sim.reefStories.clinic.appointment.phase,'ready');
}
function care(sim,c){
 ready(sim,c);assert.equal(storyAction(sim,'clinic-care'),true);
 for(let i=0;i<3600&&sim.reefStories.clinic.appointment;i++)frame(sim);
 assert.equal(sim.reefStories.clinic.appointment,null);
 assert.ok(sim.reefStories.clinic.relationships.some(r=>r.id===c.id&&r.visits===1));
}

test('both clinic roles preserve finite NPCs and award care only after real contact, keeping injuries',()=>{
 for(const role of ['s43','s45']){
  const {sim,clients}=scene(role),ids=clients.map(e=>e.id),c=clients[0];
  ready(sim,c);const before=c.health;
  assert.equal(storyAction(sim,'clinic-care'),true);
  const origin={x:sim.player.x,y:sim.player.y};frame(sim);
  assert.equal(sim.player.service.removed,0);assert.equal(c.health,before);
  assert.ok(Math.hypot(sim.player.x-origin.x,sim.player.y-origin.y)<=sim.player.species.speed/60+.001);
  for(let i=0;i<3600&&sim.reefStories.clinic.appointment;i++)frame(sim);
  assert.equal(sim.reefStories.clinic.relationships[0].visits,1);
  assert.ok(sim.reefStories.clinic.relationships[0].removed>=19);
  assert.equal(c.biteDamage,10);assert.equal(c.poisonDamage,5);assert.ok(parasiteDamage(c)<.02);
  assert.deepEqual(sim.section.entities.map(e=>e.id),ids);assert.equal(sim.reefStories.clinic.completed,false);assert.equal(validStory(sim.reefStories.clinic),true);
 }
});

test('nervous and bold clients have different readable consent and bounded approaches',()=>{
 const {sim,clients}=scene(),bold=clients[1],nervous=clients[0];
 assert.equal(storyAction(sim,'clinic-choose',nervous.id),true);
 assert.equal(sim.reefStories.clinic.appointment.temperament,'nervous');assert.match(storyView(sim).detail,/Nervous/);
 const start={x:nervous.x,y:nervous.y};assert.equal(storyNPC(sim,nervous,1/60),true);
 assert.ok(Math.hypot(nervous.x-start.x,nervous.y-start.y)<=nervous.species.speed*.32/60+.001);
 for(let i=0;i<3600;i++)frame(sim);
 assert.equal(sim.reefStories.clinic.appointment.phase,'approach');assert.equal(storyAction(sim,'clinic-care'),false);
 assert.equal(storyAction(sim,'context'),true);
 for(let i=0;i<1200&&sim.reefStories.clinic.appointment.phase!=='ready';i++)frame(sim);
 assert.equal(sim.reefStories.clinic.appointment.gentle,true);assert.equal(sim.reefStories.clinic.appointment.phase,'ready');
 assert.equal(storyAction(sim,'clinic-cancel'),true);
 assert.equal(storyAction(sim,'clinic-choose',bold.id),true);assert.equal(sim.reefStories.clinic.appointment.temperament,'bold');assert.match(storyView(sim).detail,/Bold/);
});

test('return recognition requires the same cared-for incarnation; welcome yields no fake health or meals',()=>{
 const {sim,clients}=scene();care(sim,clients[0]);care(sim,clients[1]);
 assert.equal(sim.reefStories.clinic.completed,false);
 assert.equal(sim.events.filter(e=>e.value==='reef-clinic').length,0);
 const c=clients[0],health=c.health,energy=sim.player.energy;
 ready(sim,c);assert.equal(sim.reefStories.clinic.appointment.returning,true);
 const beforeWelcome=c.health,beforeEnergy=sim.player.energy;
 assert.equal(storyAction(sim,'clinic-welcome'),true);assert.equal(c.health,beforeWelcome);assert.equal(sim.player.energy,beforeEnergy);
 assert.equal(sim.reefStories.clinic.relationships[0].returned,true);assert.equal(sim.reefStories.clinic.completed,true);
 assert.equal(sim.events.filter(e=>e.value==='reef-clinic').length,1);
 for(let i=0;i<100;i++)frame(sim);assert.equal(sim.events.filter(e=>e.value==='reef-clinic').length,1);
 assert.ok(c.health<=health);assert.ok(sim.player.energy>=energy);
 const other=scene();care(other.sim,other.clients[0]);other.clients[0].incarnation++;
 assert.equal(storyAction(other.sim,'clinic-return',other.clients[0].id),false);
 assert.equal(other.sim.reefStories.clinic.relationships[0].returned,false);
});

test('cancelled, interrupted and idle appointments never award elapsed-time care',()=>{
 for(const interrupt of [sim=>storyAction(sim,'clinic-cancel'),sim=>cancelPlayerService(sim),sim=>{sim.section.entities[0].alive=false;},sim=>{sim.section.entities[0].stun=1;},sim=>{sim.current=1;}]){
  const {sim,clients}=scene();ready(sim,clients[0]);assert.equal(storyAction(sim,'clinic-care'),true);
  for(let i=0;i<900&&!(sim.player.service?.removed>2);i++)frame(sim);
  assert.ok(sim.player.service.removed>2);interrupt(sim);tickStory(sim,1/60);
  assert.equal(sim.reefStories.clinic.appointment,null);assert.equal(sim.reefStories.clinic.relationships.length,0);
  assert.equal(sim.events.filter(e=>e.value==='reef-clinic').length,0);
 }
 const {sim}=scene();const before=structuredClone(sim.reefStories.clinic);tickStory(sim,1e6);assert.deepEqual(sim.reefStories.clinic,before);assert.equal(storyMeal(sim,{food:'shrimp'}),false);
});

test('saved active clinic service resumes deterministic actual care and pauses without progress',()=>{
 const {sim,clients}=scene();ready(sim,clients[0]);storyAction(sim,'clinic-care');
 for(let i=0;i<900&&!(sim.player.service?.removed>2);i++)frame(sim);
 const saved=JSON.parse(sim.serialize());saved.reefStories=structuredClone(sim.reefStories);
 const restored=Simulation.restore(saved);restored.reefStories=structuredClone(saved.reefStories);
 const snapshot=structuredClone(restored.reefStories);tickStory(restored,1);assert.deepEqual(restored.reefStories,snapshot);
 restored.paused=false;
 for(let i=0;i<3600&&sim.reefStories.clinic.appointment;i++){frame(sim);frame(restored);}
 assert.deepEqual(restored.reefStories.clinic,sim.reefStories.clinic);assert.equal(restored.reefStories.clinic.relationships.length,1);
});

test('state validation rejects corrupt identities, service bounds and unsupported completion',()=>{
 assert.equal(validStory(null),true);const {sim}=scene(),s=sim.reefStories.clinic;assert.equal(validStory(s),true);
 for(const corrupt of [x=>{x.station.x=Infinity;},x=>{x.reef=8;},x=>{x.relationships=[{id:1,species:'nope',incarnation:0,temperament:'bold',visits:1,removed:10,returned:false}];},x=>{x.completed=true;},x=>{x.emitted=true;},x=>{x.appointment={id:900,species:'s29',incarnation:0,temperament:'nervous',phase:'care',gentle:false,returning:false,removed:21,startDamage:20,total:20,lastElapsed:1,careStarted:true};}]){
  const invalid=structuredClone(s);corrupt(invalid);assert.equal(validStory(invalid),false);
 }
 const original=sim.section.entities.length;sim.reefStories.active='artist';assert.equal(storyAction(sim,'context'),false);assert.equal(storyNPC(sim,sim.section.entities[0],1),false);assert.equal(sim.section.entities.length,original);
});


test('clinic headline guides actual station distance, gentle invitation and readiness',()=>{
 const {sim,clients}=scene(),nervous=clients[0],station=sim.reefStories.clinic.station;
 assert.equal(storyAction(sim,'clinic-choose',nervous.id),true);
 assert.equal(storyView(sim).step,'Invite a gentle approach');
 assert.match(storyView(sim).detail,new RegExp(nervous.species.name));
 sim.player.x=station.x+101;
 assert.equal(storyView(sim).step,'Return to your station');
 assert.equal(storyAction(sim,'clinic-care'),false);
 sim.player.x=station.x+100;
 assert.equal(storyView(sim).step,'Invite a gentle approach');
 assert.equal(storyAction(sim,'clinic-gentle'),true);
 assert.equal(storyView(sim).step,'Let your visitor approach');
 for(let i=0;i<3600&&sim.reefStories.clinic.appointment.phase!=='ready';i++)frame(sim);
 assert.equal(storyView(sim).step,'Your visitor is ready');
 sim.player.x=station.x+101;
 assert.equal(storyView(sim).step,'Return to your station');
 assert.equal(storyView(sim).actions.some(action=>action.id==='clinic-care'),false);
 sim.player.x=station.x;
 assert.equal(storyAction(sim,'clinic-care'),true);
 assert.equal(storyView(sim).step,'Caring for '+nervous.species.name);
});

test('same-species familiar cardinalfish keep distinct temperament labels',()=>{
 const {sim,clients}=scene('s45'),cardinalfish=Object.values(BY_ID).find(species=>species.name==='Banggai cardinalfish');
 for(const c of clients)c.species=cardinalfish;
 care(sim,clients[0]);care(sim,clients[1]);
 const labels=storyView(sim).actions.filter(action=>action.id==='clinic-return').map(action=>action.label);
 assert.equal(labels.length,2);assert.equal(new Set(labels).size,2);
 assert.ok(labels.some(label=>label==='Banggai cardinalfish · nervous familiar visitor'));
 assert.ok(labels.some(label=>label==='Banggai cardinalfish · bold familiar visitor'));
});

test('matching species and temperament use stable visitor numbers before and after care',()=>{
 const {sim,clients}=scene('s45'),cardinalfish=Object.values(BY_ID).find(species=>species.name==='Banggai cardinalfish');
 for(const c of clients)c.species=cardinalfish;
 clients[1].id=902;
 const labels=()=>new Map(storyView(sim).actions.filter(action=>action.id==='clinic-choose'||action.id==='clinic-return').map(action=>[action.value,action.label]));
 const before=labels();assert.match(before.get(900),/nervous visitor 1/);assert.match(before.get(902),/nervous visitor 2/);
 clients[0].x=1400;clients[1].x=800;
 assert.deepEqual(labels(),before);
 care(sim,clients[1]);care(sim,clients[0]);
 const after=labels();assert.match(after.get(900),/nervous familiar visitor 1/);assert.match(after.get(902),/nervous familiar visitor 2/);
 const restored=Simulation.restore(sim.serialize());restored.reefStories=structuredClone(sim.reefStories);
 assert.deepEqual(storyView(restored).actions,storyView(sim).actions);
});
