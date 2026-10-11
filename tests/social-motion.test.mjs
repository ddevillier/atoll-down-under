import test from 'node:test';import assert from 'node:assert/strict';
import {Simulation,distance} from '../src/simulation.js';import {SPECIES} from '../src/data.js';import {creatureFrame} from '../src/geometry.js';
import {separateCompanions} from '../src/social-motion.js';
import {COMMUNITIES} from '../src/communities.js';
function group(index,n,player='s1'){const s=new Simulation(42);s.start('practice',player);s.section.entities=Array.from({length:n},(_,i)=>({...structuredClone(s.player),id:900+i,species:SPECIES[index],x:650+i*45,y:350+i%2*30,angle:0,health:100,think:0,satiated:60,rest:0,behavior:'Exploring'}));s.section.food=[];s.player.x=1450;s.player.y=100;s.point(1450,100);return s;}
const ticks=(s,n)=>{for(let i=0;i<n*60;i++)s.step(1/60);};
const bodyGap=(a,b)=>{const x=creatureFrame(a),y=creatureFrame(b);return Math.hypot((a.x-b.x)/((x.width+y.width)*.38),(a.y-b.y)/((x.height+y.height)*.32));};

test('overlapping schoolmates spread into distinct bodies without moving the player or spawning fish',()=>{
 for(const index of [0,42,49,53,55]){const s=group(index,5),p={x:s.player.x,y:s.player.y};for(const e of s.section.entities){e.x=800;e.y=350;}
  ticks(s,10);assert.equal(s.section.entities.length,5);assert.deepEqual({x:s.player.x,y:s.player.y},p);
  for(const [i,e] of s.section.entities.entries())for(const b of s.section.entities.slice(i+1))assert.ok(bodyGap(e,b)>.85,SPECIES[index].name+' separates overlapping schoolmates');
 }
});

test('a small school takes actual meals in limited excursions and rejoins afterward',()=>{
 const s=group(42,5),food={id:'school-plankton',kind:'food',food:'plankton',name:'Plankton',size:24,x:800,y:300,amount:100,regrow:0};s.section.food=[food];for(const e of s.section.entities)e.satiated=0;
 const ate=new Set(),returned=new Set();let largestParty=0;
 for(let i=0;i<25*60;i++){s.step(1/60);largestParty=Math.max(largestParty,s.section.entities.filter(e=>e.target===food.id).length);for(const e of s.section.entities){if(e.feeding?.committed)ate.add(e.id);if(ate.has(e.id)&&e.activity==='schooling')returned.add(e.id);}}
 assert.ok(largestParty>0&&largestParty<=2);assert.ok(food.amount<100||food.regrow>0);assert.ok(ate.size>=2);assert.equal(returned.size,ate.size);assert.equal(s.section.entities.filter(e=>e.alive).length,5);
});

test('rabbitfish companions retain their relationship through an actual grazing trip and rejoin',()=>{
 for(const index of [8,52]){const s=group(index,2);ticks(s,.1);const [a,b]=s.section.entities;assert.equal(a.ecology.partner,b.id);
  const food={id:'pair-algae',kind:'food',food:'algae',name:'Algae',size:24,x:a.x-100,y:a.y-45,amount:100,regrow:0};s.section.food=[food];a.satiated=0;a.think=0;
  ticks(s,5);assert.ok(food.amount<100);assert.ok(a.satiated>0);ticks(s,15);
  assert.equal(a.ecology.partner,b.id);assert.equal(b.ecology.partner,a.id);assert.ok(distance(a,b)<creatureFrame(a).width*2);assert.ok(bodyGap(a,b)>.8);
  const restored=Simulation.restore(s.serialize());restored.paused=false;ticks(s,3);ticks(restored,3);assert.equal(restored.serialize(),s.serialize());
 }
});

test('social correction is time-bounded and pauses without drifting',()=>{
 const s=group(42,2),[a,b]=s.section.entities;b.x=a.x;b.y=a.y;const before={x:a.x,y:a.y};separateCompanions(a,[b],0);assert.equal(a.x,before.x);assert.equal(a.y,before.y);separateCompanions(a,[b],1/60);assert.ok(Math.hypot(a.x-before.x,a.y-before.y)<=22/60+1e-9);
});

test('a school breaks away from a nearby predator and reforms after it swims away',()=>{
 const s=group(42,5,'s16');ticks(s,3);const a=s.section.entities[2];s.player.x=a.x+45;s.player.y=a.y;s.point(s.player.x,s.player.y);
 const alarmed=new Set();for(let i=0;i<45;i++){s.step(1/60);for(const e of s.section.entities)if(e.activity==='avoiding')alarmed.add(e.id);}
 assert.ok(alarmed.size>=3);s.point(1400,100);ticks(s,15);
 assert.ok(s.section.entities.filter(e=>e.activity==='schooling').length>=4);assert.equal(s.section.entities.filter(e=>e.alive).length,5);
});

test('paired browsers retain their community bonds while reef 0 reserves an existing unpaired lookout slot',()=>{
 for(const id of ['s8','s48','s52'])for(let seed=1;seed<=20;seed++){
  const base=new Simulation(seed);base.start('practice','s1');const s=new Simulation(seed);s.start('practice',id);
  for(const [i,section] of s.sections.entries()){
   assert.equal(section.entities.length,base.sections[i].entities.length);assert.ok(section.entities.filter(e=>e.species.diet.includes('fish')).length<=2);
   if(i===0&&['s8','s52'].includes(id)){
    const reserved=section.entities.filter(e=>e.adventureReservation?.key==='lookout');assert.equal(reserved.length,1);
    const [neighbor]=reserved;assert.equal(neighbor.species.id,id);assert.equal(neighbor.ecology?.partner,undefined);assert.ok(!section.entities.some(e=>e!==neighbor&&e.ecology?.partner===neighbor.id));
    assert.equal(neighbor.adventureReservation.species,id);assert.equal(neighbor.adventureReservation.incarnation,neighbor.incarnation||0);assert.equal(neighbor.adventureReservation.remaining,60);
   }else if(COMMUNITIES[i].day.includes(s.player.species.index)){const [a,b]=section.entities;assert.equal(a.species.id,id);assert.equal(b.species.id,id);assert.equal(a.ecology.partner,b.id);assert.equal(b.ecology.partner,a.id);assert.ok(distance(a,b)<150);}
  }
 }
});
