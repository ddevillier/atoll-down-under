import test from 'node:test';
import assert from 'node:assert/strict';
import {Simulation} from '../src/simulation.js';
import {exportDive,importDive} from '../src/save-files.js';
function fixture(){
 const s=new Simulation(42);s.start('practice','s1');
 const h=s.section.entities.find(e=>e.species.diet.includes('fish'));
 Object.assign(h,{target:'player',pursuit:5.99,health:100,think:1});
 s.player.x=1595;return {s,h};
}
const counts=s=>s.sections.map(z=>z.entities.filter(e=>e.species.diet.includes('fish')).length);
test('finished visiting hunter returns offscreen without changing population or digestion',()=>{
 const {s,h}=fixture(),before=counts(s),position={x:h.x,y:h.y};
 s.transition(1,0);s.stepNpc(h,.02);
 assert.equal(h.target,null);assert.equal(h.rest,15);
 assert.equal(s.section.entities.includes(h),true,'visit remains visible until departure');
 s.transition(-1,0);
 assert.deepEqual(counts(s),before);assert.equal(s.section.entities.includes(h),true);
 assert.deepEqual({x:h.x,y:h.y},position);assert.equal(h.rest,15);
 assert.equal(s.sections.flatMap(z=>z.entities).filter(e=>e.id===h.id).length,1);
 assert.equal(h.pursuitOrigin,undefined);
});
test('continued multi-reef pursuit retains first home through save and can return there',()=>{
 const {s,h}=fixture();s.transition(1,0);h.pursuit=2;s.transition(1,0);
 assert.equal(h.pursuitOrigin.reef,4);assert.equal(h.target,'player');
 const q=importDive(exportDive(s,'Visiting hunter')).simulation;q.paused=false;
 const visitor=q.section.entities.find(e=>e.id===h.id);visitor.target=null;visitor.satiated=57;
 q.transition(1,0);
 assert.equal(q.current,4);assert.ok(q.section.entities.includes(visitor));assert.equal(visitor.satiated,57);
 assert.equal(visitor.pursuitOrigin,undefined);
});
test('a pursuit reaching its original reef stops being a visitor',()=>{
 const {s,h}=fixture();s.transition(1,0);s.transition(-1,0);
 assert.equal(h.target,'player');assert.equal(h.pursuitOrigin,undefined);
});
test('malformed saved pursuit origin is rejected',()=>{
 const {s,h}=fixture();s.transition(1,0);
 const d=JSON.parse(s.serialize());d.sections[s.current].entities.find(e=>e.id===h.id).pursuitOrigin.reef=99;
 assert.throws(()=>Simulation.restore(d),/pursuit/);
});

test('a dead visitor returns its respawn slot home without being revived',()=>{
 const {s,h}=fixture(),before=counts(s);s.transition(1,0);h.alive=false;h.respawn=20;
 s.transition(-1,0);assert.deepEqual(counts(s),before);
 assert.equal(h.alive,false);assert.equal(h.respawn,20);assert.equal(h.target,null);
});
