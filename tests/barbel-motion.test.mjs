import test from 'node:test';import assert from 'node:assert/strict';
import {Simulation} from '../src/simulation.js';import {SPECIES} from '../src/data.js';import {inspectingWithBarbels,mouthPoint} from '../src/feeding-contact.js';import {partPose,PART_RIGS,bodyPoint} from '../src/part-motion.js';

function fixture(){const s=new Simulation(2);s.start('practice','s9');s.player.x=650;s.player.y=350;s.player.angle=0;s.player.facing=1;s.player.energy=60;s.section.entities=[];const mouth=mouthPoint(s.player),f={id:'barbel-meal',kind:'food',food:'shrimp',name:'Small shrimp',x:mouth.x+35,y:mouth.y,size:22,amount:100,regrow:0};s.section.food=[f];return {s,f};}

test('barbel search responds to a nearby available bottom-food meal and yields to interruptions',()=>{
 const {s,f}=fixture(),e=s.player;assert.equal(inspectingWithBarbels(e,f),true);
 for(const override of [{angle:Math.PI},{alive:false},{hidden:true},{stun:2},{cleanTime:1},{cleanerTarget:42}])assert.equal(inspectingWithBarbels({...e,...override},f),false);
 for(const override of [{food:'algae'},{regrow:1},{x:1500},{kind:'fish'}])assert.equal(inspectingWithBarbels(e,{...f,...override}),false);
 assert.equal(inspectingWithBarbels({...e,species:SPECIES[12]},f),false);assert.equal(inspectingWithBarbels(e,null),false);
 const barbs=PART_RIGS.s9.parts.filter(p=>p.mode==='barbel');assert.equal(barbs.length,2);
 for(const b of barbs){for(const pt of b.hinge)assert.deepEqual(bodyPoint('s9',...pt,.4,1,{turn:1}),{x:pt[0],y:pt[1]});const quiet=partPose('s9',b.name,.2,0),search=partPose('s9',b.name,.2,0,{probe:1});assert.ok(Math.abs(search.shear)>Math.abs(quiet.shear)*5);}
});

test('player food approach shows a probe cue, consumes once, and clears after a canceled approach',()=>{
 const {s,f}=fixture();s.eatAt(f.x,f.y);let seen=false;for(let i=0;i<180;i++){s.step(1/60);seen||=s.player.activity==='probing';}assert.ok(seen);assert.ok(s.player.energy>60);assert.equal(s.events.filter(e=>e.type==='eat').length,1);assert.notEqual(s.player.activity,'probing');
 s.player.biteCooldown=0;f.x=mouthPoint(s.player).x+40;s.eatAt(f.x,f.y);s.step(1/60);assert.equal(s.player.activity,'probing');s.point(300,300);s.step(1/60);assert.notEqual(s.player.activity,'probing');
});

test('NPC probe cue survives replay and clears for food loss, cleaning, stun and death',()=>{
 const {s,f}=fixture(),e={...structuredClone(s.player),id:900,target:f.id,think:10,satiated:0,rest:0};s.player.x=100;s.section.entities=[e];s.stepNpc(e,1/60);assert.equal(e.activity,'probing');
 const restored=Simulation.restore(s.serialize());restored.stepNpc(restored.section.entities[0],1/60);assert.equal(restored.section.entities[0].activity,'probing');
 f.regrow=8;s.stepNpc(e,1/60);assert.notEqual(e.activity,'probing');f.regrow=0;e.target=f.id;e.stun=1;s.stepNpc(e,1/60);assert.notEqual(e.activity,'probing');
 e.stun=0;e.alive=false;e.respawn=2;s.stepNpc(e,1/60);assert.notEqual(e.activity,'probing');e.respawn=0;s.stepNpc(e,1/60);assert.equal(e.target,null);assert.notEqual(e.activity,'probing');
 const cleaner={...structuredClone(e),id:901,species:SPECIES[43],station:{x:700,y:350},x:700,y:350};s.section.entities.push(cleaner);e.x=735;e.y=350;e.health=40;e.target=f.id;e.think=0;s.stepNpc(e,1/60);assert.notEqual(e.activity,'probing');assert.equal(e.target,cleaner.id);
});

test('a generated goatfish uses the cue on its own feeding trip without replacing its community',()=>{
 const s=new Simulation(2);s.start('practice','s9');s.point(s.player.x,s.player.y);let seen=false;
 for(let i=0;i<3600&&!seen;i++){s.step(1/60);seen=s.section.entities.some(e=>e.species.id==='s9'&&e.activity==='probing');}assert.ok(seen);
});
