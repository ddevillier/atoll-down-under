import test from 'node:test';
import assert from 'node:assert/strict';
import {Simulation} from '../src/simulation.js';
import {nearbyFoodHints} from '../src/food-hints.js';
import {BY_ID} from '../src/data.js';

test('food hints choose up to three nearby available meals without changing the dive',()=>{
 const s=new Simulation(42);s.start('practice','s1');s.player.x=800;s.player.y=300;s.section.entities=[];
 s.section.food=[50,100,150,200,600].map((dx,i)=>({id:'food-'+i,kind:'food',food:'algae',x:800+dx,y:300,regrow:0}));
 s.section.food.push({id:'wrong',kind:'food',food:'sponge',x:805,y:300,regrow:0});
 s.section.food[1].regrow=10;const before=s.serialize();
 assert.deepEqual(nearbyFoodHints(s).map(e=>e.id),['food-0','food-2','food-3']);
 assert.equal(s.serialize(),before);s.phase='dead';assert.deepEqual(nearbyFoodHints(s),[]);
});

test('food hints respect prey size, cleaner safety and the current fish poison resistance',()=>{
 const s=new Simulation(42);s.start('practice','s53');s.section.food=[];
 const cleaner=s.section.entities.find(e=>e.species.ability==='clean');
 Object.assign(cleaner,{x:800,y:300});
 const prey={id:'prey',alive:true,x:810,y:300,species:{...BY_ID.s1,size:20,poison:true}};
 Object.assign(s.player,{x:800,y:300,species:{...s.player.species,diet:['fish','shrimp'],size:100,ability:'dash'}});
 s.section.entities=[cleaner,prey];assert.deepEqual(nearbyFoodHints(s),[]);
 s.player.species.ability='crush';assert.deepEqual(nearbyFoodHints(s),[prey]);
 prey.species.size=200;assert.deepEqual(nearbyFoodHints(s),[]);
 prey.species.size=20;prey.alive=false;assert.deepEqual(nearbyFoodHints(s),[]);
});
