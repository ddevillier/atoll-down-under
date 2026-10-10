import test from 'node:test';import assert from 'node:assert/strict';
import {Simulation} from '../src/simulation.js';import {SPECIES} from '../src/data.js';
import {sitesFor,tickAdventure} from '../src/adventures.js';
import {sharedSandFood,uncoverSand,sandOpportunityHint} from '../src/sand-search.js';
import {feedingApproach} from '../src/feeding-contact.js';
const step=s=>s.step(1/60);
function scene(){const s=new Simulation(42);s.start('practice','s9');s.section.entities=[];s.events=[];return s;}
function position(s,f){const p=feedingApproach(s.player,f);Object.assign(s.player,{x:p.x,y:p.y,angle:p.facing>0?0:Math.PI,facing:p.facing});s.point(p.x,p.y);}
function reveal(s,f){position(s,f);s.useContext();for(let i=0;i<600&&s.player.sandProbe;i++)step(s);assert.ok(f.uncovered>0);}
test('goatfish probes at contact before uncovering real food, and steering safely interrupts',()=>{
 const s=scene(),f=sitesFor(s)[0].food,amount=f.amount,energy=s.player.energy;position(s,f);s.useContext();
 for(let i=0;i<30;i++)step(s);assert.ok(s.player.sandProbe);assert.ok(!(f.uncovered>0));assert.equal(s.player.activity,'probing');
 s.point(700,300);assert.equal(s.player.sandProbe,null);for(let i=0;i<120;i++)step(s);assert.ok(!(f.uncovered>0));
 reveal(s,f);assert.equal(f.amount,amount);assert.ok(s.player.energy<energy);assert.equal(s.adventure.complete,false);
});
test('sand opportunity attracts at most one additional available forager without taking over other priorities',()=>{
 const s=scene(),f=sitesFor(s)[0].food;uncoverSand(s,f,s.player);
 const a={...structuredClone(s.player),id:800,species:SPECIES[10],x:f.x+200,y:f.y,satiated:0,rest:0,target:null,feeding:null};
 const b={...a,id:801};s.section.entities=[a,b];assert.equal(sharedSandFood(s,a),f);a.target=f.id;assert.equal(sharedSandFood(s,b),null);
 a.target=null;for(const field of ['satiated','rest','cleanTime']){b[field]=1;assert.equal(sharedSandFood(s,b),null);b[field]=0;}
 b.feeding={target:f.id};assert.equal(sharedSandFood(s,b),null);b.feeding=null;b.x=f.x+241;assert.equal(sharedSandFood(s,b),null);
 f.uncovered=0;b.x=f.x+200;assert.equal(sharedSandFood(s,b),null);
});
test('sharing discovery requires a real nearby NPC bite and a player meal at a different site',()=>{
 const s=scene(),[first,second]=sitesFor(s).map(x=>x.food);reveal(s,first);s.consume(first);
 reveal(s,second);const e={...structuredClone(s.player),id:800,species:SPECIES[10],energy:100,health:100,biteDamage:0,poisonDamage:0,sandProbe:null,satiated:0,rest:0,target:null,feeding:null,think:0,cleanTime:0,actionTime:0,biteCooldown:0,alive:true};
 const dock=feedingApproach(e,second);Object.assign(e,{x:dock.x,y:dock.y,angle:dock.facing>0?0:Math.PI,facing:dock.facing});s.section.entities=[e];
 const amount=second.amount;assert.equal(s.adventure.shared,undefined);
 for(let i=0;i<300&&!s.adventure.shared;i++)step(s);assert.ok(s.adventure.shared);assert.equal(second.amount,amount-12);tickAdventure(s,.01);assert.equal(s.adventure.complete,true);
 assert.equal(s.section.entities.length,1);assert.equal(s.events.filter(e=>e.type==='discovery').length,1);
});
test('probe checkpoints resume deterministically, reject corrupt progress, and travel cancels the search',()=>{
 const s=scene(),f=sitesFor(s)[0].food;position(s,f);s.useContext();for(let i=0;i<30;i++)step(s);
 const restored=Simulation.restore(s.serialize()),before=restored.serialize();restored.step(5);assert.equal(restored.serialize(),before);restored.paused=false;
 for(let i=0;i<120;i++){step(s);step(restored);}assert.equal(restored.serialize(),s.serialize());
 const bad=JSON.parse(s.serialize());bad.player.sandProbe={reef:4,food:f.id,elapsed:-1};assert.throws(()=>Simulation.restore(bad));
 const source=JSON.parse(s.serialize());source.sections[source.current].food[0].sandSource={unexpected:true};assert.throws(()=>Simulation.restore(source));
 position(s,f);s.useContext();s.transition(1,0);assert.equal(s.player.sandProbe,null);
});

test('a naturally generated neighbor takes a shared discovery without replacing or relocating the community',()=>{
 const s=new Simulation(2);s.start('practice','s9');const count=s.section.entities.length,f=sitesFor(s)[0].food,dock=feedingApproach(s.player,f);s.point(dock.x,dock.y);let next=0;
 for(let i=0;i<60*60&&!s.adventure.shared;i++){
  if(!s.player.sandProbe&&s.time>=next&&Math.hypot(s.player.x-f.x,s.player.y-f.y)<110){s.useContext();next=s.time+7;}
  step(s);
 }
 assert.equal(s.adventure.shared,s.current+':'+f.id);assert.equal(s.section.entities.length,count);assert.equal(s.adventure.complete,false);
});

test('sand feedback distinguishes no nearby appetite, an eligible neighbor and a committed visitor',()=>{
 const s=scene(),f=sitesFor(s)[0].food;assert.match(sandOpportunityHint(s,[f]),/No hungry/);
 const e={...structuredClone(s.player),id:900,species:SPECIES[10],x:f.x+100,y:f.y,satiated:0,rest:0,target:null,cleanTime:0,feeding:null,stun:0,hidden:false};s.section.entities=[e];assert.match(sandOpportunityHint(s,[f]),/may share/);
 e.satiated=10;assert.match(sandOpportunityHint(s,[f]),/No hungry/);e.target=f.id;assert.match(sandOpportunityHint(s,[f]),/is approaching/);
});

test('sand journeys credit player discoveries while NPC discoveries remain edible',()=>{
 for(const species of ['s9','s23']){
  const s=new Simulation(42);s.start('practice',species);s.section.entities=[];
  const foods=sitesFor(s).map(site=>site.food);
  const bite=f=>{position(s,f);s.player.biteCooldown=0;const amount=f.amount;s.eatAt(f.x,f.y);for(let i=0;i<180&&f.amount===amount;i++)step(s);assert.equal(f.amount,amount-35);};
  for(const f of foods){uncoverSand(s,f,{id:900,actionTime:0});bite(f);}
  assert.deepEqual(s.adventure.meals,[],species+' must uncover its own discoveries');
  assert.equal(s.adventure.complete,false);
  for(const f of foods){uncoverSand(s,f,s.player);bite(f);}
  assert.deepEqual(s.adventure.meals,foods.map(f=>s.current+':'+f.id));
  tickAdventure(s,.01);assert.equal(s.adventure.complete,species==='s23');
 }
});
