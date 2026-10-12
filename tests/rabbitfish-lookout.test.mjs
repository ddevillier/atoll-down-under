import test from 'node:test';
import assert from 'node:assert/strict';
import {SPECIES} from '../src/data.js';
import {approachMeal,feedingApproach,contactGap} from '../src/feeding-contact.js';
import {mealContact,tickFeeding} from '../src/feeding-motion.js';
import {Simulation} from '../src/simulation.js';
import {beginStory,storyAction as dispatchAction} from '../src/reef-stories.js';
import {LOOKOUT_SITES,initStory,validStory,validStoryPlayer,storyAction,storyPointer,storyClick,storyPlayer,storyNPC,tickStory,storyMeal,storyView,stopStory,safety} from '../src/rabbitfish-lookout.js';

const animal=(id,index,x,y)=>({id,incarnation:0,species:SPECIES[index],x,y,angle:0,facing:1,alive:true,health:100,energy:85,satiated:0,rest:0,target:null,feeding:null,stun:0,cleanTime:0,biteCooldown:0,actionTime:0,ecology:{reef:0,partner:null},think:0});
function scene(index=8){
 const a=LOOKOUT_SITES[0],p=animal('player',index,a.lookout.x,a.lookout.y),buddy=animal(20,index,260,405),passer=animal(21,0,30,342);
 const food=LOOKOUT_SITES.map((site,i)=>({id:'look-food-'+i,kind:'food',food:'algae',name:'Algae',x:site.x,y:site.y,size:24,amount:100,regrow:0}));
 const sections=Array.from({length:9},()=>({entities:[],food:[]}));sections[0]={entities:[buddy,passer],food};
 const sim={player:p,phase:'playing',paused:false,current:0,sections,reefStories:{active:'lookout',lookout:null},pointer:{x:p.x,y:p.y},events:[],adventure:{buddy:null},
  get section(){return this.sections[this.current];},event(type,text,data={}){this.events.push({type,text,...data});},setDestination(reef){this.destination=reef;}};
 initStory(sim);return sim;
}
const state=sim=>sim.reefStories.lookout;
function normalBite(sim,e,dt){
 const food=sim.section.food.find(f=>f.id===e.target&&f.regrow<=0);if(!food)return;
 const contact=approachMeal(e,food,dt,e.species.speed*.55);
 if(contact.ready&&e.biteCooldown<=0&&mealContact(e,food,dt,contact.contact)){
  storyMeal(sim,food,e);food.amount-=e===sim.player?35:12;e.target=null;e.actionTime=.65;e.biteCooldown=e===sim.player?.45:2;
  if(e!==sim.player)e.satiated=60;
 }
}
function step(sim,dt=1/60){
 if(sim.paused)return;
 for(const e of sim.section.entities){tickFeeding(e,dt);e.actionTime=Math.max(0,e.actionTime-dt);e.biteCooldown=Math.max(0,e.biteCooldown-dt);e.satiated=Math.max(0,e.satiated-dt);e.rest=Math.max(0,e.rest-dt);if(!storyNPC(sim,e,dt))normalBite(sim,e,dt);}
 tickFeeding(sim.player,dt);sim.player.biteCooldown=Math.max(0,sim.player.biteCooldown-dt);storyPlayer(sim,dt);normalBite(sim,sim.player,dt);tickStory(sim,dt);
 assert.equal(validStory(state(sim)),true,JSON.stringify(state(sim)));
}
function until(sim,predicate,limit=3000){for(let i=0;i<limit&&!predicate();i++)step(sim);assert.equal(predicate(),true,JSON.stringify(state(sim)));}
function begin(sim){assert.equal(storyAction(sim,'invite'),true);assert.equal(storyAction(sim,'site',LOOKOUT_SITES[0].id),true);assert.equal(storyAction(sim,'context'),true);assert.equal(state(sim).phase,'watch');}
function signal(sim){until(sim,()=>state(sim).phase==='signal');const e=sim.section.entities[1];assert.equal(storyAction(sim,'hold'),false);storyPointer(sim,e.x,e.y);assert.equal(storyClick(sim,e.x,e.y),true);}
function exchange(sim,response='hold'){
 begin(sim);signal(sim);assert.equal(storyAction(sim,response),true);
 if(response==='move'){
  assert.equal(state(sim).phase,'relocating');assert.equal(state(sim).role,'none');
  const before={x:sim.section.entities[0].x,y:sim.section.entities[0].y};for(let i=0;i<60;i++)step(sim);
  assert.ok(Math.hypot(before.x-sim.section.entities[0].x,before.y-sim.section.entities[0].y)>5);
  const a=LOOKOUT_SITES[1];Object.assign(sim.player,a.lookout);until(sim,()=>Math.hypot(sim.section.entities[0].x-sim.player.x,sim.section.entities[0].y-sim.player.y)<300);storyAction(sim,'context');
 }
 until(sim,()=>state(sim).phase==='player-feed');
 const food=sim.section.food.find(f=>f.id===state(sim).partnerFood);
 assert.equal(state(sim).partnerMeal,true);assert.equal(food.amount,88);assert.equal(state(sim).playerMeal,false);
 assert.ok(Math.hypot(sim.section.entities[0].x-storyView(sim).site.lookout.x,sim.section.entities[0].y-storyView(sim).site.lookout.y)<18.1);
 sim.player.target=food.id;normalBite(sim,sim.player,1/60);assert.equal(state(sim).playerMeal,false);
 until(sim,()=>state(sim).phase==='complete');assert.equal(food.amount,53);assert.equal(state(sim).playerMeal,true);
}

test('both rabbitfish perform hold and move exchanges through real mouth contact and role arrival',()=>{
 for(const [species,response] of [[8,'hold'],[52,'move']]){const sim=scene(species);exchange(sim,response);assert.equal(sim.events.filter(e=>e.type==='discovery'&&e.value==='rabbitfish-lookout').length,1);assert.equal(storyView(sim).complete,true);for(let i=0;i<90;i++)step(sim);assert.equal(sim.events.filter(e=>e.type==='discovery').length,1);}
});

test('the remote lookout, remote food and both-lookout posture cannot credit a turn',()=>{
 const sim=scene(),s=state(sim);storyAction(sim,'invite');Object.assign(sim.player,{x:800,y:100});storyAction(sim,'site',LOOKOUT_SITES[0].id);storyAction(sim,'watch');assert.equal(s.phase,'approach');assert.equal(s.anchor,null);
 Object.assign(sim.player,LOOKOUT_SITES[0].lookout);storyAction(sim,'watch');assert.equal(s.phase,'watch');
 const food=sim.section.food[0],e=sim.section.entities[0];storyMeal(sim,food,e);storyMeal(sim,food,sim.player);assert.equal(s.partnerMeal,false);assert.equal(s.playerMeal,false);
 for(let i=0;i<70;i++)step(sim);assert.equal(food.amount,100);assert.equal(s.partnerMeal,false);assert.equal(e.target,null);
 assert.ok(contactGap(e,food)>3);assert.equal(safety(sim).holdNeeds,true);
});

test('special pointer aiming keeps the lookout anchored and open water cancels immediately',()=>{
 const sim=scene();begin(sim);const before={x:sim.player.x,y:sim.player.y};assert.equal(storyPointer(sim,700,50),true);assert.deepEqual({x:sim.player.x,y:sim.player.y},before);assert.deepEqual(sim.pointer,before);assert.notEqual(state(sim).aim,-Math.PI/2);assert.equal(storyPlayer(sim,1/60),true);
 assert.equal(storyClick(sim,1000,100),false);assert.equal(state(sim).role,'none');assert.equal(storyPlayer(sim,1/60),false);assert.equal(storyPointer(sim,800,80),false);assert.equal(safety(sim),null);
 storyAction(sim,'retry');begin(sim);assert.equal(storyAction(sim,'context'),true);assert.equal(storyPlayer(sim,1/60),false);
});

test('a missed passer visibly relocates the companion without a meal or artificial completion',()=>{
 const sim=scene();begin(sim);until(sim,()=>state(sim).phase==='relocating');assert.equal(state(sim).response,'missed');assert.equal(state(sim).partnerMeal,false);assert.equal(state(sim).site,LOOKOUT_SITES[1].id);
 const e=sim.section.entities[0],before={x:e.x,y:e.y};for(let i=0;i<120;i++)step(sim);assert.ok(Math.hypot(e.x-before.x,e.y-before.y)>20);assert.equal(sim.section.food[0].amount,100);assert.equal(sim.events.some(e=>e.type==='discovery'),false);
});

test('returning to the relocated lookout keeps its response when the same passer is still crossing',()=>{
 for(const response of ['move','missed']){
  const sim=scene();begin(sim);signal(sim);
  if(response==='move')storyAction(sim,'move');
  else until(sim,()=>state(sim).phase==='relocating');
  const s=state(sim),site=LOOKOUT_SITES[1],passer=sim.section.entities[1];
  // Reproduce the actual NPC-before-story tick ordering at the new nook.
  Object.assign(sim.player,site.lookout);Object.assign(passer,{x:site.lookout.x-80,y:site.lookout.y-28});s.pass.stage='crossing';
  assert.equal(storyAction(sim,'watch'),true);assert.equal(s.phase,'partner-feed');
  storyNPC(sim,passer,1/60);tickStory(sim,1/60);
  assert.equal(s.phase,'partner-feed');assert.equal(s.response,response);assert.equal(s.responded,true);assert.equal(s.partnerMeal,false);assert.equal(validStory(s),true);
  assert.equal(storyPlayer(sim,1/60),true);assert.equal(validStoryPlayer(sim),true);assert.equal(safety(sim).holdNeeds,true);assert.equal(s.role,'player');assert.match(sim.events.at(-1).text,/companion is heading to the grazing patch/);
  const saved=structuredClone(s);sim.reefStories.lookout=saved;initStory(sim);assert.strictEqual(state(sim),saved);assert.equal(validStoryPlayer(sim),true);assert.equal(storyPlayer(sim,1/60),true);
 }
});

test('existing pair, buddy journeys, digestion, care and committed feeding are preserved',()=>{
 const sim=scene(),e=sim.section.entities[0];e.ecology.partner=99;sim.section.entities.push(animal(99,8,270,410));sim.section.entities[2].ecology.partner=e.id;
 storyAction(sim,'invite');assert.equal(state(sim).buddy,null);assert.equal(e.ecology.partner,99);assert.equal(sim.section.entities[2].ecology.partner,e.id);
 e.ecology.partner=null;storyAction(sim,'invite');assert.equal(state(sim).buddy,null);assert.equal(sim.section.entities[2].ecology.partner,e.id);
 sim.section.entities[2].alive=false;e.satiated=8;e.rest=2;const legacy={id:e.id,reef:0,incarnation:0,playerMeal:true,partnerMeal:true,rejoined:3};sim.adventure.buddy=legacy;
 storyAction(sim,'invite');storyAction(sim,'site',LOOKOUT_SITES[0].id);storyAction(sim,'watch');assert.equal(state(sim).phase,'approach');assert.equal(e.satiated,8);assert.equal(e.rest,2);assert.equal(state(sim).status,'digesting');assert.strictEqual(sim.adventure.buddy,legacy);assert.equal(state(sim).partnerMeal,false);
 assert.equal(storyNPC(sim,e,1/60),true);assert.equal(e.satiated,8);assert.equal(e.rest,2);assert.equal(e.target,null);
 e.satiated=0;e.rest=0;e.target='unrelated-food';e.feeding={target:'unrelated-food',committed:true,elapsed:.2,contactAt:.18,x:200,y:400};const saved=structuredClone(e.feeding);
 assert.equal(storyNPC(sim,e,1/60),false);stopStory(sim);assert.equal(e.target,'unrelated-food');assert.deepEqual(e.feeding,saved);assert.equal(e.ecology.partner,null);
});

test('pause and offscreen freeze every clock and stale incarnation never becomes the original friend',()=>{
 const sim=scene();begin(sim);signal(sim);const saved=structuredClone(state(sim)),positions=sim.section.entities.map(e=>({x:e.x,y:e.y}));sim.paused=true;
 for(let i=0;i<100;i++){tickStory(sim,1);for(const e of sim.section.entities)assert.equal(storyNPC(sim,e,1),false);assert.equal(storyPlayer(sim,1),false);}
 assert.deepEqual(state(sim),saved);assert.deepEqual(sim.section.entities.map(e=>({x:e.x,y:e.y})),positions);
 sim.paused=false;sim.current=1;tickStory(sim,10);assert.deepEqual(state(sim),saved);sim.current=0;sim.section.entities[0].incarnation++;tickStory(sim,1/60);assert.equal(state(sim).phase,'unavailable');assert.equal(state(sim).status,'partner-away');assert.equal(state(sim).partnerMeal,false);assert.equal(storyNPC(sim,sim.section.entities[0],1),false);
});

test('unavailable passing life reports an honest retry without summoning animals',()=>{
 const sim=scene();sim.section.entities[1].alive=false;const count=sim.section.entities.length;begin(sim);for(let i=0;i<90;i++)step(sim);assert.equal(state(sim).phase,'watch');assert.equal(state(sim).status,'passer-away');assert.equal(state(sim).passer,null);assert.match(storyView(sim).detail,/No calm/);assert.equal(sim.section.entities.length,count);assert.equal(sim.events.some(e=>e.type==='discovery'),false);
});

test('care and danger release the player lookout while preserving the companion priority',()=>{
 for(const phase of ['watch','signal','partner-feed']){
  const sim=scene();begin(sim);if(phase!=='watch')signal(sim);if(phase==='partner-feed')storyAction(sim,'hold');
  const e=sim.section.entities[0];e.cleanTime=1;e.target='cleaner-visit';assert.equal(storyNPC(sim,e,1/60),false);tickStory(sim,1/60);
  assert.equal(state(sim).phase,'unavailable');assert.equal(state(sim).status,'busy');assert.equal(state(sim).partnerMeal,false);assert.equal(storyPlayer(sim,1/60),false);assert.equal(e.cleanTime,1);assert.equal(e.target,'cleaner-visit');assert.equal(safety(sim),null);
 }
 const sim=scene();begin(sim);const e=sim.section.entities[0];e.activity='avoiding';e.behavior='Moving away from a hunter';tickStory(sim,1/60);assert.equal(state(sim).role,'none');assert.equal(e.behavior,'Moving away from a hunter');
});

test('Simulation owns physiology once and paused safety retains exact species identity',()=>{
 const sim=scene();begin(sim);signal(sim);const passer=sim.section.entities[1],before={satiated:8,rest:3,health:93};Object.assign(passer,before);
 assert.equal(storyNPC(sim,passer,.05),true);assert.deepEqual({satiated:passer.satiated,rest:passer.rest,health:passer.health},before);
 const zone=safety(sim);assert.deepEqual(zone.participants,state(sim).buddy&&[state(sim).buddy,state(sim).passer].map(({id,incarnation,species})=>({id,incarnation,species})));
 sim.paused=true;assert.deepEqual(safety(sim),zone);assert.equal(validStoryPlayer(sim),true);
 sim.player.target='look-food-0';assert.equal(validStoryPlayer(sim),false);sim.player.target=null;sim.player.x+=4;assert.equal(validStoryPlayer(sim),false);
 sim.current=1;assert.equal(validStoryPlayer(sim),true);assert.equal(safety(sim),null);sim.current=0;sim.player.x-=4;passer.incarnation++;assert.equal(safety(sim),null);
});

test('strict save validation rejects contradictory outcomes and preserves a resumed earned badge',()=>{
 const sim=scene();begin(sim);signal(sim);const saved=JSON.parse(JSON.stringify(state(sim)));assert.equal(validStory(saved),true);sim.reefStories.lookout=saved;initStory(sim);assert.strictEqual(state(sim),saved);
 for(const mutation of [s=>s.aim=NaN,s=>s.pass.elapsed=31,s=>s.buddy.incarnation=-1,s=>s.buddy.reef=2,s=>s.buddy.species='s48',s=>s.anchor.x=1400,s=>s.extra=true,s=>s.playerMeal=true,s=>s.role='partner',s=>s.phase='complete',s=>s.pass.seen=false]){const bad=structuredClone(saved);mutation(bad);assert.equal(validStory(bad),false,JSON.stringify(bad));}
 storyAction(sim,'hold');until(sim,()=>state(sim).phase==='player-feed');const food=sim.section.food.find(f=>f.id===state(sim).partnerFood);sim.player.target=food.id;until(sim,()=>state(sim).phase==='complete');storyAction(sim,'retry');assert.equal(state(sim).logged,true);assert.equal(validStory(state(sim)),true);
 // Another exchange can begin when the same animal naturally becomes hungry;
 // restarting never changes its digestion timer or grants another discovery.
 const timer=sim.section.entities[0].satiated;storyAction(sim,'invite');assert.equal(sim.section.entities[0].satiated,timer);assert.equal(state(sim).logged,true);assert.equal(sim.events.filter(e=>e.type==='discovery').length,1);
});

test('generated dives complete through Simulation input, actor-aware bites and paused midpoint restore',()=>{
 for(const [species,seed,response] of [['s8',9,'hold'],['s52',1,'move']]){
  let sim=new Simulation(seed);sim.start('practice',species,null,{adventureKey:'lookout'});
  const roster=sim.sections.map(r=>r.entities.map(e=>e.id));assert.equal(beginStory(sim,'lookout'),true);assert.equal(dispatchAction(sim,'invite'),true);
  const buddy=sim.section.entities.find(e=>e.id===sim.reefStories.lookout.buddy.id),digesting=buddy.satiated;assert.equal(dispatchAction(sim,'site','crest-open'),true);assert.equal(buddy.satiated,digesting);
  const advanceUntil=(check,limit=3000)=>{for(let i=0;i<limit&&!check();i++)sim.step(1/60);assert.equal(check(),true,JSON.stringify(sim.reefStories.lookout));};
  advanceUntil(()=>buddy.satiated<=0);assert.equal(dispatchAction(sim,'watch'),true);advanceUntil(()=>sim.reefStories.lookout.phase==='signal');
  const saved=sim.serialize();sim=Simulation.restore(saved);assert.equal(sim.paused,true);const frozen=sim.serialize();sim.step(10);assert.equal(sim.serialize(),frozen);sim.paused=false;
  const s=sim.reefStories.lookout,passer=sim.section.entities.find(e=>e.id===s.passer.id);sim.point(passer.x,passer.y);sim.eatAt(passer.x,passer.y);assert.equal(s.cueClicked,true);assert.equal(dispatchAction(sim,response),true);
  if(response==='move'){advanceUntil(()=>Math.hypot(sim.player.x-410,sim.player.y-485)<=40);assert.equal(dispatchAction(sim,'watch'),true);}
  advanceUntil(()=>s.phase==='player-feed');const food=sim.section.food.find(f=>f.id===s.partnerFood);assert.equal(food.amount,88);assert.equal(s.partnerMeal,true);assert.equal(s.playerMeal,false);
  assert.equal(sim.eatAt(food.x,food.y),true);assert.equal(s.playerMeal,false);advanceUntil(()=>s.phase==='complete');assert.equal(food.amount,53);assert.equal(s.playerMeal,true);assert.equal(sim.events.filter(e=>e.type==='discovery'&&e.value==='rabbitfish-lookout').length,1);
  assert.deepEqual(sim.sections.map(r=>r.entities.map(e=>e.id)),roster);assert.equal(validStory(s),true);
 }
});

test('seed1 slow mouse approach keeps the invited fish from eating another meal as digestion expires',()=>{
 const sim=new Simulation(1);sim.start('practice','s52',null,{adventureKey:'lookout'});assert.equal(beginStory(sim,'lookout'),true);assert.equal(dispatchAction(sim,'invite'),true);
 const s=sim.reefStories.lookout,buddy=sim.section.entities.find(e=>e.id===s.buddy.id),initial={satiated:buddy.satiated,health:buddy.health,incarnation:buddy.incarnation||0};
 // Read the two choices for a few normal frames, then make the real remote
 // lookout check with mouse swimming. No position or physiology is assigned.
 for(let i=0;i<180;i++)sim.step(1/60);assert.equal(buddy.target,null);assert.equal(buddy.feeding??null,null);assert.ok(buddy.satiated<=initial.satiated);
 assert.equal(dispatchAction(sim,'site','crest-open'),true);sim.point(650,220);
 const advanceUntil=check=>{for(let i=0;i<3000&&!check();i++){const before=buddy.satiated;sim.step(1/60);assert.ok(buddy.satiated<=before+1e-9);assert.equal(buddy.target,null);assert.equal(buddy.feeding??null,null);}assert.equal(check(),true);};
 advanceUntil(()=>Math.hypot(sim.player.x-650,sim.player.y-220)<18);dispatchAction(sim,'watch');assert.equal(s.phase,'approach');assert.equal(s.anchor,null);
 sim.point(240,370);advanceUntil(()=>Math.hypot(sim.player.x-240,sim.player.y-370)<18);
 assert.equal(buddy.satiated,0);assert.equal(buddy.ecology?.partner??null,null);assert.equal(buddy.incarnation||0,initial.incarnation);assert.ok(Math.abs(buddy.health-(initial.health-sim.time*.045))<1e-6,'ordinary parasite drain occurs exactly once per Simulation tick');
 assert.equal(dispatchAction(sim,'watch'),true);assert.equal(s.phase,'watch');assert.equal(s.partnerMeal,false);assert.equal(s.playerMeal,false);
});
