import test from 'node:test';
import assert from 'node:assert/strict';
import {Simulation} from '../src/simulation.js';
import {COMMUNITIES,chooseForager} from '../src/communities.js';
import {BY_ID,REEFS} from '../src/data.js';

test('community preferences name eligible non-hunters in the matching period',()=>{
 assert.equal(COMMUNITIES.length,REEFS.length);
 for(const community of COMMUNITIES)for(const period of ['day','night']){
  assert.ok(community[period].length);
  for(const index of community[period]){
   const s=BY_ID['s'+index];
   assert.ok(s.playable&&s.size<130&&!s.diet.includes('fish'));
   assert.ok(s.active===period||s.active==='both');
  }
 }
 // Removed/inactive preferences never re-enter an already filtered pool.
 assert.equal(chooseForager([BY_ID.s9],REEFS[4],'day',.99),BY_ID.s9);
});

test('Practice communities produce distinct daytime encounters and preserve nighttime eligibility',()=>{
 const counts=REEFS.map(()=>({}));
 for(let seed=1;seed<=200;seed++)for(const id of ['s1','s19']){
  const sim=new Simulation(seed);sim.start('practice',id);
  for(const [i,section] of sim.sections.entries())for(const e of section.entities){
   assert.ok(e.species.active===sim.period||e.species.active==='both');
   if(id==='s1'&&e.species.playable&&!e.species.diet.includes('fish'))
    counts[i][e.species.id]=(counts[i][e.species.id]||0)+1;
  }
 }
 const share=(reef,ids)=>ids.reduce((sum,id)=>sum+(counts[reef][id]||0),0)/Object.values(counts[reef]).reduce((a,b)=>a+b,0);
 // Compare encounter proportions, so a busier reef alone cannot pass.
 assert.ok(share(1,['s2','s6','s30'])>share(2,['s2','s6','s30'])*2);
 assert.ok(share(4,['s4','s15','s48'])>share(3,['s4','s15','s48'])*2);
 assert.ok(share(6,['s8','s52'])>share(7,['s8','s52'])*2);
 assert.ok(share(8,['s2','s3'])>share(7,['s2','s3'])*2);
});
