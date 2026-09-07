import test from 'node:test';import assert from 'node:assert/strict';
import {Simulation,distance} from '../src/simulation.js';import {SPECIES,REEFS} from '../src/data.js';import {creatureFrame} from '../src/geometry.js';
import {localRoutine} from '../src/ecology.js';import {compatibleShadow,followShadow} from '../src/refuge-motion.js';import {exportDive,importDive} from '../src/save-files.js';
const ticks=(s,n)=>{for(let i=0;i<n*60;i++)s.step(1/60);};
function scene(ids){const s=new Simulation(42);s.start('practice','s1');s.section.entities=ids.map((id,i)=>({...structuredClone(s.player),species:SPECIES[id],id:900+i,x:650+i*22,y:350,angle:0,health:100,satiated:120,think:0}));s.section.food=[];s.player.x=1450;s.player.y=100;s.point(1450,100);return s;}

test('refuge residents reserve distinct body-spaced homes and return after a feeding trip',()=>{
 const s=scene([1,3,12,13,16,26,30,31,33,38,57]);ticks(s,40);const fish=s.section.entities;
 for(const [i,e] of fish.entries()){assert.ok(e.ecology.home);assert.equal(e.activity,'at-home',e.species.name);for(const b of fish.slice(i+1)){const a=creatureFrame(e),f=creatureFrame(b),x=e.ecology.home,y=b.ecology.home;assert.ok(Math.hypot((x.x-y.x)/((a.width+f.width)*.5+12),(x.y-y.y)/((a.height+f.height)*.5+12))>=.999);}}
 const e=fish[0],home={...e.ecology.home};s.section.entities=[e];s.section.food=[{id:'away-algae',kind:'food',food:'algae',name:'Algae',x:e.x+100,y:e.y-80,size:25,amount:100,regrow:0,phase:0}];e.satiated=0;e.think=0;ticks(s,7);assert.ok(s.section.food[0].amount<100);ticks(s,20);assert.deepEqual(e.ecology.home,home);assert.ok(distance(e,home)<20);
 const restored=importDive(exportDive(s,'Homes')).simulation;restored.paused=false;ticks(s,2);ticks(restored,2);assert.equal(restored.serialize(),s.serialize());
});

test('anemone guests occupy distinct crown berths and release a lost host',()=>{
 const s=scene([7,7,7,63]);const host=s.section.entities[3];Object.assign(host,{x:800,y:500});
 for(let i=0;i<35*60;i++)for(const e of s.section.entities.slice(0,3)){const speed=localRoutine(s,e,1/60,35);e.x+=Math.cos(e.angle)*speed/60;e.y+=Math.sin(e.angle)*speed/60;e.facing=Math.cos(e.angle)>=0?1:-1;}
 const guests=s.section.entities.slice(0,3);for(const e of guests){assert.equal(e.ecology.host,host.id);assert.equal(e.activity,'at-home');assert.equal(e.ecology.home.host,host.id);}
 for(const [i,e] of guests.entries())for(const b of guests.slice(i+1))assert.ok(distance(e,b)>30);
 host.alive=false;localRoutine(s,guests[0],.1,35);assert.equal(guests[0].ecology.host,null);assert.equal(guests[0].ecology.home.host,undefined);
});

test('trumpetfish chooses compatible cover, can accompany the player, and settles when its host stops',()=>{
 const s=scene([41,38]),[fish,predator]=s.section.entities;assert.equal(compatibleShadow(fish,predator),false);
 s.player.species=SPECIES[40];s.player.x=fish.x+75;s.player.y=fish.y;s.point(s.player.x,s.player.y);s.section.entities=[fish];
 ticks(s,10);assert.equal(fish.ecology.host,'player');assert.equal(fish.activity,'shadowing');const before={x:fish.x,y:fish.y};ticks(s,2);assert.ok(distance(fish,before)<1);
 s.player.target='meal';localRoutine(s,fish,.1,35);assert.equal(fish.ecology.host,null);assert.notEqual(fish.activity,'shadowing');
});

test('invalid refuge coordinates are rejected by file import and direct restore',()=>{
 const s=scene([3]);ticks(s,1);const d=JSON.parse(s.serialize());d.sections[s.current].entities[0].ecology.home.x=-100;
 assert.throws(()=>Simulation.restore(d),/damaged/);const file=JSON.parse(exportDive(s,'Bad'));file.state=d;assert.throws(()=>importDive(JSON.stringify(file)),/damaged/);
});

test('a trumpetfish holds its cover beside a moving host instead of lagging like a stationary docking approach',()=>{
 const s=scene([41,40]),[fish,host]=s.section.entities;Object.assign(host,{x:600,y:350,angle:0,vx:30,vy:0});Object.assign(fish,{x:600,y:350,angle:0});
 // Let it settle first, then move the existing host at an ordinary NPC pace.
 host.vx=0;for(let i=0;i<600;i++){const speed=localRoutine(s,fish,1/60,46);fish.x+=Math.cos(fish.angle)*speed/60;fish.y+=Math.sin(fish.angle)*speed/60;}
 host.vx=30;
 for(let i=0;i<480;i++){host.x+=host.vx/60;const speed=localRoutine(s,fish,1/60,46);fish.x+=Math.cos(fish.angle)*speed/60;fish.y+=Math.sin(fish.angle)*speed/60;}
 assert.equal(fish.ecology.host,host.id);assert.ok(Math.abs(fish.x-host.x)<6,'moving cover lag: '+Math.abs(fish.x-host.x));
 host.vx=0;const before={x:fish.x,y:fish.y};for(let i=0;i<180;i++){const speed=localRoutine(s,fish,1/60,46);fish.x+=Math.cos(fish.angle)*speed/60;fish.y+=Math.sin(fish.angle)*speed/60;}
 assert.ok(distance(fish,before)<7,'settling should not produce another large excursion');
});

test('moving cover remains speed bounded, yields to a busy or lost host and survives saving',()=>{
 const s=scene([41,40]),[fish,host]=s.section.entities;
 for(const dt of [1/120,1/60,.05]){
  const before={x:fish.x,y:fish.y};host.vx=800;host.vy=400;
  followShadow(fish,host,{x:fish.x+20,y:fish.y+20},dt,46);
  assert.ok(distance(fish,before)<=46*dt+1e-9,'ordinary cruise cap');
 }
 host.vx=host.vy=0;localRoutine(s,fish,.1,46);assert.equal(fish.ecology.host,host.id);
 host.feeding={elapsed:0};localRoutine(s,fish,.1,46);assert.equal(fish.ecology.host,null);delete host.feeding;
 localRoutine(s,fish,.1,46);assert.equal(fish.ecology.host,host.id);
 const saved=importDive(exportDive(s,'Moving cover')).simulation;saved.paused=false;
 ticks(s,3);ticks(saved,3);assert.equal(saved.serialize(),s.serialize());
 host.alive=false;localRoutine(s,fish,.1,46);assert.equal(fish.ecology.host,null);
});

test('a generated trumpetfish approaches, joins and travels with an NPC host, then yields to its own meal',()=>{
 const s=new Simulation(19);s.start('practice','s40');const fish=s.section.entities.find(e=>e.species.id==='s41'),count=s.section.entities.length;
 ticks(s,12);assert.equal(fish.activity,'approaching-cover');ticks(s,8);assert.equal(fish.activity,'shadowing');const host=fish.ecology.host,before={x:fish.x,y:fish.y};
 ticks(s,6);assert.equal(fish.activity,'shadowing');assert.equal(fish.ecology.host,host);assert.ok(distance(fish,before)>90);assert.equal(s.section.entities.length,count);
 fish.target='meal';localRoutine(s,fish,.1,46);assert.equal(fish.activity,'foraging');
});
