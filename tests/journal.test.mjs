import test from 'node:test';
import assert from 'node:assert/strict';
import {BADGES,freshJournal,validateJournal,recordProgress,mergeJournals,journalRewards,freshCare,tickCare,careHint} from '../src/journal.js';
import {Simulation} from '../src/simulation.js';
import {PLAYABLE} from '../src/data.js';
import {TitleReef} from '../src/title-reef.js';
const ids=PLAYABLE.slice(0,10).map(s=>s.id),date='2026-09-06T12:00:00.000Z';
for(const badge of BADGES)test('badge threshold and dedup: '+badge.id,()=>{
 const j=freshJournal();let kind='activity',values=[badge.id];
 if(badge.id.startsWith('care')){kind='cared';values=ids.slice(0,Number(badge.id.slice(4)));}
 if(badge.id.startsWith('play')){kind='played';values=ids.slice(0,Number(badge.id.slice(4)));}
 if(badge.id.startsWith('visit')){kind='habitat';values=Array.from({length:Number(badge.id.slice(5))},(_,i)=>i);}
 for(const value of values.slice(0,-1))recordProgress(j,kind,value,date);
 assert.equal(j.earned[badge.id],undefined);recordProgress(j,kind,values.at(-1),date);assert.equal(j.earned[badge.id],date);
 assert.deepEqual(recordProgress(j,kind,values.at(-1)),[]);assert.deepEqual(validateJournal(JSON.parse(JSON.stringify(j))),j);
});
test('custom species cannot earn roster milestones; activities can',()=>{const j=freshJournal();for(const kind of ['cared','played'])assert.deepEqual(recordProgress(j,kind,'custom'),[]);recordProgress(j,'activity','meal');assert.ok(j.earned.meal);});
test('validated backups merge sets, retain earliest dates and award combined milestones',()=>{
 const a=freshJournal(),b=freshJournal();for(const id of ids.slice(0,2))recordProgress(a,'cared',id,date);recordProgress(b,'cared',ids[2]);
 const merged=mergeJournals(a,b);assert.equal(merged.earned.care1,date);assert.ok(merged.earned.care3);assert.deepEqual(mergeJournals(merged,b),merged);assert.deepEqual(journalRewards(merged),['cuttlefish']);
 for(const bad of [null,{}, {...a,version:2},{...a,cared:['custom']},{...a,habitats:[9]},{...a,earned:{meal:'bad'}},{...a,earned:{alien:date}}])assert.throws(()=>validateJournal(bad));
});
function harness(){const s=new Simulation(42);s.start('practice','s1');s.events=[];s.section.entities=[];return s;}
test('care needs food and continuous good condition; played time and stamps checkpoint',()=>{
 const s=harness();tickCare(s,30,false);assert.equal(s.careProgress.healthy,0);s.careProgress.fed=true;tickCare(s,29,false);assert.ok(!s.events.some(e=>e.kind==='cared'));
 s.player.energy=69;tickCare(s,1,false);assert.equal(s.careProgress.healthy,0);s.player.energy=90;tickCare(s,29,false);
 const restored=Simulation.restore(s.serialize());assert.deepEqual(restored.careProgress,s.careProgress);tickCare(restored,1,false);assert.ok(restored.events.some(e=>e.kind==='cared'));
 assert.ok(s.events.some(e=>e.kind==='played'));const old=JSON.parse(s.serialize());delete old.careProgress;assert.deepEqual(Simulation.restore(JSON.stringify(old)).careProgress,freshCare());
 old.careProgress={...freshCare(),healthy:-1};assert.throws(()=>Simulation.restore(JSON.stringify(old)));
});
test('pause freezes every care timer and restart resets local counters',()=>{const s=harness();s.paused=true;const before=structuredClone(s.careProgress);s.step(30);assert.deepEqual(s.careProgress,before);s.careProgress.played=50;s.continueRun();assert.equal(s.careProgress.played,0);});
test('camouflage in open water never counts as physical shelter; school needs three live nearby schooling peers',()=>{
 const s=harness();s.player.hidden=true;tickCare(s,6,false);assert.equal(s.careProgress.shelter,0);tickCare(s,5,true);assert.ok(s.events.some(e=>e.value==='shelter'));
 s.section.entities=Array.from({length:3},()=>({...s.player,alive:true,behavior:'Swimming with a school',activity:'schooling'}));s.section.entities[2].alive=false;tickCare(s,11,false);assert.equal(s.careProgress.school,0);
 s.section.entities[2].alive=true;tickCare(s,9,false);assert.ok(!s.events.some(e=>e.value==='school'));s.section.entities[0].x+=200;tickCare(s,1,false);assert.equal(s.careProgress.school,0);s.section.entities[0].x-=200;tickCare(s,10,false);assert.ok(s.events.some(e=>e.value==='school'));
});
test('meal and night badges use actual restored energy, not a food click',()=>{
 for(const [energy,food,period,good] of [[100,'plankton','day',false],[95,'plankton','day',false],[70,'algae','day',true],[70,'coral','day',false],[70,'sponge','day',false],[70,'algae','night',true]]){
  const s=harness();s.player.energy=energy;s.period=period;s.consume({kind:'food',food,name:food,amount:100,x:500,y:300});
  assert.equal(s.events.some(e=>e.value==='meal'),good);assert.equal(s.events.some(e=>e.value==='night'),good&&period==='night');
 }
});
test('inspection only earns neighbour badge during actual NPC cleaning',()=>{
 const s=harness(),cleaner=new Simulation(9);cleaner.start('practice','s43');const c={...cleaner.player,id:998,alive:true};const e={...s.player,id:999,alive:true,target:998,cleanTime:0};s.section.entities=[c,e];s.observe(e);assert.ok(!s.events.some(e=>e.type==='progress'));e.cleanTime=1;e.behavior='Being cleaned';c.x=e.x;c.y=e.y;s.observe(e);assert.ok(s.events.some(e=>e.value==='neighbor'));
});
test('care hints have stable thresholds and prioritize meal, cleaner, recovery',()=>{const p={energy:59,health:80,biteDamage:0,poisonDamage:0};assert.equal(careHint(p).kind,'food');p.energy=65;assert.equal(careHint(p,'food').kind,'food');p.energy=70;assert.equal(careHint(p,'food').kind,'clean');p.health=96;assert.equal(careHint(p,'clean').kind,'clean');p.health=98;assert.equal(careHint(p,'clean').kind,'well');p.biteDamage=2;assert.equal(careHint(p).kind,'rest');});
test('splash density, title exclusion, reward identities and reduced motion',()=>{
 const r=new TitleReef();assert.equal(r.actors().length,18);r.rewards=['ray','seahorse','cuttlefish','school'];const still=r.actors(true);
 for(let t=0;t<120;t+=.5){r.time=t;r.move(800,450);const actors=r.actors();assert.equal(actors.length,24);for(const a of actors){const margin=a.w*.6;assert.ok(!(a.x+margin>540&&a.x-margin<1110&&a.y+margin>250.01&&a.y-margin<755),a.id+' at '+t);assert.ok(a.y-margin>=65); }assert.deepEqual(r.actors(true),still);}
 assert.equal(r.actors().find(a=>a.id==='reward-ray').species.name,'Blue-spotted stingray');assert.equal(r.actors().find(a=>a.id==='reward-cuttlefish').species.name,'Cuttlefish');r.click(200,300);r.click(200,300);assert.equal(r.bubbles.length,1);
});

test('plankton grazers can build nourishment across needed small meals without a false single-meal badge',()=>{const s=harness();s.player.energy=70;for(let i=0;i<2;i++){s.player.biteCooldown=0;s.consume({kind:'food',food:'plankton',name:'Plankton',amount:100});}assert.equal(s.careProgress.fed,true);assert.equal(s.careProgress.nourishment,18);assert.ok(!s.events.some(e=>e.value==='meal'));tickCare(s,30,false);assert.ok(s.events.some(e=>e.kind==='cared'));});
test('cleaning badge requires completed treatment removing at least ten actual damage',()=>{for(const [damage,expected]of [[9.6,false],[12,true]]){const s=new Simulation(42);s.start('practice','s1');const c=s.section.entities.find(e=>e.species.ability==='clean');Object.assign(c,{x:700,y:300,station:{x:700,y:300}});s.section.entities=[c];Object.assign(s.player,{x:735,y:300,health:100-damage,energy:90});s.point(735,300);s.requestCleaning(c);for(let i=0;i<180;i++)s.step(1/60);assert.equal(s.events.some(e=>e.value==='clean'),expected);}});

test('reward cuttlefish follows a continuous route clear of the title exclusion area',()=>{const r=new TitleReef();r.rewards=['cuttlefish'];let previous;for(let t=0;t<60;t+=.1){r.time=t;const a=r.actors().find(a=>a.id==='reward-cuttlefish');if(previous)assert.ok(Math.hypot(a.x-previous.x,a.y-previous.y)<2);previous=a;}});
