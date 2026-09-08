import test from 'node:test';import assert from 'node:assert/strict';import {Simulation} from '../src/simulation.js';
import {schoolMeal,sharedSchoolFood,tickSchoolTrip,schoolNeighbors} from '../src/school-activity.js';import {tickAdventure} from '../src/adventures.js';
function scene(id='s0'){const s=new Simulation(42);s.start('practice',id);s.section.entities=[1,2,3].map((id,i)=>({...structuredClone(s.player),id:900+id,x:s.player.x+50+i*30,y:s.player.y,alive:true,hidden:false,target:null,feeding:null,activity:'schooling',satiated:0,rest:0,cleanTime:0,stun:0}));const f=s.section.food.find(f=>f.food==='plankton');f.x=s.player.x+160;f.y=s.player.y;return {s,f};}
test('school activity requires the player meal, a real neighbor meal and regrouping instead of waiting alone',()=>{
 for(const id of ['s0','s11','s58']){const {s,f}=scene(id);schoolMeal(s,s.player,f);tickAdventure(s,5);assert.equal(s.adventure.complete,false);
  schoolMeal(s,s.section.entities[0],f);s.section.entities.forEach(e=>e.target=f.id);tickAdventure(s,5);assert.equal(s.adventure.complete,false);
  s.section.entities.forEach(e=>e.target=null);tickAdventure(s,2);assert.equal(s.adventure.complete,false);tickAdventure(s,1);assert.equal(s.adventure.complete,true);
 }
});
test('local school feeding invitations respect appetite, availability and the existing two-fish limit',()=>{
 const {s,f}=scene();schoolMeal(s,s.player,f);const [a,b,c]=s.section.entities;assert.equal(sharedSchoolFood(s,a),f);a.target=f.id;b.target=f.id;assert.equal(sharedSchoolFood(s,c),null);a.target=null;b.target=null;
 for(const key of ['satiated','rest','cleanTime']){c[key]=1;assert.equal(sharedSchoolFood(s,c),null);c[key]=0;}f.regrow=8;assert.equal(sharedSchoolFood(s,c),null);
});
test('a solo meal cannot claim a group trip and saved school progress rejects corrupt state',()=>{
 const {s,f}=scene();s.section.entities.length=1;schoolMeal(s,s.player,f);assert.equal(s.adventure.school,undefined);
 const good=scene();schoolMeal(good.s,good.s.player,good.f);const restored=Simulation.restore(good.s.serialize());assert.deepEqual(restored.adventure.school,good.s.adventure.school);const paused=restored.serialize();restored.step(10);assert.equal(restored.serialize(),paused);
 const bad=JSON.parse(good.s.serialize());bad.adventure.school.joined=-1;assert.throws(()=>Simulation.restore(bad));good.s.transition(1,0);assert.equal(tickSchoolTrip(good.s,5),false);
});

test('generated schools complete feeding trips through real meals, movement and regrouping',()=>{
 for(const id of ['s0','s11','s58']){
  const s=new Simulation(42);s.start('practice',id);const count=s.section.entities.length;
  for(let i=0;i<120*60&&!s.adventure.complete&&s.phase==='playing';i++){
   if(i%30===0){const p=s.player,group=s.section.entities.filter(e=>e.alive&&e.species.id===id),trip=s.adventure.school;
    if(group.length&&(trip?.neighborMeal||!trip&&!p.target&&schoolNeighbors(s).length<2))s.point(group.reduce((n,e)=>n+e.x,0)/group.length,group.reduce((n,e)=>n+e.y,0)/group.length);
    else if(trip){const f=s.section.food.find(f=>f.id===trip.patch);s.point(f.x,f.y);}
    else if(!p.target){const f=s.section.food.filter(f=>f.food==='plankton'&&f.regrow<=0).sort((a,b)=>group.filter(e=>Math.hypot(e.x-b.x,e.y-b.y)<240).length-group.filter(e=>Math.hypot(e.x-a.x,e.y-a.y)<240).length||Math.hypot(p.x-a.x,p.y-a.y)-Math.hypot(p.x-b.x,p.y-b.y))[0];if(f)s.eatAt(f.x,f.y);}
   }s.step(1/60);
  }
  assert.equal(s.adventure.complete,true,id);assert.equal(s.section.entities.length,count);assert.equal(s.events.filter(e=>e.type==='discovery').length,1);assert.ok(s.events.some(e=>e.type==='eat'));
 }
});
