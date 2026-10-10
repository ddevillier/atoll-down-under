import test from 'node:test';
import assert from 'node:assert/strict';
import {Simulation,healthState} from '../src/simulation.js';
import {SPECIES} from '../src/data.js';
import {mimicBite} from '../src/ability-rules.js';
import {canHelp} from '../src/player-cleaner.js';

function scene(){
 const s=new Simulation(42);s.start('practice','s1');
 const cleaner=s.section.entities.find(e=>e.species.ability==='clean');
 Object.assign(cleaner,{x:700,y:300,station:{x:700,y:300}});
 const client={...structuredClone(s.player),id:'audit05-client',species:SPECIES[1],x:735,y:300,health:64,satiated:60,rest:0,think:0};
 s.section.entities=[cleaner,client];s.section.food=[];
 Object.assign(s.player,{x:1400,y:100});s.pointer={x:1400,y:100};
 return {s,cleaner,client};
}

test('audit05 NPC station removes parasites after a mimic bite without healing the wound or masking later parasites',()=>{
 const {s,client}=scene();
 mimicBite(s,{...structuredClone(s.player),id:'audit05-mimic'},client);
 assert.deepEqual(healthState(client),{poison:0,injury:6,parasites:36});
 for(let frame=0;frame<100&&client.behavior!=='Leaving the cleaning station';frame++)s.step(.05);
 assert.equal(client.behavior,'Leaving the cleaning station');
 assert.equal(client.health,94);
 assert.deepEqual(healthState(client),{poison:0,injury:6,parasites:0});
 assert.equal(client.recoveryDelay,10,'NPC station must not invent injury recovery');
 for(let frame=0;frame<500;frame++)s.stepNpc(client,.05);
 assert.ok(healthState(client).parasites>1);
 assert.equal(canHelp(client),true,'new parasite damage remains available to player cleaners');
});

test('audit05 wounds alone do not reserve an NPC cleaning queue or restart completed treatment',()=>{
 const {s,cleaner,client}=scene();
 Object.assign(client,{health:60,biteDamage:40});
 assert.equal(s.cleaningPlan().destinations.has(client.id),false);
 s.stepNpc(client,.05);
 assert.notEqual(client.target,cleaner.id);
 assert.equal(client.cleanTime,0);
 const waiting={...structuredClone(client),id:'audit05-parasites',health:60,biteDamage:0,x:900};
 s.section.entities.push(waiting);
 assert.equal(s.cleaningPlan().client,waiting,'wounded neighbor must not block a parasite-bearing visitor');
});
