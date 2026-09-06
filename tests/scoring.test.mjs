import test from 'node:test';
import assert from 'node:assert/strict';
import {Simulation} from '../src/simulation.js';
import {BY_ID} from '../src/data.js';

function fixture(mode){
 const s=new Simulation(42);s.start(mode,'s1');s.player.species=BY_ID.s1;
 s.section.entities=[];s.score=9000;s.stageScore=4999;s.protected=false;
 return s;
}
const sponge=s=>s.section.food.find(f=>f.food==='sponge');

test('poison delays advancement consistently in Challenge and Tournament, including after saving',()=>{
 for(const mode of ['challenge','tournament']){
  const s=fixture(mode);s.consume(sponge(s));
  assert.equal(s.score,8500);assert.equal(s.stageScore,4499);
  assert.equal(s.events.at(-1).pointsLost,500);assert.equal(s.events.at(-1).progressLost,500);
  for(let i=0;i<4;i++)s.step(.05);assert.equal(s.phase,'playing');
  const resumed=Simulation.restore(s.serialize());resumed.paused=false;
  assert.equal(resumed.stageScore,s.stageScore);assert.equal(resumed.score,s.score);
  resumed.player.biteCooldown=0;
  resumed.consume(resumed.section.food.find(f=>f.food==='algae'));
  resumed.step(.01);assert.equal(resumed.phase,'advance');
 }
});

test('penalties floor total and current-life progress separately and report actual loss',()=>{
 const s=fixture('tournament');s.score=300;s.stageScore=70;s.consume(sponge(s));
 assert.equal(s.score,0);assert.equal(s.stageScore,0);
 assert.equal(s.events.at(-1).pointsLost,300);assert.equal(s.events.at(-1).progressLost,70);
 assert.match(s.events.at(-1).text,/Lost 300 points/);
 s.player.biteCooldown=0;s.consume(sponge(s));assert.equal(s.score,0);assert.equal(s.stageScore,0);
 assert.equal(s.events.at(-1).pointsLost,0);assert.doesNotMatch(s.events.at(-1).text,/Lost/);
});

test('Practice stays unscored, Create-a-Fish receives the penalty and specialist sponge meals stay valid',()=>{
 const practice=fixture('practice');practice.score=0;practice.stageScore=0;practice.consume(sponge(practice));
 assert.equal(practice.score,0);assert.equal(practice.stageScore,0);assert.equal(practice.events.at(-1).pointsLost,0);
 const created=fixture('create');created.consume(sponge(created));assert.equal(created.score,8500);assert.equal(created.stageScore,4499);
 const specialist=fixture('tournament');specialist.player.species=BY_ID.s4;specialist.consume(sponge(specialist));
 assert.equal(specialist.score,9500);assert.equal(specialist.stageScore,5499);assert.equal(specialist.player.health,100);
});
