import test from 'node:test';import assert from 'node:assert/strict';
import {Simulation} from '../src/simulation.js';import {SPECIES} from '../src/data.js';import {PART_RIGS,bodyPoint,lightVisibility} from '../src/part-motion.js';import {ANIMAL_RIGS} from '../src/animal-rigs.js';

test('flashlight organ dims smoothly, stays bright for feeding or defense, and leaves the eye on a rigid head',()=>{
 const values=Array.from({length:341},(_,i)=>lightVisibility(i/100));assert.ok(Math.min(...values)<.05);assert.equal(Math.max(...values),1);
 for(let i=1;i<values.length;i++)assert.ok(Math.abs(values[i]-values[i-1])<.05);
 for(const t of [0,1,2.3,3.4,40]){assert.equal(lightVisibility(t,{feed:1}),1);assert.equal(lightVisibility(t,{flash:1}),1);assert.ok(Math.abs(lightVisibility(t)-lightVisibility(t+3.4))<1e-12);}
 const rig=PART_RIGS.s53,light=rig.parts.find(p=>p.mode==='glow'),eye=ANIMAL_RIGS.s53.eye;assert.ok(Math.min(...light.polygon.map(p=>p[0]))>rig.spine.front);assert.ok(eye[1]<Math.min(...light.polygon.map(p=>p[1])));
 for(let t=0;t<4;t+=.1)assert.deepEqual(bodyPoint('s53',...eye,t,1,{turn:1}),{x:eye[0],y:eye[1]});
});

test('defensive flash startles nearby predators without stunning schoolmates, cleaners or distant fish',()=>{
 const s=new Simulation(42);s.start('practice','s53');const base=s.section.entities[0];s.section.entities=[53,43,32,32].map((n,i)=>({...structuredClone(base),id:900+i,species:SPECIES[n],x:s.player.x+(i===3?300:60+i*20),y:s.player.y,alive:true,stun:0}));
 const energy=s.player.energy,count=s.section.entities.length;assert.equal(s.useAbility(),true);assert.deepEqual(s.section.entities.map(e=>e.stun),[0,0,4,0]);assert.equal(s.player.energy,energy-8);assert.equal(s.section.entities.length,count);assert.equal(s.useAbility(),false);assert.equal(s.player.energy,energy-8);
 for(let i=0;i<241;i++)s.step(1/60);assert.equal(s.section.entities[2].stun,0);
});
