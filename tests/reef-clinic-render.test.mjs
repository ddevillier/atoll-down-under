import test from 'node:test';
import assert from 'node:assert/strict';
import {SPECIES} from '../src/data.js';
import {clinicPose,drawStory} from '../src/reef-clinic-render.js';

function scene(){
 const client={id:5,incarnation:2,species:SPECIES[16],alive:true,health:60,x:850,y:300,facing:-1,activity:'approaching-cleaner'};
 const player={id:'player',species:SPECIES[43],alive:true,health:95,x:700,y:300,facing:1};
 const clinic={version:1,reef:4,species:'s43',station:{x:700,y:300},open:true,appointment:{id:5,incarnation:2,species:'s16',phase:'approach',temperament:'nervous',gentle:false,returning:false},relationships:[]};
 return {client,player,clinic,sim:{current:4,player,section:{entities:[client]},reefStories:{active:'clinic',clinic}}};
}

test('real invitation and distance change painted fish posture, then care takes ownership',()=>{
 const {sim,client,player,clinic}=scene();
 const nervous=clinicPose(sim,client,2);
 player.x=400;const distant=clinicPose(sim,client,2);
 assert.ok(Math.abs(nervous.pitch)>Math.abs(distant.pitch),'head reaction responds to the cleaner distance');
 player.x=700;clinic.appointment.gentle=true;
 const reassured=clinicPose(sim,client,2);
 assert.ok(Math.abs(reassured.pitch)<Math.abs(nervous.pitch));assert.ok(reassured.brake<nervous.brake);
 clinic.appointment.temperament='bold';client.x=765;
 const bold=clinicPose(sim,client,2);
 assert.ok(bold.feed>.2,'confident invitation opens the existing jaw');
 clinic.appointment.returning=true;const remembered=clinicPose(sim,client,2);
 assert.ok(remembered.feed<bold.feed);assert.ok(remembered.brake<bold.brake);
 clinic.appointment.phase='care';assert.equal(clinicPose(sim,client,2),null,'contact animation has no clinic override');
});

test('clinic presentation cannot claim a respawn, interrupted visitor or different story',()=>{
 const {sim,client,clinic}=scene();
 for(const patch of [{incarnation:3},{alive:false},{hidden:true},{stun:1},{feeding:{}},{activity:'avoiding'}]){
  const before={...client};Object.assign(client,patch);assert.equal(clinicPose(sim,client),null);Object.assign(client,before);
 }
 clinic.open=false;assert.equal(clinicPose(sim,client),null);clinic.open=true;
 sim.current=8;assert.equal(clinicPose(sim,client),null);sim.current=4;
 sim.reefStories.active='artist';assert.equal(clinicPose(sim,client),null);
});

test('drawing and reduced motion are pure across repeated paused or restored frames',()=>{
 const {sim,client,clinic}=scene();clinic.appointment.returning=true;
 const before=JSON.stringify(sim),calls=[];
 const ctx=new Proxy({}, {get:(target,name)=>typeof target[name]==='function'?target[name]:target[name]??((...args)=>calls.push([name,...args])),set:(target,name,value)=>(target[name]=value,true)});
 const renderer={ctx,uiUnit:1,reducedMotion:true};
 drawStory(renderer,sim,0);const first=calls.splice(0);
 drawStory(renderer,sim,40);assert.deepEqual(calls,first,'reduced motion retains the same suspended geometry');
 assert.deepEqual(clinicPose(sim,client,0,true),clinicPose(sim,client,40,true));
 assert.equal(JSON.stringify(sim),before);
 assert.equal(calls.filter(c=>c[0]==='save').length,calls.filter(c=>c[0]==='restore').length);
});
