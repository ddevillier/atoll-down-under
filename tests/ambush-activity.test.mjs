import {ambushConcealed,aimAmbush} from '../src/ambush-activity.js';
import {creatureFrame} from '../src/geometry.js';
import test from 'node:test';import assert from 'node:assert/strict';
import {Simulation} from '../src/simulation.js';import {SPECIES} from '../src/data.js';
import {sitesFor} from '../src/adventures.js';import {lureDisplay,attractingLure} from '../src/lure-motion.js';
import {edible} from '../src/simulation.js';import {contactGap} from '../src/feeding-contact.js';
function scene(id='s54'){const s=new Simulation(42);s.start('practice',id);s.section.entities=[];s.section.food=[];const site=sitesFor(s)[0];Object.assign(s.player,{x:site.x,y:site.y,angle:0,facing:1,energy:50});s.point(site.x,site.y);s.useContext();return s;}
const ticks=(s,n)=>{for(let i=0;i<n*60;i++)s.step(1/60);};
function prey(s,offset=90){const e={...structuredClone(s.player),id:900,species:SPECIES[0],ambush:null,x:s.player.x+offset,y:s.player.y,health:100,alive:true,hidden:false,angle:Math.PI,facing:-1,stun:0,rest:0,satiated:50,think:10,target:null,feeding:null,cleanTime:0};s.section.entities=[e];return e;}
test('settling conceals each ambush hunter, while only frogfish displays a waiting lure',()=>{
 for(const id of ['s16','s21','s54','s59']){const s=scene(id);ticks(s,1);assert.ok(s.player.ambush.settled>.99&&s.player.ambush.settled<1.01);assert.equal(ambushConcealed(s.player),false);ticks(s,1.1);assert.equal(s.player.hidden,true);assert.equal(lureDisplay(s.player),id==='s54'?1:0);s.point(s.player.x+60,s.player.y);assert.equal(s.player.ambush,null);assert.equal(s.player.hidden,false);}
});
test('a short strike reaches an actual prey mouth contact and awards one ambush discovery',()=>{
 const s=scene();ticks(s,2.1);const e=prey(s,65);e.stun=0;const before=s.player.energy;let gap=null;const consume=s.consume;s.consume=function(t){gap=contactGap(this.player,t);consume.call(this,t);};assert.equal(s.eatAt(e.x,e.y),true);assert.ok(s.player.ambush.strike>0);ticks(s,1);
 assert.equal(e.alive,false);assert.ok(gap<=3);assert.ok(s.player.energy>before);assert.equal(s.adventure.complete,true);assert.equal(s.events.filter(e=>e.type==='discovery').length,1);assert.equal(s.section.entities.length,1);
});
test('missed strikes stop within their window without food, credit or an endless chase',()=>{
 const s=scene();ticks(s,2.1);const e=prey(s,159);e.x=s.player.x+159;s.eatAt(e.x,e.y);e.x=1500;e.y=40;const before=s.player.energy;ticks(s,1);assert.equal(s.player.ambush,null);assert.equal(s.player.target,null);assert.equal(e.alive,true);assert.ok(s.player.energy<=before);assert.equal(s.adventure.complete,false);
});
test('ambush replay is deterministic and travel, corrupt saves and early attacks are handled',()=>{
 const s=scene();ticks(s,1);const copy=Simulation.restore(s.serialize()),paused=copy.serialize();copy.step(10);assert.equal(copy.serialize(),paused);copy.paused=false;ticks(s,2);ticks(copy,2);assert.equal(copy.serialize(),s.serialize());
 const bad=JSON.parse(s.serialize());bad.player.ambush.strike=4;assert.throws(()=>Simulation.restore(bad));s.transition(1,0);assert.equal(s.player.ambush,null);
 const early=scene(),e=prey(early);early.eatAt(e.x,e.y);assert.equal(early.player.ambush,null);assert.equal(early.adventure.complete,false);
});
test('a concealed waiting frogfish invites eligible prey without manufacturing a meal',()=>{
 const s=scene();ticks(s,2.1);const e=prey(s,210);assert.equal(attractingLure(s,e,edible),s.player);const count=s.section.entities.length,energy=s.player.energy;ticks(s,.2);assert.equal(e.activity,'investigating-lure');assert.equal(e.alive,true);assert.equal(s.section.entities.length,count);assert.ok(s.player.energy<=energy);
});

test('generated communities support ambush catches with ordinary steering, waiting and repeat attempts',()=>{
 for(const id of ['s16','s21','s54','s59']){
  const s=new Simulation(42);s.start('practice',id);const count=s.section.entities.length,score=p=>s.section.entities.filter(e=>e.alive&&edible(s.player,e)&&!e.species.poison&&Math.hypot(e.x-p.x,e.y-p.y)<340).length;
  const site=sitesFor(s).sort((a,b)=>score(b)-score(a))[0];s.point(site.x,site.y);
  for(let i=0;i<120*60&&s.phase==='playing'&&!s.adventure.complete;i++){
   if(!s.player.ambush){if(Math.hypot(s.player.x-site.x,s.player.y-site.y)<100)s.useContext();else s.point(site.x,site.y);}
   if(s.player.ambush?.settled>=2&&!s.player.ambush.strike){const e=s.section.entities.find(e=>e.alive&&!e.hidden&&edible(s.player,e)&&!e.species.poison&&Math.hypot(s.player.x-e.x,s.player.y-e.y)<130);if(e){const f=creatureFrame(e);s.eatAt(f.x,f.y);}}
   s.step(1/60);
  }
  assert.equal(s.adventure.complete,true,id);assert.equal(s.section.entities.length,count);assert.equal(s.events.filter(e=>e.type==='discovery').length,1);
 }
});

test('aiming turns a settled hunter without moving it, and short strikes work from different starting headings',()=>{
 const aimed=scene();ticks(aimed,2.1);const {x,y}=aimed.player;aimAmbush(aimed,x-100,y);ticks(aimed,1);assert.equal(aimed.player.x,x);assert.equal(aimed.player.y,y);assert.equal(aimed.player.facing,-1);assert.ok(aimed.player.ambush);
 for(const angle of [0,Math.PI/2,Math.PI,-Math.PI/2]){const s=scene();s.player.angle=angle;s.player.facing=Math.cos(angle)>=0?1:-1;ticks(s,2.1);const e=prey(s,90);e.angle=0;e.facing=1;e.think=0;s.eatAt(e.x,e.y);ticks(s,.8);assert.equal(e.alive,false,'heading '+angle);assert.equal(s.adventure.complete,true);}
});
