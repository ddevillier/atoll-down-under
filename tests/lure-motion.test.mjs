import test from 'node:test';import assert from 'node:assert/strict';import {Simulation,edible,distance} from '../src/simulation.js';import {SPECIES} from '../src/data.js';import {lureDisplay,attractingLure,lurePoint} from '../src/lure-motion.js';import {partPose} from '../src/part-motion.js';
const tick=(s,n)=>{for(let i=0;i<Math.round(n*60);i++)s.step(1/60);};
function scene(){const s=new Simulation(42);s.start('practice','s54');s.player.x=100;s.player.y=100;s.point(100,100);const base=structuredClone(s.section.entities[0]),frog={...base,id:900,species:SPECIES[54],x:700,y:400,angle:0,facing:1,alive:true,health:100,stun:0,target:null,think:10,rest:0,satiated:0,activity:'at-home',actionTime:0,ecology:{reef:s.current,clock:10,point:0,wait:0,partner:null,host:null,home:{x:700,y:400}}},prey={...base,id:901,species:SPECIES[0],x:910,y:370,angle:Math.PI,facing:-1,alive:true,health:100,stun:0,target:null,think:10,rest:0,satiated:0,activity:'cruising',actionTime:0,ecology:null};s.section.entities=[frog,prey];s.section.food=[];return {s,frog,prey};}

test('frogfish display is a brief hungry refuge action, while the player uses the active ability',()=>{
 const {s,frog}=scene();assert.equal(lureDisplay(frog),1);for(const override of [{satiated:10},{rest:5},{target:123},{stun:1},{alive:false},{activity:'returning-home'},{feeding:{elapsed:0}},{cleanTime:1}])assert.equal(lureDisplay({...frog,...override}),0);
 for(const clock of [0,7,8,14,16])assert.equal(lureDisplay({...frog,ecology:{...frog.ecology,clock}}),0);
 s.player.abilityTime=6;assert.equal(lureDisplay(s.player),1);s.player.abilityTime=0;assert.equal(lureDisplay(s.player),0);
 const quiet=partPose('s54','lure',.2,0),display=partPose('s54','lure',.2,0,{lure:1});assert.ok(Math.abs(display.shear)>Math.abs(quiet.shear)*5);
});

test('eligible prey approaches a moving lure without assigning a meal or damaging either fish',()=>{
 const {s,frog,prey}=scene();assert.equal(attractingLure(s,prey,edible),frog);const before=distance(prey,lurePoint(frog));tick(s,1);
 assert.equal(prey.activity,'investigating-lure');assert.ok(distance(prey,lurePoint(frog))<before);assert.equal(prey.target,null);assert.equal(prey.feeding,undefined);assert.ok(frog.health>99.9);assert.equal(frog.biteDamage,0);assert.equal(frog.alive,true);
});

test('meals, cleaning, avoidance and unsuitable animals take priority over lure curiosity',()=>{
 const {s,frog,prey}=scene();for(const override of [{target:777},{feeding:{elapsed:0}},{cleanTime:1},{stun:1},{activity:'avoiding'},{species:SPECIES[43]},{species:SPECIES[38]}])assert.equal(attractingLure(s,{...prey,...override},edible),null);
 s.section.food=[{id:'sprat-meal',kind:'food',food:'plankton',x:prey.x+35,y:prey.y,size:22,amount:100,regrow:0,name:'Plankton'}];prey.think=0;s.stepNpc(prey,1/60);assert.equal(prey.target,'sprat-meal');assert.notEqual(prey.activity,'investigating-lure');
 frog.stun=1;prey.target=null;assert.equal(attractingLure(s,prey,edible),null);
});

test('curiosity ends when the display ends or the host dies, replays saves, and does not survive travel',()=>{
 const {s,frog,prey}=scene();tick(s,.2);const copy=Simulation.restore(s.serialize());copy.paused=false;tick(s,.3);tick(copy,.3);assert.equal(copy.serialize(),s.serialize());
 frog.alive=false;frog.respawn=10;tick(s,.1);assert.notEqual(prey.activity,'investigating-lure');frog.alive=true;frog.activity='at-home';frog.ecology.clock=14;assert.equal(attractingLure(s,prey,edible),null);
 frog.ecology.clock=10;frog.activity='at-home';prey.think=10;assert.equal(attractingLure(s,prey,edible),frog);assert.equal(s.transition(1,0),true);assert.equal(attractingLure(s,prey,edible),null);
});

test('legacy player-lure aliases are released without converting prey curiosity into a meal',()=>{
 const {s,prey}=scene();s.section.entities=[prey];s.player.x=700;s.player.y=400;s.point(700,400);s.player.abilityTime=6;prey.target='player';prey.behavior='Following lure';prey.think=10;s.stepNpc(prey,1/60);assert.equal(prey.target,null);assert.equal(prey.activity,'investigating-lure');assert.equal(s.player.health,100);assert.equal(prey.feeding,undefined);
 s.player.abilityTime=0;s.stepNpc(prey,1/60);assert.notEqual(prey.activity,'investigating-lure');
});
