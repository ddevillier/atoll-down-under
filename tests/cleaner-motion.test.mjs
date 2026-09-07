import test from 'node:test';import assert from 'node:assert/strict';
import {Simulation,healthState} from '../src/simulation.js';
import {SPECIES,PLAYABLE} from '../src/data.js';
import {cleanerInspection,foregroundCleaner} from '../src/cleaner-motion.js';

function visit(id,cleanerIndex){
 const s=new Simulation(42);s.start('practice',id);const c=s.section.entities.find(e=>e.species.ability==='clean');
 Object.assign(c,{species:SPECIES[cleanerIndex],x:700,y:300,station:{x:700,y:300}});s.section.entities=[c];s.section.food=[];
 Object.assign(s.player,{x:500,y:300,angle:0,facing:1,health:40,biteDamage:15,recoveryDelay:60});s.requestCleaning(c);return {s,c};
}

test('both cleaners reach all three inspection areas during real visits across eligible player species',()=>{
 for(const species of PLAYABLE.filter(e=>e.parasites))for(const cleanerIndex of [43,45]){
  const {s,c}=visit(species.id,cleanerIndex),stages=new Set();let count=0;
  while(!s.events.some(e=>e.type==='clean')&&count++<15*60){s.step(1/60);if(s.player.cleanTime>0){const plan=cleanerInspection(c,s.player);if(plan.gap<6&&c.actionTime>0)stages.add(plan.stage);}}
  assert.equal(s.player.health,85,species.name+' '+c.species.name+' finishes');
  assert.deepEqual(healthState(s.player),{parasites:0,injury:15,poison:0});
  assert.deepEqual([...stages],[0,1,2],species.name+' has a visible contact in each treatment area');
  assert.equal(s.section.entities.length,1);assert.equal(s.events.filter(e=>e.type==='clean').length,1);
 }
});

test('paused and saved inspections preserve progress and cancellation returns the cleaner home',()=>{
 for(const index of [43,45]){
  const {s,c}=visit('s16',index);for(let i=0;i<7*60&&!s.player.cleanTime;i++)s.step(1/60);
  assert.ok(s.player.cleanTime>0);assert.ok(foregroundCleaner(c));
  s.paused=true;const before=s.serialize();s.step(.05);assert.equal(s.serialize(),before);s.paused=false;
  const copy=Simulation.restore(s.serialize());copy.paused=false;
  for(let i=0;i<15;i++){s.step(1/60);copy.step(1/60);}assert.equal(copy.serialize(),s.serialize());
  s.point(1200,500);s.step(.05);assert.equal(c.actionTime,0);assert.equal(foregroundCleaner(c),false);
  for(let i=0;i<4*60;i++)s.step(1/60);assert.ok(Math.hypot(c.x-c.station.x,c.y-c.station.y)<1);assert.equal(c.behavior,'At a cleaning station');
 }
});

test('eligible fish settle at a cleaning dock from diagonal and tight turning approaches',()=>{
 for(const species of PLAYABLE.filter(e=>e.parasites))for(const [dx,dy,angle] of [[150,120,0],[-150,120,Math.PI],[150,-120,Math.PI],[-150,-120,0],[6,25,.53]]){
  const {s}=visit(species.id,43);Object.assign(s.player,{x:735+dx,y:300+dy,angle,facing:Math.cos(angle)<0?-1:1});
  let ticks=0;while(!s.events.some(e=>e.type==='clean')&&ticks++<15*60)s.step(1/60);
  assert.equal(s.player.health,85,species.name+' arrives from '+[dx,dy,angle].join(','));
 }
});
