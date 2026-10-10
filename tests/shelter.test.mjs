import test from 'node:test';
import assert from 'node:assert/strict';
import {Simulation} from '../src/simulation.js';
import {REEFS} from '../src/data.js';
import {shelterAt,shelterHint,canUseShelter} from '../src/shelter.js';

test('shelter boundaries and stillness retain the existing gameplay rules',()=>{
 const sim=new Simulation(7);sim.start('practice','s1');
 const reef=REEFS[sim.current],area=reef.shelters[0],p=sim.player;
 sim.section.entities=[];sim.section.food=[];sim.protected=false;
 Object.assign(p,{x:area.x,y:area.y+area.r*.8,still:0});
 sim.pointer={x:p.x,y:p.y};
 assert.equal(shelterAt(reef,p),area); // Inside the true circle, outside the old drawn ellipse.
 assert.equal(shelterHint(reef,p),'Shelter');
 for(let i=0;i<13;i++)sim.step(.05);
 assert.equal(p.hidden,false);assert.match(shelterHint(reef,p),/Taking cover/);
 sim.step(.05);sim.step(.05);assert.equal(p.hidden,true);
 sim.pointer={x:p.x+200,y:p.y};sim.step(.05);assert.equal(p.hidden,false);
 Object.assign(p,{x:area.x+area.r,y:area.y});assert.equal(shelterAt(reef,p),undefined);
 p.species={...p.species,size:125};p.x=area.x;
 assert.equal(canUseShelter(p.species),false);assert.equal(shelterHint(reef,p),'');
 sim.pointer={x:p.x,y:p.y};p.still=2;sim.step(.05);assert.equal(p.hidden,false);
});

test('large fish can still use active camouflage independently of shelter fit',()=>{
 const sim=new Simulation(7);sim.start('practice','s16');
 sim.section.entities=[];sim.section.food=[];sim.player.species={...sim.player.species,size:150};
 sim.pointer={x:sim.player.x,y:sim.player.y};
 assert.equal(sim.useAbility(),true);sim.step(.05);
 assert.equal(sim.player.hidden,true);assert.equal(sim.protected,false);
});
