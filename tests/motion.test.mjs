import test from 'node:test';
import assert from 'node:assert/strict';
import {motionKind,bodyMotion} from '../src/motion.js';
import {SPECIES} from '../src/data.js';
test('distinct silhouettes receive appropriate stylized motion families',()=>{
 for(const [index,kind]of [[26,'eel'],[27,'ray'],[37,'ray'],[19,'cuttlefish'],[44,'seahorse'],[34,'shark'],[1,'fish'],[63,'still']])assert.equal(motionKind(SPECIES[index]),kind);
});
test('tail-driven swimming preserves the head and settles when hovering',()=>{
 for(const kind of ['fish','shark','eel']){assert.equal(Math.abs(bodyMotion(kind,1,.3).offset),0);assert.ok(Math.abs(bodyMotion(kind,0,.3,0).offset)<Math.abs(bodyMotion(kind,0,.3,1).offset));}
});
test('cuttlefish articulation changes fin height while eel motion bends the body',()=>{
 assert.equal(bodyMotion('cuttlefish',.35,.3).offset,0);assert.notEqual(bodyMotion('cuttlefish',.35,.3).stretch,1);assert.notEqual(bodyMotion('eel',.35,.3).offset,0);
});
