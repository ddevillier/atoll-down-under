import test from 'node:test';
import assert from 'node:assert/strict';
import {foodWeb} from '../src/learning.js';
import {SPECIES} from '../src/data.js';

test('a plankton feeder connects a food source to larger fish without acquiring a hunter diet',()=>{
 const web=foodWeb(SPECIES[0]);assert.deepEqual(web.resources.map(f=>f.id),['plankton']);assert.equal(web.prey.length,0);assert.ok(web.predators.some(s=>s.id==='s39'));
 const trout=foodWeb(SPECIES[39]);assert.ok(trout.prey.some(s=>s.id==='s0'));assert.equal(trout.resources.some(f=>f.id==='algae'),false);
});
test('cleaning and shell-crushing food webs expose their distinct feeding roles',()=>{
 assert.deepEqual(foodWeb(SPECIES[43]).special,['parasite']);
 assert.ok(foodWeb(SPECIES[24]).prey.some(s=>s.id==='s62'));
 assert.equal(foodWeb(SPECIES[17]).prey.some(s=>s.id==='s62'),false);
});
