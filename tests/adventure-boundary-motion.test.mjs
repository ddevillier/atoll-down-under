import test from 'node:test';
import assert from 'node:assert/strict';
import {Simulation} from '../src/simulation.js';
import {beginStory} from '../src/reef-stories.js';
import {steerAroundAdventure,isProtectedActor} from '../src/adventure-safety.js';

test('the existing seed 4 ray clears the clipped lantern circle without an edge trap',()=>{
 const sim=new Simulation(4);sim.start('practice','s53',null,{adventureKey:'lantern'});beginStory(sim,'lantern');sim.useAbility();sim.point(610,360);
 const ray=sim.section.entities.find(e=>e.species.id==='s37'),id=ray.id,health=ray.health;
 let escaped=false,firstEscape=null,courtesy=0;
 for(let i=0;i<2400;i++){
  sim.step(.05);if(ray.behavior==='Swimming around the occupied adventure')courtesy++;
  const zone=sim.storySafety;
  if(zone&&Math.hypot(ray.x-zone.x,ray.y-zone.y)>zone.radius+Math.max(35,ray.species.size*.35)){escaped=true;firstEscape??=sim.time;}
  assert.equal(ray.id,id);assert.ok(Number.isFinite(ray.x)&&Number.isFinite(ray.y));assert.ok(ray.x>=10&&ray.x<=1590&&ray.y>=25&&ray.y<=720);
 }
 assert.ok(courtesy>0,'the generated encounter actually invokes courtesy');assert.ok(escaped,'the hunter must leave the local circle through available water');assert.ok(firstEscape<40,'ordinary ecology must resume without an extended edge stall');
 assert.ok(ray.alive);assert.ok(ray.health<=health,'courtesy must not replenish health');assert.equal(isProtectedActor(sim,ray),false);
});

for(const radius of [220,430,480])for(const [name,zoneX,zoneY,x,y] of [
 ['top',800,360,496,25],['bottom',800,380,496,720],
 ['left',220,360,10,300],['right',1380,360,1590,300],
 ['top left',120,120,10,25],['top right',1480,120,1590,25],
 ['bottom left',120,620,10,720],['bottom right',1480,620,1590,720],
])test(`courtesy finds a bounded continuous exit at ${name}, radius ${radius}`,()=>{
 const sim=new Simulation(4);sim.start('practice','s53',null,{adventureKey:'lantern'});beginStory(sim,'lantern');
 const actor=sim.section.entities.find(e=>e.species.id==='s37');Object.assign(actor,{x,y,angle:Math.atan2(y-zoneY,x-zoneX),target:null});
 const zone={reef:8,x:zoneX,y:zoneY,radius,participants:[],holdNeeds:false};Object.defineProperty(sim,'storySafety',{value:zone});
 const identity=actor.id,energy=actor.energy,health=actor.health,speed=actor.species.speed*.35,margin=Math.max(35,actor.species.size*.35);
 let escaped=false,handled=0,travel=0;
 for(let i=0;i<2400;i++){
  const prior={x:actor.x,y:actor.y,angle:actor.angle};const moving=steerAroundAdventure(sim,actor,.05,speed);if(!moving){escaped=true;break;}handled++;
  const step=Math.hypot(actor.x-prior.x,actor.y-prior.y);travel+=step;assert.ok(step<=speed*.05+1e-8,'no teleport or speed increase');
  const turn=Math.abs(Math.atan2(Math.sin(actor.angle-prior.angle),Math.cos(actor.angle-prior.angle)));assert.ok(turn<=(actor.species.agility||2)*.05+1e-8,'ordinary turning limit retained');
  assert.ok(actor.x>=10&&actor.x<=1590&&actor.y>=25&&actor.y<=720);assert.equal(actor.id,identity);assert.equal(actor.energy,energy);assert.equal(actor.health,health);
 }
 assert.ok(escaped,'the clipped circle must have a physical exit');if(handled)assert.ok(travel>10,'courtesy must produce visible travel');
 assert.ok(Math.hypot(actor.x-zone.x,actor.y-zone.y)>zone.radius+margin);
 const food=sim.section.food[0];actor.x=zone.x;actor.y=zone.y;actor.target=food.id;assert.equal(steerAroundAdventure(sim,actor,.05,speed),false);assert.equal(actor.target,food.id,'ordinary food remains higher priority');
});
