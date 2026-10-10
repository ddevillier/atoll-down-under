import test from 'node:test';
import assert from 'node:assert/strict';
import {freshJournal,recordProgress,persistJournal} from '../src/journal.js';

test('a stale open journal preserves awards written by another game',()=>{
 let raw=JSON.stringify(freshJournal());
 const storage={getItem:()=>raw,setItem:(_key,value)=>{raw=value;}};
 const a=JSON.parse(raw),b=JSON.parse(raw);
 recordProgress(a,'activity','meal','2026-09-01T00:00:00Z');
 persistJournal(a,storage);
 recordProgress(b,'activity','shelter');
 const merged=persistJournal(b,storage);
 assert.deepEqual(new Set(merged.activities),new Set(['meal','shelter']));
 assert.equal(merged.earned.meal,'2026-09-01T00:00:00Z');
 assert.ok(merged.earned.shelter);
 assert.deepEqual(JSON.parse(raw),merged);
 assert.deepEqual(a.activities,['meal']);
});

test('persist merges species milestones and discoveries from independent dives',()=>{
 const stored=freshJournal(),current=freshJournal();
 recordProgress(stored,'cared','s1');recordProgress(stored,'cared','s2');
 recordProgress(stored,'discovery','coral-home');recordProgress(current,'cared','s43');
 let raw=JSON.stringify(stored);
 const merged=persistJournal(current,{getItem:()=>raw,setItem:(_key,value)=>{raw=value;}});
 assert.ok(merged.earned.care3);
 assert.deepEqual(merged.discoveries,['coral-home']);
 assert.deepEqual(new Set(merged.cared),new Set(['s1','s2','s43']));
});

test('damaged old storage can be replaced; write failures preserve caller progress',()=>{
 const j=freshJournal();recordProgress(j,'activity','meal');
 let raw='{broken';
 assert.deepEqual(persistJournal(j,{getItem:()=>raw,setItem:(_key,value)=>{raw=value;}}),j);
 const before=structuredClone(j);
 assert.throws(()=>persistJournal(j,{getItem:()=>raw,setItem:()=>{throw new Error('full');}}),/full/);
 assert.deepEqual(j,before);
 assert.throws(()=>persistJournal(j,{getItem:()=>{throw new Error('unavailable');}}),/unavailable/);
});
