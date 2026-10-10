import test from 'node:test';
import assert from 'node:assert/strict';
import {Simulation} from '../src/simulation.js';
import {PATROL_JOURNEYS,validPatrolJourney,tickPatrolJourney,patrolSites} from '../src/patrol-journeys.js';
import {exportDive,importDive} from '../src/save-files.js';
function setup(id){const s=new Simulation(42);s.start('practice',id);s.player.x=350;s.player.y=PATROL_JOURNEYS[id].y;s.useContext();return s;}
test('patrol meal stage validation uses the selected species and accepts every genuine prefix',()=>{
 for(const [id,d] of Object.entries(PATROL_JOURNEYS)){
  const s=setup(id),j=s.adventure.patrolJourney;
  assert.equal(validPatrolJourney(j,s.player),true);
  for(let n=0;n<d.foods.length;n++){j.stage=1;j.meals=d.foods.slice(0,n);assert.equal(validPatrolJourney(j,s.player),true,id);}
  j.meals=[...d.foods];assert.equal(validPatrolJourney(j,s.player),false,id);
  j.stage=2;assert.equal(validPatrolJourney(j,s.player),true,id);
  j.meals=[];assert.equal(validPatrolJourney(j,s.player),false,id);
  j.stage=0;j.meals=['fish'];assert.equal(validPatrolJourney(j,s.player),false,id);
 }
 const s=setup('s55');s.adventure.patrolJourney.stage=1;s.adventure.patrolJourney.meals=['fish'];assert.equal(validPatrolJourney(s.adventure.patrolJourney,s.player),false);
});
test('import rejects an exhausted patrol meal goal for every patrol species',()=>{
 for(const [id,d] of Object.entries(PATROL_JOURNEYS)){
  const file=JSON.parse(exportDive(setup(id),'Patrol'));
  Object.assign(file.state.adventure.patrolJourney,{stage:1,meals:[...d.foods]});
  assert.throws(()=>importDive(JSON.stringify(file)),/damaged|incompatible/,id);
 }
});
test('off-layer and pursuit interruptions require a new continuous survey, surviving save/load',()=>{
 for(const interrupt of ['layer','pursuit']){
  const s=setup('s18'),j=s.adventure.patrolJourney;
  s.player.x=500;tickPatrolJourney(s,.05);
  if(interrupt==='layer')s.player.y=500;else s.player.target=s.section.entities[0].id;
  s.player.x=750;tickPatrolJourney(s,.05);
  const r=importDive(exportDive(s,'Interrupted patrol')).simulation;r.paused=false;
  r.player.target=null;r.player.y=105;tickPatrolJourney(r,.05);
  assert.equal(r.adventure.patrolJourney.stage,0,interrupt);
  const site=patrolSites(r)[0];assert.ok(Math.abs(site.x-r.player.x)>=360);
  r.player.x=1110;tickPatrolJourney(r,.05);assert.equal(r.adventure.patrolJourney.stage,1,interrupt);
 }
});
test('travel interrupts a survey even when the player returns before another tick',()=>{
 const s=setup('s18');s.transition(1,0);s.transition(-1,0);tickPatrolJourney(s,.05);
 assert.equal(s.adventure.patrolJourney.stage,0);
});
test('E-guided patrols finish surveying after a natural turn leaves the lane',()=>{
 for(const id of Object.keys(PATROL_JOURNEYS)){
  const s=new Simulation(42);s.start('practice',id);const site=patrolSites(s)[1];s.point(site.x,site.y);
  for(let i=0;i<1800&&Math.hypot(s.player.x-site.x,s.player.y-site.y)>=70;i++)s.step(1/60);
  assert.ok(Math.hypot(s.player.x-site.x,s.player.y-site.y)<70,id);
  s.useContext();
  for(let i=0;i<1800&&s.adventure.patrolJourney.stage===0;i++)s.step(1/60);
  assert.equal(s.adventure.patrolJourney.stage,1,id);
 }
});
test('restarting an interrupted survey preserves a manually chosen destination',()=>{
 const s=setup('s18');s.point(1400,400);s.player.y=500;tickPatrolJourney(s,.05);
 s.player.x=750;s.player.y=105;tickPatrolJourney(s,.05);
 assert.deepEqual(s.pointer,{x:1400,y:400});assert.equal(s.adventure.patrolJourney.stage,0);
});
