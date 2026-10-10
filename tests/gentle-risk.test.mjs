import test from 'node:test';import assert from 'node:assert/strict';
import {Simulation} from '../src/simulation.js';import {SPECIES} from '../src/data.js';
import {riskStatus,enterReefLife} from '../src/risk-cues.js';import {approachMeal} from '../src/feeding-contact.js';
const ticks=(s,seconds)=>{for(let i=0;i<seconds*60;i++)s.step(1/60);};

test('watching and benign unsuitable curiosity stay protected; real meal, ability and travel explain exposure once',()=>{
 const s=new Simulation(42);s.start('practice','s1');assert.match(riskStatus(s),/Watching safely/);s.section.entities=[];
 const wrong=s.section.food.find(f=>f.food==='worm');s.eatAt(wrong.x,wrong.y);assert.equal(s.protected,true);
 const meal=s.section.food.find(f=>f.food==='algae');s.eatAt(meal.x,meal.y);assert.equal(s.protected,false);assert.equal(riskStatus(s),'Meal started');s.useAbility();assert.equal(s.events.filter(e=>e.type==='reef-life').length,1);
 const r=new Simulation(42);r.start('practice','s1');r.useAbility();assert.equal(riskStatus(r),'Ability used');
 const t=new Simulation(42);t.start('practice','s1');t.transition(1,0);assert.equal(riskStatus(t),'Habitat entered');
 const poison=new Simulation(42);poison.start('practice','s1');poison.section.entities=[];const sponge=poison.section.food.find(f=>f.food==='sponge');poison.eatAt(sponge.x,sponge.y);assert.equal(poison.protected,false);
});
test('actual pursuers and injury get durable actionable status independent of toast and activity visibility',()=>{
 const s=new Simulation(42);s.start('practice','s2');enterReefLife(s,'meal');s.riskCue.until=0;const hunter=s.section.entities.find(e=>e.species.diet.includes('fish'));hunter.target='player';assert.equal(riskStatus(s),'Cover or Space');s.player.cooldown=2;assert.equal(riskStatus(s),'Swim toward cover');s.player.cooldown=0;s.player.species={...s.player.species,ability:'none'};assert.equal(riskStatus(s),'Swim toward cover');s.player.hurtGrace=1;assert.equal(riskStatus(s),'Rest to recover');s.adventure.visible=false;assert.equal(riskStatus(s),'Rest to recover');
});
test('simultaneous real contact bites allow a shared reaction window, but later predation remains possible',()=>{
 const s=new Simulation(42);s.start('practice','s1');s.protected=false;s.difficulty=0;s.section.food=[];s.point(800,300);
 const hunters=[1,2,3].map(id=>({...structuredClone(s.player),id,species:SPECIES[16],x:1100,y:300,angle:Math.PI,facing:-1,target:'player',satiated:0,rest:0,think:100,pursuit:0,biteCooldown:0}));
 for(const e of hunters)for(let i=0;i<400;i++){const result=approachMeal(e,s.player,1/60,1000);if(result.ready)break;}
 s.section.entities=hunters;ticks(s,.5);assert.equal(s.player.health,82);assert.equal(s.phase,'playing');assert.ok(s.player.hurtGrace>3);assert.equal(s.events.filter(e=>e.type==='hurt').length,1);
 const restored=Simulation.restore(s.serialize());assert.equal(restored.player.hurtGrace,s.player.hurtGrace);ticks(s,2);assert.equal(s.player.health,82,'Practice gives time to react');ticks(s,2);assert.ok(s.player.health<82,'hunters can bite after the grace period');
});

test('Challenge and Tournament keep the stronger bite and shorter reaction window',()=>{
 for(const mode of ['challenge','tournament']){
  const s=new Simulation(42);s.start('practice','s1');s.mode=mode;s.protected=false;s.difficulty=0;s.section.food=[];s.point(800,300);
  const hunters=[1,2].map(id=>({...structuredClone(s.player),id,species:SPECIES[16],x:1100,y:300,angle:Math.PI,facing:-1,target:'player',satiated:0,rest:0,think:100,pursuit:0,biteCooldown:0}));
  for(const e of hunters)for(let i=0;i<400;i++)if(approachMeal(e,s.player,1/60,1000).ready)break;
  s.section.entities=hunters;ticks(s,.5);assert.equal(s.player.health,65);assert.ok(s.player.hurtGrace<=1.8);
  ticks(s,2);assert.equal(s.player.health,30);assert.equal(s.phase,'playing');
 }
});

test('bite recovery rate is gentler in Practice and old grace values still load',()=>{
 for(const [mode,damage,grace,delay,rate] of [['practice',18,4,5,1.2],['challenge',35,1.8,10,.4],['tournament',35,1.8,10,.4]]){
  const s=new Simulation(42);s.start('practice','s1');s.mode=mode;s.section.entities=[];s.protected=false;s.difficulty=0;
  Object.assign(s.player,{health:100-damage,biteDamage:damage,energy:75,recoveryDelay:delay,hurtGrace:grace});
  ticks(s,delay+2);assert.ok(Math.abs(s.player.health-(100-damage+2*rate))<.025);
  const old=JSON.parse(s.serialize());old.player.hurtGrace=1.8;assert.doesNotThrow(()=>Simulation.restore(old));
  const bad=JSON.parse(s.serialize());bad.player.hurtGrace=grace+.01;assert.throws(()=>Simulation.restore(bad),/bite recovery/);
 }
});
test('closed top and bottom edges settle at the resting energy rate',()=>{
 for(const [reef,y]of [[0,0],[8,740]]){const s=new Simulation(42);s.start('practice','s34');s.current=reef;s.section.entities=[];s.protected=false;Object.assign(s.player,{x:800,y:y===0?8:732,angle:y===0?-Math.PI/2:Math.PI/2});s.point(800,y);const energy=s.player.energy;ticks(s,2);assert.ok(s.player.still>1.9);assert.ok(Math.abs(energy-s.player.energy-s.player.species.metabolism*.7*2)<1e-8);}
});
