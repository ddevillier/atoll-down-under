import test from 'node:test';
import assert from 'node:assert/strict';
import {Simulation} from '../src/simulation.js';
function meal(energy,period='night'){
 const s=new Simulation(42);s.start('practice','s58');s.period=period;s.player.energy=energy;s.events=[];
 const food=s.section.food.find(f=>f.food==='plankton');s.consume(food);return s;
}
const night=s=>s.events.some(e=>e.type==='progress'&&e.kind==='activity'&&e.value==='night');
test('a suitable small night meal earns night progress even below ten energy',()=>{
 for(const energy of [50,99]){const s=meal(energy);assert.ok(s.player.energy>energy);assert.ok(night(s));}
});
test('no night credit for a full stomach or a day meal',()=>{
 assert.equal(night(meal(100)),false);assert.equal(night(meal(50,'day')),false);
});
