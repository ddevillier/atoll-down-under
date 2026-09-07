import test from 'node:test';
import assert from 'node:assert/strict';
import {lengthSummary} from '../src/measurements.js';
import {NATURAL_HISTORY} from '../src/natural-history.js';

test('imperial length summaries retain qualifiers and anatomical definitions',()=>{
 assert.equal(lengthSummary('Up to 24 cm standard length (without the tail fin)',false),'Up to 9.4 inches standard length (without the tail fin) (approx.)');
 assert.equal(lengthSummary('Up to about 6.4 m (21 feet)',false),'Up to about 21 feet (approx.)');
 assert.equal(lengthSummary('Up to about 8.6 cm (3.4 inches)',false),'Up to about 3.4 inches (approx.)');
 assert.equal(lengthSummary('About 30.48 cm',false),'About 12 inches (approx.)');
 assert.equal(lengthSummary('About 0.3048 m',false),'About 1 foot (approx.)');
});

test('every existing measured summary converts without modifying sources or inventing missing lengths',()=>{
 const before=JSON.stringify(NATURAL_HISTORY),measured=Object.values(NATURAL_HISTORY).filter(n=>n.length);
 assert.equal(measured.length,28);
 for(const n of measured){
  assert.equal(lengthSummary(n.length),n.length);
  const imperial=lengthSummary(n.length,false);assert.match(imperial,/(inches|feet)/);assert.doesNotMatch(imperial,/\b(?:cm|m)\b/);
 }
 assert.equal(lengthSummary(undefined,false),'');assert.equal(lengthSummary('Length unknown',false),'Length unknown');
 assert.equal(JSON.stringify(NATURAL_HISTORY),before);
});
