import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Simulation} from '../src/simulation.js';
import {exportDive,importDive} from '../src/save-files.js';

function terminal(){const s=new Simulation(25);s.start('challenge');s.score=4200;s.die('Your energy ran out. Look for food that suits your fish.');s.recorded=true;return s;}

test('terminal cause and submitted-score marker survive local and portable checkpoints',()=>{
 const s=terminal();
 for(const restored of [Simulation.restore(s.serialize()),importDive(exportDive(s,'Ended challenge')).simulation]){
  assert.equal(restored.phase,'dead');assert.equal(restored.deathReason,s.deathReason);assert.equal(restored.recorded,true);assert.equal(restored.score,4200);
 }
});

test('direct legacy restore defaults terminal metadata without losing phase',()=>{
 const saved=JSON.parse(terminal().serialize());delete saved.recorded;delete saved.deathReason;
 const restored=Simulation.restore(saved);assert.equal(restored.phase,'dead');assert.equal(restored.recorded,false);assert.equal(restored.deathReason,null);
});

test('direct restore rejects malformed terminal metadata',()=>{
 const raw=terminal().serialize();
 for(const [key,values] of [['recorded',[null,1,'true']],['deathReason',[false,{},'x'.repeat(501)]]])for(const value of values){const saved=JSON.parse(raw);saved[key]=value;assert.throws(()=>Simulation.restore(saved));}
});

test('death owns its cause immediately and retry resets only attempt metadata and score',()=>{
 const s=terminal();assert.match(s.deathReason,/energy ran out/);
 s.stage=2;s.time=37;s.adventure.visible=true;const species=s.player.species.id;
 s.continueRun();assert.equal(s.recorded,false);assert.equal(s.deathReason,null);assert.equal(s.phase,'playing');assert.equal(s.score,0);assert.equal(s.stageScore,0);assert.equal(s.stage,2);assert.equal(s.time,37);assert.equal(s.player.species.id,species);assert.equal(s.adventure.visible,false);
 s.die('Another attempt');s.recorded=true;s.start('practice','s1');assert.equal(s.recorded,false);assert.equal(s.deathReason,null);assert.equal(s.stage,0);assert.equal(s.time,0);
});

test('actual Challenge advances and repeated retries preserve unique visited habitats',()=>{
 const s=new Simulation(25);s.start('challenge');
 for(let i=0;i<3;i++){
  s.section.entities=[];s.stageScore=s.required;s.step(1/60);assert.equal(s.phase,'advance');s.next();assert.equal(s.visited.length,new Set(s.visited).size);
 }
 const visited=[...s.visited];
 for(let i=0;i<12;i++){s.die('retry fixture');s.continueRun();assert.deepEqual(s.visited,visited);}
 s.section.entities=[];s.stageScore=s.required;s.step(1/60);assert.equal(s.phase,'won');assert.ok(s.visited.length<=9);
});
