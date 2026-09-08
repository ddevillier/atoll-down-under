import test from 'node:test';import assert from 'node:assert/strict';
import {Simulation} from '../src/simulation.js';import {tickAdventure,sitesFor} from '../src/adventures.js';
import {disturbPatch,recoverPatch,grazingRecovered,patchCrowdingCost} from '../src/grazing-activity.js';
const ticks=(s,n)=>{for(let i=0;i<n*60;i++)s.step(1/60);};
function scene(id='s5'){const s=new Simulation(42);s.start('practice',id);s.section.entities=[];s.events=[];return s;}
test('partly grazed plants recover only after a quiet interval, with no growth on animal food or coral',()=>{
 for(const kind of ['algae','grass','coral','shrimp']){const f={kind:'food',food:kind,amount:40,regrow:0};disturbPatch(f);recoverPatch(f,7);assert.equal(f.amount,40);recoverPatch(f,2);assert.equal(f.amount,['algae','grass'].includes(kind)?42:40);recoverPatch(f,100);assert.equal(f.amount,['algae','grass'].includes(kind)?100:40);}
 const depleted={kind:'food',food:'algae',amount:100,regrow:8};disturbPatch(depleted);recoverPatch(depleted,20);assert.equal(depleted.amount,100);assert.equal(depleted.regrow,8);
});
test('grazing route needs another actual meal and a return to observed recovery, not elapsed time alone',()=>{
 for(const id of ['s5','s15']){const s=scene(id),[a,b]=s.section.food.filter(f=>f.food==='algae');s.consume(a);assert.equal(a.amount,65);assert.equal(sitesFor(s)[0].id,a.id);ticks(s,30);assert.equal(s.adventure.complete,false);
  s.player.biteCooldown=0;s.consume(b);s.point(a.x+200,a.y);ticks(s,1);assert.equal(s.adventure.complete,false);assert.equal(grazingRecovered(s),true);
  Object.assign(s.player,{x:a.x,y:a.y,still:1});s.point(a.x,a.y);tickAdventure(s,.1);assert.equal(s.adventure.complete,true);assert.equal(s.events.filter(e=>e.type==='discovery').length,1);
 }
});
test('a second bite restarts recovery and saves preserve the actual resource clock and grazing route',()=>{
 const s=scene(),f=s.section.food.find(f=>f.food==='algae');s.consume(f);ticks(s,10);assert.ok(f.amount>65);s.player.biteCooldown=0;s.consume(f);const amount=f.amount;ticks(s,7);assert.equal(f.amount,amount);
 const restored=Simulation.restore(s.serialize()),before=restored.serialize();restored.step(50);assert.equal(restored.serialize(),before);restored.paused=false;ticks(s,5);ticks(restored,5);assert.equal(restored.serialize(),s.serialize());
 const bad=JSON.parse(s.serialize());bad.adventure.grazing.after=101;assert.throws(()=>Simulation.restore(bad));bad.adventure.grazing.after=65;bad.sections[s.current].food[0].patchRest=-1;assert.throws(()=>Simulation.restore(bad));
});
test('low plant food affects nearby foraging choice without penalizing coral or prey',()=>{
 assert.equal(patchCrowdingCost({kind:'food',food:'algae',amount:20}),100);assert.equal(patchCrowdingCost({kind:'food',food:'algae',amount:65}),0);assert.equal(patchCrowdingCost({kind:'food',food:'coral',amount:20}),0);assert.equal(patchCrowdingCost({species:{},amount:20}),0);
});

test('a hungry NPC chooses a fuller nearby patch over a closer heavily grazed one',()=>{
 const s=scene(),[a,b]=s.section.food.filter(f=>f.food==='algae');s.section.food=[a,b];Object.assign(a,{x:860,y:300,amount:20});Object.assign(b,{x:920,y:300,amount:100});
 const e={...structuredClone(s.player),id:900,x:800,y:300,health:100,satiated:0,rest:0,think:0,target:null,feeding:null};s.section.entities=[e];s.stepNpc(e,.01);assert.equal(e.target,b.id);assert.equal(a.amount,20);assert.equal(b.amount,100);
});
