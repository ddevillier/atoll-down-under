import test from 'node:test';
import assert from 'node:assert/strict';
import {Simulation} from '../src/simulation.js';
import {BY_ID} from '../src/data.js';

function fixture(){
 const sim=new Simulation(42);sim.start('practice','s8');
 const algae={...sim.section.food.find(f=>f.food==='algae'),x:500,y:300};
 const slug={...structuredClone(sim.section.entities[0]),id:901,species:BY_ID.s60,x:518,y:300,alive:true};
 sim.section.food=[algae];sim.section.entities=[slug];
 return {sim,algae,slug};
}

test('direct food clicks win over the edge of a nearby poisonous animal',()=>{
 const {sim,algae,slug}=fixture();
 assert.equal(sim.findAt(500,300),algae);
 assert.equal(sim.findAt(518,300),slug);
 assert.equal(sim.eatAt(500,300),true);
 assert.equal(sim.player.target,algae.id);
 sim.player.energy=50;sim.consume(sim.mealTarget);
 assert.ok(sim.player.energy>50);
 assert.equal(sim.player.poisonDamage,0);
 assert.equal(slug.alive,true);
 assert.ok(algae.amount<100);
});

test('overlapping food hit areas select the nearer patch regardless of array order',()=>{
 const {sim,algae}=fixture();sim.section.entities=[];
 const other={...algae,id:'nearer',x:550};sim.section.food=[algae,other];
 assert.equal(sim.findAt(530,300),other);
 sim.section.food.reverse();
 assert.equal(sim.findAt(530,300),other);
 other.regrow=5;
 assert.equal(sim.findAt(530,300),algae);
});

test('selection preserves creature edges, exact overlap priority and inactive exclusions',()=>{
 const {sim,algae,slug}=fixture();
 slug.x=algae.x;
 assert.equal(sim.findAt(500,300),slug);
 slug.alive=false;
 assert.equal(sim.findAt(500,300),algae);
 algae.regrow=5;
 assert.equal(sim.findAt(500,300),null);
 slug.alive=true;sim.section.food=[];
 assert.equal(sim.findAt(520,300),slug);
 assert.equal(sim.findAt(700,300),null);
});
