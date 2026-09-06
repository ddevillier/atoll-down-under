import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Simulation} from '../src/simulation.js';
import {PLAYABLE} from '../src/data.js';
import {exportDive,importDive,diveFilename,MAX_SAVE_BYTES} from '../src/save-files.js';

test('portable dives retain every species, world, RNG and progression state',()=>{
 for(const species of PLAYABLE){
  const s=new Simulation(71);s.start('practice',species.id);s.protected=false;
  for(let i=0;i<100;i++)s.step(.05);
  s.destination=(s.current+1)%9;
  const restored=importDive(exportDive(s,'Zoë’s reef 🐠'));
  assert.equal(restored.name,'Zoë’s reef 🐠');assert.equal(restored.simulation.paused,true);
  assert.equal(restored.simulation.serialize(),s.serialize());
  assert.equal(restored.simulation.random(),s.random());
  restored.simulation.paused=false;restored.simulation.step(.05);
  assert.ok(Number.isFinite(restored.simulation.player.health));
 }
 for(const mode of ['challenge','tournament'])for(const phase of ['playing','advance','dead','won']){
  const s=new Simulation(7);s.start(mode);s.phase=phase;s.score=12000;s.stageScore=4000;
  assert.equal(importDive(exportDive(s,'Journey')).simulation.serialize(),s.serialize());
 }
});

test('created fish and older health fields remain importable',()=>{
 const s=new Simulation(9);s.start('create','custom',{name:'Shell eater',size:75,speed:140,endurance:150,agility:150,ability:'crush',active:'night',diet:'omnivore',color:'#60bba5'});
 const file=JSON.parse(exportDive(s,'Custom dive'));
 delete file.state.player.poisonDamage;delete file.state.player.biteDamage;delete file.state.player.recoveryDelay;
 const restored=importDive(JSON.stringify(file)).simulation;
 assert.equal(restored.player.species.name,'Shell eater');assert.ok(restored.player.species.diet.includes('urchin'));
 restored.paused=false;restored.step(.05);assert.ok(Number.isFinite(restored.player.health));
});

test('malformed worlds and unsupported files are rejected before a simulation is installed',()=>{
 const s=new Simulation();s.start();const raw=exportDive(s,'Original');
 const mutations=[f=>f.version=2,f=>f.state.step='broken',f=>f.state.sections[0].entities=null,f=>f.state.player.species.ability='missing',f=>f.state.player.species.speed=null,f=>f.state.sections[0].food[0].food='missing',f=>f.state.sequence=['missing'],f=>f.state.stage=999,f=>f.state.pointer.x=null,f=>f.state.phase='idle',f=>f.state.player.constructor={},f=>f.state.sections[0].entities[0].station={x:null,y:4}];
 for(const mutate of mutations){const f=JSON.parse(raw);mutate(f);assert.throws(()=>importDive(JSON.stringify(f)));}
 assert.throws(()=>importDive('{'));
 assert.throws(()=>importDive(' '.repeat(MAX_SAVE_BYTES+1)),/too large/);
 assert.equal(s.serialize(),JSON.stringify(JSON.parse(raw).state));
});

test('dive filenames are Windows-safe while keeping readable names',()=>{
 assert.equal(diveFilename('  Zoë’s reef  '),'Zoë’s reef.atoll');
 assert.equal(diveFilename('CON'),'Dive CON.atoll');assert.equal(diveFilename('a/b:c?'),'a-b-c-.atoll');
 assert.equal(diveFilename(''),'My reef dive.atoll');
});
