import test from 'node:test';
import assert from 'node:assert/strict';
import {Simulation,edible,distance,W,H} from '../src/simulation.js';
import {PLAYABLE,FOODS} from '../src/data.js';
const count=(section,food)=>section.food.filter(f=>f.food===food).length;

test('food availability distinguishes open water, seagrass, coral and cave routes',()=>{
 const s=new Simulation(42);s.start('practice','s1');const r=s.sections;
 assert.ok(count(r[2],'plankton')>count(r[8],'plankton'));
 assert.ok(count(r[6],'grass')>=6);assert.equal(count(r[5],'grass'),0);
 assert.equal(count(r[6],'coral'),0);assert.ok(count(r[4],'coral')>=5);
 assert.ok(count(r[8],'sponge')>count(r[6],'sponge'));
 assert.ok(count(r[7],'worm')>count(r[2],'worm'));
});

test('local habitat preferences allow varied neighbors without adding extra hunters',()=>{
 for(const [id,minimum] of [['s1',5],['s53',4]])for(const seed of [7,42,91]){
  const s=new Simulation(seed);s.start('practice',id);
  for(const section of s.sections){
   const initial=section.entities.slice(0,15),foragers=initial.filter(e=>!e.species.diet.includes('fish'));
   assert.ok(new Set(foragers.map(e=>e.species.id)).size>=minimum);
   assert.ok(initial.filter(e=>e.species.diet.includes('fish')).length<=2);
   assert.ok(initial.every(e=>e.species.active===s.period||e.species.active==='both'));
  }
 }
});

test('feeding routes follow the terrace height and the shallow meadow floor',()=>{
 const s=new Simulation(42);s.start('practice','s1');
 const terrace=s.sections[1].food,meadow=s.sections[6].food;
 assert.ok(terrace.filter(f=>f.food!=='plankton'&&f.y<300).length>=6);
 assert.ok(terrace.filter(f=>f.food==='plankton').every(f=>f.x>1250));
 assert.ok(meadow.filter(f=>f.food==='worm'&&f.y<450).length>=3);
});

test('each food patch has a selectable center inside the playable area',()=>{
 const s=new Simulation(42);s.start('practice','s1');const ids=new Set();
 for(let i=0;i<s.sections.length;i++){
  s.current=i;s.section.entities=[];
  for(const f of s.section.food){
   assert.ok(FOODS[f.food]);assert.ok(f.x>40&&f.x<W-40&&f.y>35&&f.y<=H-40);
   assert.equal(ids.has(f.id),false);ids.add(f.id);
   assert.equal(s.findAt(f.x,f.y),f,`independent selection of ${f.food} in section ${i}`);
   for(const other of s.section.food)if(other!==f)assert.ok(distance(f,other)>=50,`overlapping feeding sites in section ${i}`);
  }
 }
});

test('all playable diets have suitable food or prey in their starting habitat',()=>{
 for(const species of PLAYABLE){
  const s=new Simulation(42);s.start('practice',species.id);
  const meals=[...s.section.food,...s.section.entities.filter(e=>e.alive&&!e.species.poison&&e.species.ability!=='clean')];
  assert.ok(meals.some(f=>edible(s.player,f)),species.name+' needs a suitable first meal');
 }
});

test('food grows back at the learned location and saved locations retain their state',()=>{
 const s=new Simulation(42);s.start('practice','s8');s.section.entities=[];
 const f=s.section.food.find(f=>f.food==='algae'),location={x:f.x,y:f.y};
 for(let i=0;i<3;i++){s.player.biteCooldown=0;s.consume(f);}
 assert.ok(f.regrow>0);const saved=Simulation.restore(s.serialize());
 assert.deepEqual(saved.section.food,s.section.food);saved.paused=false;
 for(let i=0;i<9*60;i++)saved.step(1/60);
 const regrown=saved.section.food.find(p=>p.id===f.id);
 assert.equal(regrown.regrow,0);assert.deepEqual({x:regrown.x,y:regrown.y},location);
 // Saves from earlier layouts preserve coordinates and depletion, too.
 const legacy=JSON.parse(s.serialize());legacy.sections[legacy.current].food[0].x=321;
 assert.equal(Simulation.restore(legacy).section.food[0].x,321);
});
