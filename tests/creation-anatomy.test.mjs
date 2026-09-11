import test from 'node:test';
import assert from 'node:assert/strict';
import {DEFAULT_BLUEPRINT,blueprint} from '../src/creations.js';
import {APPEARANCE_OPTIONS,anatomy} from '../src/creation-appearance.js';
import {createSpecies} from '../src/data.js';
import {Simulation} from '../src/simulation.js';
import {exportDive,importDive} from '../src/save-files.js';
import {mouthPoint} from '../src/feeding-contact.js';
import {creatureWidth} from '../src/geometry.js';

test('every anatomical choice survives portable save and independent variation',()=>{
 for(const [key,options] of Object.entries(APPEARANCE_OPTIONS))for(const [value]of options){
  const s=new Simulation(42);s.start('create','custom',{...DEFAULT_BLUEPRINT,[key]:value,finColor:'#aa5544',markingColor:'#341b61'});
  const loaded=importDive(exportDive(s,'Original')).simulation;
  assert.equal(loaded.creation.blueprint[key],value);assert.equal(loaded.player.species.appearance[key],value);
  assert.equal(loaded.player.species.appearance.finColor,'#aa5544');
  const draft=structuredClone(loaded.creation.blueprint);draft.tail='point';draft.color='#112233';
  assert.equal(loaded.creation.blueprint.color,DEFAULT_BLUEPRINT.color);
 }
});
test('shape follows traits visibly, while chosen free proportions stay fixed',()=>{
 const a=createSpecies({...DEFAULT_BLUEPRINT,speed:70}),b=createSpecies({...DEFAULT_BLUEPRINT,speed:220});
 assert.ok(anatomy(b).length>anatomy(a).length);assert.ok(anatomy(b).depth<anatomy(a).depth);
 const c=createSpecies({...DEFAULT_BLUEPRINT,agility:50}),d=createSpecies({...DEFAULT_BLUEPRINT,agility:250});assert.ok(anatomy(d).depth>anatomy(c).depth);
 const free={...DEFAULT_BLUEPRINT,shapeMode:'free',bodyLength:135,bodyDepth:70};
 assert.equal(anatomy(createSpecies({...free,speed:70})).length,anatomy(createSpecies({...free,speed:220})).length);
 assert.equal(anatomy(createSpecies({...free,agility:50})).depth,anatomy(createSpecies({...free,agility:250})).depth);
});
test('part choices do not silently change budget, diet, protection or swimming statistics',()=>{
 const base=createSpecies(DEFAULT_BLUEPRINT);
 for(const key of ['tail','dorsal','pectoral','mouth','marking'])for(const [value]of APPEARANCE_OPTIONS[key]){
  const s=createSpecies({...DEFAULT_BLUEPRINT,[key]:value});for(const field of ['cost','size','speed','agility','metabolism','ability','diet','poison','armor'])assert.deepEqual(s[field],base[field]);
 }
});
test('legacy saved creatures retain their old painted appearance until revised',()=>{
 const old={name:'Original fish',body:'sturdy',color:'#aa7722',size:75,speed:140,endurance:150,agility:150,ability:'none',active:'day',diet:'grazer'};
 const s=new Simulation(44);s.start('create','custom',old);assert.equal(s.creation.blueprint.appearanceVersion,0);
 const loaded=Simulation.restore(s.serialize());assert.equal(loaded.player.species.appearance.appearanceVersion,0);assert.equal(loaded.player.species.index,s.player.species.index);
 const raw=JSON.parse(s.serialize());delete raw.creation;delete raw.player.species.appearance;delete raw.player.species.body;
 const migrated=Simulation.restore(raw);assert.equal(migrated.creation.blueprint.appearanceVersion,0);assert.equal(migrated.player.species.index,s.player.species.index);
});
test('invalid or mismatched saved anatomy is rejected, including nonfinite proportions',()=>{
 for(const patch of [{tail:'unknown'},{dorsal:'unknown'},{finColor:'red'},{bodyDepth:200},{bodyLength:NaN},{appearanceVersion:99}])assert.throws(()=>blueprint({...DEFAULT_BLUEPRINT,...patch}));
 const s=new Simulation(1);s.start('create','custom',DEFAULT_BLUEPRINT);const raw=JSON.parse(s.serialize());raw.player.species.appearance.tail='point';assert.throws(()=>Simulation.restore(raw),/anatomy/);
});
test('mouth landmarks follow selected mouth in either facing and rotation',()=>{
 for(const [mouth]of APPEARANCE_OPTIONS.mouth)for(const facing of [-1,1]){
  const s=createSpecies({...DEFAULT_BLUEPRINT,mouth}),e={species:s,x:800,y:400,facing};
  const p=mouthPoint(e),q=mouthPoint(e,{rotation:Math.PI/2});
  assert.ok(Math.abs(p.x-(800+anatomy(s).mouthX*creatureWidth(s)*facing))<1e-8);
  assert.ok(Math.abs(q.y-(400+anatomy(s).mouthX*creatureWidth(s)*facing))<1e-8);
 }
});
