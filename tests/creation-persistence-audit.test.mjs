import test from 'node:test';
import assert from 'node:assert/strict';
import {Simulation} from '../src/simulation.js';
import {DEFAULT_BLUEPRINT} from '../src/creations.js';
import {exportDive,importDive} from '../src/save-files.js';

// Only the browser storage boundary is doubled; imports use the real save
// validator and simulation restore, including their migration behavior.
function storage(){
 const records=new Map(),connections=[];
 return {records,connections,open(){
  const request={};
  queueMicrotask(()=>{
   const connection={closed:false,close(){this.closed=true;},transaction(){
    if(this.closed)throw new DOMException('Connection closed','InvalidStateError');
    const tx={objectStore(){return {get(id){return run(()=>structuredClone(records.get(id)));},getAll(){return run(()=>structuredClone([...records.values()]));},put(value){return run(()=>{records.set(value.id,structuredClone(value));return value.id;});}};}};
    function run(action){const r={};queueMicrotask(()=>{r.result=action();r.onsuccess?.();queueMicrotask(()=>tx.oncomplete?.());});return r;}
    return tx;
   }};
   connections.push(connection);request.result=connection;request.onsuccess?.();
  });
  return request;
 }};
}
async function withStorage(t,fn){
 const prior=globalThis.indexedDB,fake=storage();globalThis.indexedDB=fake;
 t.after(()=>{if(prior===undefined)delete globalThis.indexedDB;else globalThis.indexedDB=prior;});
 const api=await import('../src/creations.js?audit='+encodeURIComponent(t.name));
 await fn(api,fake);
}
const reverseKeys=value=>Array.isArray(value)?value.map(reverseKeys):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).reverse().map(([k,v])=>[k,reverseKeys(v)])):value;

test('reordered portable objects preserve identity while changed worlds become independent copies',async t=>withStorage(t,async(api,fake)=>{
 const sim=new Simulation(91);sim.start('create','custom',DEFAULT_BLUEPRINT);await api.storeCreation(sim);
 const exported=reverseKeys(JSON.parse(exportDive(sim,'Original')));
 const same=importDive(JSON.stringify(exported)).simulation;await api.resolveImportedCreation(same);
 assert.equal(same.creation.id,sim.creation.id);
 const different=importDive(JSON.stringify(exported)).simulation;different.player.energy-=1;
 await api.resolveImportedCreation(different);await api.storeCreation(different);
 assert.notEqual(different.creation.id,sim.creation.id);assert.equal(different.creation.parentId,sim.creation.id);
 assert.equal(fake.records.size,2);assert.equal(fake.records.get(sim.creation.id).state.player.energy,sim.player.energy);
}));

for(const event of ['close','versionchange'])test(`creation storage reopens after ${event}`,async t=>withStorage(t,async(api,fake)=>{
 const sim=new Simulation(91);sim.start('create','custom',DEFAULT_BLUEPRINT);await api.storeCreation(sim);
 const first=fake.connections[0];if(event==='close')first.closed=true;
 first['on'+event]();
 const saved=await api.getCreation(sim.creation.id);
 assert.equal(first.closed,true);assert.equal(fake.connections.length,2);assert.deepEqual(saved.state,JSON.parse(sim.serialize()));
 sim.creation.blueprint.name='Recovered';sim.custom.name='Recovered';sim.player.species.name='Recovered';
 await api.storeCreation(sim);assert.equal((await api.getCreation(sim.creation.id)).creation.blueprint.name,'Recovered');
}));
